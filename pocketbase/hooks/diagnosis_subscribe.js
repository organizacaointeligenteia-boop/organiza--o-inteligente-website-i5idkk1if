routerAdd('POST', '/backend/v1/diagnosis/subscribe', (e) => {
  // Parse body — handle string or object safely
  let body = {}
  try {
    const raw = e.requestInfo().body
    if (typeof raw === 'string') {
      body = raw.trim().length > 0 ? JSON.parse(raw) : {}
    } else if (raw && typeof raw === 'object') {
      body = raw
    } else {
      body = {}
    }
  } catch (_) {
    body = {}
  }

  const email = body.email
  const name = body.name || ''

  // Consent validation: accept only true, "true", or "granted"
  const consentValue = body.consent
  const consented = consentValue === true || consentValue === 'true' || consentValue === 'granted'

  if (!consented) {
    throw new BadRequestError('Consentimento necessário', {
      consent: new ValidationError(
        'validation_required',
        'É necessário aceitar receber comunicações.',
      ),
    })
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new BadRequestError('Email inválido', {
      email: new ValidationError('validation_invalid_email', 'Email inválido'),
    })
  }

  // Dry-run mode: sentinel email diagnostic-check@invalid.local
  // Validate everything but do NOT persist and do NOT send to RD Station
  if (email === 'diagnostic-check@invalid.local') {
    return e.json(200, { success: true, consentReceived: true, dryRun: true })
  }

  // Sanitização de UTMs recebidos (apenas strings, trim, max 100 caracteres)
  // Fallbacks padrão do RD Station quando ausentes/vazios
  const sanitizeUtmParam = (val) => {
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

  try {
    const col = $app.findCollectionByNameOrId('newsletter_subscribers')
    const record = new Record(col)
    record.set('email', email)
    if (name) record.set('name', name)
    record.set('status', 'active')
    record.set('source', 'OI - Diagnóstico concluído')
    $app.save(record)

    // RD Station conversion — failures must never block registration
    let rdSynced = false
    try {
      const apiKey = $os.getenv('RD_STATION_API_KEY')
      if (apiKey) {
        const url =
          'https://api.rd.services/platform/conversions?api_key=' + encodeURIComponent(apiKey)

        // Contrato RD Station Platform Conversions:
        // - traffic_source, traffic_medium, traffic_campaign
        // - traffic_value corresponde a utm_term (NÃO a utm_content); NÃO enviamos traffic_value nem utm_content aqui
        // - tags, legal_bases, available_for_mailing
        const rdPayload = {
          conversion_identifier: 'OI - Diagnóstico concluído',
          email: email,
          name: name,
          traffic_source: trafficSource,
          traffic_medium: trafficMedium,
          tags: ['organizacao-inteligente'],
          legal_bases: [{ category: 'communications', type: 'consent', status: 'granted' }],
        }

        if (trafficCampaign) {
          rdPayload.traffic_campaign = trafficCampaign
        }

        const res = $http.send({
          url: url,
          method: 'POST',
          body: JSON.stringify({
            event_type: 'CONVERSION',
            event_family: 'CDP',
            payload: rdPayload,
          }),
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        })

        if (res && res.statusCode >= 200 && res.statusCode < 300) {
          rdSynced = true
        } else {
          console.error(
            'RD Station retornou status não-2xx:',
            res ? res.statusCode : 'sem resposta',
          )
        }
      }
    } catch (rdErr) {
      console.error('RD Station falhou mas inscrição foi salva')
    }

    return e.json(200, { success: true, consentReceived: true, rd_synced: rdSynced })
  } catch (err) {
    throw new BadRequestError('Este email já está inscrito ou ocorreu um erro.', {
      email: new ValidationError('validation_not_unique', 'Este email já está inscrito.'),
    })
  }
})
