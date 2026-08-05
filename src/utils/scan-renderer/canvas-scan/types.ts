import type { ScanConfig } from '../config.types'
import { defaultPaperConfig } from '../../paper/paper'
import { defaultWatermarkConfig } from '../../watermark/watermark'
import { defaultStampConfig } from '../../stamp/stamp'
import { defaultMetadataConfig } from '../../pdf-metadata/metadata'

export type { ScanConfig }
export { colorspaces } from '../config.types'

export const defaultConfig: ScanConfig = {
  rotate: 1,
  rotate_var: 0.5,
  colorspace: 'gray',
  blur: 0.3,
  noise: 0.1,
  border: false,
  scale: 2,
  brightness: 1,
  yellowish: 0,
  contrast: 1,
  output_format: 'image/jpeg',
  paper: defaultPaperConfig,
  watermark: defaultWatermarkConfig,
  stamp: defaultStampConfig,
  metadata: defaultMetadataConfig
}
