import { computePaperLayout, type PaperConfig } from '../paper/paper'
import { drawWatermark, type WatermarkConfig } from '../watermark/watermark'
import { drawStamp, shouldApplyStamp, type StampConfig } from '../stamp/stamp'

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas

function createCanvas(width: number, height: number): AnyCanvas {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height)
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

async function canvasToBlob(canvas: AnyCanvas, type: string): Promise<Blob> {
  if ('convertToBlob' in canvas) {
    return await canvas.convertToBlob({ type })
  }
  return await new Promise<Blob>((resolve, reject) => {
    ;(canvas as HTMLCanvasElement).toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to encode canvas'))),
      type
    )
  })
}

/**
 * Composite a scanned page with paper background, watermark and signature /
 * stamp overlays into a single page-sized image.
 *
 * This runs after the scan effect so it works for both the Canvas and the
 * ImageMagick scan backends. `pageIndex` is 0-based and `totalPages` is the
 * document length (used to decide stamp applicability).
 */
export async function compositePage(
  scannedBlob: Blob,
  paper: PaperConfig,
  watermark: WatermarkConfig,
  stamp: StampConfig,
  pageIndex: number,
  totalPages: number,
  ppi: number
): Promise<Blob> {
  const scannedBitmap = await createImageBitmap(scannedBlob)
  const layout = computePaperLayout(scannedBitmap.width, scannedBitmap.height, ppi, paper)

  const canvas = createCanvas(layout.pageWidth, layout.pageHeight)
  const ctx = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null
  if (!ctx) throw new Error('Canvas not supported')

  ctx.fillStyle = layout.backgroundColor
  ctx.fillRect(0, 0, layout.pageWidth, layout.pageHeight)
  ctx.drawImage(
    scannedBitmap,
    layout.offsetX,
    layout.offsetY,
    scannedBitmap.width,
    scannedBitmap.height
  )

  if (watermark.enabled) {
    drawWatermark(ctx, layout.pageWidth, layout.pageHeight, watermark)
  }

  if (shouldApplyStamp(pageIndex, totalPages, stamp) && stamp.imageDataUrl) {
    const res = await fetch(stamp.imageDataUrl)
    const stampBitmap = await createImageBitmap(await res.blob())
    drawStamp(ctx, layout.pageWidth, layout.pageHeight, stampBitmap, stamp)
  }

  return await canvasToBlob(canvas, 'image/jpeg')
}
