import { useEffect, useState, useRef } from 'react'
import { usePageTitle } from '@/hooks/use-page-title'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getDownloads, trackDownload, type Download } from '@/services/downloads'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { findFreeDownloadFile, downloadPdfFromBase64 } from '@/lib/freeDownloadFiles'
import { ToastAction } from '@/components/ui/toast'
import { Download as DownloadIcon } from 'lucide-react'

export default function FreeTools() {
  usePageTitle('Ferramentas Gratuitas | Organização Inteligente')
  const { toast } = useToast()
  const [tools, setTools] = useState<Download[]>([])
  const newsletterRef = useRef<HTMLInputElement>(null)

  const loadTools = () => {
    getDownloads().then(setTools).catch(console.error)
  }

  useEffect(() => {
    loadTools()
  }, [])

  useRealtime('free_downloads', () => {
    loadTools()
  })

  const handleDownload = async (tool: Download) => {
    const file = findFreeDownloadFile(tool.title)
    if (!file) {
      scrollToNewsletter()
      return
    }
    toast({
      title: 'Download iniciado',
      description: 'Cadastre seu e-mail para receber novas ferramentas.',
      action: (
        <ToastAction altText="Inscrever na newsletter" onClick={scrollToNewsletter}>
          Quero receber
        </ToastAction>
      ),
    })
    try {
      await trackDownload(tool.id)
      downloadPdfFromBase64(file.base64, file.filename)
    } catch {
      toast({ title: 'Erro ao baixar', variant: 'destructive' })
    }
  }

  const scrollToNewsletter = () => {
    document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })
    setTimeout(() => newsletterRef.current?.focus(), 600)
  }

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
        toast({
          title: 'Inscrição realizada!',
          description: res.message,
          className: 'bg-green-600 text-white border-none',
        })
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
    <div className="space-y-10 animate-fade-in pb-16">
      <div className="space-y-4 text-center py-8">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-primary">
          Ferramentas Gratuitas
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Baixe nossos templates e planilhas desenhados para economizar seu tempo e impulsionar seus
          resultados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Card
            key={tool.id}
            className="flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-elevation"
          >
            <CardHeader className="flex-1">
              <CardTitle className="text-xl flex justify-between items-start">
                {tool.title}
                {tool.downloadCount > 0 && (
                  <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                    {tool.downloadCount} baixados
                  </span>
                )}
              </CardTitle>
              <CardDescription className="mt-2 text-base">{tool.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full gap-2" onClick={() => handleDownload(tool)}>
                <DownloadIcon className="h-4 w-4" /> Baixar PDF
              </Button>
            </CardFooter>
          </Card>
        ))}
        {tools.length === 0 && (
          <Card className="flex flex-col border-dashed bg-muted/30 items-center justify-center min-h-[200px] text-center p-6 lg:col-span-3">
            <h3 className="font-medium text-muted-foreground">Mais ferramentas em breve</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Inscreva-se na newsletter para ser avisado.
            </p>
          </Card>
        )}
      </div>

      <section id="newsletter" className="py-10 flex justify-center">
        <div className="bg-card rounded-[32px] p-8 md:p-16 max-w-[900px] text-center space-y-6 w-full shadow-elevation border border-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Receba nossas ferramentas por e-mail
          </h2>
          <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
            Receba novos materiais gratuitos por e-mail assim que forem publicados.
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-3 max-w-[550px] mx-auto pt-6"
          >
            <Input
              name="email"
              type="email"
              placeholder="E-mail principal"
              required
              className="bg-background flex-1 shadow-sm"
              ref={newsletterRef}
            />
            <Button
              type="submit"
              size="lg"
              className="whitespace-nowrap w-full sm:w-auto shadow-sm"
            >
              Quero receber
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
