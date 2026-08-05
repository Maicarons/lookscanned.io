export type WatermarkType = 'text' | 'image'
export type WatermarkPositionMode = 'single' | 'tiled'

export interface WatermarkConfig {
  enabled: boolean
  type: WatermarkType
  text: string
  /** Data URL of the watermark image (used when type === 'image'). */
  imageDataUrl?: string
  fontFamily: string
  fontSize: number
  color: string
  opacity: number
  rotation: number
  positionMode: WatermarkPositionMode
  /** Horizontal anchor (0..1) for single mode. */
  positionX: number
  /** Vertical anchor (0..1) for single mode. */
  positionY: number
  /** Horizontal spacing between tiles, in pixels. */
  tileGapX: number
  /** Vertical spacing between tiles, in pixels. */
  tileGapY: number
  /** Overall scale factor applied to the watermark. */
  scale: number
}

export const defaultWatermarkConfig: WatermarkConfig = {
  enabled: false,
  type: 'text',
  text: 'CONFIDENTIAL',
  imageDataUrl: undefined,
  fontFamily: 'sans-serif',
  fontSize: 48,
  color: '#cccccc',
  opacity: 0.3,
  rotation: -30,
  positionMode: 'tiled',
  positionX: 0.5,
  positionY: 0.5,
  tileGapX: 160,
  tileGapY: 160,
  scale: 1
}

export interface WatermarkPlacement {
  x: number
  y: number
  rotation: number
  scale: number
}

/**
 * Compute where each watermark instance should be drawn on a page.
 *
 * - disabled: no placements.
 * - single: one placement at (positionX, positionY) of the page.
 * - tiled: a grid of placements covering the page (and a margin around it so
 *   that rotation never leaves gaps). The grid step is taken from tileGapX/Y.
 */
export function computeWatermarkPlacements(
  pageWidth: number,
  pageHeight: number,
  config: WatermarkConfig
): WatermarkPlacement[] {
  if (!config.enabled) return []

  if (config.positionMode === 'single') {
    return [
      {
        x: config.positionX * pageWidth,
        y: config.positionY * pageHeight,
        rotation: config.rotation,
        scale: config.scale
      }
    ]
  }

  const stepX = Math.max(1, config.tileGapX)
  const stepY = Math.max(1, config.tileGapY)
  const placements: WatermarkPlacement[] = []
  for (let y = -pageHeight; y <= pageHeight * 2; y += stepY) {
    for (let x = -pageWidth; x <= pageWidth * 2; x += stepX) {
      placements.push({ x, y, rotation: config.rotation, scale: config.scale })
    }
  }
  return placements
}

export type DrawContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

/**
 * Draw the watermark onto a 2D context. Pure with respect to the context, so
 * it can be exercised with a recording mock in unit tests.
 */
export function drawWatermark(
  ctx: DrawContext,
  pageWidth: number,
  pageHeight: number,
  config: WatermarkConfig,
  image?: ImageBitmap
): void {
  const placements = computeWatermarkPlacements(pageWidth, pageHeight, config)
  if (placements.length === 0) return

  ctx.save()
  ctx.globalAlpha = Math.min(1, Math.max(0, config.opacity))

  if (config.type === 'image' && image) {
    const iw = image.width * config.scale
    const ih = image.height * config.scale
    for (const p of placements) {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.drawImage(image, -iw / 2, -ih / 2, iw, ih)
      ctx.restore()
    }
  } else {
    ctx.fillStyle = config.color
    ctx.font = `${Math.round(config.fontSize * config.scale)}px ${config.fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const p of placements) {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.fillText(config.text, 0, 0)
      ctx.restore()
    }
  }

  ctx.restore()
}
