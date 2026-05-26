routerAdd(
  'PUT',
  '/backend/v1/articles/{id}/update',
  (e) => {
    const id = e.request.pathValue('id')
    const body = e.requestInfo().body || {}
    const record = $app.findRecordById('articles', id)

    if (body.title) record.set('title', body.title)
    if (body.slug) record.set('slug', body.slug)
    if (body.content) record.set('content', body.content)
    if (body.category) record.set('category', body.category)
    if (body.publishedAt) record.set('publishedAt', body.publishedAt)
    if (body.excerpt !== undefined) record.set('excerpt', body.excerpt)
    if (body.featuredImage !== undefined) record.set('featuredImage', body.featuredImage)
    if (body.readingTime !== undefined) record.set('readingTime', body.readingTime)

    $app.save(record)
    return e.json(200, record)
  },
  $apis.requireAuth(),
)
