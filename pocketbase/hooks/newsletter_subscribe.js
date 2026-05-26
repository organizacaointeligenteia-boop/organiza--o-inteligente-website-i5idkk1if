routerAdd('POST', '/backend/v1/newsletter/subscribe', (e) => {
  const body = e.requestInfo().body || {}
  const email = body.email

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
    return e.json(200, { success: true, message: 'Inscrição realizada com sucesso' })
  } catch (err) {
    throw new BadRequestError('Este email já está inscrito ou ocorreu um erro.', {
      email: new ValidationError('validation_not_unique', 'Este email já está inscrito.'),
    })
  }
})
