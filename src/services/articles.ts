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
  created: string
  updated: string
}

export const getArticles = () =>
  pb.collection('articles').getFullList<Article>({ sort: '-publishedAt' })
export const getArticleBySlug = async (slug: string) => {
  const records = await pb
    .collection('articles')
    .getList<Article>(1, 1, { filter: `slug="${slug}"` })
  return records.items[0]
}
export const createArticle = (data: Partial<Article>) =>
  pb.collection('articles').create<Article>(data)
export const deleteArticle = (id: string) => pb.collection('articles').delete(id)
