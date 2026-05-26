import { useState, useEffect } from 'react'
import { mockArticles, Article } from '@/lib/mock-data'

export default function useArticlesStore() {
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem('oi_articles')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse articles from local storage', e)
    }
    return mockArticles
  })

  useEffect(() => {
    localStorage.setItem('oi_articles', JSON.stringify(articles))
  }, [articles])

  const addArticle = (article: Omit<Article, 'id'>) => {
    const newArticle = { ...article, id: Date.now().toString() }
    setArticles((prev) => [newArticle, ...prev])
  }

  const deleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id))
  }

  return { articles, addArticle, deleteArticle }
}
