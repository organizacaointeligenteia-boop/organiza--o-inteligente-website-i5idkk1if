// standalone-backend/pb_migrations/1740000002_seed_standalone_demo.js
/**
 * Migração de Seed para o Backend Standalone da OI.
 * Cria:
 * 1. Admin sintético (admin-oi@organizacaointeligente.com.br / Skip@Pass)
 * 2. Dois usuários sintéticos para testes:
 *    - user1@organizacaointeligente.com.br / Skip@Pass
 *    - user2@organizacaointeligente.com.br / Skip@Pass
 * Idempotente: nunca duplica nem substitui senhas existentes.
 */

migrate(
  (app) => {
    const membershipsCol = app.findCollectionByNameOrId('oi_memberships')

    const demoAccounts = [
      {
        email: 'admin-oi@organizacaointeligente.com.br',
        password: 'Skip@Pass',
        name: 'Administrador OI (Sintético)',
        role: 'admin',
        verified: true,
      },
      {
        email: 'user1@organizacaointeligente.com.br',
        password: 'Skip@Pass',
        name: 'Cliente 1 (Sintético)',
        role: 'member',
        verified: true,
      },
      {
        email: 'user2@organizacaointeligente.com.br',
        password: 'Skip@Pass',
        name: 'Cliente 2 (Sintético)',
        role: 'member',
        verified: true,
      },
    ]

    for (const acc of demoAccounts) {
      try {
        app.findAuthRecordByEmail('oi_memberships', acc.email)
        // Já existe, não recriar
      } catch (_) {
        const rec = new Record(membershipsCol)
        rec.setEmail(acc.email)
        rec.setPassword(acc.password)
        rec.setVerified(acc.verified)
        rec.set('name', acc.name)
        rec.set('role', acc.role)
        app.save(rec)
      }
    }
  },
  (app) => {
    const emails = [
      'admin-oi@organizacaointeligente.com.br',
      'user1@organizacaointeligente.com.br',
      'user2@organizacaointeligente.com.br',
    ]
    for (const email of emails) {
      try {
        const rec = app.findAuthRecordByEmail('oi_memberships', email)
        app.delete(rec)
      } catch (_) {}
    }
  },
)
