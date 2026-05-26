import { Link, NavLink } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { useTheme } from './theme-provider'
import { cn } from '@/lib/utils'

export const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/organizacao-pessoal', label: 'Organização Pessoal' },
  { to: '/produtividade', label: 'Produtividade' },
  { to: '/habitos', label: 'Hábitos' },
  { to: '/planejamento', label: 'Planejamento' },
  { to: '/ferramentas-gratuitas', label: 'Ferramentas Gratuitas' },
  { to: '/blog', label: 'Blog' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/contato', label: 'Contato' },
]

export function Header() {
  const { theme, setTheme } = useTheme()
  const { isMobile } = useSidebar()

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <header className="sticky top-0 z-40 w-full h-[72px] bg-background/95 backdrop-blur border-b flex flex-none items-center justify-between px-4 md:px-6 transition-colors">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-foreground hover:bg-accent" aria-label="Abrir menu" />
        <Link
          to="/"
          className="font-bold text-lg md:text-xl text-primary tracking-tight transition-transform hover:scale-[1.02]"
        >
          Organização Inteligente
        </Link>
      </div>

      <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
        {navLinks.slice(1, 6).map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground whitespace-nowrap',
                {
                  'bg-accent text-accent-foreground': isActive,
                  'text-muted-foreground': !isActive,
                },
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Alternar tema">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  )
}
