import { useState, useEffect, useRef } from 'react'
import { usePageTitle } from '@/hooks/use-page-title'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import {
  getArticlesList,
  createArticle,
  updateArticle,
  deleteArticle,
  type Article,
} from '@/services/articles'
import { getDownloads, type Download } from '@/services/downloads'
import {
  getAffiliates,
  createAffiliate,
  updateAffiliate,
  deleteAffiliate,
  type AffiliateLink,
} from '@/services/affiliates'
import { getSubscribers, type Subscriber } from '@/services/newsletter'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import pb from '@/lib/pocketbase/client'
import {
  Trash2,
  Edit,
  LogOut,
  Download as DownloadIcon,
  FileText,
  Link as LinkIcon,
  Users,
} from 'lucide-react'

export default function Admin() {
  usePageTitle('Administração')
  const { signOut } = useAuth()
  const { toast } = useToast()

  const [articles, setArticles] = useState<Article[]>([])
  const [downloads, setDownloads] = useState<Download[]>([])
  const [affiliates, setAffiliates] = useState<AffiliateLink[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])

  const loadData = async () => {
    try {
      const arts = await getArticlesList(1, 100)
      setArticles(arts.items)
      const dls = await getDownloads()
      setDownloads(dls)
      const affs = await getAffiliates()
      setAffiliates(affs)
      const subs = await getSubscribers()
      setSubscribers(subs)
    } catch (err) {
      toast({
        title: 'Erro ao carregar dados',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('articles', loadData)
  useRealtime('newsletter_subscribers', loadData)
  useRealtime('free_downloads', loadData)
  useRealtime('affiliate_links', loadData)

  // Articles Form
  const [articleForm, setArticleForm] = useState({
    id: '',
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    category: 'Produtividade',
    readingTime: 5,
  })
  const handleArticleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setArticleForm((prev) => ({ ...prev, [name]: value }))
    if (name === 'title' && !articleForm.id) {
      setArticleForm((prev) => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
      }))
    }
  }
  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (articleForm.id) {
        await updateArticle(articleForm.id, { ...articleForm })
        toast({ title: 'Artigo atualizado' })
      } else {
        await createArticle({ ...articleForm })
        toast({ title: 'Artigo criado' })
      }
      setArticleForm({
        id: '',
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featuredImage: '',
        category: 'Produtividade',
        readingTime: 5,
      })
    } catch (err) {
      toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
    }
  }

  // Downloads Form
  const formRef = useRef<HTMLFormElement>(null)
  const handleDownloadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const id = formData.get('id') as string
    try {
      if (id) {
        if (!(formData.get('fileUrl') as File).name) formData.delete('fileUrl') // avoid empty file update
        await pb.collection('free_downloads').update(id, formData)
        toast({ title: 'Download atualizado' })
      } else {
        await pb.collection('free_downloads').create(formData)
        toast({ title: 'Download criado' })
      }
      form.reset()
    } catch (err) {
      toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
    }
  }

  const exportSubscribersCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Email,Name,Status,Date\n' +
      subscribers.map((s) => `${s.email},${s.name || ''},${s.status},${s.created}`).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'subscribers.csv')
    document.body.appendChild(link)
    link.click()
  }

  return (
    <div className="space-y-8 animate-fade-in py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Painel de Administração</h1>
        <Button variant="outline" onClick={signOut} className="gap-2">
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto gap-2 p-1">
          <TabsTrigger value="articles" className="gap-2 py-2">
            <FileText className="h-4 w-4" /> Artigos
          </TabsTrigger>
          <TabsTrigger value="downloads" className="gap-2 py-2">
            <DownloadIcon className="h-4 w-4" /> Downloads
          </TabsTrigger>
          <TabsTrigger value="affiliates" className="gap-2 py-2">
            <LinkIcon className="h-4 w-4" /> Afiliados
          </TabsTrigger>
          <TabsTrigger value="newsletter" className="gap-2 py-2">
            <Users className="h-4 w-4" /> Newsletter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{articleForm.id ? 'Editar Artigo' : 'Novo Artigo'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleArticleSubmit}
                className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="space-y-2 col-span-1">
                  <Label>Título</Label>
                  <Input
                    name="title"
                    value={articleForm.title}
                    onChange={handleArticleChange}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-1">
                  <Label>Slug da URL</Label>
                  <Input
                    name="slug"
                    value={articleForm.slug}
                    onChange={handleArticleChange}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-1">
                  <Label>Categoria</Label>
                  <Input
                    name="category"
                    value={articleForm.category}
                    onChange={handleArticleChange}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-1">
                  <Label>URL da Imagem</Label>
                  <Input
                    name="featuredImage"
                    value={articleForm.featuredImage}
                    onChange={handleArticleChange}
                  />
                </div>
                <div className="space-y-2 col-span-1">
                  <Label>Tempo Leitura (min)</Label>
                  <Input
                    type="number"
                    name="readingTime"
                    value={articleForm.readingTime}
                    onChange={handleArticleChange}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Resumo</Label>
                  <Textarea
                    name="excerpt"
                    value={articleForm.excerpt}
                    onChange={handleArticleChange}
                    className="h-20"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Conteúdo HTML/Texto</Label>
                  <Textarea
                    name="content"
                    value={articleForm.content}
                    onChange={handleArticleChange}
                    required
                    className="h-40"
                  />
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  {articleForm.id && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setArticleForm({
                          id: '',
                          title: '',
                          slug: '',
                          excerpt: '',
                          content: '',
                          featuredImage: '',
                          category: 'Produtividade',
                          readingTime: 5,
                        })
                      }
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button type="submit">Salvar Artigo</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Artigos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.title}</TableCell>
                      <TableCell>{a.category}</TableCell>
                      <TableCell>{new Date(a.publishedAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setArticleForm({ ...a })}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => deleteArticle(a.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downloads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Novo / Editar Download</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDownloadSubmit} ref={formRef} className="space-y-4">
                <input type="hidden" name="id" id="dl-id" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input name="title" id="dl-title" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Arquivo (PDF max 50MB)</Label>
                    <Input type="file" name="fileUrl" accept="application/pdf" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Descrição</Label>
                    <Textarea name="description" id="dl-desc" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      formRef.current?.reset()
                      ;(document.getElementById('dl-id') as HTMLInputElement).value = ''
                    }}
                  >
                    Limpar
                  </Button>
                  <Button type="submit">Salvar Download</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Downloads Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Baixados</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {downloads.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.title}</TableCell>
                      <TableCell>{d.downloadCount}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const f = formRef.current
                            if (!f) return
                            ;(f.elements.namedItem('id') as HTMLInputElement).value = d.id
                            ;(f.elements.namedItem('title') as HTMLInputElement).value = d.title
                            ;(f.elements.namedItem('description') as HTMLTextAreaElement).value =
                              d.description || ''
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => pb.collection('free_downloads').delete(d.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Links Afiliados</CardTitle>
              <CardDescription>Gerencie seus links de recomendação</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.productName}</TableCell>
                      <TableCell>{a.category}</TableCell>
                      <TableCell>{a.commission ? `${a.commission}%` : '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => deleteAffiliate(a.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="newsletter" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscribers.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {subscribers.filter((s) => s.status === 'active').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cancelados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {subscribers.filter((s) => s.status === 'unsubscribed').length}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Inscritos</CardTitle>
              <Button onClick={exportSubscribersCSV} size="sm">
                Exportar CSV
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.email}</TableCell>
                      <TableCell>{s.name || '-'}</TableCell>
                      <TableCell>
                        {s.status === 'active' ? (
                          <span className="text-green-600 font-medium">Ativo</span>
                        ) : (
                          <span className="text-red-600">Inativo</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(s.created).toLocaleDateString('pt-BR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
