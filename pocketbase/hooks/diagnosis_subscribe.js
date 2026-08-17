routerAdd('POST', '/backend/v1/diagnosis/subscribe', (e) => {
  // Parse body — it arrives as a raw string from fetch(JSON.stringify(...))
  let body = {}
  try {
    const raw = e.requestInfo().body || '{}'
    body = typeof raw === 'string' ? JSON.parse(raw) : raw
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

  try {
    const col = $app.findCollectionByNameOrId('newsletter_subscribers')
    const record = new Record(col)
    record.set('email', email)
    if (name) record.set('name', name)
    record.set('status', 'active')
    record.set('source', 'OI - Diagnóstico concluído')
    $app.save(record)

    // RD Station conversion — failures must never block
    try {
      const apiKey = $os.getenv('RD_STATION_API_KEY')
      if (apiKey) {
        const url =
          'https://api.rd.services/platform/conversions?api_key=' + encodeURIComponent(apiKey)
        $http.send({
          url: url,
          method: 'POST',
          body: JSON.stringify({
            event_type: 'CONVERSION',
            event_family: 'CDP',
            payload: {
              conversion_identifier: 'OI - Diagnóstico concluído',
              email: email,
              name: name,
              legal_bases: [{ category: 'communications', type: 'consent', status: 'granted' }],
            },
          }),
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        })
      }
    } catch (rdErr) {
      console.error('RD Station falhou mas inscrição foi salva')
    }

    return e.json(200, { success: true, consentReceived: true })
  } catch (err) {
    throw new BadRequestError('Este email já está inscrito ou ocorreu um erro.', {
      email: new ValidationError('validation_not_unique', 'Este email já está inscrito.'),
    })
  }
})
