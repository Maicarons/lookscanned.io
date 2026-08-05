export interface ImagePageInfo {
  blob: Blob
  width: number
  height: number
  ppi: number
}

/**
 * Compute the rendered page dimensions for an image given the scan scale.
 * Exposed as a pure function so it can be unit tested without a DOM.
 *
 * `ppi` follows the convention used everywhere else in the app:
 * ppi = scale * 72, i.e. scale 1x == 72 ppi.
 */
export function computeImagePageInfo(
  naturalWidth: number,
  naturalHeight: number,
  scale: number
): { width: number; height: number; ppi: number } {
  return {
    width: Math.max(1, Math.round(naturalWidth * scale)),
    height: Math.max(1, Math.round(naturalHeight * scale)),
    ppi: scale * 72
  }
}

/**
 * A PDFRenderer implementation that wraps a single raster image (PNG/JPEG/WebP/
 * GIF) and exposes it as a one-page document, so the scan pipeline can treat
 * uploaded images exactly like PDFs.
 *
 * Browser-only: relies on `createImageBitmap` and a canvas for re-encoding
 * into a pdf-lib compatible format (JPEG).
 */
export class ImagePDFRenderer {
  private file: Blob

  constructor(file: Blob) {
    this.file = file
  }

  async getNumPages(): Promise<number> {
    return 1
  }

  async renderPage(_page: number, scale: number): Promise<ImagePageInfo> {
    const bitmap = await createImageBitmap(this.file)
    const { width, height, ppi } = computeImagePageInfo(bitmap.width, bitmap.height, scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas not supported')
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Failed to encode image'))),
        'image/jpeg',
        0.92
      )
    })

    return { blob, width, height, ppi }
  }
}
