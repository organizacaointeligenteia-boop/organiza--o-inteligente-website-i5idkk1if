routerAdd('GET', '/backend/v1/articles/{slug}', (e) => {
  const slug = e.request.pathValue('slug')
  try {
    const record = $app.findFirstRecordByData('articles', 'slug', slug)
    return e.json(200, record)
  } catch (err) {
    throw new NotFoundError('Article not found')
  }
})
