export interface MetadataConfig {
  title: string
  author: string
  subject: string
  creator: string
  producer: string
  keywords: string
}

export const defaultMetadataConfig: MetadataConfig = {
  title: '',
  author: '',
  subject: '',
  // Spoof the metadata to look like a real scanner, matching the original
  // hardcoded values so existing output stays identical by default.
  creator: 'TOSHIBA e-STUDIO2010AC',
  producer: 'SECnvtToPDF V1.0',
  keywords: ''
}

export interface PDFMetadata {
  title?: string
  author?: string
  subject?: string
  creator?: string
  producer?: string
  keywords?: string
}

/**
 * Build a pdf-lib compatible metadata object from the user provided config.
 * Empty / whitespace-only fields are omitted so the resulting PDF only carries
 * the metadata the user actually filled in.
 */
export function buildPDFMetadata(config: MetadataConfig): PDFMetadata {
  const metadata: PDFMetadata = {}
  if (config.title.trim()) metadata.title = config.title.trim()
  if (config.author.trim()) metadata.author = config.author.trim()
  if (config.subject.trim()) metadata.subject = config.subject.trim()
  if (config.creator.trim()) metadata.creator = config.creator.trim()
  if (config.producer.trim()) metadata.producer = config.producer.trim()
  if (config.keywords.trim()) metadata.keywords = config.keywords.trim()
  return metadata
}
