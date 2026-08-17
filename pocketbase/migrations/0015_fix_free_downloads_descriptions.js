migrate(
  (app) => {
    // Atualiza descrição do Template de Planejamento Semanal (downloadCount preservado)
    try {
      const planejamento = app.findFirstRecordByData(
        'free_downloads',
        'title',
        'Template de Planejamento Semanal',
      )
      planejamento.set(
        'description',
        'Planner reutilizável de 15 páginas com sistema de 5 passos, mapa semanal, blocos de tempo e revisão.',
      )
      app.save(planejamento)
    } catch (_) {}

    // Atualiza descrição do Checklist da Rotina Matinal Ideal (downloadCount preservado)
    try {
      const checklist = app.findFirstRecordByData(
        'free_downloads',
        'title',
        'Checklist da Rotina Matinal Ideal',
      )
      checklist.set(
        'description',
        'Guia imprimível de 12 páginas com 4 pilares, versões de 5, 15 e 30 minutos e desafio de 14 dias.',
      )
      app.save(checklist)
    } catch (_) {}
  },
  (app) => {},
)
