migrate(
  (app) => {
    var records = app.findRecordsByFilter(
      'affiliate_links',
      "affiliateUrl ~ 'example.com'",
      '-created',
      500,
      0,
    )
    for (var i = 0; i < records.length; i++) {
      app.delete(records[i])
    }
  },
  (app) => {
    // down: not strict — deleted records cannot be restored
  },
)
