import { describe, it, expect } from 'vitest'
import {
  computeWatermarkPlacements,
  drawWatermark,
  defaultWatermarkConfig,
  type DrawContext
} from './watermark'

function mockCtx() {
  const calls: Record<string, any[]> = {}
  const record = (name: string) => (...args: any[]) => {
    ;(calls[name] ??= []).push(args)
  }
  return {
    calls,
    save: record('save'),
    restore: record('restore'),
    translate: record('translate'),
    rotate: record('rotate'),
    drawImage: record('drawImage'),
    fillText: record('fillText'),
    fillRect: record('fillRect'),
    globalAlpha: 1,
    fillStyle: '',
    font: '',
    textAlign: '',
    textBaseline: ''
  }
}

describe('computeWatermarkPlacements', () => {
  it('returns no placements when disabled', () => {
    expect(
      computeWatermarkPlacements(1000, 800, { ...defaultWatermarkConfig, enabled: false })
    ).toEqual([])
  })

  it('single mode returns one placement at the given relative position', () => {
    const p = computeWatermarkPlacements(1000, 800, {
      ...defaultWatermarkConfig,
      enabled: true,
      positionMode: 'single',
      positionX: 0.5,
      positionY: 0.25,
      rotation: -30,
      scale: 2
    })
    expect(p).toHaveLength(1)
    expect(p[0].x).toBe(500)
    expect(p[0].y).toBe(200)
    expect(p[0].rotation).toBe(-30)
    expect(p[0].scale).toBe(2)
  })

  it('tiled mode returns a grid of placements with the configured rotation', () => {
    const p = computeWatermarkPlacements(200, 200, {
      ...defaultWatermarkConfig,
      enabled: true,
      positionMode: 'tiled',
      tileGapX: 50,
      tileGapY: 50,
      rotation: 15
    })
    expect(p.length).toBeGreaterThan(1)
    expect(p.every((pl) => pl.rotation === 15)).toBe(true)
  })
})

describe('drawWatermark', () => {
  it('does nothing when disabled', () => {
    const ctx = mockCtx()
    drawWatermark(ctx as unknown as DrawContext, 1000, 800, {
      ...defaultWatermarkConfig,
      enabled: false
    })
    expect(ctx.calls.fillText ?? []).toHaveLength(0)
  })

  it('text mode fills text once per placement and sets opacity', () => {
    const ctx = mockCtx()
    const cfg = {
      ...defaultWatermarkConfig,
      enabled: true,
      positionMode: 'single',
      opacity: 0.4,
      text: 'TOP SECRET'
    }
    drawWatermark(ctx as unknown as DrawContext, 1000, 800, cfg)
    expect(ctx.calls.fillText?.length).toBe(1)
    expect(ctx.calls.fillText?.[0]?.[0]).toBe('TOP SECRET')
    expect(ctx.calls.save?.length).toBeGreaterThan(0)
    expect(ctx.globalAlpha).toBe(0.4)
  })

  it('image mode draws the bitmap once per placement', () => {
    const ctx = mockCtx()
    const image = { width: 100, height: 40 } as ImageBitmap
    const cfg = { ...defaultWatermarkConfig, enabled: true, type: 'image', positionMode: 'single' }
    drawWatermark(ctx as unknown as DrawContext, 1000, 800, cfg, image)
    expect(ctx.calls.drawImage?.length).toBe(1)
  })
})
