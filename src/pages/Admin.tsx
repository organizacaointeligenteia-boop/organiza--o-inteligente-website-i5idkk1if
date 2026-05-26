import { useState } from 'react'
import { usePageTitle } from '@/hooks/use-page-title'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import useArticlesStore from '@/stores/use-articles-store'
import { Trash2, Edit, Plus } from 'lucide-react'

export default function Admin() {
  usePageTitle('Administração')
  const { articles, addArticle, deleteArticle } = useArticlesStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    image: 'https://img.usecurling.com/p/800/400?q=office&dpr=2',
    category: 'Geral',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === 'title' && !formData.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addArticle(formData)
    toast({ title: 'Artigo adicionado', description: 'O artigo foi salvo localmente com sucesso.' })
    setFormData({
      ...formData,
      title: '',
      slug: '',
      excerpt: '',
      content: '',
    })
  }

  return (
    <div className="space-y-8 animate-fade-in py-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Painel de Administração</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <Card className="lg:col-span-1 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" /> Novo Artigo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug da URL</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">URL da Imagem</Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Resumo (Excerpt)</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  required
                  className="h-20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo HTML/Texto</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  className="h-40"
                />
              </div>
              <Button type="submit" className="w-full">
                Salvar Artigo
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="lg:col-span-2 shadow-sm bg-card">
          <CardHeader>
            <CardTitle>Artigos Cadastrados ({articles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {articles.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
                Nenhum artigo encontrado.
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold">{article.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {article.slug} • {article.category}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast({ title: 'Edição mockada' })}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteArticle(article.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
