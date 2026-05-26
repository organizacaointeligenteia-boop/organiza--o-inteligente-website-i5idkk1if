routerAdd('GET', '/backend/v1/downloads', (e) => {
  const result = $app.findRecordsByFilter('free_downloads', '', '-created', 100, 0)
  return e.json(200, { items: result })
})
