import { describe, it, expect } from 'vitest'
import { SUPPORTED_LOCALES, normalizeLocale } from '@/locale/config'
import { en } from '@/locale/en'
import { zhCN } from '@/locale/zh-CN'
import { fr } from '@/locale/fr'
import { es } from '@/locale/es'
import { pt } from '@/locale/pt'

/** 将嵌套对象拍平为点分 key 集合，用于对比不同语言翻译的完整性 */
function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return flattenKeys(value as Record<string, unknown>, path)
    }
    return [path]
  })
}

/** 拍平为 [path, value]，用于校验叶子值非空 */
function flattenEntries(obj: Record<string, unknown>, prefix = ''): [string, unknown][] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return flattenEntries(value as Record<string, unknown>, path)
    }
    return [[path, value]]
  })
}

const allMessages = { en, 'zh-CN': zhCN, fr, es, pt }
const enKeys = flattenKeys(en as Record<string, unknown>).sort()

describe('i18n config', () => {
  it('supports exactly the 5 required languages', () => {
    expect(SUPPORTED_LOCALES.map((l) => l.code)).toEqual(['zh-CN', 'en', 'fr', 'es', 'pt'])
  })

  it('keeps language codes unique', () => {
    const codes = SUPPORTED_LOCALES.map((l) => l.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('normalizes browser/region tags to supported locales', () => {
    expect(normalizeLocale('zh-CN')).toBe('zh-CN')
    expect(normalizeLocale('fr-FR')).toBe('fr')
    expect(normalizeLocale('fr')).toBe('fr')
    expect(normalizeLocale('es-419')).toBe('es')
    expect(normalizeLocale('pt-BR')).toBe('pt')
    expect(normalizeLocale('PT')).toBe('pt')
  })

  it('falls back to en for unknown or empty locales', () => {
    expect(normalizeLocale('de')).toBe('en')
    expect(normalizeLocale('ja-JP')).toBe('en')
    expect(normalizeLocale(null)).toBe('en')
    expect(normalizeLocale(undefined)).toBe('en')
    expect(normalizeLocale('')).toBe('en')
  })
})

describe('translation completeness', () => {
  it('every supported language contains exactly the same keys as English', () => {
    for (const code of Object.keys(allMessages)) {
      const keys = flattenKeys(allMessages[code] as Record<string, unknown>).sort()
      expect(keys, `missing/extra keys in "${code}"`).toEqual(enKeys)
    }
  })

  it('keeps no empty string values in translations', () => {
    for (const code of Object.keys(allMessages)) {
      const entries = flattenEntries(allMessages[code] as Record<string, unknown>)
      for (const [path, value] of entries) {
        if (typeof value === 'string') {
          expect(value.trim(), `empty value at ${code}.${path}`).not.toBe('')
        }
      }
    }
  })

  it('covers the newly added feature keys (paper/watermark/stamp/metadata)', () => {
    const required = [
      'settings.paper',
      'settings.paperSize',
      'settings.stamp',
      'settings.stampImage',
      'settings.watermark',
      'settings.watermarkText',
      'settings.metadata',
      'settings.metadataTitle'
    ]
    for (const code of Object.keys(allMessages)) {
      const keys = flattenKeys(allMessages[code] as Record<string, unknown>)
      for (const key of required) {
        expect(keys, `language "${code}" missing "${key}"`).toContain(key)
      }
    }
  })
})
