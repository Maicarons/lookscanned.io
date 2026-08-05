/**
 * i18n 纯逻辑层（与 vue-i18n / naive-ui 解耦，便于在测试中无副作用地复用）。
 * 新增一种语言只需：建 src/locale/<code>/ 目录 + 在 SUPPORTED_LOCALES 追加一项，
 * 其余（切换器、持久化、校验测试、naive-ui 映射）都会自动适配。
 */
export interface LocaleMeta {
  /** vue-i18n / naive-ui 使用的语言代码 */
  code: string
  /** 该语言的自称（母语写法），用于切换器展示 */
  label: string
  /** 英文名称，便于不熟悉该文字的用户识别 */
  englishLabel: string
}

export const SUPPORTED_LOCALES: LocaleMeta[] = [
  { code: 'zh-CN', label: '中文', englishLabel: 'Chinese' },
  { code: 'en', label: 'English', englishLabel: 'English' },
  { code: 'fr', label: 'Français', englishLabel: 'French' },
  { code: 'es', label: 'Español', englishLabel: 'Spanish' },
  { code: 'pt', label: 'Português', englishLabel: 'Portuguese' }
]

const STORAGE_KEY = 'lookscanned-locale'

/**
 * 将浏览器/存储中的语言标签规范化到已支持的语言。
 * 支持带地区后缀的标签，例如 'zh-CN'、'fr-FR'、'es-419'、'pt-BR' 都会正确匹配。
 */
export function normalizeLocale(raw: string | null | undefined): string {
  if (!raw) return 'en'
  const lower = raw.toLowerCase()
  const base = lower.split('-')[0]
  const exact = SUPPORTED_LOCALES.find((l) => l.code.toLowerCase() === lower)
  if (exact) return exact.code
  const byBase = SUPPORTED_LOCALES.find((l) => l.code.toLowerCase().split('-')[0] === base)
  if (byBase) return byBase.code
  return 'en'
}

export function persistLocale(code: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, code)
  } catch {
    /* localStorage 不可用时静默忽略 */
  }
}
