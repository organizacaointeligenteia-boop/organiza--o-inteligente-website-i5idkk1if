migrate(
  (app) => {
    // Atualiza descrições via SQL direto para evitar re-validar o campo `fileUrl`
    // (required) que está vazio nos registros existentes. downloadCount não é tocado.
    app
      .db()
      .newQuery('UPDATE free_downloads SET description = {:d} WHERE id = {:id}')
      .bind({
        d: 'Planner reutilizável de 15 páginas com sistema de 5 passos, mapa semanal, blocos de tempo e revisão.',
        id: 'dl_template_planejamento',
      })
      .execute()

    app
      .db()
      .newQuery('UPDATE free_downloads SET description = {:d} WHERE id = {:id}')
      .bind({
        d: 'Guia imprimível de 12 páginas com 4 pilares, versões de 5, 15 e 30 minutos e desafio de 14 dias.',
        id: 'dl_checklist_matinal',
      })
      .execute()
  },
  (app) => {},
)
