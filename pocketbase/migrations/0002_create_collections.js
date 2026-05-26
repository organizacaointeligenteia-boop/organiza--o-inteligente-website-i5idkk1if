migrate(
  (app) => {
    const articles = new Collection({
      name: 'articles',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'title', type: 'text', required: true, max: 200 },
        { name: 'slug', type: 'text', required: true },
        { name: 'content', type: 'editor', required: true },
        { name: 'excerpt', type: 'text', max: 500 },
        { name: 'featuredImage', type: 'url' },
        {
          name: 'category',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: [
            'Organização Pessoal',
            'Produtividade',
            'Hábitos',
            'Planejamento',
            'Desenvolvimento Pessoal',
          ],
        },
        { name: 'readingTime', type: 'number' },
        { name: 'publishedAt', type: 'date', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_articles_slug ON articles (slug)',
        'CREATE INDEX idx_articles_category ON articles (category)',
        'CREATE INDEX idx_articles_publishedAt ON articles (publishedAt)',
      ],
    })
    app.save(articles)

    const newsletter = new Collection({
      name: 'newsletter_subscribers',
      type: 'base',
      listRule: null,
      viewRule: null,
      createRule: '',
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'email', type: 'email', required: true },
        { name: 'name', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['active', 'unsubscribed'],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_newsletter_email ON newsletter_subscribers (email)',
        'CREATE INDEX idx_newsletter_status ON newsletter_subscribers (status)',
      ],
    })
    app.save(newsletter)

    const downloads = new Collection({
      name: 'free_downloads',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'title', type: 'text', required: true, max: 200 },
        { name: 'description', type: 'text', max: 500 },
        {
          name: 'fileUrl',
          type: 'file',
          required: true,
          maxSelect: 1,
          maxSize: 52428800,
          mimeTypes: ['application/pdf'],
        },
        { name: 'downloadCount', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(downloads)

    const affiliates = new Collection({
      name: 'affiliate_links',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'productName', type: 'text', required: true, max: 200 },
        { name: 'productUrl', type: 'url', required: true },
        {
          name: 'category',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['Livros', 'Cursos', 'Ferramentas', 'Aplicativos'],
        },
        { name: 'description', type: 'text', max: 500 },
        { name: 'affiliateUrl', type: 'url', required: true },
        { name: 'commission', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(affiliates)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('affiliate_links'))
    app.delete(app.findCollectionByNameOrId('free_downloads'))
    app.delete(app.findCollectionByNameOrId('newsletter_subscribers'))
    app.delete(app.findCollectionByNameOrId('articles'))
  },
)
