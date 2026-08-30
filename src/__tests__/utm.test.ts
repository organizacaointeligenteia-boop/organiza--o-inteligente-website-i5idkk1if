import { describe, it, expect, beforeEach } from 'vitest'
import {
  readUtmFromQuery,
  getStoredUtm,
  setStoredUtm,
  captureAndPersistUtm,
  getKiwifyCheckoutUrl,
  KIWIFY_CHECKOUT_BASE_URL,
  DEFAULT_UTM,
  UTM_SESSION_STORAGE_KEY,
} from '../lib/utm'

describe('UTM Helper', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  describe('readUtmFromQuery', () => {
    it('extracts utm_source, utm_medium, utm_campaign and utm_content from query string', () => {
      const query =
        '?utm_source=instagram&utm_medium=social&utm_campaign=habitos_7_dias&utm_content=stories'
      const res = readUtmFromQuery(query)
      expect(res).toEqual({
        utm_source: 'instagram',
        utm_medium: 'social',
        utm_campaign: 'habitos_7_dias',
        utm_content: 'stories',
      })
    })

    it('ignores non-UTM parameters and personal data', () => {
      const query = '?utm_source=facebook&email=test%40example.com&name=John&ip=127.0.0.1&foo=bar'
      const res = readUtmFromQuery(query)
      expect(res).toEqual({
        utm_source: 'facebook',
      })
      expect((res as any).email).toBeUndefined()
      expect((res as any).name).toBeUndefined()
      expect((res as any).ip).toBeUndefined()
      expect((res as any).foo).toBeUndefined()
    })

    it('returns empty object when query string has no UTM params or is empty', () => {
      expect(readUtmFromQuery('')).toEqual({})
      expect(readUtmFromQuery('?other=value')).toEqual({})
    })

    it('trims whitespace and ignores empty string UTM values', () => {
      const query = '?utm_source=  google  &utm_medium=&utm_campaign=   '
      const res = readUtmFromQuery(query)
      expect(res).toEqual({
        utm_source: 'google',
      })
    })
  })

  describe('sessionStorage persistence', () => {
    it('stores and retrieves only allowed UTM parameters', () => {
      const params = {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'black_friday',
        utm_content: 'banner_top',
      }
      setStoredUtm(params)
      expect(getStoredUtm()).toEqual(params)

      const raw = sessionStorage.getItem(UTM_SESSION_STORAGE_KEY)
      expect(raw).toBeTruthy()
      expect(JSON.parse(raw!)).toEqual(params)
    })

    it('never stores disallowed properties (e.g. email, user data)', () => {
      const dirtyParams: any = {
        utm_source: 'tiktok',
        email: 'user@secret.com',
        userId: '12345',
      }
      setStoredUtm(dirtyParams)
      expect(getStoredUtm()).toEqual({
        utm_source: 'tiktok',
      })
      const raw = JSON.parse(sessionStorage.getItem(UTM_SESSION_STORAGE_KEY)!)
      expect(raw.email).toBeUndefined()
      expect(raw.userId).toBeUndefined()
    })

    it('captureAndPersistUtm merges query params into stored session without dropping existing UTMs', () => {
      // First visit: from twitter with source & campaign
      captureAndPersistUtm('?utm_source=twitter&utm_campaign=launch_2025')
      expect(getStoredUtm()).toEqual({
        utm_source: 'twitter',
        utm_campaign: 'launch_2025',
      })

      // Navigation without query params keeps the session UTMs
      const onSecondPage = captureAndPersistUtm('')
      expect(onSecondPage).toEqual({
        utm_source: 'twitter',
        utm_campaign: 'launch_2025',
      })

      // New UTM query overrides/augments previous
      const onThirdPage = captureAndPersistUtm('?utm_medium=paid')
      expect(onThirdPage).toEqual({
        utm_source: 'twitter',
        utm_medium: 'paid',
        utm_campaign: 'launch_2025',
      })
    })
  })

  describe('getKiwifyCheckoutUrl', () => {
    it('returns default UTM parameters on organic visit (no UTM in query, empty session)', () => {
      const urlString = getKiwifyCheckoutUrl('pagina_kit', KIWIFY_CHECKOUT_BASE_URL, '')
      const url = new URL(urlString)

      expect(url.origin + url.pathname).toBe(KIWIFY_CHECKOUT_BASE_URL)
      expect(url.searchParams.get('utm_source')).toBe(DEFAULT_UTM.utm_source)
      expect(url.searchParams.get('utm_medium')).toBe(DEFAULT_UTM.utm_medium)
      expect(url.searchParams.get('utm_campaign')).toBe(DEFAULT_UTM.utm_campaign)
      expect(url.searchParams.get('utm_content')).toBe('pagina_kit')
    })

    it('passes captured campaign UTMs when user comes with custom UTMs', () => {
      const query = '?utm_source=instagram&utm_medium=social&utm_campaign=habitos_7_dias'
      const urlString = getKiwifyCheckoutUrl(
        'diagnostico_resultado',
        KIWIFY_CHECKOUT_BASE_URL,
        query,
      )
      const url = new URL(urlString)

      expect(url.origin + url.pathname).toBe(KIWIFY_CHECKOUT_BASE_URL)
      expect(url.searchParams.get('utm_source')).toBe('instagram')
      expect(url.searchParams.get('utm_medium')).toBe('social')
      expect(url.searchParams.get('utm_campaign')).toBe('habitos_7_dias')
      expect(url.searchParams.get('utm_content')).toBe('diagnostico_resultado')
    })

    it('preserves existing non-UTM query parameters already present on the checkout baseUrl', () => {
      const customCheckoutUrl =
        'https://pay.kiwify.com.br/qpFPGxF?src=affiliate_123&coupon=SPECIAL10'
      const urlString = getKiwifyCheckoutUrl(
        'home',
        customCheckoutUrl,
        '?utm_source=youtube&utm_medium=video',
      )
      const url = new URL(urlString)

      expect(url.origin + url.pathname).toBe('https://pay.kiwify.com.br/qpFPGxF')
      // Preserved params
      expect(url.searchParams.get('src')).toBe('affiliate_123')
      expect(url.searchParams.get('coupon')).toBe('SPECIAL10')
      // Injected UTM params
      expect(url.searchParams.get('utm_source')).toBe('youtube')
      expect(url.searchParams.get('utm_medium')).toBe('video')
      expect(url.searchParams.get('utm_campaign')).toBe(DEFAULT_UTM.utm_campaign)
      expect(url.searchParams.get('utm_content')).toBe('home')
    })

    it('uses utm_content from query if present, otherwise defaults to CTA position', () => {
      // Case 1: query has utm_content
      const withContent = getKiwifyCheckoutUrl(
        'home',
        KIWIFY_CHECKOUT_BASE_URL,
        '?utm_content=hero_banner',
      )
      const url1 = new URL(withContent)
      expect(url1.searchParams.get('utm_content')).toBe('hero_banner')

      // Case 2: query has no utm_content, position is provided
      sessionStorage.clear()
      const withoutContent = getKiwifyCheckoutUrl(
        'diagnostico_resultado',
        KIWIFY_CHECKOUT_BASE_URL,
        '',
      )
      const url2 = new URL(withoutContent)
      expect(url2.searchParams.get('utm_content')).toBe('diagnostico_resultado')
    })

    it('works across different CTA positions: diagnostico_resultado, pagina_kit, home', () => {
      const positions = ['diagnostico_resultado', 'pagina_kit', 'home'] as const
      for (const pos of positions) {
        sessionStorage.clear()
        const urlStr = getKiwifyCheckoutUrl(pos, KIWIFY_CHECKOUT_BASE_URL, '')
        const parsed = new URL(urlStr)
        expect(parsed.searchParams.get('utm_content')).toBe(pos)
      }
    })
  })
})
