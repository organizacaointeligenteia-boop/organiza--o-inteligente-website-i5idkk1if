import { useState } from 'react'
import { usePageTitle } from '@/hooks/use-page-title'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Mail, MapPin, Phone } from 'lucide-react'

const CONTACT_EMAIL = 'contato@organizacaointeligente.com.br'

export default function Contact() {
  usePageTitle('Contato')
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const name = (formData.get('name') as string) || ''
    const email = (formData.get('email') as string) || ''
    const message = (formData.get('message') as string) || ''

    const subject = `Contato pelo site - ${name}`
    const body = `Nome: ${name}\nE-mail: ${email}\n\nMensagem:\n${message}`
    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    setLoading(true)
    window.location.href = mailtoUrl

    toast({
      title: 'Abrindo seu aplicativo de e-mail',
      description: 'Revise a mensagem e envie para concluir o contato.',
    })

    setTimeout(() => {
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="max-w-5xl mx-auto py-8 animate-fade-in">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">Fale Conosco</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tem dúvidas, sugestões ou quer compartilhar uma história de sucesso? Adoraríamos ouvir
          você.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-secondary p-8 rounded-2xl space-y-6">
            <h3 className="text-2xl font-bold">Informações de Contato</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span>{CONTACT_EMAIL}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Atendimento inicial por e-mail</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Brasil - atendimento remoto</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Digite seu nome"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="seu@email.com"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                name="message"
                required
                placeholder="Como podemos ajudar?"
                className="min-h-[150px]"
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? 'Abrindo...' : 'Enviar Mensagem'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
