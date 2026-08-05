import { describe, it, expect } from 'vitest'
import {
  shouldApplyStamp,
  computeStampPlacement,
  drawStamp,
  defaultStampConfig
} from './stamp'
import type { DrawContext } from '../watermark/watermark'

describe('shouldApplyStamp', () => {
  it('returns false when disabled', () => {
    expect(shouldApplyStamp(0, 5, { ...defaultStampConfig, enabled: false })).toBe(false)
  })
  it('applies to all pages', () => {
    expect(shouldApplyStamp(2, 5, { ...defaultStampConfig, enabled: true, pages: 'all' })).toBe(true)
  })
  it('first page only', () => {
    expect(shouldApplyStamp(0, 5, { ...defaultStampConfig, enabled: true, pages: 'first' })).toBe(true)
    expect(shouldApplyStamp(1, 5, { ...defaultStampConfig, enabled: true, pages: 'first' })).toBe(false)
  })
  it('last page only', () => {
    expect(shouldApplyStamp(4, 5, { ...defaultStampConfig, enabled: true, pages: 'last' })).toBe(true)
    expect(shouldApplyStamp(3, 5, { ...defaultStampConfig, enabled: true, pages: 'last' })).toBe(false)
  })
  it('custom pages by 1-based number', () => {
    const cfg = { ...defaultStampConfig, enabled: true, pages: 'custom', customPages: [1, 3, 5] }
    expect(shouldApplyStamp(0, 5, cfg)).toBe(true)
    expect(shouldApplyStamp(2, 5, cfg)).toBe(true)
    expect(shouldApplyStamp(4, 5, cfg)).toBe(true)
    expect(shouldApplyStamp(1, 5, cfg)).toBe(false)
  })
})

describe('computeStampPlacement', () => {
  it('centers the stamp at the relative anchor with size = min*frac', () => {
    const p = computeStampPlacement(1000, 800, {
      ...defaultStampConfig,
      x: 0.5,
      y: 0.5,
      size: 0.3,
      rotation: 10,
      opacity: 0.8
    })
    const base = Math.min(1000, 800) * 0.3
    expect(p.width).toBe(Math.round(base))
    expect(p.height).toBe(Math.round(base))
    expect(p.x).toBeCloseTo(500 - base / 2, 5)
    expect(p.y).toBeCloseTo(400 - base / 2, 5)
    expect(p.rotation).toBe(10)
    expect(p.opacity).toBe(0.8)
  })
})

describe('drawStamp', () => {
  it('draws the image centered and rotated', () => {
    const calls: Record<string, any[]> = {}
    const record = (n: string) => (...a: any[]) => {
      ;(calls[n] ??= []).push(a)
    }
    const ctx = {
      calls,
      save: record('save'),
      restore: record('restore'),
      translate: record('translate'),
      rotate: record('rotate'),
      drawImage: record('drawImage'),
      globalAlpha: 1
    }
    const image = { width: 120, height: 120 } as ImageBitmap
    const cfg = { ...defaultStampConfig, x: 0.5, y: 0.5, size: 0.2, rotation: 0, opacity: 1 }
    drawStamp(ctx as unknown as DrawContext, 1000, 800, image, cfg)
    expect(calls.drawImage?.length).toBe(1)
    expect(calls.translate?.length).toBe(1)
  })
})
