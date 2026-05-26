routerAdd(
  'DELETE',
  '/backend/v1/articles/{id}/delete',
  (e) => {
    const id = e.request.pathValue('id')
    const record = $app.findRecordById('articles', id)
    $app.delete(record)
    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
