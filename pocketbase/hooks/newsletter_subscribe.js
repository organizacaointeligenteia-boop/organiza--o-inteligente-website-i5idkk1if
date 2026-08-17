routerAdd('POST', '/backend/v1/newsletter/subscribe', (e) => {
  const body = e.requestInfo().body || {}
  const email = body.email
  const source = body.source || ''

  // Diagnóstico requires explicit consent before subscribing.
  if (source === 'OI - Diagnóstico concluído' && body.consent !== true) {
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

  try {
    const col = $app.findCollectionByNameOrId('newsletter_subscribers')
    const record = new Record(col)
    record.set('email', email)
    if (body.name) record.set('name', body.name)
    record.set('status', 'active')
    $app.save(record)

    // RD Station conversion — only for the diagnóstico quiz source.
    // Failures here must never block the local subscription.
    if (source === 'OI - Diagnóstico concluído') {
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
                name: body.name || '',
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
    }

    return e.json(200, { success: true, message: 'Inscrição realizada com sucesso' })
  } catch (err) {
    throw new BadRequestError('Este email já está inscrito ou ocorreu um erro.', {
      email: new ValidationError('validation_not_unique', 'Este email já está inscrito.'),
    })
  }
})
