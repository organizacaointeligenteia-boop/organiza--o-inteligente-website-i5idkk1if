// src/pilot/standaloneConfig.ts
/**
 * Configuração e estado do endpoint isolado do backend standalone da OI.
 *
 * REGRAS MANDATÓRIAS:
 * 1. Fail closed por padrão: se a variável de ambiente VITE_STANDALONE_OI_API_URL estiver vazia ou não informada,
 *    o endpoint isolado é considerado NÃO CONFIGURADO (isConfigured: false).
 * 2. NUNCA utilizar ou fazer fallback para o PocketBase compartilhado do site ou do Kit.
 * 3. O usuário pode informar a URL do backend local/isolado em tempo de execução na interface de preview
 *    para testes e conferência, mas isso afeta apenas a sessão do cliente e nunca salva credenciais no servidor compartilhado.
 */

const STORAGE_KEY_CUSTOM_ENDPOINT = 'oi_custom_standalone_endpoint'

/**
 * Valida se uma URL aponta estritamente para loopback (127.0.0.1 ou localhost).
 * Rejeita qualquer outro host/IP.
 */
export function isLoopbackEndpoint(urlStr: string): boolean {
  if (!urlStr || !urlStr.trim()) return false
  try {
    const parsed = new URL(urlStr.trim())
    const host = parsed.hostname.toLowerCase()
    return host === '127.0.0.1' || host === 'localhost'
  } catch {
    return false
  }
}

export function getStandaloneApiUrl(): string {
  // 1. Variável de build/ambiente (preferência oficial, validada como loopback)
  const envUrl = (import.meta.env.VITE_STANDALONE_OI_API_URL as string | undefined)?.trim()
  if (envUrl && isLoopbackEndpoint(envUrl)) {
    return envUrl
  }

  // 2. Override temporário de teste na preview (se o desenvolvedor/proprietário informou na UI técnica recolhida)
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY_CUSTOM_ENDPOINT)
      if (stored && stored.trim().length > 0 && isLoopbackEndpoint(stored)) {
        return stored.trim()
      }
    } catch {
      /* intentionally ignored */
    }
  }

  // 3. Padrão honesto: VAZIO => Fail-closed
  return ''
}

export function setCustomStandaloneApiUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.removeItem(STORAGE_KEY_CUSTOM_ENDPOINT)
      } catch {
        /* intentionally ignored */
      }
    }
    return true
  }

  if (!isLoopbackEndpoint(trimmed)) {
    return false
  }

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY_CUSTOM_ENDPOINT, trimmed)
    } catch {
      /* intentionally ignored */
    }
  }
  return true
}

export function isStandaloneConfigured(): boolean {
  const url = getStandaloneApiUrl()
  return Boolean(url && url.length > 0)
}
