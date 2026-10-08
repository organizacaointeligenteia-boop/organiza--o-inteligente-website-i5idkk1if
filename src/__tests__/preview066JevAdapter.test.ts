import { describe, it, expect } from 'vitest'
import {
  JEV_PROJECT_ID,
  JEV_MODEL_ID,
  JEV_PROVISIONAL_CONFIDENCE_THRESHOLD,
  JEV_INTENT_OPTIONS,
  JEV_TOPIC_OPTIONS,
  type TypeSafeRequestBody,
  type JevRequestEnvelope,
  type JevResponseEnvelope,
} from '@/pilot/jevContract'
import {
  buildTypeSafeRequestBody,
  buildJevRequestEnvelope,
  buildJevClassificationRequest,
  validateStrictChoiceAnswer,
  evaluateJevResponseEnvelope,
} from '@/pilot/jevAdapter'
import { JEV_SYNTHETIC_FIXTURES, runSyntheticFixturesSimulation } from '@/pilot/jevFixtures'
import fs from 'node:fs'
import path from 'node:path'

describe('Preview 0.0.66 / 0.0.67 - Adaptador TypeSafe / Jev (Contrato Puro Offline)', () => {
  describe('1. Contrato de Request (buildTypeSafeRequestBody e buildJevRequestEnvelope)', () => {
    it('buildJevRequestEnvelope gera envelope local com project obrigatório e request nativo', () => {
      const stateText = 'Gostaria de organizar minha rotina e definir prioridades para a semana'
      const envelope: JevRequestEnvelope = buildJevRequestEnvelope(stateText)

      expect(envelope.project).toBe('organizacao-inteligente')
      expect(envelope.request).toBeDefined()
      expect(envelope.request.model).toBe('jev-latest')
      expect(envelope.request.state).toBe(stateText)
      expect(envelope.request.questions).toBeDefined()
      expect(envelope.request.questions.intent).toBeDefined()
      expect(envelope.request.questions.topic).toBeDefined()
    })

    it('buildTypeSafeRequestBody gera corpo nativo com EXATAMENTE as chaves state, model e questions (sem project)', () => {
      const stateText = 'Gostaria de organizar minha rotina'
      const nativeBody: TypeSafeRequestBody = buildTypeSafeRequestBody(stateText)

      expect(nativeBody.model).toBe('jev-latest')
      expect(nativeBody.state).toBe(stateText)
      expect(nativeBody.questions).toBeDefined()
      expect('project' in (nativeBody as unknown as Record<string, unknown>)).toBe(false)
    })

    it('REGRESSÃO A (0.0.67): JSON.stringify(TypeSafeRequestBody) contém EXATAMENTE as chaves state, model e questions (project não vaza)', () => {
      const nativeBody = buildTypeSafeRequestBody(
        'Verificação de serialização estrita sem metadados',
      )
      const jsonString = JSON.stringify(nativeBody)
      const parsed = JSON.parse(jsonString) as Record<string, unknown>

      const keys = Object.keys(parsed).sort()
      expect(keys).toEqual(['model', 'questions', 'state'].sort())
      expect(keys).not.toContain('project')
      expect(jsonString).not.toContain('"project"')
    })

    it('pergunta "intent" é do tipo "choice" com critérios bem separados em pt-BR', () => {
      const req = buildTypeSafeRequestBody('teste')
      const intentQ = req.questions.intent

      expect(intentQ.type).toBe('choice')
      expect(intentQ.instructions).toContain('intenção principal do usuário')

      // Critérios esperados
      expect(Object.keys(intentQ.criteria).sort()).toEqual(
        ['routine', 'kit', 'guidance', 'unknown', 'restricted'].sort(),
      )

      // Restrito com menção explícita de PRIORIDADE MÁXIMA para saúde/direito/finanças
      expect(intentQ.criteria.restricted).toContain('PRIORIDADE MÁXIMA')
      expect(intentQ.criteria.restricted).toContain('clínicos')
      expect(intentQ.criteria.restricted).toContain('jurídicos')
      expect(intentQ.criteria.restricted).toContain('financeiros')
    })

    it('pergunta "topic" é do tipo "choice" com as 4 opções de tópico fechadas', () => {
      const req = buildTypeSafeRequestBody('teste')
      const topicQ = req.questions.topic

      expect(topicQ.type).toBe('choice')
      expect(topicQ.instructions).toContain('tema específico abordado')
      expect(Object.keys(topicQ.criteria).sort()).toEqual(
        ['time', 'priorities', 'consistency', 'general'].sort(),
      )
    })
  })

  describe('2. Validação Estrita de Resposta Choice (validateStrictChoiceAnswer)', () => {
    const validRoutineAnswer = {
      type: 'choice',
      choice: 'routine',
      confidence: 0.95,
      probabilities: {
        routine: 0.95,
        kit: 0.02,
        guidance: 0.01,
        unknown: 0.01,
        restricted: 0.01,
      },
    }

    it('valida com sucesso uma resposta conforme o contrato', () => {
      const result = validateStrictChoiceAnswer(validRoutineAnswer, JEV_INTENT_OPTIONS, 'intent')
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.value.choice).toBe('routine')
        expect(result.value.confidence).toBe(0.95)
      }
    })

    it('rejeita se objeto for nulo, indefinido, primitivo ou array', () => {
      expect(validateStrictChoiceAnswer(null, JEV_INTENT_OPTIONS, 'intent').valid).toBe(false)
      expect(validateStrictChoiceAnswer(undefined, JEV_INTENT_OPTIONS, 'intent').valid).toBe(false)
      expect(validateStrictChoiceAnswer('routine', JEV_INTENT_OPTIONS, 'intent').valid).toBe(false)
      expect(validateStrictChoiceAnswer([], JEV_INTENT_OPTIONS, 'intent').valid).toBe(false)
    })

    it('rejeita se type não for "choice"', () => {
      const bad = { ...validRoutineAnswer, type: 'score' }
      const res = validateStrictChoiceAnswer(bad, JEV_INTENT_OPTIONS, 'intent')
      expect(res.valid).toBe(false)
      if (res.valid === false) {
        expect(res.errors[0]).toContain("type deve ser 'choice'")
      }
    })

    it('rejeita enums inválidos (fora do conjunto fechado)', () => {
      const bad = { ...validRoutineAnswer, choice: 'custom_intent' }
      const res = validateStrictChoiceAnswer(bad, JEV_INTENT_OPTIONS, 'intent')
      expect(res.valid).toBe(false)
      if (res.valid === false) {
        expect(res.errors.some((e) => e.includes('choice inválido'))).toBe(true)
      }
    })

    it('rejeita confiança menor que 0, maior que 1, NaN ou não-finita', () => {
      const badNegative = { ...validRoutineAnswer, confidence: -0.1 }
      expect(validateStrictChoiceAnswer(badNegative, JEV_INTENT_OPTIONS, 'intent').valid).toBe(
        false,
      )

      const badOver = { ...validRoutineAnswer, confidence: 1.05 }
      expect(validateStrictChoiceAnswer(badOver, JEV_INTENT_OPTIONS, 'intent').valid).toBe(false)

      const badNaN = { ...validRoutineAnswer, confidence: NaN }
      expect(validateStrictChoiceAnswer(badNaN, JEV_INTENT_OPTIONS, 'intent').valid).toBe(false)

      const badInf = { ...validRoutineAnswer, confidence: Infinity }
      expect(validateStrictChoiceAnswer(badInf, JEV_INTENT_OPTIONS, 'intent').valid).toBe(false)
    })

    it('rejeita distribuição de probabilidades incompleta (faltando chave)', () => {
      const incompleteProbs = {
        type: 'choice',
        choice: 'routine',
        confidence: 0.95,
        probabilities: {
          routine: 0.95,
          kit: 0.05,
          // faltam guidance, unknown, restricted
        },
      }
      const res = validateStrictChoiceAnswer(incompleteProbs, JEV_INTENT_OPTIONS, 'intent')
      expect(res.valid).toBe(false)
      if (res.valid === false) {
        expect(res.errors.some((e) => e.includes("chave 'guidance' ausente"))).toBe(true)
      }
    })

    it('rejeita distribuição com chaves extras inesperadas', () => {
      const extraProbs = {
        type: 'choice',
        choice: 'routine',
        confidence: 0.9,
        probabilities: {
          routine: 0.9,
          kit: 0.02,
          guidance: 0.02,
          unknown: 0.03,
          restricted: 0.03,
          extra_hallucinated_key: 0.0,
        },
      }
      const res = validateStrictChoiceAnswer(extraProbs, JEV_INTENT_OPTIONS, 'intent')
      expect(res.valid).toBe(false)
      if (res.valid === false) {
        expect(res.errors.some((e) => e.includes('chave extra inesperada'))).toBe(true)
      }
    })

    it('rejeita quando valores de probabilidade não estão em 0..1 ou não são finitos', () => {
      const badVal = {
        type: 'choice',
        choice: 'routine',
        confidence: 0.9,
        probabilities: {
          routine: 1.2,
          kit: -0.2,
          guidance: 0.0,
          unknown: 0.0,
          restricted: 0.0,
        },
      }
      const res = validateStrictChoiceAnswer(badVal, JEV_INTENT_OPTIONS, 'intent')
      expect(res.valid).toBe(false)
      if (res.valid === false) {
        expect(res.errors.some((e) => e.includes('deve ser número finito entre 0 e 1'))).toBe(true)
      }
    })

    it('rejeita quando a soma das probabilidades difere de 1 (além da tolerância)', () => {
      const sumTooLow = {
        type: 'choice',
        choice: 'routine',
        confidence: 0.5,
        probabilities: {
          routine: 0.5,
          kit: 0.1,
          guidance: 0.1,
          unknown: 0.1,
          restricted: 0.05, // soma = 0.85
        },
      }
      const res = validateStrictChoiceAnswer(sumTooLow, JEV_INTENT_OPTIONS, 'intent')
      expect(res.valid).toBe(false)
      if (res.valid === false) {
        expect(res.errors.some((e) => e.includes('soma das probabilidades'))).toBe(true)
      }
    })

    it('rejeita quando choice é incoerente com o máximo da distribuição', () => {
      const incoherence = {
        type: 'choice',
        choice: 'kit', // choice indica kit, mas kit tem 0.10 e routine tem 0.80
        confidence: 0.8,
        probabilities: {
          routine: 0.8,
          kit: 0.1,
          guidance: 0.05,
          unknown: 0.03,
          restricted: 0.02,
        },
      }
      const res = validateStrictChoiceAnswer(incoherence, JEV_INTENT_OPTIONS, 'intent')
      expect(res.valid).toBe(false)
      if (res.valid === false) {
        expect(
          res.errors.some((e) => e.includes('não coincide com o máximo da distribuição')),
        ).toBe(true)
      }
    })
  })

  describe('3. Avaliador do Envelope e Regras de Decisão (evaluateJevResponseEnvelope)', () => {
    it('isolamento de marca: rejeita envelope de outras marcas e retorna decisão "review"', () => {
      const wrongBrandEnvelope = {
        project: 'outra-marca-qualquer',
        response: {
          model: 'jev-latest',
          answers: {
            intent: {
              type: 'choice',
              choice: 'routine',
              confidence: 0.95,
              probabilities: {
                routine: 0.95,
                kit: 0.02,
                guidance: 0.01,
                unknown: 0.01,
                restricted: 0.01,
              },
            },
            topic: {
              type: 'choice',
              choice: 'time',
              confidence: 0.95,
              probabilities: {
                time: 0.95,
                priorities: 0.02,
                consistency: 0.02,
                general: 0.01,
              },
            },
          },
        },
      }

      const evaluated = evaluateJevResponseEnvelope(wrongBrandEnvelope)
      expect(evaluated.decision).toBe('review')
      expect(evaluated.intent).toBe('unknown')
      expect(evaluated.validationErrors.some((e) => e.includes('Marca/projeto rejeitado'))).toBe(
        true,
      )
    })

    it('REGRESSÃO B (0.0.67): resposta SEM envelope de projeto (project ausente) e com project divergente resultam em decisão review', () => {
      const validNativeResponse = {
        model: JEV_MODEL_ID,
        answers: {
          intent: {
            type: 'choice',
            choice: 'routine',
            confidence: 0.95,
            probabilities: {
              routine: 0.95,
              kit: 0.02,
              guidance: 0.01,
              unknown: 0.01,
              restricted: 0.01,
            },
          },
          topic: {
            type: 'choice',
            choice: 'time',
            confidence: 0.95,
            probabilities: {
              time: 0.95,
              priorities: 0.02,
              consistency: 0.02,
              general: 0.01,
            },
          },
        },
      }

      // Caso 1: project ausente (apenas corpo nativo sem envelope)
      const resMissingProject = evaluateJevResponseEnvelope(validNativeResponse)
      expect(resMissingProject.decision).toBe('review')
      expect(resMissingProject.intent).toBe('unknown')
      expect(resMissingProject.decision).not.toBe('approved')
      expect(
        resMissingProject.validationErrors.some((e) =>
          e.includes('Marca/projeto obrigatório ausente'),
        ),
      ).toBe(true)

      // Caso 2: project divergente ('outra-marca')
      const resDivergentProject = evaluateJevResponseEnvelope({
        project: 'outra-marca',
        response: validNativeResponse,
      })
      expect(resDivergentProject.decision).toBe('review')
      expect(resDivergentProject.intent).toBe('unknown')
      expect(resDivergentProject.decision).not.toBe('approved')
      expect(
        resDivergentProject.validationErrors.some((e) => e.includes('Marca/projeto rejeitado')),
      ).toBe(true)
    })

    it('se modelo retornar "unknown", trata como unknown externo sem casts cegos', () => {
      const unknownEnvelope: JevResponseEnvelope = {
        project: JEV_PROJECT_ID,
        response: {
          model: JEV_MODEL_ID,
          answers: {
            intent: {
              type: 'choice',
              choice: 'unknown',
              confidence: 0.92,
              probabilities: {
                unknown: 0.92,
                routine: 0.02,
                kit: 0.02,
                guidance: 0.02,
                restricted: 0.02,
              },
            },
            topic: {
              type: 'choice',
              choice: 'general',
              confidence: 0.9,
              probabilities: {
                time: 0.03,
                priorities: 0.03,
                consistency: 0.04,
                general: 0.9,
              },
            },
          },
        },
      }

      const res = evaluateJevResponseEnvelope(unknownEnvelope)
      expect(res.decision).toBe('review')
      expect(res.intent).toBe('unknown')
      expect(res.decisionReason).toContain('desconhecida ou fora de escopo')
      expect(res.suggestedPath).toBeNull()
      expect(res.suggestedModelKey).toBeNull()
    })

    it('RESTRICTED DOMINA SEMPRE: restricted vence mesmo com confiança menor (ex.: 0.65 vs rotina)', () => {
      const restrictedEnvelope: JevResponseEnvelope = {
        project: JEV_PROJECT_ID,
        response: {
          model: JEV_MODEL_ID,
          answers: {
            intent: {
              type: 'choice',
              choice: 'restricted',
              confidence: 0.65, // abaixo do limiar 0.8, mas restrito DOMINA
              probabilities: {
                restricted: 0.65,
                routine: 0.3,
                kit: 0.02,
                guidance: 0.02,
                unknown: 0.01,
              },
            },
            topic: {
              type: 'choice',
              choice: 'general',
              confidence: 0.9,
              probabilities: {
                time: 0.02,
                priorities: 0.03,
                consistency: 0.05,
                general: 0.9,
              },
            },
          },
        },
      }

      const res = evaluateJevResponseEnvelope(restrictedEnvelope)
      expect(res.decision).toBe('blocked')
      expect(res.intent).toBe('restricted')
      expect(res.restrictedReason).toContain('saúde, direito ou finanças')
    })

    it('limiar provisório 0.8 não calibrado: confiança menor encaminha para revisão manual', () => {
      const lowConfidenceEnvelope: JevResponseEnvelope = {
        project: JEV_PROJECT_ID,
        response: {
          model: JEV_MODEL_ID,
          answers: {
            intent: {
              type: 'choice',
              choice: 'routine',
              confidence: 0.72, // < 0.8
              probabilities: {
                routine: 0.72,
                kit: 0.2,
                guidance: 0.04,
                unknown: 0.02,
                restricted: 0.02,
              },
            },
            topic: {
              type: 'choice',
              choice: 'priorities',
              confidence: 0.85,
              probabilities: {
                time: 0.05,
                priorities: 0.85,
                consistency: 0.05,
                general: 0.05,
              },
            },
          },
        },
      }

      const res = evaluateJevResponseEnvelope(lowConfidenceEnvelope)
      expect(res.decision).toBe('review')
      expect(res.isThresholdCalibrated).toBe(false)
      expect(res.provisionalConfidenceThreshold).toBe(0.8)
      expect(res.decisionReason).toContain('abaixo do limiar provisório de 0.8')
      expect(res.suggestedModelKey).toBeNull()
    })

    it('aprovação com mapeamento estrito para o catálogo editorial existente (sem texto gerado)', () => {
      const validEnvelope: JevResponseEnvelope = {
        project: JEV_PROJECT_ID,
        response: {
          model: JEV_MODEL_ID,
          answers: {
            intent: {
              type: 'choice',
              choice: 'routine',
              confidence: 0.95,
              probabilities: {
                routine: 0.95,
                kit: 0.02,
                guidance: 0.01,
                unknown: 0.01,
                restricted: 0.01,
              },
            },
            topic: {
              type: 'choice',
              choice: 'time',
              confidence: 0.92,
              probabilities: {
                time: 0.92,
                priorities: 0.03,
                consistency: 0.03,
                general: 0.02,
              },
            },
          },
        },
      }

      const res = evaluateJevResponseEnvelope(validEnvelope)
      expect(res.decision).toBe('approved')
      expect(res.intent).toBe('routine')
      expect(res.topic).toBe('time')
      expect(res.suggestedPath).toBe('routine')
      // Mapeamento esperado do tópico "time": "week" no catálogo editorial
      expect(res.suggestedModelKey).toBe('week')
    })
  })

  describe('4. Fixtures Sintéticas Fixas (JEV_SYNTHETIC_FIXTURES)', () => {
    it('contém exatamente 6 fixtures sintéticas cobrindo todas as categorias obrigatórias', () => {
      expect(JEV_SYNTHETIC_FIXTURES).toHaveLength(6)

      const categories = JEV_SYNTHETIC_FIXTURES.map((f) => f.categoryKey)
      expect(categories).toEqual([
        'valid_routine',
        'ambiguous',
        'restricted',
        'invalid_enum',
        'incoherent_probs',
        'wrong_brand',
      ])
    })

    it('runSyntheticFixturesSimulation executa em memória sem erros e valida 100% das decisões esperadas', () => {
      const results = runSyntheticFixturesSimulation()
      expect(results).toHaveLength(6)

      for (const item of results) {
        expect(item.adapterResult.decision).toBe(item.fixture.expectedDecision)
        expect(item.isMatchingExpectedDecision).toBe(true)
      }
    })
  })

  describe('5. Ausência de Rede, Credenciais e Preservação dos Módulos Técnicos Offline', () => {
    it('os arquivos do adaptador Jev NÃO contêm chamadas de fetch, axios nem URLs com api-keys', () => {
      const adapterCode = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/jevAdapter.ts'),
        'utf-8',
      )
      const fixturesCode = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/jevFixtures.ts'),
        'utf-8',
      )
      const contractCode = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/jevContract.ts'),
        'utf-8',
      )

      for (const code of [adapterCode, fixturesCode, contractCode]) {
        expect(code).not.toContain('fetch(')
        expect(code).not.toContain('axios')
        expect(code).not.toContain('Bearer ')
        expect(code).not.toContain('api_key')
        expect(code).not.toContain('apiKey')
        expect(code).not.toContain('process.env.JEV')
      }
    })

    it('os módulos de contrato, adaptador e fixtures permanecem preservados no repositório para testes sintéticos e evolução futura', () => {
      expect(fs.existsSync(path.resolve(process.cwd(), 'src/pilot/jevContract.ts'))).toBe(true)
      expect(fs.existsSync(path.resolve(process.cwd(), 'src/pilot/jevAdapter.ts'))).toBe(true)
      expect(fs.existsSync(path.resolve(process.cwd(), 'src/pilot/jevFixtures.ts'))).toBe(true)
    })

    it('a UI pública do piloto NÃO expõe mais botões de execução nem painel de auto-liberação de fixtures sintéticas', () => {
      const pageCode = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )

      expect(pageCode).not.toContain('Executar testes simulados')
      expect(pageCode).not.toContain('Teste do adaptador Jev (simulado)')
    })
  })
})
