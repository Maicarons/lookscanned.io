import { describe, it, expect } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { buildPDF } from './build-pdf'
import { buildPDFMetadata, defaultMetadataConfig } from '@/utils/pdf-metadata/metadata'

// 1x1 transparent PNG
const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

function makePngBlob(): Blob {
  const bytes = Uint8Array.from(atob(PNG_BASE64), (c) => c.charCodeAt(0))
  return new Blob([bytes], { type: 'image/png' })
}

describe('buildPDF', () => {
  it('embeds pages and reports the correct page count', async () => {
    const pdf = await buildPDF([{ blob: makePngBlob(), width: 100, height: 100, ppi: 72 }])
    const reloaded = await PDFDocument.load(await pdf.arrayBuffer())
    expect(reloaded.getPageCount()).toBe(1)
  })

  it('does not set our scanner-spoof metadata when none is provided', async () => {
    const pdf = await buildPDF([{ blob: makePngBlob(), width: 100, height: 100, ppi: 72 }])
    const reloaded = await PDFDocument.load(await pdf.arrayBuffer())
    expect(reloaded.getTitle()).toBeUndefined()
    // The previously hardcoded scanner values must no longer be written when
    // the user leaves metadata blank.
    expect(reloaded.getCreator()).not.toBe('TOSHIBA e-STUDIO2010AC')
    expect(reloaded.getProducer()).not.toBe('SECnvtToPDF V1.0')
  })

  it('round-trips user supplied metadata and keeps scanner defaults', async () => {
    const metadata = buildPDFMetadata({
      ...defaultMetadataConfig,
      title: 'Quarterly Report',
      author: 'Acme Inc',
      keywords: 'finance, 2026'
    })
    const pdf = await buildPDF(
      [{ blob: makePngBlob(), width: 100, height: 100, ppi: 72 }],
      metadata
    )
    const reloaded = await PDFDocument.load(await pdf.arrayBuffer())
    expect(reloaded.getTitle()).toBe('Quarterly Report')
    expect(reloaded.getAuthor()).toBe('Acme Inc')
    expect(reloaded.getKeywords()).toContain('finance')
    expect(reloaded.getKeywords()).toContain('2026')
    // default scanner spoof creator is carried over (pdf-lib overwrites
    // Producer on save, so we only assert Creator here)
    expect(reloaded.getCreator()).toBe('TOSHIBA e-STUDIO2010AC')
  })

  it('supports multi-page documents', async () => {
    const pdf = await buildPDF([
      { blob: makePngBlob(), width: 100, height: 100, ppi: 72 },
      { blob: makePngBlob(), width: 200, height: 100, ppi: 72 }
    ])
    const reloaded = await PDFDocument.load(await pdf.arrayBuffer())
    expect(reloaded.getPageCount()).toBe(2)
  })
})
