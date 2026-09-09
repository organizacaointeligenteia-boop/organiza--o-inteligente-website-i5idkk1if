import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { sanitizeUtmForSubmission } from '../lib/utm'

describe('Preview 0.0.55 Requirements: Atribuição UTM Diagnóstico e RD Station', () => {
  const diagnosticoSource = readFileSync(resolve(__dirname, '../pages/Diagnostico.tsx'), 'utf-8')
  const hookSource = readFileSync(
    resolve(__dirname, '../../pocketbase/hooks/diagnosis_subscribe.js'),
    'utf-8',
  )

  beforeEach(() => {
    sessionStorage.clear()
  })

  describe('Frontend (Diagnostico.tsx)', () => {
    it('lê e sanitiza UTMs capturados antes de enviar ao endpoint', () => {
      expect(diagnosticoSource).toContain('captureAndPersistUtm()')
      expect(diagnosticoSource).toContain('sanitizeUtmForSubmission(')
      expect(diagnosticoSource).toContain('...sanitizedUtms')
    })

    it('mantém o endpoint /backend/v1/diagnosis/subscribe e consent: "granted"', () => {
      expect(diagnosticoSource).toContain('/backend/v1/diagnosis/subscribe')
      expect(diagnosticoSource).toContain("consent: 'granted'")
      expect(diagnosticoSource).toContain(
        'data?.success === true && data?.consentReceived === true',
      )
    })

    it('sanitiza parâmetros UTM respeitando limite de 100 caracteres e omitindo vazios', () => {
      const sanitized = sanitizeUtmForSubmission({
        utm_source: '  google  ',
        utm_medium: 'cpc',
        utm_campaign: 'b'.repeat(120),
        utm_content: 'banner',
        invalid_empty: '',
      })

      expect(sanitized).toEqual({
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'b'.repeat(100),
        utm_content: 'banner',
      })
    })
  })

  describe('PocketBase Hook (diagnosis_subscribe.js)', () => {
    it('mapeia UTMs para traffic_source, traffic_medium e traffic_campaign com fallbacks oficiais', () => {
      expect(hookSource).toContain("cleanSource || 'organizacao_inteligente'")
      expect(hookSource).toContain("cleanMedium || 'diagnostico_site'")
      expect(hookSource).toContain('traffic_source: trafficSource')
      expect(hookSource).toContain('traffic_medium: trafficMedium')
    })

    it('NÃO inclui traffic_value nem utm_content no payload do RD Station (contrato oficial da API)', () => {
      expect(hookSource).not.toContain('traffic_value:')
      expect(hookSource).not.toContain('utm_content:')
      // Deve conter o comentário explicando que traffic_value corresponde a utm_term
      expect(hookSource).toMatch(/traffic_value corresponde a utm_term/i)
    })

    it('persiste o lead antes da chamada ao RD Station e trata erro do RD sem quebrar a resposta', () => {
      const saveIdx = hookSource.indexOf('$app.save(record)')
      const rdIdx = hookSource.indexOf('https://api.rd.services/platform/conversions')
      expect(saveIdx).toBeGreaterThan(-1)
      expect(rdIdx).toBeGreaterThan(saveIdx)
      expect(hookSource).toContain('RD Station falhou mas inscrição foi salva')
      expect(hookSource).toContain('rd_synced')
    })

    it('preserva sentinel dry-run diagnostic-check@invalid.local', () => {
      expect(hookSource).toContain("email === 'diagnostic-check@invalid.local'")
      expect(hookSource).toContain('{ success: true, consentReceived: true, dryRun: true }')
    })
  })
})
