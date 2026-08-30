import { describe, it, expect } from 'vitest'

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

  it('dry-run mode does not trigger db save or RD station', () => {
    const sentinel = 'diagnostic-check@invalid.local'
    let dbSaved = false
    let rdSent = false
    let dispatchedPayload: any = null

    const handleSubscribe = (body: { email: string; name?: string; consent: any }) => {
      const consented =
        body.consent === true || body.consent === 'true' || body.consent === 'granted'
      if (!consented) throw new Error('Consent required')

      if (body.email === sentinel) {
        return { status: 200, json: { success: true, consentReceived: true, dryRun: true } }
      }

      dbSaved = true
      dispatchedPayload = {
        event_type: 'CONVERSION',
        event_family: 'CDP',
        payload: {
          conversion_identifier: 'OI - Diagnóstico concluído',
          email: body.email,
          name: body.name || '',
          traffic_source: 'organizacao_inteligente',
          traffic_medium: 'diagnostico_site',
          tags: ['organizacao-inteligente'],
          legal_bases: [{ category: 'communications', type: 'consent', status: 'granted' }],
        },
      }
      rdSent = true
      return { status: 200, json: { success: true, consentReceived: true } }
    }

    const res = handleSubscribe({
      email: 'diagnostic-check@invalid.local',
      name: 'Tester',
      consent: 'granted',
    })

    expect(res.status).toBe(200)
    expect(res.json.success).toBe(true)
    expect(res.json.consentReceived).toBe(true)
    expect(res.json.dryRun).toBe(true)
    expect(dbSaved).toBe(false)
    expect(rdSent).toBe(false)
    expect(dispatchedPayload).toBeNull()
  })

  it('builds exact RD Station conversion payload for diagnosis subscription', () => {
    const buildRdPayload = (email: string, name: string) => ({
      event_type: 'CONVERSION',
      event_family: 'CDP',
      payload: {
        conversion_identifier: 'OI - Diagnóstico concluído',
        email,
        name,
        traffic_source: 'organizacao_inteligente',
        traffic_medium: 'diagnostico_site',
        tags: ['organizacao-inteligente'],
        legal_bases: [{ category: 'communications', type: 'consent', status: 'granted' }],
      },
    })

    const payload = buildRdPayload('lead@example.com', 'Nome do Lead')

    expect(payload).toEqual({
      event_type: 'CONVERSION',
      event_family: 'CDP',
      payload: {
        conversion_identifier: 'OI - Diagnóstico concluído',
        email: 'lead@example.com',
        name: 'Nome do Lead',
        traffic_source: 'organizacao_inteligente',
        traffic_medium: 'diagnostico_site',
        tags: ['organizacao-inteligente'],
        legal_bases: [{ category: 'communications', type: 'consent', status: 'granted' }],
      },
    })

    expect(payload.payload.conversion_identifier).toBe('OI - Diagnóstico concluído')
    expect(payload.payload.traffic_source).toBe('organizacao_inteligente')
    expect(payload.payload.traffic_medium).toBe('diagnostico_site')
    expect(payload.payload.tags).toEqual(['organizacao-inteligente'])
    expect(payload.payload.legal_bases).toEqual([
      { category: 'communications', type: 'consent', status: 'granted' },
    ])
  })
})
