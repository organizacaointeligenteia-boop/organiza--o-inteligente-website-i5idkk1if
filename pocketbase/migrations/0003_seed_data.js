migrate(
  (app) => {
    // Do not seed administrator credentials in source code. Create the production admin directly in PocketBase and keep credentials out of exports.

    const articlesCol = app.findCollectionByNameOrId('articles')
    try {
      app.findFirstRecordByData('articles', 'slug', 'guia-produtividade-2026')
    } catch (_) {
      const r1 = new Record(articlesCol)
      r1.set('title', 'Guia de Produtividade para 2026')
      r1.set('slug', 'guia-produtividade-2026')
      r1.set(
        'content',
        '<p>Aprenda a focar no que importa e evite distrações.</p><p>Um dos maiores desafios modernos é manter o foco. Implementar blocos de tempo pode dobrar sua capacidade produtiva.</p>',
      )
      r1.set(
        'excerpt',
        'Descubra como organizar seu dia com eficiência e terminar o ano conquistando mais objetivos.',
      )
      r1.set('featuredImage', 'https://img.usecurling.com/p/800/400?q=workspace&dpr=2')
      r1.set('category', 'Produtividade')
      r1.set('publishedAt', new Date().toISOString().replace('T', ' '))
      app.save(r1)

      const r2 = new Record(articlesCol)
      r2.set('title', 'Como criar Hábitos Duradouros')
      r2.set('slug', 'como-criar-habitos')
      r2.set(
        'content',
        '<p>A regra dos 2 minutos é essencial para começar.</p><p>Quando você for criar um novo hábito, ele não deve levar mais do que 2 minutos para ser feito. Ao longo do tempo você ganha constância.</p>',
      )
      r2.set('excerpt', 'Pequenas ações diárias geram grandes resultados ao longo do tempo.')
      r2.set('featuredImage', 'https://img.usecurling.com/p/800/400?q=habits&dpr=2')
      r2.set('category', 'Hábitos')
      r2.set('publishedAt', new Date().toISOString().replace('T', ' '))
      app.save(r2)
    }

    try {
      app.findFirstRecordByData('affiliate_links', 'productName', 'Livro Essencialismo')
    } catch (_) {
      const affCol = app.findCollectionByNameOrId('affiliate_links')
      const r = new Record(affCol)
      r.set('productName', 'Livro Essencialismo')
      r.set('productUrl', 'https://example.com/essencialismo')
      r.set('category', 'Livros')
      r.set('description', 'A disciplinada busca por menos.')
      r.set('affiliateUrl', 'https://example.com/aff?id=123')
      r.set('commission', 10)
      app.save(r)
    }

    try {
      app.findFirstRecordByData('free_downloads', 'title', 'Planilha de Hábitos')
    } catch (_) {
      app
        .db()
        .newQuery(
          "INSERT INTO free_downloads (id, title, description, fileUrl, downloadCount, created, updated) VALUES ({:id}, {:title}, {:desc}, '', 0, {:time}, {:time})",
        )
        .bind({
          id: 'planilha12345678',
          title: 'Planilha de Hábitos',
          desc: 'Acompanhe seus hábitos diários com esta planilha gratuita.',
          time: new Date().toISOString().replace('T', ' ').replace('Z', 'Z'),
        })
        .execute()
    }
  },
  (app) => {
    // down not strict
  },
)
