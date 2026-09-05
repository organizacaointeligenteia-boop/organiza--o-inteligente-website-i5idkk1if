import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('Mobile Sidebar Navigation and Focus Return (v0.0.53)', () => {
  const sidebarSource = readFileSync(resolve(__dirname, '../components/AppSidebar.tsx'), 'utf-8')
  const sidebarUiSource = readFileSync(resolve(__dirname, '../components/ui/sidebar.tsx'), 'utf-8')
  const headerSource = readFileSync(resolve(__dirname, '../components/Header.tsx'), 'utf-8')

  describe('(a) Fechamento da sidebar ao selecionar rota (incluindo rota atual e atalhos)', () => {
    it('importa useSidebar no AppSidebar', () => {
      expect(sidebarSource).toContain('useSidebar')
    })

    it('utiliza setOpenMobile(false) no handleNavClick quando em mobile', () => {
      expect(sidebarSource).toContain('const { isMobile, setOpenMobile } = useSidebar()')
      expect(sidebarSource).toContain('const handleNavClick = () => {')
      expect(sidebarSource).toContain('if (isMobile) {')
      expect(sidebarSource).toContain('setOpenMobile(false)')
    })

    it('anexa onClick={handleNavClick} aos links de navegação principais (todos os itens do menu)', () => {
      // Verifica que NavLink dentro de navLinks possui onClick={handleNavClick}
      expect(sidebarSource).toMatch(
        /navLinks\.map[\s\S]*?<NavLink[\s\S]*?onClick=\{handleNavClick\}/,
      )
    })

    it('anexa onClick={handleNavClick} aos atalhos rápidos do blog', () => {
      expect(sidebarSource).toMatch(
        /Atalhos do Blog[\s\S]*?<NavLink[\s\S]*?onClick=\{handleNavClick\}/,
      )
    })

    it('permite fechar mesmo se a rota for a rota atual (ação de clique sempre invoca handleNavClick)', () => {
      // Como onClick é chamado incondicionalmente no clique do NavLink, selecionar a rota atual também dispara handleNavClick
      expect(sidebarSource).toContain('onClick={handleNavClick}')
    })
  })

  describe('(b) Destino de navegação correto e integridade dos links', () => {
    it('Header exporta todas as rotas esperadas incluindo Home, Kit e Diagnóstico', () => {
      expect(headerSource).toContain("{ to: '/', label: 'Home' }")
      expect(headerSource).toContain("{ to: '/diagnostico', label: 'Diagnóstico' }")
      expect(headerSource).toContain("{ to: '/kit-organizacao-inteligente', label: 'Kit' }")
      expect(headerSource).toContain("{ to: '/blog', label: 'Blog' }")
      expect(headerSource).toContain(
        "{ to: '/ferramentas-gratuitas', label: 'Ferramentas Gratuitas' }",
      )
    })

    it('AppSidebar mapeia os itens mantendo as rotas to={item.to} intactas', () => {
      expect(sidebarSource).toContain('to={item.to}')
    })

    it('Atalhos rápidos apontam corretamente para as categorias do blog com encoding', () => {
      expect(sidebarSource).toContain('to={`/blog?cat=${encodeURIComponent(cat)}`}')
    })
  })

  describe('(c) Devolução de foco ao botão Abrir menu (SidebarTrigger) ao fechar por X ou Escape', () => {
    it('SidebarTrigger tem atributo data-sidebar="trigger" e aria-label="Abrir menu"', () => {
      expect(sidebarUiSource).toContain('data-sidebar="trigger"')
      expect(headerSource).toContain('aria-label="Abrir menu"')
    })

    it('SheetContent no modo móvel intercepta onCloseAutoFocus para restaurar foco no SidebarTrigger', () => {
      expect(sidebarUiSource).toContain('onCloseAutoFocus=')
      expect(sidebarUiSource).toContain('event.preventDefault()')
      expect(sidebarUiSource).toContain('document.querySelector')
      expect(sidebarUiSource).toContain('data-sidebar="trigger"')
    })

    it('utiliza preventScroll: true ao focar para evitar rolagem inesperada da página', () => {
      expect(sidebarUiSource).toContain('trigger.focus({ preventScroll: true })')
    })
  })

  describe('Acessibilidade mantida', () => {
    it('mantém classes de foco visível (focus-visible:ring-2 focus-visible:ring-primary)', () => {
      expect(sidebarSource).toContain('focus-visible:ring-2')
      expect(sidebarSource).toContain('focus-visible:ring-primary')
    })

    it('mantém SheetTitle e SheetDescription acessíveis para leitores de tela', () => {
      expect(sidebarUiSource).toContain('Menu de Navegação')
      expect(sidebarUiSource).toContain('SheetDescription className="sr-only"')
    })
  })
})
