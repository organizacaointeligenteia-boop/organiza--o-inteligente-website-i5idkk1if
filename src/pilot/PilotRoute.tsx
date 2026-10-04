import { Suspense, lazy } from 'react'
import { isPilotHostnameAllowed, getCurrentHostname } from './guard'
import { PilotUnavailablePage } from './PilotUnavailable'

// Dynamic lazy import only evaluated when hostname is allowed
const LazyPilotPage = lazy(() => import('./PilotOrganizacaoPage'))

export function PilotRoute() {
  const currentHost = getCurrentHostname()
  const isAllowed = isPilotHostnameAllowed(currentHost)

  if (!isAllowed) {
    // Render unavailable page IMMEDIATELY.
    // The pilot component is NOT imported or mounted.
    return <PilotUnavailablePage />
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"
            role="status"
            aria-label="Carregando demonstração"
          />
        </div>
      }
    >
      <LazyPilotPage />
    </Suspense>
  )
}
