routerAdd('POST', '/backend/v1/downloads/{id}/track', (e) => {
  const id = e.request.pathValue('id')
  const record = $app.findRecordById('free_downloads', id)
  const currentCount = record.getInt('downloadCount') || 0
  record.set('downloadCount', currentCount + 1)
  $app.saveNoValidate(record)
  return e.json(200, { success: true, count: currentCount + 1 })
})
