migrate(
  (app) => {
    var ctaHtml =
      '<div style="margin-top:2.5rem;padding:2rem 1.5rem;border-radius:1rem;background:hsl(var(--primary)/0.08);border:1px solid hsl(var(--primary)/0.2);text-align:center">' +
      '<h3 style="margin:0 0 0.5rem;font-size:1.25rem;font-weight:700">Quer o sistema completo? Conheça o Kit Organização Inteligente.</h3>' +
      '<p style="margin:0 0 1rem;color:hsl(var(--muted-foreground));font-size:1.05rem">Planner semanal, checklist expandido, controle de hábitos, documentos e mais — tudo pronto para usar.</p>' +
      '<a href="/kit-organizacao-inteligente" style="display:inline-block;padding:0.75rem 1.75rem;border-radius:0.5rem;background:hsl(var(--primary));color:hsl(var(--primary-foreground));font-weight:600;text-decoration:none;font-size:1rem">Conhecer o Kit Organização Inteligente</a>' +
      '</div>'

    var slugs = [
      'como-organizar-rotina-semanal',
      'checklist-organizacao-pessoal',
      'rotina-matinal-produtiva',
    ]

    for (var i = 0; i < slugs.length; i++) {
      try {
        var record = app.findFirstRecordByData('articles', 'slug', slugs[i])
        var content = record.getString('content')
        if (content.indexOf('/kit-organizacao-inteligente') === -1) {
          record.set('content', content + ctaHtml)
          app.save(record)
        }
      } catch (_) {}
    }
  },
  (app) => {
    var slugs = [
      'como-organizar-rotina-semanal',
      'checklist-organizacao-pessoal',
      'rotina-matinal-produtiva',
    ]

    for (var i = 0; i < slugs.length; i++) {
      try {
        var record = app.findFirstRecordByData('articles', 'slug', slugs[i])
        var content = record.getString('content')
        var marker = '/kit-organizacao-inteligente'
        var idx = content.indexOf(marker)
        if (idx !== -1) {
          var divStart = content.lastIndexOf('<div', idx)
          if (divStart !== -1) {
            var divEnd = content.indexOf('</div>', idx)
            if (divEnd !== -1) {
              record.set('content', content.substring(0, divStart) + content.substring(divEnd + 6))
              app.save(record)
            }
          }
        }
      } catch (_) {}
    }
  },
)
