routerAdd(
  'POST',
  '/backend/v1/articles/create',
  (e) => {
    const body = e.requestInfo().body || {}
    const collection = $app.findCollectionByNameOrId('articles')
    const record = new Record(collection)

    record.set('title', body.title || '')
    record.set('slug', body.slug || '')
    record.set('content', body.content || '')
    record.set('category', body.category || '')
    record.set('publishedAt', body.publishedAt || new Date().toISOString())
    if (body.excerpt) record.set('excerpt', body.excerpt)
    if (body.featuredImage) record.set('featuredImage', body.featuredImage)
    if (body.readingTime) record.set('readingTime', body.readingTime)

    $app.save(record)
    return e.json(200, record)
  },
  $apis.requireAuth(),
)
