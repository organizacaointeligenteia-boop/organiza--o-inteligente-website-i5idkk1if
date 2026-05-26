import { useEffect, useState } from 'react'
import { usePageTitle } from '@/hooks/use-page-title'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getDownloads, trackDownload, type Download } from '@/services/downloads'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { Download as DownloadIcon } from 'lucide-react'

export default function FreeTools() {
  usePageTitle('Ferramentas Gratuitas | Organização Inteligente')
  const { toast } = useToast()
  const [tools, setTools] = useState<Download[]>([])

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
    try {
      await trackDownload(tool.id)
      toast({ title: 'Download iniciado', description: 'O arquivo está sendo baixado.' })
      const url = pb.files.getURL(
        { collectionId: 'free_downloads', id: tool.id } as any,
        tool.fileUrl,
      )
      window.open(url, '_blank')
    } catch (err) {
      toast({ title: 'Erro ao baixar', variant: 'destructive' })
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
                <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                  {tool.downloadCount} baixados
                </span>
              </CardTitle>
              <CardDescription className="mt-2 text-base">{tool.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full gap-2" onClick={() => handleDownload(tool)}>
                <DownloadIcon className="h-4 w-4" /> Baixar
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
    </div>
  )
}
