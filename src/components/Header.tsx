import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useTheme } from './theme-provider'

export const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/organizacao-pessoal', label: 'Organização Pessoal' },
  { to: '/produtividade', label: 'Produtividade' },
  { to: '/habitos', label: 'Hábitos' },
  { to: '/planejamento', label: 'Planejamento' },
  { to: '/ferramentas-gratuitas', label: 'Ferramentas Gratuitas' },
  { to: '/recomendados', label: 'Recomendados' },
  { to: '/blog', label: 'Blog' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/contato', label: 'Contato' },
  { to: '/kit-organizacao-inteligente', label: 'Kit' },
  { to: '/diagnostico', label: 'Diagnóstico' },
]

export function Header() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <header className="sticky top-0 z-40 w-full h-[72px] bg-background/90 backdrop-blur-md border-b shadow-small flex flex-none items-center justify-between px-4 md:px-6 transition-colors min-w-0">
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger
          className="text-primary hover:bg-primary/10 min-w-[44px] min-h-[44px] flex-shrink-0"
          aria-label="Abrir menu"
        />
        <Link
          to="/"
          className="font-bold text-[18px] sm:text-[22px] md:text-[26px] text-primary tracking-tight transition-transform hover:scale-[1.02] whitespace-nowrap shrink-0"
        >
          Organização Inteligente
        </Link>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className="rounded-full min-w-[44px] min-h-[44px]"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  )
}
