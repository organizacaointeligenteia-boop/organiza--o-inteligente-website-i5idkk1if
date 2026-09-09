/**
 * Helper de atribuição e rastreamento de UTM para o checkout Kiwify.
 *
 * Requisitos:
 * 1. Lê utm_source, utm_medium, utm_campaign, utm_content da URL atual.
 * 2. Guarda SOMENTE esses 4 valores em sessionStorage, sem cookies de terceiros nem dados pessoais.
 * 3. Repassa UTMs ao link do checkout oficial (https://pay.kiwify.com.br/qpFPGxF).
 * 4. Aplica padrões quando não houver campanha:
 *    utm_source=site, utm_medium=referral, utm_campaign=kit_organizacao_inteligente
 * 5. Define utm_content por posição do CTA (ex: diagnostico_resultado, pagina_kit, home).
 * 6. Preserva parâmetros pré-existentes na URL do checkout.
 */

export const KIWIFY_CHECKOUT_BASE_URL = 'https://pay.kiwify.com.br/qpFPGxF'

export const DEFAULT_UTM = {
  utm_source: 'site',
  utm_medium: 'referral',
  utm_campaign: 'kit_organizacao_inteligente',
} as const

export const UTM_SESSION_STORAGE_KEY = 'oi_utm_params'

export type UtmPosition = 'diagnostico_resultado' | 'pagina_kit' | 'home' | (string & {})

export interface UtmParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
}

const ALLOWED_UTM_KEYS: (keyof UtmParams)[] = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
]

/**
 * Lê os parâmetros UTM presentes na query string fornecida (ou na window.location.search).
 * Retorna apenas as chaves permitidas que contenham valor não-vazio.
 */
export function readUtmFromQuery(search?: string): UtmParams {
  const params: UtmParams = {}
  try {
    let queryString = search
    if (queryString === undefined && typeof window !== 'undefined' && window.location) {
      queryString = window.location.search
    }
    if (!queryString) return params

    const searchParams = new URLSearchParams(queryString)
    for (const key of ALLOWED_UTM_KEYS) {
      const val = searchParams.get(key)
      if (val && val.trim()) {
        params[key] = val.trim()
      }
    }
  } catch {
    // Fail silently in non-browser or malformed url environments
  }
  return params
}

/**
 * Lê os UTMs salvos em sessionStorage (SOMENTE as 4 chaves permitidas).
 */
export function getStoredUtm(): UtmParams {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.sessionStorage.getItem(UTM_SESSION_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}

    const safeParams: UtmParams = {}
    for (const key of ALLOWED_UTM_KEYS) {
      if (typeof parsed[key] === 'string' && parsed[key].trim()) {
        safeParams[key] = parsed[key].trim()
      }
    }
    return safeParams
  } catch {
    return {}
  }
}

/**
 * Salva SOMENTE as 4 chaves de UTM no sessionStorage.
 * Nunca armazena dados pessoais (e-mail, nome, IP, etc).
 */
export function setStoredUtm(params: UtmParams): void {
  if (typeof window === 'undefined') return
  try {
    const safeParams: UtmParams = {}
    for (const key of ALLOWED_UTM_KEYS) {
      if (params[key] && typeof params[key] === 'string' && params[key].trim()) {
        safeParams[key] = params[key].trim()
      }
    }
    if (Object.keys(safeParams).length === 0) return
    window.sessionStorage.setItem(UTM_SESSION_STORAGE_KEY, JSON.stringify(safeParams))
  } catch {
    // sessionStorage pode estar desabilitado (modo anônimo restrito, etc.)
  }
}

/**
 * Captura os UTMs da query atual (se existirem), mescla com os previamente gravados e
 * persiste a sessão no sessionStorage. Retorna os UTMs finais consolidados.
 */
export function captureAndPersistUtm(search?: string): UtmParams {
  const fromQuery = readUtmFromQuery(search)
  const stored = getStoredUtm()

  // Prioriza a query string atual, depois o que já foi guardado na sessão
  const consolidated: UtmParams = {
    ...stored,
    ...fromQuery,
  }

  if (Object.keys(consolidated).length > 0) {
    setStoredUtm(consolidated)
  }

  return consolidated
}

/**
 * Sanitiza parâmetros UTM para envio a APIs (ex.: POST /backend/v1/diagnosis/subscribe).
 * Regras:
 * - Apenas valores string
 * - Trim de espaços
 * - Limite máximo de 100 caracteres por valor
 * - Omitir campos ausentes ou que resultem em string vazia
 */
export function sanitizeUtmForSubmission(raw: unknown): UtmParams {
  if (!raw || typeof raw !== 'object') {
    return {}
  }

  const source = raw as Record<string, unknown>
  const result: UtmParams = {}

  for (const key of ALLOWED_UTM_KEYS) {
    const val = source[key]
    if (typeof val === 'string') {
      const trimmed = val.trim()
      if (trimmed.length > 0) {
        result[key] = trimmed.slice(0, 100)
      }
    }
  }

  return result
}

/**
 * Constrói a URL do checkout Kiwify com as UTMs de atribuição:
 * - Mantém a base configurada (padrão https://pay.kiwify.com.br/qpFPGxF)
 * - Preserva quaisquer query params já existentes na baseUrl
 * - Aplica os UTMs capturados na sessão/URL
 * - Aplica os valores padrão (utm_source=site, utm_medium=referral, utm_campaign=kit_organizacao_inteligente) quando ausentes
 * - Define o utm_content com a posição do CTA (ou respeita a posição passada como fallback)
 */
export function getKiwifyCheckoutUrl(
  position: UtmPosition = 'pagina_kit',
  baseUrl: string = KIWIFY_CHECKOUT_BASE_URL,
  currentSearch?: string,
): string {
  try {
    const currentUtm = captureAndPersistUtm(currentSearch)

    // Faz o parse seguro da baseUrl preservando seus parâmetros existentes
    const url = new URL(baseUrl)

    // Valores finais com fallback padrão
    const finalSource = currentUtm.utm_source || DEFAULT_UTM.utm_source
    const finalMedium = currentUtm.utm_medium || DEFAULT_UTM.utm_medium
    const finalCampaign = currentUtm.utm_campaign || DEFAULT_UTM.utm_campaign
    const finalContent = currentUtm.utm_content || position

    // Aplica/sobrescreve UTMs na URL de checkout
    url.searchParams.set('utm_source', finalSource)
    url.searchParams.set('utm_medium', finalMedium)
    url.searchParams.set('utm_campaign', finalCampaign)
    if (finalContent) {
      url.searchParams.set('utm_content', finalContent)
    }

    return url.toString()
  } catch {
    // Fallback gracioso caso a URL seja inválida ou o ambiente não suporte URL API
    return baseUrl
  }
}
