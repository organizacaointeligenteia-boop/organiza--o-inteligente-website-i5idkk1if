import pb from '@/lib/pocketbase/client'
import { getStaticArticles } from '@/lib/staticCatalog'
import { parseDateSafe } from '@/lib/dateUtils'

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

/**
 * Merges an API article with its static catalog counterpart if the static catalog
 * version has a more recent editorial date (`updatedAt` or `publishedAt`), or if the API
 * article lacks updated content.
 */
export function mergeArticleWithStatic(apiArticle: Article): Article {
  const staticArt = getStaticArticles().find((s) => s.slug === apiArticle.slug)
  if (!staticArt) return apiArticle

  // Get editorial dates for comparison
  const staticEditorialDate =
    parseDateSafe(staticArt.updatedAt) || parseDateSafe(staticArt.publishedAt)
  const apiEditorialDate =
    parseDateSafe(apiArticle.updatedAt) || parseDateSafe(apiArticle.publishedAt)

  // If static has editorial updates and either api doesn't, or static date > api date,
  // static prevails for editorial fields
  const staticTime = staticEditorialDate ? staticEditorialDate.getTime() : 0
  const apiTime = apiEditorialDate ? apiEditorialDate.getTime() : 0

  if (staticTime > apiTime) {
    return {
      ...apiArticle,
      ...staticArt,
      id: apiArticle.id || staticArt.id,
      content: staticArt.content || apiArticle.content,
    }
  }

  // If static content exists and api content is empty or older
  if (staticArt.content && !apiArticle.content) {
    return {
      ...apiArticle,
      content: staticArt.content,
      title: staticArt.title || apiArticle.title,
      excerpt: staticArt.excerpt || apiArticle.excerpt,
    }
  }

  return apiArticle
}

export const getArticles = async (limit = 12, offset = 0) => {
  const res = await pb.send(`/backend/v1/articles?limit=${limit}&offset=${offset}`, {
    method: 'GET',
  })
  const items = (res.items as Article[]) || []
  return items.map(mergeArticleWithStatic)
}

export const getArticlesList = async (page = 1, perPage = 12, filter = '') => {
  const res = await pb
    .collection('articles')
    .getList<Article>(page, perPage, { filter, sort: '-publishedAt' })
  return {
    ...res,
    items: res.items.map(mergeArticleWithStatic),
  }
}
export const getArticleBySlug = async (slug: string) => {
  try {
    const apiArticle = (await pb.send(`/backend/v1/articles/${slug}`, { method: 'GET' })) as Article
    return mergeArticleWithStatic(apiArticle)
  } catch (err) {
    const staticArticle = getStaticArticles().find((a) => a.slug === slug)
    if (staticArticle) return staticArticle
    throw err
  }
}

export const getArticleBySlugSync = (slug: string): Article | undefined => {
  return getStaticArticles().find((a) => a.slug === slug)
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
