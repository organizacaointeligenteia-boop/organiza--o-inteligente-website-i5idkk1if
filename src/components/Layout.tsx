import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Header } from './Header'
import { Footer } from './Footer'
import { AppSidebar } from './AppSidebar'
import { ErrorBoundary } from './ErrorBoundary'

export default function Layout() {
  return (
    <ErrorBoundary>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-h-screen flex flex-col bg-background relative min-w-0 max-w-full overflow-hidden">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-medium"
          >
            Pular para o conteúdo principal
          </a>
          <Header />
          <main
            id="main-content"
            className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-8 md:px-8 md:py-12 min-w-0"
          >
            <Outlet />
          </main>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </ErrorBoundary>
  )
}
