export type PaperPresetId = 'auto' | 'a4' | 'a5' | 'a3' | 'letter'

export interface PaperSize {
  id: PaperPresetId
  name: string
  // dimensions in inches
  widthIn: number
  heightIn: number
}

export const paperSizes: Record<PaperPresetId, PaperSize> = {
  auto: { id: 'auto', name: 'Auto (fit content)', widthIn: 0, heightIn: 0 },
  a4: { id: 'a4', name: 'A4', widthIn: 8.27, heightIn: 11.69 },
  a5: { id: 'a5', name: 'A5', widthIn: 5.83, heightIn: 8.27 },
  a3: { id: 'a3', name: 'A3', widthIn: 11.69, heightIn: 16.54 },
  letter: { id: 'letter', name: 'Letter', widthIn: 8.5, heightIn: 11 }
}

export interface PaperConfig {
  /** Paper preset; 'auto' sizes the page to the content + margin. */
  size: PaperPresetId
  /** Margin around the content, in inches. */
  margin: number
  /** Background color of the paper (CSS color string). */
  paperColor: string
}

export const defaultPaperConfig: PaperConfig = {
  size: 'auto',
  margin: 0,
  paperColor: '#ffffff'
}

export interface PaperLayout {
  pageWidth: number
  pageHeight: number
  /** Offset of the scanned content inside the page, in pixels. */
  offsetX: number
  offsetY: number
  backgroundColor: string
}

/**
 * Compute the final page geometry for a scanned page given the paper settings.
 *
 * - `auto`: page == content size + 2 * margin, content centered.
 * - preset: fixed page size from the preset; content is centered within the
 *   area left after subtracting the margin on every side.
 */
export function computePaperLayout(
  imageWidth: number,
  imageHeight: number,
  ppi: number,
  config: PaperConfig
): PaperLayout {
  const marginPx = config.margin * ppi

  if (config.size === 'auto') {
    const pageWidth = Math.max(1, Math.round(imageWidth + 2 * marginPx))
    const pageHeight = Math.max(1, Math.round(imageHeight + 2 * marginPx))
    return {
      pageWidth,
      pageHeight,
      offsetX: Math.round(marginPx),
      offsetY: Math.round(marginPx),
      backgroundColor: config.paperColor
    }
  }

  const paper = paperSizes[config.size]
  const pageWidth = Math.max(1, Math.round(paper.widthIn * ppi))
  const pageHeight = Math.max(1, Math.round(paper.heightIn * ppi))
  const availW = Math.max(0, pageWidth - 2 * marginPx)
  const availH = Math.max(0, pageHeight - 2 * marginPx)
  const offsetX = Math.round(marginPx + (availW - imageWidth) / 2)
  const offsetY = Math.round(marginPx + (availH - imageHeight) / 2)
  return {
    pageWidth,
    pageHeight,
    offsetX,
    offsetY,
    backgroundColor: config.paperColor
  }
}
