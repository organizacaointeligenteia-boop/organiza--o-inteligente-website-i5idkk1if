migrate(
  (app) => {
    // Use raw SQL to bypass PocketBase record validation — the `fileUrl` file
    // field is required by the schema but empty on the existing records, so
    // `app.save(record)` rejects with "fileUrl: Cannot be blank". We only need
    // to change title/description; downloadCount is intentionally untouched.
    const updates = [
      {
        id: 'planilha12345678',
        title: 'Planilha de Hábitos - 8 Semanas',
        description:
          'Planilha editável para criar até 6 hábitos, registrar 8 semanas e acompanhar consistência com painel e gráficos.',
      },
      {
        id: 'dl_ebook_mente_org',
        title: 'Ebook: O Guia da Mente Organizada',
        description:
          'Guia prático de 41 páginas com método de organização, exercícios e plano de 30 dias.',
      },
      {
        id: 'dl_planilha_habitos',
        title: 'Controle de Hábitos Mensal',
        description:
          'Planilha editável para acompanhar até 12 hábitos, com metas mensais, validações, consistência automática, relatório e gráficos.',
      },
    ]

    for (const u of updates) {
      app
        .db()
        .newQuery(
          'UPDATE free_downloads SET title = {:title}, description = {:desc} WHERE id = {:id}',
        )
        .bind({ title: u.title, desc: u.description, id: u.id })
        .execute()
    }
  },
  (app) => {
    const reverts = [
      {
        id: 'planilha12345678',
        title: 'Planilha de Hábitos',
        description: 'Acompanhe seus hábitos diários com esta planilha gratuita.',
      },
      {
        id: 'dl_ebook_mente_org',
        title: 'Ebook: O Guia da Mente Organizada',
        description:
          'Um ebook completo de 80 páginas com técnicas de organização pessoal, sistemas de produtividade e exercícios práticos para transformar sua rotina.',
      },
      {
        id: 'dl_planilha_habitos',
        title: 'Planilha de Controle de Hábitos Mensal',
        description:
          'Planilha interativa para acompanhar até 12 hábitos simultaneamente. Inclui gráficos automáticos, taxa de consistência e relatório mensal.',
      },
    ]

    for (const r of reverts) {
      app
        .db()
        .newQuery(
          'UPDATE free_downloads SET title = {:title}, description = {:desc} WHERE id = {:id}',
        )
        .bind({ title: r.title, desc: r.description, id: r.id })
        .execute()
    }
  },
)
