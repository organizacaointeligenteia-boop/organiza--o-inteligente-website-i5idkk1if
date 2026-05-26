routerAdd('GET', '/backend/v1/articles', (e) => {
  const limit = parseInt(e.request.url.query().get('limit')) || 12
  const offset = parseInt(e.request.url.query().get('offset')) || 0

  const result = $app.findRecordsByFilter('articles', '', '-publishedAt', limit, offset)

  return e.json(200, { items: result })
})
