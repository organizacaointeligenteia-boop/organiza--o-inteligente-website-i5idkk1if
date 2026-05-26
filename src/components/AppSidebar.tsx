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
    <Sidebar collapsible="offcanvas" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
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
                            'flex items-center gap-2',
                            isActive && 'text-primary font-medium bg-sidebar-accent',
                          )
                        }
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2',
                        isActive && 'text-primary font-medium bg-sidebar-accent',
                      )
                    }
                  >
                    <Settings className="h-4 w-4" />
                    <span>Administração</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Atalhos do Blog</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {['Produtividade', 'Hábitos Diários', 'Ferramentas'].map((cat) => (
                <SidebarMenuItem key={cat}>
                  <SidebarMenuButton asChild>
                    <NavLink to={`/blog?cat=${encodeURIComponent(cat)}`}>
                      <span>{cat}</span>
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
