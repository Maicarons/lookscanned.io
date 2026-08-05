import { createI18n } from 'vue-i18n'

import { en } from './en'
import { zhCN } from './zh-CN'
import { fr } from './fr'
import { es } from './es'
import { pt } from './pt'
import { zhCN as naiveZhCN, enUS, frFR, esAR, ptBR } from 'naive-ui'
import type { NLocale } from 'naive-ui'
import { SUPPORTED_LOCALES, normalizeLocale, persistLocale } from './config'

export type { LocaleMeta } from './config'
export { SUPPORTED_LOCALES, normalizeLocale, persistLocale }

/** naive-ui 组件语言包映射；新增语言时在此补充对应包即可 */
export const naiveLocaleMap: Record<string, NLocale> = {
  'zh-CN': naiveZhCN,
  en: enUS,
  fr: frFR,
  es: esAR,
  pt: ptBR
}

function getInitialLocale(): string {
  try {
    const stored =
      typeof localStorage !== 'undefined' ? localStorage.getItem('lookscanned-locale') : null
    if (stored) return normalizeLocale(stored)
  } catch {
    /* ignore */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : null
  return normalizeLocale(nav)
}

const i18n = createI18n({
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  legacy: false,
  messages: {
    en,
    'zh-CN': zhCN,
    fr,
    es,
    pt
  }
})

export default i18n
