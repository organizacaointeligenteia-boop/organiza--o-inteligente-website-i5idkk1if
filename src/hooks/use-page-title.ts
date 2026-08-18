import { useEffect } from 'react'

export const BRAND = 'Organização Inteligente'

/**
 * Build a page title, appending the brand only when the passed title does not
 * already contain it. Pure function — exported for testing.
 */
export function buildTitle(title: string): string {
  if (!title) return BRAND
  return title.includes(BRAND) ? title : `${title} | ${BRAND}`
}

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = buildTitle(title)
  }, [title])
}
