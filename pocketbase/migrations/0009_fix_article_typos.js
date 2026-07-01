migrate(
  (app) => {
    try {
      var record = app.findFirstRecordByData('articles', 'slug', 'como-criar-habitos')
      var content = record.getString('content')
      content = content.replace(/Deiva \(O Gatilho\)/g, 'Gatilho')
      content = content.replace(/deiva/gi, 'gatilho')
      record.set('content', content)
      app.save(record)
    } catch (_) {}
  },
  (app) => {
    // down: not strict — original typos cannot be restored
  },
)
