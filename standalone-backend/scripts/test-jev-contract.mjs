import fs from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'
const src = fs.readFileSync(new URL('../pb_hooks/oi_plan_service.js', import.meta.url), 'utf8')
let providerResult,
  sent,
  hasKey = true
const ctx = {
  module: { exports: {} },
  require: () => ({}),
  __hooks: '.',
  BadRequestError: Error,
  $os: { getenv: () => (hasKey ? 'synthetic-key' : '') },
  $http: {
    send: (r) => {
      sent = JSON.parse(r.body)
      return { statusCode: 200, json: providerResult }
    },
  },
}
vm.runInNewContext(src, ctx)
const f = ctx.module.exports.classify,
  l = ctx.module.exports.library
const input = {
  objective: 'Organizar a semana',
  category: 'rotina',
  difficulty: 'iniciante',
  timeAvailable: '5m',
}
providerResult = {
  answers: {
    strategy: {
      type: 'choice',
      choice: 'steps',
      confidence: 0.95,
      probabilities: { week: 0.02, priorities: 0.02, steps: 0.94, review: 0.02 },
    },
  },
}
assert.equal(f(input).strategy, 'steps')
assert.deepEqual(Object.keys(sent).sort(), ['model', 'questions', 'state'])
assert.equal(sent.model, 'jev-latest')
assert.equal(sent.questions.strategy.type, 'choice')
assert.equal(l('rotina', 'Objetivo', '5m', '7 dias', 'steps').modelKey, 'steps')
for (const bad of [
  'invalid_enum',
  'invalid_confidence',
  'invalid_distribution',
  'incoherent_choice',
  'low_confidence',
  'review',
]) {
  providerResult = JSON.parse(
    JSON.stringify({
      answers: {
        strategy: {
          type: 'choice',
          choice: 'steps',
          confidence: 0.95,
          probabilities: { week: 0.02, priorities: 0.02, steps: 0.94, review: 0.02 },
        },
      },
    }),
  )
  const r = providerResult.answers.strategy
  if (bad === 'invalid_enum') r.choice = 'other'
  if (bad === 'invalid_confidence') r.confidence = 2
  if (bad === 'invalid_distribution') r.probabilities.steps = 0.1
  if (bad === 'incoherent_choice') r.choice = 'week'
  if (bad === 'low_confidence') r.confidence = 0.4
  if (bad === 'review') {
    r.choice = 'review'
    r.probabilities = { week: 0.02, priorities: 0.02, steps: 0.02, review: 0.94 }
  }
  assert.throws(() => f(input))
}
hasKey = false
assert.equal(f(input).provider, 'manual-honest')
assert.equal(f(input).costMeasured, null)
console.log(
  'Contrato Jev: request oficial, seleção de estratégia e 6 rejeições validados. Fixtures locais; nenhuma chamada real.',
)
