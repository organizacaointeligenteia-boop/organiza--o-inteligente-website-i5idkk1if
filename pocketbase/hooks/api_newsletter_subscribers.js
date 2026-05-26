routerAdd(
  'GET',
  '/backend/v1/newsletter/subscribers',
  (e) => {
    const result = $app.findRecordsByFilter('newsletter_subscribers', '', '-created', 1000, 0)
    return e.json(200, { items: result })
  },
  $apis.requireAuth(),
)
