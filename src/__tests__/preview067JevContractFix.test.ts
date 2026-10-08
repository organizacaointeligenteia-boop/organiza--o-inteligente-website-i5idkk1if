import { describe, it, expect } from 'vitest'
import {
  JEV_PROJECT_ID,
  JEV_MODEL_ID,
  type TypeSafeRequestBody,
  type JevRequestEnvelope,
  type JevResponseEnvelope,
  type TypeSafeResponseBodyRaw,
} from '@/pilot/jevContract'
import {
  buildTypeSafeRequestBody,
  buildJevRequestEnvelope,
  evaluateJevResponseEnvelope,
} from '@/pilot/jevAdapter'

describe('Preview 0.0.67 - Regressões do Contrato Jev e Envelope de Marca', () => {
  describe('Regressão A: Serialização estrita do request nativo TypeSafe', () => {
    it('o corpo nativo TypeSafeRequestBody contém EXATAMENTE as chaves { state, model, questions }', () => {
      const stateText = 'Preciso organizar minha rotina e ter mais tempo livre'
      const nativeBody: TypeSafeRequestBody = buildTypeSafeRequestBody(stateText)

      // Chaves do objeto em memória
      const inMemoryKeys = Object.keys(nativeBody).sort()
      expect(inMemoryKeys).toEqual(['model', 'questions', 'state'].sort())
      expect('project' in (nativeBody as unknown as Record<string, unknown>)).toBe(false)

      // Serialização JSON estrita
      const serialized = JSON.stringify(nativeBody)
      const parsed = JSON.parse(serialized) as Record<string, unknown>
      const serializedKeys = Object.keys(parsed).sort()

      expect(serializedKeys).toEqual(['model', 'questions', 'state'].sort())
      expect(serializedKeys).toHaveLength(3)
      expect(serialized).not.toContain('"project"')
    })

    it('o envelope local JevRequestEnvelope encapsula project obrigatório com request nativo desacoplado', () => {
      const envelope: JevRequestEnvelope = buildJevRequestEnvelope('Texto de teste')

      expect(envelope.project).toBe(JEV_PROJECT_ID)
      expect(envelope.request).toBeDefined()
      expect(envelope.request.model).toBe(JEV_MODEL_ID)

      // Garantir que a chave project está no envelope, mas NÃO dentro de envelope.request
      expect('project' in envelope).toBe(true)
      expect('project' in (envelope.request as unknown as Record<string, unknown>)).toBe(false)
    })
  })

  describe('Regressão B: Envelopes de resposta sem project ou com project divergente', () => {
    const sampleNativeResponse: TypeSafeResponseBodyRaw = {
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
          confidence: 0.9,
          probabilities: {
            time: 0.9,
            priorities: 0.04,
            consistency: 0.03,
            general: 0.03,
          },
        },
      },
    }

    it('resposta recebida SEM campo "project" é rejeitada (decisão = review, nunca aprovado, nunca inventa certeza)', () => {
      // Passando diretamente o corpo nativo sem envelope
      const resWithoutProject = evaluateJevResponseEnvelope(sampleNativeResponse)

      expect(resWithoutProject.decision).toBe('review')
      expect(resWithoutProject.decision).not.toBe('approved')
      expect(resWithoutProject.intent).toBe('unknown')
      expect(resWithoutProject.validationErrors.length).toBeGreaterThan(0)
      expect(
        resWithoutProject.validationErrors.some((e) =>
          e.includes('Marca/projeto obrigatório ausente'),
        ),
      ).toBe(true)
    })

    it('envelope com "project" ausente/indefinido ({ response: ... }) é rejeitado', () => {
      const envelopeWithoutProject = {
        response: sampleNativeResponse,
      }

      const res = evaluateJevResponseEnvelope(envelopeWithoutProject)
      expect(res.decision).toBe('review')
      expect(res.decision).not.toBe('approved')
      expect(res.intent).toBe('unknown')
      expect(
        res.validationErrors.some((e) => e.includes('Marca/projeto obrigatório ausente')),
      ).toBe(true)
    })

    it('envelope com "project" divergente ("outra-marca") é rejeitado (decisão = review)', () => {
      const envelopeWrongBrand = {
        project: 'outra-marca',
        response: sampleNativeResponse,
      }

      const res = evaluateJevResponseEnvelope(envelopeWrongBrand)
      expect(res.decision).toBe('review')
      expect(res.decision).not.toBe('approved')
      expect(res.intent).toBe('unknown')
      expect(res.validationErrors.some((e) => e.includes('Marca/projeto rejeitado'))).toBe(true)
    })

    it('envelope legítimo com project="organizacao-inteligente" é aprovado com sucesso', () => {
      const legitimateEnvelope: JevResponseEnvelope = {
        project: JEV_PROJECT_ID,
        response: sampleNativeResponse,
      }

      const res = evaluateJevResponseEnvelope(legitimateEnvelope)
      expect(res.decision).toBe('approved')
      expect(res.intent).toBe('routine')
      expect(res.topic).toBe('time')
      expect(res.suggestedPath).toBe('routine')
      expect(res.suggestedModelKey).toBe('week')
    })
  })
})
