import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const run = spawnSync(
  process.env.OI_PYTHON || 'python3',
  [fileURLToPath(new URL('./validate_http.py', import.meta.url))],
  { stdio: 'inherit', env: process.env },
)
process.exit(run.status === null ? 1 : run.status)
