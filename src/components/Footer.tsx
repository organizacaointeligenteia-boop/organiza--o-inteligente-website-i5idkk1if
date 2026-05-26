import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { navLinks } from './Header'

export function Footer() {
  const { toast } = useToast()

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    try {
      const res = await pb.send('/backend/v1/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: formData.get('email') }),
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.success) {
        toast({ title: 'Inscrição realizada!', description: res.message })
        ;(e.target as HTMLFormElement).reset()
      }
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.response?.message || 'Ocorreu um erro',
        variant: 'destructive',
      })
    }
  }

  return (
    <footer className="border-t bg-card text-card-foreground mt-auto">
      <div className="w-full max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-primary">Organização Inteligente</h3>
            <p className="text-sm text-muted-foreground">
              Micro-guias práticos para pessoas sem tempo. Transforme sua rotina com pequenos
              hábitos diários.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Links Rápidos</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Receba dicas exclusivas toda semana.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                name="email"
                type="email"
                placeholder="Seu email"
                required
                className="bg-background"
              />
              <Button type="submit">Assinar</Button>
            </form>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2026 Organização Inteligente. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
