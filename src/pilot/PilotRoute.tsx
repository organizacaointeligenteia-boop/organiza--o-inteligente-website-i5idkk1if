import { Suspense, lazy, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { isPilotHostnameAllowed, getCurrentHostname } from './guard'
import { PilotUnavailablePage } from './PilotUnavailable'

// Dynamic lazy import only evaluated when hostname is allowed
const LazyPilotPage = lazy(() => import('./PilotOrganizacaoPage'))

export function PilotRoute() {
  // useLocation ensures the guard is re-evaluated on any router transition/navigation
  const location = useLocation()

  // Guard evaluation per navigation/render: strictly pure exact allowlist check
  // Executed BEFORE mounting/rendering LazyPilotPage
  const isAllowed = useMemo(() => {
    const currentHost = getCurrentHostname()
    return isPilotHostnameAllowed(currentHost)
  }, [location.pathname, location.search])

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
