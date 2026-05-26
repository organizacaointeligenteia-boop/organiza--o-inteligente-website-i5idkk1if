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
        <SidebarInset className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-8 md:px-8 md:py-10 animate-fade-in">
            <Outlet />
          </main>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </ErrorBoundary>
  )
}
