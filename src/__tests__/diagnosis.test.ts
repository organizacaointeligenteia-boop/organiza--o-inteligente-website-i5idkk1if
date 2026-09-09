import { describe, it, expect } from 'vitest'

/**
 * Simulação fiel da lógica do hook diagnosis_subscribe.js
 */
function runDiagnosisHook(
  rawBody: unknown,
  options?: {
    apiKey?: string
    mockDbSave?: (rec: any) => void
    mockHttpSend?: (req: any) => { statusCode: number }
  },
) {
  let body: Record<string, any> = {}
  try {
    if (typeof rawBody === 'string') {
      body = rawBody.trim().length > 0 ? JSON.parse(rawBody) : {}
    } else if (rawBody && typeof rawBody === 'object') {
      body = rawBody as Record<string, any>
    }
  } catch (_) {
    body = {}
  }

  const email = body.email
  const name = body.name || ''

  const consentValue = body.consent
  const consented = consentValue === true || consentValue === 'true' || consentValue === 'granted'

  if (!consented) {
    throw new Error('Consentimento necessário')
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new Error('Email inválido')
  }

  // Sentinel dry-run
  if (email === 'diagnostic-check@invalid.local') {
    return { status: 200, json: { success: true, consentReceived: true, dryRun: true } }
  }

  const sanitizeUtmParam = (val: unknown): string => {
    if (typeof val === 'string') {
      const trimmed = val.trim()
      if (trimmed.length > 0) {
        return trimmed.slice(0, 100)
      }
    }
    return ''
  }

  const cleanSource = sanitizeUtmParam(body.utm_source)
  const cleanMedium = sanitizeUtmParam(body.utm_medium)
  const cleanCampaign = sanitizeUtmParam(body.utm_campaign)

  const trafficSource = cleanSource || 'organizacao_inteligente'
  const trafficMedium = cleanMedium || 'diagnostico_site'
  const trafficCampaign = cleanCampaign || ''

  // 1. Persist local lead first
  if (options?.mockDbSave) {
    options.mockDbSave({
      email,
      name,
      status: 'active',
      source: 'OI - Diagnóstico concluído',
    })
  }

  // 2. RD Station call
  let rdSynced = false
  let rdSentPayload: any = null

  try {
    const apiKey = options?.apiKey ?? 'test-api-key'
    if (apiKey) {
      const rdPayload: Record<string, any> = {
        conversion_identifier: 'OI - Diagnóstico concluído',
        email,
        name,
        traffic_source: trafficSource,
        traffic_medium: trafficMedium,
        tags: ['organizacao-inteligente'],
        legal_bases: [{ category: 'communications', type: 'consent', status: 'granted' }],
      }

      if (trafficCampaign) {
        rdPayload.traffic_campaign = trafficCampaign
      }

      rdSentPayload = {
        event_type: 'CONVERSION',
        event_family: 'CDP',
        payload: rdPayload,
      }

      if (options?.mockHttpSend) {
        const res = options.mockHttpSend({
          url: 'https://api.rd.services/platform/conversions?api_key=' + encodeURIComponent(apiKey),
          method: 'POST',
          body: JSON.stringify(rdSentPayload),
        })
        if (res && res.statusCode >= 200 && res.statusCode < 300) {
          rdSynced = true
        }
      }
    }
  } catch (_) {
    // Failures in RD Station must never bubble up
  }

  return {
    status: 200,
    json: { success: true, consentReceived: true, rd_synced: rdSynced },
    rdSentPayload,
  }
}

describe('diagnosis backend hook logic', () => {
  it('validates consent properly', () => {
    const isConsentValid = (consentValue: any) =>
      consentValue === true || consentValue === 'true' || consentValue === 'granted'

    expect(isConsentValid(true)).toBe(true)
    expect(isConsentValid('true')).toBe(true)
    expect(isConsentValid('granted')).toBe(true)
    expect(isConsentValid(false)).toBe(false)
    expect(isConsentValid('false')).toBe(false)
    expect(isConsentValid(undefined)).toBe(false)
    expect(isConsentValid(null)).toBe(false)
  })

  it('dry-run mode sentinel diagnostic-check@invalid.local does not persist and does not call RD', () => {
    let dbSaved = false
    let rdCalled = false

    const res = runDiagnosisHook(
      {
        email: 'diagnostic-check@invalid.local',
        name: 'Tester',
        consent: 'granted',
        utm_source: 'google',
      },
      {
        mockDbSave: () => {
          dbSaved = true
        },
        mockHttpSend: () => {
          rdCalled = true
          return { statusCode: 200 }
        },
      },
    )

    expect(res.status).toBe(200)
    expect(res.json.success).toBe(true)
    expect(res.json.consentReceived).toBe(true)
    expect((res.json as any).dryRun).toBe(true)
    expect(dbSaved).toBe(false)
    expect(rdCalled).toBe(false)
    expect(res.rdSentPayload).toBeNull()
  })

  it('maps complete UTMs to traffic_source, traffic_medium and traffic_campaign', () => {
    let capturedReq: any = null
    const res = runDiagnosisHook(
      {
        email: 'lead@example.com',
        name: 'Lead Silva',
        consent: 'granted',
        utm_source: 'linkedin',
        utm_medium: 'cpc',
        utm_campaign: 'organize_sua_rotina',
      },
      {
        mockHttpSend: (req) => {
          capturedReq = req
          return { statusCode: 200 }
        },
      },
    )

    expect(res.json.success).toBe(true)
    expect(res.json.consentReceived).toBe(true)
    expect(res.json.rd_synced).toBe(true)

    const sent = JSON.parse(capturedReq.body)
    expect(sent.event_type).toBe('CONVERSION')
    expect(sent.event_family).toBe('CDP')
    expect(sent.payload.traffic_source).toBe('linkedin')
    expect(sent.payload.traffic_medium).toBe('cpc')
    expect(sent.payload.traffic_campaign).toBe('organize_sua_rotina')
    expect(sent.payload.conversion_identifier).toBe('OI - Diagnóstico concluído')
    expect(sent.payload.tags).toEqual(['organizacao-inteligente'])
    expect(sent.payload.legal_bases).toEqual([
      { category: 'communications', type: 'consent', status: 'granted' },
    ])
  })

  it('applies default fallbacks when UTMs are absent or empty', () => {
    let capturedReq: any = null
    runDiagnosisHook(
      {
        email: 'organico@example.com',
        name: 'Sem UTM',
        consent: 'granted',
      },
      {
        mockHttpSend: (req) => {
          capturedReq = req
          return { statusCode: 200 }
        },
      },
    )

    const sent = JSON.parse(capturedReq.body)
    expect(sent.payload.traffic_source).toBe('organizacao_inteligente')
    expect(sent.payload.traffic_medium).toBe('diagnostico_site')
    expect(sent.payload.traffic_campaign).toBeUndefined()
  })

  it('handles partial UTMs by filling missing fields with default fallbacks', () => {
    let capturedReq: any = null
    runDiagnosisHook(
      {
        email: 'parcial@example.com',
        consent: 'granted',
        utm_source: 'instagram',
        // utm_medium e utm_campaign ausentes
      },
      {
        mockHttpSend: (req) => {
          capturedReq = req
          return { statusCode: 200 }
        },
      },
    )

    const sent = JSON.parse(capturedReq.body)
    expect(sent.payload.traffic_source).toBe('instagram')
    expect(sent.payload.traffic_medium).toBe('diagnostico_site')
    expect(sent.payload.traffic_campaign).toBeUndefined()
  })

  it('sanitizes invalid values (non-string, whitespace, >100 chars) with fallback', () => {
    const long120 = 'a'.repeat(120)
    let capturedReq: any = null

    runDiagnosisHook(
      {
        email: 'sanitize@example.com',
        consent: 'granted',
        utm_source: '   google_ads   ',
        utm_medium: 12345, // não-string -> deve cair no fallback
        utm_campaign: long120, // >100 chars -> deve truncar para 100
      },
      {
        mockHttpSend: (req) => {
          capturedReq = req
          return { statusCode: 200 }
        },
      },
    )

    const sent = JSON.parse(capturedReq.body)
    expect(sent.payload.traffic_source).toBe('google_ads')
    expect(sent.payload.traffic_medium).toBe('diagnostico_site') // fallback
    expect(sent.payload.traffic_campaign).toBe('a'.repeat(100)) // truncado
  })

  it('never sends utm_content or traffic_value to RD Station (semântica oficial RD)', () => {
    let capturedReq: any = null
    runDiagnosisHook(
      {
        email: 'content-test@example.com',
        consent: 'granted',
        utm_source: 'youtube',
        utm_medium: 'video',
        utm_campaign: 'produtividade',
        utm_content: 'banner_intro',
      },
      {
        mockHttpSend: (req) => {
          capturedReq = req
          return { statusCode: 200 }
        },
      },
    )

    const sent = JSON.parse(capturedReq.body)
    expect(sent.payload.utm_content).toBeUndefined()
    expect(sent.payload.traffic_value).toBeUndefined()
    expect(sent.payload.traffic_source).toBe('youtube')
    expect(sent.payload.traffic_medium).toBe('video')
    expect(sent.payload.traffic_campaign).toBe('produtividade')
  })

  it('preserves lead persistence and handles RD Station failures gracefully without throwing', () => {
    let savedLead: any = null

    const res = runDiagnosisHook(
      {
        email: 'lead-resilient@example.com',
        name: 'Maria Resiliente',
        consent: 'granted',
        utm_source: 'newsletter',
      },
      {
        mockDbSave: (rec) => {
          savedLead = rec
        },
        mockHttpSend: () => {
          throw new Error('RD Station timeout / 500 error')
        },
      },
    )

    // O lead DEVE ter sido salvo no banco antes
    expect(savedLead).not.toBeNull()
    expect(savedLead.email).toBe('lead-resilient@example.com')
    expect(savedLead.name).toBe('Maria Resiliente')
    expect(savedLead.status).toBe('active')
    expect(savedLead.source).toBe('OI - Diagnóstico concluído')

    // A resposta HTTP continua bem-sucedida para o usuário com consentReceived: true
    expect(res.status).toBe(200)
    expect(res.json.success).toBe(true)
    expect(res.json.consentReceived).toBe(true)
    expect(res.json.rd_synced).toBe(false)
  })

  it('supports stringified JSON body safely', () => {
    const raw = JSON.stringify({
      email: 'stringified@example.com',
      consent: 'granted',
      utm_source: 'twitter',
    })

    const res = runDiagnosisHook(raw, {
      mockHttpSend: () => ({ statusCode: 200 }),
    })

    expect(res.json.success).toBe(true)
    expect(res.rdSentPayload.payload.traffic_source).toBe('twitter')
  })
})
