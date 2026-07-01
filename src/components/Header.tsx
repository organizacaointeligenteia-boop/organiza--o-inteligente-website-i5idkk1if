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
  { to: '/recomendados', label: 'Recomendados' },
  { to: '/blog', label: 'Blog' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/contato', label: 'Contato' },
]

export function Header() {
  const { theme, setTheme } = useTheme()
  const { isMobile } = useSidebar()

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  const desktopLinks = [
    ...navLinks.slice(1, 6),
    { to: '/recomendados', label: 'Recomendados' },
    ...navLinks.slice(6, 7),
  ]

  return (
    <header className="sticky top-0 z-40 w-full h-[72px] bg-background/90 backdrop-blur-md border-b shadow-small flex flex-none items-center justify-between px-4 md:px-6 transition-colors">
      <div className="flex items-center gap-2">
        <SidebarTrigger
          className="text-primary hover:bg-primary/10 min-w-[44px] min-h-[44px]"
          aria-label="Abrir menu"
        />
        <Link
          to="/"
          className="font-bold text-[22px] md:text-[28px] text-primary tracking-tight transition-transform hover:scale-[1.02] truncate"
        >
          Organização Inteligente
        </Link>
      </div>

      <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
        {desktopLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap min-h-[44px] inline-flex items-center justify-center',
                {
                  'bg-primary/15 text-primary': isActive,
                  'text-muted-foreground hover:bg-primary/10 hover:text-primary': !isActive,
                },
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className="rounded-full"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  )
}
