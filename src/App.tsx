import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'

import Layout from './components/Layout'
import NotFound from './pages/NotFound'

const Home = lazy(() => import('./pages/Index'))
const Category = lazy(() => import('./pages/Category'))
const FreeTools = lazy(() => import('./pages/FreeTools'))
const Blog = lazy(() => import('./pages/Blog'))
const Article = lazy(() => import('./pages/Article'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Admin = lazy(() => import('./pages/Admin'))

const LoadingFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="theme">
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
              <Route path="/admin" element={<Admin />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </TooltipProvider>
    </BrowserRouter>
  </ThemeProvider>
)

export default App
