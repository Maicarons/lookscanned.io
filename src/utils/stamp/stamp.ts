import type { DrawContext } from '../watermark/watermark'

export type StampPages = 'all' | 'first' | 'last' | 'custom'

export interface StampConfig {
  enabled: boolean
  /** Data URL of the signature / stamp image. */
  imageDataUrl?: string
  /** Horizontal anchor (0..1) of the stamp center. */
  x: number
  /** Vertical anchor (0..1) of the stamp center. */
  y: number
  /** Stamp size as a fraction of min(pageWidth, pageHeight). */
  size: number
  rotation: number
  opacity: number
  /** Which pages the stamp is applied to. */
  pages: StampPages
  /** 1-based page numbers, used when pages === 'custom'. */
  customPages: number[]
}

export const defaultStampConfig: StampConfig = {
  enabled: false,
  imageDataUrl: undefined,
  x: 0.5,
  y: 0.5,
  size: 0.3,
  rotation: 0,
  opacity: 1,
  pages: 'all',
  customPages: []
}

/**
 * Decide whether the stamp should be drawn on a given page.
 * `pageIndex` is 0-based, `totalPages` is the document length.
 */
export function shouldApplyStamp(
  pageIndex: number,
  totalPages: number,
  config: StampConfig
): boolean {
  if (!config.enabled) return false
  switch (config.pages) {
    case 'all':
      return true
    case 'first':
      return pageIndex === 0
    case 'last':
      return pageIndex === totalPages - 1
    case 'custom':
      return config.customPages.includes(pageIndex + 1)
    default:
      return false
  }
}

export interface StampPlacement {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
}

export function computeStampPlacement(
  pageWidth: number,
  pageHeight: number,
  config: StampConfig
): StampPlacement {
  const base = Math.min(pageWidth, pageHeight) * config.size
  const width = Math.max(1, base)
  const height = Math.max(1, base)
  return {
    x: config.x * pageWidth - width / 2,
    y: config.y * pageHeight - height / 2,
    width,
    height,
    rotation: config.rotation,
    opacity: config.opacity
  }
}

/**
 * Draw the stamp onto a 2D context. The caller is responsible for checking
 * `shouldApplyStamp` first; this function only renders.
 */
export function drawStamp(
  ctx: DrawContext,
  pageWidth: number,
  pageHeight: number,
  image: ImageBitmap,
  config: StampConfig
): void {
  const p = computeStampPlacement(pageWidth, pageHeight, config)
  ctx.save()
  ctx.globalAlpha = Math.min(1, Math.max(0, p.opacity))
  ctx.translate(p.x + p.width / 2, p.y + p.height / 2)
  ctx.rotate((p.rotation * Math.PI) / 180)
  ctx.drawImage(image, -p.width / 2, -p.height / 2, p.width, p.height)
  ctx.restore()
}
