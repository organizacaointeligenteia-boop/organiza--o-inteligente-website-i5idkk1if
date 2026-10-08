routerAdd(
  'GET',
  '/api/oi/plans/list',
  (e) => require(__hooks + '/oi_plan_service.js').list(e),
  $apis.requireAuth('oi_memberships'),
)
routerAdd(
  'GET',
  '/api/oi/plans/get',
  (e) => require(__hooks + '/oi_plan_service.js').get(e),
  $apis.requireAuth('oi_memberships'),
)
routerAdd(
  'POST',
  '/api/oi/plans/create',
  (e) => require(__hooks + '/oi_plan_service.js').handle(e, 'create'),
  $apis.requireAuth('oi_memberships'),
)
routerAdd(
  'POST',
  '/api/oi/plans/adjust',
  (e) => require(__hooks + '/oi_plan_service.js').handle(e, 'adjust'),
  $apis.requireAuth('oi_memberships'),
)
routerAdd(
  'PATCH',
  '/api/oi/plans/update',
  (e) => require(__hooks + '/oi_plan_service.js').update(e),
  $apis.requireAuth('oi_memberships'),
)
routerAdd(
  'GET',
  '/api/oi/plans/export-pdf',
  (e) => require(__hooks + '/oi_plan_service.js').pdf(e),
  $apis.requireAuth('oi_memberships'),
)
