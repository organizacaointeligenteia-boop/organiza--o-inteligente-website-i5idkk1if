import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { navLinks } from './Header'
import { Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-auto border-t">
      <div className="w-full max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-1">
            <h3 className="font-bold text-[22px] mb-4 text-primary tracking-tight">
              Organização Inteligente
            </h3>
            <p className="text-[15px] text-muted-foreground leading-relaxed">
              Guias, checklists e ferramentas para profissionais ocupados organizarem rotina,
              documentos, foco e planejamento semanal.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-6 text-foreground tracking-wide">Links Rápidos</h4>
            <ul className="flex flex-col gap-3 text-[15px] text-muted-foreground">
              {navLinks.slice(1, 6).map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="hover:text-primary transition-colors min-h-[44px] inline-flex items-center"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-6 text-foreground tracking-wide">Comunidade & Legal</h4>
            <ul className="flex flex-col gap-3 text-[15px] text-muted-foreground">
              <li>
                <Link
                  to="/sobre"
                  className="hover:text-primary transition-colors min-h-[44px] inline-flex items-center"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  to="/contato"
                  className="hover:text-primary transition-colors min-h-[44px] inline-flex items-center"
                >
                  Contato
                </Link>
              </li>
              <li>
                <Link
                  to="/termos"
                  className="hover:text-primary transition-colors min-h-[44px] inline-flex items-center"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  to="/privacidade"
                  className="hover:text-primary transition-colors min-h-[44px] inline-flex items-center"
                >
                  Política de Privacidade
                </Link>
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a
                href="https://www.instagram.com/organizacao.inteligente.ia/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @organizacao.inteligente.ia"
                className="text-muted-foreground hover:text-primary min-w-[44px] min-h-[44px] inline-flex items-center justify-center bg-background rounded-full shadow-sm"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="md:col-span-1">
            <h4 className="font-semibold mb-6 text-foreground tracking-wide">
              Diagnóstico gratuito
            </h4>
            <p className="text-[15px] text-muted-foreground mb-4 leading-relaxed">
              Descubra em 2 minutos qual ponto está travando sua rotina. O diagnóstico é gratuito e
              100% opcional.
            </p>
            <Button asChild className="w-full shadow-sm">
              <Link to="/diagnostico">Fazer diagnóstico gratuito</Link>
            </Button>
          </div>
        </div>
        <div className="border-t border-border mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© 2026 Organização Inteligente. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
