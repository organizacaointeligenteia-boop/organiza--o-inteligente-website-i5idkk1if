import {
  JEV_PROJECT_ID,
  JEV_MODEL_ID,
  type JevClassificationResponseRaw,
  type JevAdapterResult,
} from './jevContract'
import { evaluateJevResponseEnvelope } from './jevAdapter'

export interface JevSyntheticFixture {
  id: 'fixture-a' | 'fixture-b' | 'fixture-c' | 'fixture-d' | 'fixture-e' | 'fixture-f'
  categoryKey:
    | 'valid_routine'
    | 'ambiguous'
    | 'restricted'
    | 'invalid_enum'
    | 'incoherent_probs'
    | 'wrong_brand'
  label: string
  description: string
  simulatedInputSummary: string
  rawResponse: JevClassificationResponseRaw | Record<string, unknown>
  expectedDecision: 'approved' | 'review' | 'blocked'
}

/**
 * 6 FIXED synthetic fixtures:
 * (a) válido rotina/time com alta confiança;
 * (b) intenção ambígua com baixa confiança;
 * (c) restricted misturado a rotina;
 * (d) enum inválido;
 * (e) probabilidades incoerentes;
 * (f) resposta de outra marca.
 */
export const JEV_SYNTHETIC_FIXTURES: readonly JevSyntheticFixture[] = [
  {
    id: 'fixture-a',
    categoryKey: 'valid_routine',
    label: '(a) Válido: Rotina / Tempo (Alta Confiança)',
    description:
      'Resposta estritamente válida segundo o esquema: intent="routine" (p=0.92, conf=0.92) e topic="time" (p=0.88, conf=0.88).',
    simulatedInputSummary: 'Exemplo sintético de rotina diária e gestão de tempo',
    expectedDecision: 'approved',
    rawResponse: {
      project: JEV_PROJECT_ID,
      model: JEV_MODEL_ID,
      answers: {
        intent: {
          type: 'choice',
          choice: 'routine',
          confidence: 0.92,
          probabilities: {
            routine: 0.92,
            kit: 0.03,
            guidance: 0.02,
            unknown: 0.02,
            restricted: 0.01,
          },
        },
        topic: {
          type: 'choice',
          choice: 'time',
          confidence: 0.88,
          probabilities: {
            time: 0.88,
            priorities: 0.06,
            consistency: 0.04,
            general: 0.02,
          },
        },
      },
      usage: {
        input_tokens: 180,
        output_tokens: 28,
      },
    },
  },
  {
    id: 'fixture-b',
    categoryKey: 'ambiguous',
    label: '(b) Intenção Ambígua (Baixa Confiança < 0.8)',
    description:
      'A confiança retornada (0.54) fica abaixo do limiar provisório não calibrado de 0.8. O adaptador encaminha para revisão manual sem inventar certeza.',
    simulatedInputSummary: 'Exemplo com intenção dividida entre rotina e kit',
    expectedDecision: 'review',
    rawResponse: {
      project: JEV_PROJECT_ID,
      model: JEV_MODEL_ID,
      answers: {
        intent: {
          type: 'choice',
          choice: 'routine',
          confidence: 0.54,
          probabilities: {
            routine: 0.54,
            kit: 0.4,
            guidance: 0.03,
            unknown: 0.02,
            restricted: 0.01,
          },
        },
        topic: {
          type: 'choice',
          choice: 'general',
          confidence: 0.6,
          probabilities: {
            time: 0.15,
            priorities: 0.15,
            consistency: 0.1,
            general: 0.6,
          },
        },
      },
      usage: {
        input_tokens: 195,
        output_tokens: 32,
      },
    },
  },
  {
    id: 'fixture-c',
    categoryKey: 'restricted',
    label: '(c) Restricted Dominante (Misturado a Rotina)',
    description:
      'Mesmo com termos de rotina e confiança moderada (0.75), o tema restrito clínico/jurídico/financeiro tem precedência absoluta e bloqueia a saída.',
    simulatedInputSummary: 'Exemplo sintético mencionando rotina junto de tema clínico/jurídico',
    expectedDecision: 'blocked',
    rawResponse: {
      project: JEV_PROJECT_ID,
      model: JEV_MODEL_ID,
      answers: {
        intent: {
          type: 'choice',
          choice: 'restricted',
          confidence: 0.75,
          probabilities: {
            restricted: 0.75,
            routine: 0.2,
            kit: 0.02,
            guidance: 0.02,
            unknown: 0.01,
          },
        },
        topic: {
          type: 'choice',
          choice: 'general',
          confidence: 0.85,
          probabilities: {
            time: 0.05,
            priorities: 0.05,
            consistency: 0.05,
            general: 0.85,
          },
        },
      },
      usage: {
        input_tokens: 210,
        output_tokens: 30,
      },
    },
  },
  {
    id: 'fixture-d',
    categoryKey: 'invalid_enum',
    label: '(d) Enum Inválido (Violação de Esquema)',
    description:
      'O envelope traz valor "custom_intent" inexistente no enum fechado de intenções. O adaptador rejeita e classifica como revisão/unknown sem cast cego.',
    simulatedInputSummary: 'Simulação de erro em que modelo inventa categoria não autorizada',
    expectedDecision: 'review',
    rawResponse: {
      project: JEV_PROJECT_ID,
      model: JEV_MODEL_ID,
      answers: {
        intent: {
          type: 'choice',
          choice: 'custom_intent_invalid',
          confidence: 0.95,
          probabilities: {
            routine: 0.05,
            kit: 0.0,
            guidance: 0.0,
            unknown: 0.0,
            restricted: 0.0,
            // chave extra inválida
            custom_intent_invalid: 0.95,
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
    },
  },
  {
    id: 'fixture-e',
    categoryKey: 'incoherent_probs',
    label: '(e) Probabilidades Incoerentes (Soma != 1 e Choice Inconsistente)',
    description:
      'Probabilidades somam 1.40 e choice indicado difere do máximo real da distribuição. O validador estrito detecta anomalia matemática e rejeita.',
    simulatedInputSummary: 'Simulação de anomalia numérica e distribuição corrompida',
    expectedDecision: 'review',
    rawResponse: {
      project: JEV_PROJECT_ID,
      model: JEV_MODEL_ID,
      answers: {
        intent: {
          type: 'choice',
          choice: 'kit', // inconsistente: kit tem 0.20, routine tem 0.80
          confidence: 0.9,
          probabilities: {
            routine: 0.8,
            kit: 0.2,
            guidance: 0.2,
            unknown: 0.1,
            restricted: 0.1,
          }, // soma = 1.40
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
    },
  },
  {
    id: 'fixture-f',
    categoryKey: 'wrong_brand',
    label: '(f) Envelope de Outra Marca (project Incompatível)',
    description:
      'Envelope pertence a "marca-terceira" e não ao identificador isolado "organizacao-inteligente". O adaptador isola o escopo e rejeita prontamente.',
    simulatedInputSummary: 'Simulação de envelope recebido com namespace de outro produto',
    expectedDecision: 'review',
    rawResponse: {
      project: 'marca-terceira-financeira',
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
            priorities: 0.04,
            consistency: 0.02,
            general: 0.02,
          },
        },
      },
    },
  },
]

export interface FixtureRunResult {
  fixture: JevSyntheticFixture
  adapterResult: JevAdapterResult
  isMatchingExpectedDecision: boolean
}

/**
 * Executes all 6 synthetic fixtures purely locally in-memory.
 * Absolutely no network call, fetch, storage or credential reading.
 */
export function runSyntheticFixturesSimulation(): FixtureRunResult[] {
  return JEV_SYNTHETIC_FIXTURES.map((fixture) => {
    const adapterResult = evaluateJevResponseEnvelope(fixture.rawResponse)
    const isMatchingExpectedDecision = adapterResult.decision === fixture.expectedDecision
    return {
      fixture,
      adapterResult,
      isMatchingExpectedDecision,
    }
  })
}
