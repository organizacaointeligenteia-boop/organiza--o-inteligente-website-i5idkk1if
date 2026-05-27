import { NavLink } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { navLinks } from './Header'
import {
  BookOpen,
  Calendar,
  CheckSquare,
  Coffee,
  Compass,
  Download,
  Home,
  Info,
  Mail,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ElementType> = {
  Home: Home,
  'Organização Pessoal': CheckSquare,
  Produtividade: Compass,
  Hábitos: Coffee,
  Planejamento: Calendar,
  'Ferramentas Gratuitas': Download,
  Blog: BookOpen,
  Sobre: Info,
  Contato: Mail,
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="offcanvas" className="border-r border-border bg-secondary">
      <SidebarContent className="bg-secondary">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-semibold px-4 pt-4 pb-2 text-xs uppercase tracking-wider">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks.map((item) => {
                const Icon = iconMap[item.label] || BookOpen
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 min-h-[44px] rounded-lg mx-2 px-3 transition-colors duration-200',
                            isActive
                              ? 'text-primary font-medium bg-primary/15'
                              : 'text-muted-foreground hover:bg-primary/10 hover:text-primary',
                          )
                        }
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-[15px]">{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
              <SidebarMenuItem className="mt-4">
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 min-h-[44px] rounded-lg mx-2 px-3 transition-colors duration-200',
                        isActive
                          ? 'text-primary font-medium bg-primary/15'
                          : 'text-muted-foreground hover:bg-primary/10 hover:text-primary',
                      )
                    }
                  >
                    <Settings className="h-5 w-5" />
                    <span className="text-[15px]">Administração</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-muted-foreground font-semibold px-4 pb-2 text-xs uppercase tracking-wider">
            Atalhos do Blog
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {['Produtividade', 'Hábitos Diários', 'Ferramentas'].map((cat) => (
                <SidebarMenuItem key={cat}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={`/blog?cat=${encodeURIComponent(cat)}`}
                      className="flex items-center gap-3 min-h-[44px] rounded-lg mx-2 px-3 transition-colors duration-200 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    >
                      <span className="text-[15px]">{cat}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
