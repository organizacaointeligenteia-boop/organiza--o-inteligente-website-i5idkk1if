migrate(
  (app) => {
    // Atualiza descrição do Template de Planejamento Semanal
    try {
      const planejamento = app.findRecordById('free_downloads', 'dl_template_planejamento')
      planejamento.set(
        'description',
        'Planner reutilizável de 15 páginas com sistema de 5 passos, mapa semanal, blocos de tempo e revisão.',
      )
      app.save(planejamento)
    } catch (_) {}

    // Atualiza descrição do Checklist da Rotina Matinal Ideal
    try {
      const checklist = app.findRecordById('free_downloads', 'dl_checklist_matinal')
      checklist.set(
        'description',
        'Guia imprimível de 12 páginas com 4 pilares, versões de 5, 15 e 30 minutos e desafio de 14 dias.',
      )
      app.save(checklist)
    } catch (_) {}
  },
  (app) => {
    // Reversível apenas em forma: não há estado anterior conhecido para restaurar.
  },
)
