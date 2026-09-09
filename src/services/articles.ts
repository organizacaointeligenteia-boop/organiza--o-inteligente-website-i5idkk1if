import pb from '@/lib/pocketbase/client'

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImage?: string
  category: string
  readingTime?: number
  publishedAt: string
  updatedAt?: string
  created: string
  updated: string
}

export const getArticles = async (limit = 12, offset = 0) => {
  const res = await pb.send(`/backend/v1/articles?limit=${limit}&offset=${offset}`, {
    method: 'GET',
  })
  return res.items as Article[]
}
export const getArticlesList = async (page = 1, perPage = 12, filter = '') => {
  return pb.collection('articles').getList<Article>(page, perPage, { filter, sort: '-publishedAt' })
}
export const getArticleBySlug = async (slug: string) => {
  return pb.send(`/backend/v1/articles/${slug}`, { method: 'GET' }) as Promise<Article>
}
export const createArticle = async (data: any) => {
  return pb.send('/backend/v1/articles/create', { method: 'POST', body: data }) as Promise<Article>
}
export const updateArticle = async (id: string, data: any) => {
  return pb.send(`/backend/v1/articles/${id}/update`, {
    method: 'PUT',
    body: data,
  }) as Promise<Article>
}
export const deleteArticle = async (id: string) => {
  return pb.send(`/backend/v1/articles/${id}/delete`, { method: 'DELETE' })
}
