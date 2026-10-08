migrate(
  (app) => {
    for (const name of ['oi_orders', 'oi_cycles', 'oi_quotas', 'oi_plans', 'oi_ai_audit']) {
      const c = app.findCollectionByNameOrId(name)
      c.listRule = null
      c.viewRule = null
      c.createRule = null
      c.updateRule = null
      c.deleteRule = null
      app.save(c)
    }
    const members = app.findCollectionByNameOrId('oi_memberships')
    members.authRule = 'verified = true'
    app.save(members)
    const requests = new Collection({
      name: 'oi_requests',
      type: 'base',
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'member',
          type: 'relation',
          collectionId: members.id,
          maxSelect: 1,
          required: true,
        },
        {
          name: 'cycle',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('oi_cycles').id,
          maxSelect: 1,
          required: true,
        },
        { name: 'request_id', type: 'text', required: true },
        { name: 'fingerprint', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['reserved', 'complete', 'failed'],
          maxSelect: 1,
          required: true,
        },
        { name: 'result', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_oi_request_identity ON oi_requests(member,request_id)'],
    })
    app.save(requests)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('oi_requests'))
  },
)
