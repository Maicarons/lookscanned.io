import { describe, it, expect } from 'vitest'
import { computePaperLayout, defaultPaperConfig, paperSizes } from './paper'

describe('computePaperLayout', () => {
  it('auto with zero margin equals content size and centers at 0', () => {
    const layout = computePaperLayout(1000, 800, 72, {
      ...defaultPaperConfig,
      size: 'auto',
      margin: 0
    })
    expect(layout.pageWidth).toBe(1000)
    expect(layout.pageHeight).toBe(800)
    expect(layout.offsetX).toBe(0)
    expect(layout.offsetY).toBe(0)
    expect(layout.backgroundColor).toBe('#ffffff')
  })

  it('auto adds 2*margin around content', () => {
    const layout = computePaperLayout(1000, 800, 72, {
      ...defaultPaperConfig,
      size: 'auto',
      margin: 1
    })
    expect(layout.pageWidth).toBe(1000 + 2 * 72)
    expect(layout.pageHeight).toBe(800 + 2 * 72)
    expect(layout.offsetX).toBe(72)
    expect(layout.offsetY).toBe(72)
  })

  it('preset sizes the page from the preset and centers content', () => {
    const layout = computePaperLayout(1000, 800, 72, {
      ...defaultPaperConfig,
      size: 'letter',
      margin: 0
    })
    const paper = paperSizes.letter
    expect(layout.pageWidth).toBe(Math.round(paper.widthIn * 72))
    expect(layout.pageHeight).toBe(Math.round(paper.heightIn * 72))
    expect(layout.offsetX).toBe(Math.round((layout.pageWidth - 1000) / 2))
    expect(layout.offsetY).toBe(Math.round((layout.pageHeight - 800) / 2))
  })

  it('preset respects margin by shrinking the available area', () => {
    const layout = computePaperLayout(1000, 800, 72, {
      ...defaultPaperConfig,
      size: 'letter',
      margin: 0.5
    })
    const paper = paperSizes.letter
    const pageW = Math.round(paper.widthIn * 72)
    const availW = pageW - 2 * 0.5 * 72
    expect(layout.offsetX).toBe(Math.round(0.5 * 72 + (availW - 1000) / 2))
  })

  it('never returns a page smaller than 1px', () => {
    const layout = computePaperLayout(10, 10, 72, {
      ...defaultPaperConfig,
      size: 'auto',
      margin: -100
    })
    expect(layout.pageWidth).toBeGreaterThanOrEqual(1)
    expect(layout.pageHeight).toBeGreaterThanOrEqual(1)
  })
})
