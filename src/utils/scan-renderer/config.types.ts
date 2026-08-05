import type { PaperConfig } from '../paper/paper'
import type { WatermarkConfig } from '../watermark/watermark'
import type { StampConfig } from '../stamp/stamp'
import type { MetadataConfig } from '../pdf-metadata/metadata'

export const colorspaces = ['gray', 'sRGB'] as const

export interface ScanConfig {
  rotate: number
  rotate_var: number
  colorspace: (typeof colorspaces)[number]
  blur: number
  noise: number
  border: boolean
  scale: number
  brightness: number
  yellowish: number
  contrast: number
  output_format: 'image/png' | 'image/jpeg'
  // --- Features present in the commercial edition but previously missing ---
  paper: PaperConfig
  watermark: WatermarkConfig
  stamp: StampConfig
  metadata: MetadataConfig
}
