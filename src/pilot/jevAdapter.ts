import {
  JEV_PROJECT_ID,
  JEV_MODEL_ID,
  JEV_PROVISIONAL_CONFIDENCE_THRESHOLD,
  JEV_PROVISIONAL_THRESHOLD_LABEL,
  JEV_INTENT_OPTIONS,
  JEV_TOPIC_OPTIONS,
  type TypeSafeRequestBody,
  type JevRequestEnvelope,
  type TypeSafeResponseBodyRaw,
  type JevResponseEnvelope,
  type JevIntentChoice,
  type JevTopicChoice,
  type JevAdapterResult,
  type ValidatedChoiceAnswer,
  type TypeSafeChoiceAnswer,
} from './jevContract'
import { resolveSuggestedModel } from './catalog'
import type { PilotPath } from './types'

/**
 * Builds the native request body for the TypeSafe Choice primitive.
 * Contains EXATAMENTE state, model, questions (sem project nem metadados extras).
 */
export function buildTypeSafeRequestBody(stateText: string): TypeSafeRequestBody {
  return {
    state: stateText,
    model: JEV_MODEL_ID,
    questions: {
      intent: {
        type: 'choice',
        instructions:
          'Classifique a intenção principal do usuário para apoiar sua organização pessoal.',
        criteria: {
          restricted:
            'PRIORIDADE MÁXIMA: Menciona temas clínicos, médicos, sintomas, medicamentos, psiquiatria, terapia, processos jurídicos, direito, audiências, dívidas, investimentos, bitcoin ou tributos. Deve ter precedência absoluta sobre qualquer outro tema.',
          routine:
            'Organização da rotina diária ou semanal, distribuição de tempo, gestão de tarefas, foco e criação de constância.',
          kit: 'Interesse em conhecer ferramentas, modelos conceituais, planners, planilhas ou templates de organização.',
          guidance:
            'Dúvida de como começar, orientações práticas de uso ou passos guiados para aplicar o método.',
          unknown:
            'Texto vago, ambíguo, sem sentido, genérico ou que não se encaixa nas demais opções.',
        },
      },
      topic: {
        type: 'choice',
        instructions:
          'Se a intenção for organização de rotina ou foco geral, qual é o tema específico abordado?',
        criteria: {
          time: 'Gestão da agenda diária/semanal, blocos de horário e planejamento do tempo.',
          priorities:
            'Definição de tarefas essenciais, foco no que é urgente e redução de sobrecarga.',
          consistency: 'Criação e manutenção de hábitos regulares, disciplina e rotina diária.',
          general:
            'Visão ampla de organização pessoal, múltiplos temas combinados ou não especificado.',
        },
      },
    },
  }
}

/**
 * Builds the local request envelope wrapping the native request with mandatory brand isolation metadata.
 * 'project' is mandatory local metadata ('organizacao-inteligente') and not sent to the remote API.
 */
export function buildJevRequestEnvelope(stateText: string): JevRequestEnvelope {
  return {
    project: JEV_PROJECT_ID,
    request: buildTypeSafeRequestBody(stateText),
  }
}

/**
 * Backwards compatibility alias for buildJevRequestEnvelope.
 */
export const buildJevClassificationRequest = buildJevRequestEnvelope

/**
 * Strict validator for a single Choice answer according to TypeSafe contract.
 * Checks:
 * 1. answer is a valid object with type === 'choice'
 * 2. choice is a known member of expectedOptions
 * 3. confidence is a finite number in [0, 1]
 * 4. probabilities is an object containing EXACTLY all expectedOptions keys (no missing, no extra)
 * 5. each probability is a finite number in [0, 1]
 * 6. sum of probabilities ~= 1 (within tolerance 0.005)
 * 7. choice corresponds to the key with the maximum probability (within tolerance 0.005)
 */
export type ChoiceValidationResult<T extends string> =
  | { valid: true; value: ValidatedChoiceAnswer<T>; errors?: never }
  | { valid: false; errors: string[]; value?: never }

export function validateStrictChoiceAnswer<T extends string>(
  raw: unknown,
  expectedOptions: readonly T[],
  questionName: string,
): ChoiceValidationResult<T> {
  const errors: string[] = []

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, errors: [`${questionName}: resposta não é um objeto válido`] }
  }

  const obj = raw as Partial<TypeSafeChoiceAnswer<T>>

  // 1. type === 'choice'
  if (obj.type !== 'choice') {
    errors.push(`${questionName}: type deve ser 'choice', recebido '${String(obj.type)}'`)
  }

  // 2. choice is known member of expectedOptions
  const rawChoice = obj.choice as T
  if (!rawChoice || !expectedOptions.includes(rawChoice)) {
    errors.push(
      `${questionName}: choice inválido ('${String(rawChoice)}'). Esperado um de: ${expectedOptions.join(', ')}`,
    )
  }

  // 3. confidence is finite number in [0, 1]
  const conf = obj.confidence
  if (
    typeof conf !== 'number' ||
    !Number.isFinite(conf) ||
    Number.isNaN(conf) ||
    conf < 0 ||
    conf > 1
  ) {
    errors.push(
      `${questionName}: confidence deve ser número finito entre 0 e 1, recebido '${String(conf)}'`,
    )
  }

  // 4 & 5. probabilities must have EXACTLY all expected keys and finite values in [0, 1]
  const probs = obj.probabilities
  if (!probs || typeof probs !== 'object' || Array.isArray(probs)) {
    errors.push(`${questionName}: probabilities ausente ou inválido`)
  } else {
    const probKeys = Object.keys(probs)
    const expectedSet = new Set(expectedOptions as readonly string[])

    // Check missing keys
    for (const opt of expectedOptions) {
      if (!(opt in probs)) {
        errors.push(`${questionName}: chave '${opt}' ausente na distribuição de probabilidades`)
      }
    }

    // Check unexpected extra keys
    for (const k of probKeys) {
      if (!expectedSet.has(k)) {
        errors.push(
          `${questionName}: chave extra inesperada '${k}' na distribuição de probabilidades`,
        )
      }
    }

    // Check each value in [0, 1]
    let sum = 0
    let maxProb = -Infinity
    let maxKey: T | null = null

    for (const opt of expectedOptions) {
      const val = (probs as Record<string, unknown>)[opt]
      if (
        typeof val !== 'number' ||
        !Number.isFinite(val) ||
        Number.isNaN(val) ||
        val < 0 ||
        val > 1
      ) {
        errors.push(
          `${questionName}: probabilidade para '${opt}' deve ser número finito entre 0 e 1, recebido '${String(val)}'`,
        )
      } else {
        sum += val
        if (val > maxProb) {
          maxProb = val
          maxKey = opt
        }
      }
    }

    // 6. sum ~= 1 (tolerance 0.005)
    if (Math.abs(sum - 1.0) > 0.005) {
      errors.push(
        `${questionName}: soma das probabilidades (${sum.toFixed(4)}) difere de 1.0 além da tolerância`,
      )
    }

    // 7. choice matches maximum probability (within tolerance 0.005)
    if (rawChoice && expectedOptions.includes(rawChoice)) {
      const choiceProb = (probs as Record<string, number>)[rawChoice]
      if (typeof choiceProb === 'number' && maxProb > -Infinity) {
        // If the difference between choiceProb and maxProb is larger than 0.005, choice is incoherent
        if (maxProb - choiceProb > 0.005) {
          errors.push(
            `${questionName}: choice '${String(rawChoice)}' (p=${choiceProb}) não coincide com o máximo da distribuição ('${String(maxKey)}', p=${maxProb})`,
          )
        }
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    value: {
      choice: rawChoice,
      confidence: conf as number,
      probabilities: probs as Record<T, number>,
    },
  }
}

/**
 * Evaluates the native response body from TypeSafe / Jev after envelope unwrapping.
 */
export function evaluateTypeSafeResponseBody(
  nativeBody: unknown,
  provisionalThreshold: number = JEV_PROVISIONAL_CONFIDENCE_THRESHOLD,
): JevAdapterResult {
  const thresholdDisclaimer = `Limiar de confiança: ${provisionalThreshold} (provisório e NÃO calibrado; confiança reflete apenas a dispersão matemática das probabilidades, não mede acurácia do modelo)`

  if (!nativeBody || typeof nativeBody !== 'object' || Array.isArray(nativeBody)) {
    return {
      decision: 'review',
      decisionReason: 'Corpo nativo da resposta inválido ou não é um objeto.',
      intent: 'unknown',
      topic: 'general',
      provisionalConfidenceThreshold: provisionalThreshold,
      isThresholdCalibrated: false,
      thresholdDisclaimer,
      rawIntentConfidence: null,
      rawTopicConfidence: null,
      suggestedModelKey: null,
      suggestedPath: null,
      validationErrors: ['Corpo nativo da resposta não é um objeto válido.'],
    }
  }

  const responseObj = nativeBody as Partial<TypeSafeResponseBodyRaw>
  const errors: string[] = []

  // Model identifier check
  if (!responseObj.model || typeof responseObj.model !== 'string') {
    errors.push("Campo 'model' ausente ou inválido na resposta.")
  }

  // Answers container check
  if (
    !responseObj.answers ||
    typeof responseObj.answers !== 'object' ||
    Array.isArray(responseObj.answers)
  ) {
    errors.push("Campo 'answers' ausente ou inválido na resposta.")
    return {
      decision: 'review',
      decisionReason: 'Respostas ausentes na resposta.',
      intent: 'unknown',
      topic: 'general',
      provisionalConfidenceThreshold: provisionalThreshold,
      isThresholdCalibrated: false,
      thresholdDisclaimer,
      rawIntentConfidence: null,
      rawTopicConfidence: null,
      suggestedModelKey: null,
      suggestedPath: null,
      validationErrors: errors,
    }
  }

  // Strict validation of intent and topic
  const intentVal = validateStrictChoiceAnswer<JevIntentChoice>(
    responseObj.answers.intent,
    JEV_INTENT_OPTIONS,
    'intent',
  )
  const topicVal = validateStrictChoiceAnswer<JevTopicChoice>(
    responseObj.answers.topic,
    JEV_TOPIC_OPTIONS,
    'topic',
  )

  if (!intentVal.valid) {
    errors.push(...intentVal.errors)
  }
  if (!topicVal.valid) {
    errors.push(...topicVal.errors)
  }

  // If validation failed, fallback to review with unknown
  if (!intentVal.valid || !topicVal.valid) {
    return {
      decision: 'review',
      decisionReason:
        'Falha na validação matemática ou de esquema do contrato. Nenhuma certeza foi presumida.',
      intent: 'unknown',
      topic: 'general',
      provisionalConfidenceThreshold: provisionalThreshold,
      isThresholdCalibrated: false,
      thresholdDisclaimer,
      rawIntentConfidence: intentVal.valid ? intentVal.value.confidence : null,
      rawTopicConfidence: topicVal.valid ? topicVal.value.confidence : null,
      suggestedModelKey: null,
      suggestedPath: null,
      validationErrors: errors,
    }
  }

  const intentAnswer = intentVal.value
  const topicAnswer = topicVal.value

  // RESTRICTED DOMINANCE: Restricted overrides everything, even with lower confidence
  if (intentAnswer.choice === 'restricted') {
    return {
      decision: 'blocked',
      decisionReason:
        'Tema com restrição clínica, jurídica ou financeira detectado. Precedência absoluta de proteção.',
      intent: 'restricted',
      topic: 'general',
      provisionalConfidenceThreshold: provisionalThreshold,
      isThresholdCalibrated: false,
      thresholdDisclaimer,
      rawIntentConfidence: intentAnswer.confidence,
      rawTopicConfidence: topicAnswer.confidence,
      suggestedModelKey: null,
      suggestedPath: null,
      restrictedReason:
        'O tema mencionado envolve saúde, direito ou finanças e está fora do escopo desta demonstração de organização pessoal. Por favor, consulte profissionais especializados para essas áreas.',
      validationErrors: [],
    }
  }

  // Unknown intent: External unknown must NOT be cast to certainty
  if (intentAnswer.choice === 'unknown') {
    return {
      decision: 'review',
      decisionReason: 'O modelo classificou a entrada como desconhecida ou fora de escopo.',
      intent: 'unknown',
      topic: topicAnswer.choice,
      provisionalConfidenceThreshold: provisionalThreshold,
      isThresholdCalibrated: false,
      thresholdDisclaimer,
      rawIntentConfidence: intentAnswer.confidence,
      rawTopicConfidence: topicAnswer.confidence,
      suggestedModelKey: null,
      suggestedPath: null,
      validationErrors: [],
    }
  }

  // Confidence threshold check (provisional 0.8)
  const isConfidenceLow =
    intentAnswer.confidence < provisionalThreshold || topicAnswer.confidence < provisionalThreshold

  if (isConfidenceLow) {
    return {
      decision: 'review',
      decisionReason: `Confiança (${intentAnswer.confidence.toFixed(2)} em intenção / ${topicAnswer.confidence.toFixed(2)} em tópico) abaixo do limiar provisório de ${provisionalThreshold}. Encaminhado para revisão manual.`,
      intent: intentAnswer.choice,
      topic: topicAnswer.choice,
      provisionalConfidenceThreshold: provisionalThreshold,
      isThresholdCalibrated: false,
      thresholdDisclaimer,
      rawIntentConfidence: intentAnswer.confidence,
      rawTopicConfidence: topicAnswer.confidence,
      suggestedModelKey: null,
      suggestedPath: null,
      validationErrors: [],
    }
  }

  // Approved: map strictly to existing static editorial catalog
  let suggestedPath: PilotPath | null = null
  if (intentAnswer.choice === 'routine') suggestedPath = 'routine'
  else if (intentAnswer.choice === 'kit') suggestedPath = 'kit'
  else if (intentAnswer.choice === 'guidance') suggestedPath = 'guidance'

  const suggestedModelKey = resolveSuggestedModel(topicAnswer.choice, undefined)

  return {
    decision: 'approved',
    decisionReason: `Classificação validada com sucesso pelo contrato Jev (intenção: ${intentAnswer.choice}, tópico: ${topicAnswer.choice}).`,
    intent: intentAnswer.choice,
    topic: topicAnswer.choice,
    provisionalConfidenceThreshold: provisionalThreshold,
    isThresholdCalibrated: false,
    thresholdDisclaimer,
    rawIntentConfidence: intentAnswer.confidence,
    rawTopicConfidence: topicAnswer.confidence,
    suggestedModelKey,
    suggestedPath,
    validationErrors: [],
  }
}

/**
 * Pure local adapter evaluation of a local response envelope (unknown input).
 *
 * Rules:
 * 1. Brand isolation: Envelope must be an object with MANDATORY `project` strictly === 'organizacao-inteligente'.
 *    If `project` is missing, undefined, null, or different from 'organizacao-inteligente', the adapter REJECTS immediately
 *    (decision = 'review', intent = 'unknown', validation error recorded, NEVER invented certainty).
 * 2. Unwrapping: The native response body is extracted from `response` (or legacy root format if structured as envelope)
 *    and validated strictly.
 * 3. Strict schema parsing: Invalid schema => decision = 'review', intent = 'unknown', NEVER invented certainty.
 * 4. Priority of 'restricted': If intent is 'restricted', decision is ALWAYS 'blocked', regardless of confidence or threshold.
 * 5. External 'unknown': If model returned 'unknown', decision is ALWAYS 'review'.
 * 6. Provisional threshold (0.8, not calibrated): If confidence of either intent or topic is below 0.8, decision is 'review'.
 * 7. Editorial catalog mapping: Uses ONLY existing static models (priorities, week, steps). NO generative text.
 */
export function evaluateJevResponseEnvelope(
  rawEnvelope: unknown,
  provisionalThreshold: number = JEV_PROVISIONAL_CONFIDENCE_THRESHOLD,
): JevAdapterResult {
  const thresholdDisclaimer = `Limiar de confiança: ${provisionalThreshold} (provisório e NÃO calibrado; confiança reflete apenas a dispersão matemática das probabilidades, não mede acurácia do modelo)`

  // 1. Initial envelope structural check
  if (!rawEnvelope || typeof rawEnvelope !== 'object' || Array.isArray(rawEnvelope)) {
    return {
      decision: 'review',
      decisionReason: 'Envelope da resposta inválido ou não é um objeto.',
      intent: 'unknown',
      topic: 'general',
      provisionalConfidenceThreshold: provisionalThreshold,
      isThresholdCalibrated: false,
      thresholdDisclaimer,
      rawIntentConfidence: null,
      rawTopicConfidence: null,
      suggestedModelKey: null,
      suggestedPath: null,
      validationErrors: ['Envelope raiz não é um objeto válido.'],
    }
  }

  const envelopeObj = rawEnvelope as Record<string, unknown>

  // 2. Mandatory brand isolation check: 'project' must exist and be strictly 'organizacao-inteligente'
  if (
    !('project' in envelopeObj) ||
    envelopeObj.project === undefined ||
    envelopeObj.project === null
  ) {
    return {
      decision: 'review',
      decisionReason: 'Resposta rejeitada: metadado local de marca "project" ausente no envelope.',
      intent: 'unknown',
      topic: 'general',
      provisionalConfidenceThreshold: provisionalThreshold,
      isThresholdCalibrated: false,
      thresholdDisclaimer,
      rawIntentConfidence: null,
      rawTopicConfidence: null,
      suggestedModelKey: null,
      suggestedPath: null,
      validationErrors: [
        `Marca/projeto obrigatório ausente: esperado '${JEV_PROJECT_ID}', mas o campo 'project' não foi informado`,
      ],
    }
  }

  if (envelopeObj.project !== JEV_PROJECT_ID) {
    const errorMsg = `Marca/projeto rejeitado: envelope pertence a '${String(envelopeObj.project)}', esperado '${JEV_PROJECT_ID}'`
    return {
      decision: 'review',
      decisionReason: 'Resposta rejeitada: marca ou projeto incompatível com esta aplicação.',
      intent: 'unknown',
      topic: 'general',
      provisionalConfidenceThreshold: provisionalThreshold,
      isThresholdCalibrated: false,
      thresholdDisclaimer,
      rawIntentConfidence: null,
      rawTopicConfidence: null,
      suggestedModelKey: null,
      suggestedPath: null,
      validationErrors: [errorMsg],
    }
  }

  // 3. Extract native response body:
  // In the standard JevResponseEnvelope: { project: 'organizacao-inteligente', response: TypeSafeResponseBodyRaw }
  // For backwards compatibility or flat shape with answers: if envelopeObj.response is an object, use it; else if envelopeObj.answers exists, evaluate envelopeObj as body.
  const nativeBody =
    'response' in envelopeObj && envelopeObj.response && typeof envelopeObj.response === 'object'
      ? envelopeObj.response
      : envelopeObj

  return evaluateTypeSafeResponseBody(nativeBody, provisionalThreshold)
}
