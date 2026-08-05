import { describe, it, expect } from 'vitest'
import { computeImagePageInfo, ImagePDFRenderer } from './index'

describe('computeImagePageInfo', () => {
  it('scales natural dimensions and sets ppi = scale*72', () => {
    const info = computeImagePageInfo(1000, 500, 2)
    expect(info.width).toBe(2000)
    expect(info.height).toBe(1000)
    expect(info.ppi).toBe(144)
  })

  it('never returns dimensions smaller than 1', () => {
    const info = computeImagePageInfo(0, 0, 1)
    expect(info.width).toBeGreaterThanOrEqual(1)
    expect(info.height).toBeGreaterThanOrEqual(1)
  })
})

describe('ImagePDFRenderer', () => {
  it('reports a single page', async () => {
    const renderer = new ImagePDFRenderer(new Blob())
    expect(await renderer.getNumPages()).toBe(1)
  })
})
