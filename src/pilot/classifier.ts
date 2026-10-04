import type { PilotPath, PilotTopic } from './types'

export type IntentResult = 'routine' | 'kit' | 'guidance' | 'unknown' | 'restricted'

export interface ClassificationOutput {
  source: 'demo-local'
  intent: IntentResult
  suggestedPath: PilotPath | null
  topic: PilotTopic
  restrictedReason?: string
  confidenceLabel: string
}

/**
 * Normalizes text: lowercase, removes diacritics / accents, strips extra punctuation.
 */
export function normalizeText(raw: string): string {
  if (!raw) return ''
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Restricted keywords list (clinical, legal, financial, crypto, medication).
 * These HAVE HIGHEST PRIORITY and always result in 'restricted'.
 */
const RESTRICTED_TERMS: string[] = [
  'diagnostico',
  'medicamento',
  'remedio',
  'saude',
  'laudo',
  'medico',
  'medica',
  'psiquiatra',
  'psicologo',
  'terapia',
  'depressao',
  'ansiedade',
  'sintoma',
  'doenca',
  'inss',
  'aposentadoria',
  'beneficio',
  'processo judicial',
  'processo',
  'juridico',
  'advogado',
  'advocacia',
  'audiencia',
  'contrato',
  'investir',
  'investimento',
  'emprestimo',
  'divida',
  'juros',
  'imposto',
  'tributo',
  'receita federal',
  'bitcoin',
  'cripto',
  'criptomoeda',
  'acoes',
  'bolsa de valores',
]

/**
 * Routine keywords.
 */
const TIME_TERMS = ['semana', 'agenda', 'tempo', 'horario', 'calendario', 'dia a dia']
const PRIORITY_TERMS = [
  'prioridade',
  'prioridades',
  'foco',
  'tarefa',
  'tarefas',
  'pendencia',
  'urgente',
]
const CONSISTENCY_TERMS = [
  'habito',
  'habitos',
  'constancia',
  'disciplina',
  'rotina',
  'frequencia',
  'costume',
]

/**
 * Kit / Tool keywords.
 */
const KIT_TERMS = [
  'kit',
  'ferramenta',
  'material',
  'modelo',
  'workbook',
  'planilha',
  'pdf',
  'template',
]

/**
 * Guidance / Usage keywords.
 */
const GUIDANCE_TERMS = [
  'como funciona',
  'como usar',
  'passo a passo',
  'orientacao',
  'usar',
  'uso',
  'comecar',
  'aplicar',
  'ajuda',
  'duvida',
]

function containsAny(normalized: string, terms: string[]): boolean {
  return terms.some((term) => {
    // Check as word boundary or direct substring when compound
    if (term.includes(' ')) {
      return normalized.includes(term)
    }
    const regex = new RegExp(`\\b${term}\\b`, 'i')
    return regex.test(normalized)
  })
}

/**
 * Pure rule-based classifier.
 * - Enforces strictly closed enum outputs
 * - Validated with source = 'demo-local'
 * - Text is NEVER stored, logged or echoed back
 */
export function classifyFreeText(rawText: string): ClassificationOutput {
  const normalized = normalizeText(rawText)

  if (!normalized) {
    return {
      source: 'demo-local',
      intent: 'unknown',
      suggestedPath: null,
      topic: 'general',
      confidenceLabel: 'vazio',
    }
  }

  // 1. HIGHEST PRIORITY: Check for restricted clinical/legal/financial topics
  if (containsAny(normalized, RESTRICTED_TERMS)) {
    return {
      source: 'demo-local',
      intent: 'restricted',
      suggestedPath: null,
      topic: 'general',
      restrictedReason:
        'O tema mencionado envolve saúde, direito ou finanças e está fora do escopo desta demonstração de organização pessoal. Por favor, consulte profissionais especializados para essas áreas.',
      confidenceLabel: 'regra_restrita',
    }
  }

  // 2. Kit / Material rules
  if (containsAny(normalized, KIT_TERMS)) {
    return {
      source: 'demo-local',
      intent: 'kit',
      suggestedPath: 'kit',
      topic: 'general',
      confidenceLabel: 'regra_kit',
    }
  }

  // 3. Guidance / How to use rules
  if (containsAny(normalized, GUIDANCE_TERMS)) {
    return {
      source: 'demo-local',
      intent: 'guidance',
      suggestedPath: 'guidance',
      topic: 'general',
      confidenceLabel: 'regra_orientacao',
    }
  }

  // 4. Routine topics (time / priorities / consistency)
  if (containsAny(normalized, TIME_TERMS)) {
    return {
      source: 'demo-local',
      intent: 'routine',
      suggestedPath: 'routine',
      topic: 'time',
      confidenceLabel: 'regra_tempo',
    }
  }

  if (containsAny(normalized, PRIORITY_TERMS)) {
    return {
      source: 'demo-local',
      intent: 'routine',
      suggestedPath: 'routine',
      topic: 'priorities',
      confidenceLabel: 'regra_prioridades',
    }
  }

  if (containsAny(normalized, CONSISTENCY_TERMS)) {
    return {
      source: 'demo-local',
      intent: 'routine',
      suggestedPath: 'routine',
      topic: 'consistency',
      confidenceLabel: 'regra_constancia',
    }
  }

  // 5. Default / Unknown: do not guess or pretend comprehension
  return {
    source: 'demo-local',
    intent: 'unknown',
    suggestedPath: null,
    topic: 'general',
    confidenceLabel: 'regra_desconhecido',
  }
}
