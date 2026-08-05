import { describe, it, expect } from 'vitest'
import { buildPDFMetadata, defaultMetadataConfig } from './metadata'

describe('buildPDFMetadata', () => {
  it('omits empty fields and keeps non-empty', () => {
    const meta = buildPDFMetadata({
      ...defaultMetadataConfig,
      title: 'My Doc',
      author: '  ',
      keywords: 'a,b,c'
    })
    expect(meta.title).toBe('My Doc')
    expect(meta.author).toBeUndefined()
    expect(meta.keywords).toBe('a,b,c')
    // creator/producer default values are non-empty
    expect(meta.creator).toBe('TOSHIBA e-STUDIO2010AC')
    expect(meta.producer).toBe('SECnvtToPDF V1.0')
  })

  it('trims whitespace', () => {
    const meta = buildPDFMetadata({ ...defaultMetadataConfig, subject: '  Hello  ' })
    expect(meta.subject).toBe('Hello')
  })

  it('returns empty object when everything blank', () => {
    const meta = buildPDFMetadata({
      title: '',
      author: '',
      subject: '',
      creator: '',
      producer: '',
      keywords: ''
    })
    expect(meta).toEqual({})
  })
})
