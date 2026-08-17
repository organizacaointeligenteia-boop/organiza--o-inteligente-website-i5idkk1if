migrate(
  (app) => {
    app
      .db()
      .newQuery(
        "UPDATE free_downloads SET title = {:title}, updated = datetime('now') WHERE id = {:id}",
      )
      .bind({ title: 'Planejamento Semanal Inteligente', id: 'dl_template_planejamento' })
      .execute()
  },
  (app) => {
    app
      .db()
      .newQuery(
        "UPDATE free_downloads SET title = {:title}, updated = datetime('now') WHERE id = {:id}",
      )
      .bind({ title: 'Template de Planejamento Semanal', id: 'dl_template_planejamento' })
      .execute()
  },
)
