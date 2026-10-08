import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { captureAndPersistUtm } from '@/lib/utm'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/hooks/use-auth'

import Layout from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import NotFound from './pages/NotFound'
import { PilotRoute } from './pilot/PilotRoute'
import { MemberLoginRoute } from './pilot/MemberLoginRoute'

const Home = lazy(() => import('./pages/Index'))
const Category = lazy(() => import('./pages/Category'))
const FreeTools = lazy(() => import('./pages/FreeTools'))
const Blog = lazy(() => import('./pages/Blog'))
const Article = lazy(() => import('./pages/Article'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Admin = lazy(() => import('./pages/Admin'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Recommended = lazy(() => import('./pages/Recommended'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const KitPage = lazy(() => import('./pages/KitPage'))
const Diagnostico = lazy(() => import('./pages/Diagnostico'))

const LoadingFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

function UtmTracker() {
  const location = useLocation()
  useEffect(() => {
    captureAndPersistUtm(location.search)
  }, [location.search])
  return null
}

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="theme">
    <BrowserRouter>
      <UtmTracker />
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route
                  path="/organizacao-pessoal"
                  element={<Category title="Organização Pessoal" />}
                />
                <Route path="/produtividade" element={<Category title="Produtividade" />} />
                <Route path="/habitos" element={<Category title="Hábitos" />} />
                <Route path="/planejamento" element={<Category title="Planejamento" />} />
                <Route path="/ferramentas-gratuitas" element={<FreeTools />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<Article />} />
                <Route path="/sobre" element={<About />} />
                <Route path="/contato" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/recomendados" element={<Recommended />} />
                <Route path="/termos" element={<Terms />} />
                <Route path="/privacidade" element={<Privacy />} />
                <Route path="/kit-organizacao-inteligente" element={<KitPage />} />
                {/* Diagnóstico quiz — production deploy */}
                <Route path="/diagnostico" element={<Diagnostico />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/admin" element={<Admin />} />
                </Route>
              </Route>
              {/* Piloto de Demonstração e Login de Membros (isolados fora do Layout público) */}
              <Route path="/piloto-organizacao" element={<PilotRoute />} />
              <Route path="/piloto-organizacao/login" element={<MemberLoginRoute />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
)

export default App
