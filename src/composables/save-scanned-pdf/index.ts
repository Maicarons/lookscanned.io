import type { Ref } from 'vue'
import { get } from '@vueuse/core'
import { ref, computed, watch } from 'vue'
import { buildPDF } from '@/utils/pdf-builder/pdf-lib'
import type { ScanConfig } from '@/utils/scan-renderer'
import { computePaperLayout } from '@/utils/paper/paper'
import { shouldApplyStamp } from '@/utils/stamp/stamp'
import { buildPDFMetadata } from '@/utils/pdf-metadata/metadata'
import { compositePage } from '@/utils/composite/composite'

interface PDFRenderer {
  renderPage(
    page: number,
    scale: number
  ): Promise<{
    blob: Blob
    height: number
    width: number
    ppi: number
  }>
  getNumPages(): Promise<number>
}

interface ScanRenderer {
  renderPage(image: Blob): Promise<{
    blob: Blob
  }>
}

export function useSaveScannedPDF(
  pdf: Ref<File | undefined>,
  pdfRenderer: Ref<PDFRenderer | undefined>,
  scanRenderer: Ref<ScanRenderer | undefined>,
  scale: Ref<number>,
  config: Ref<ScanConfig>
) {
  const finishedPages = ref(0)
  const totalPages = ref(0)
  const progress = computed(() => {
    if (totalPages.value === 0) {
      return 0
    }
    return finishedPages.value / totalPages.value
  })

  const saving = ref(false)
  const scannedPDF = ref<File | undefined>(undefined)
  const outputFilename = computed(() => {
    const originalFilename = pdf.value?.name ?? 'doc.pdf'
    const filename = `${originalFilename.replace(/\.[^/.]+$/, '')}-scan.pdf`
    return filename
  })

  const reset = () => {
    finishedPages.value = 0
    totalPages.value = 0
    scannedPDF.value = undefined
    saving.value = false
  }

  watch(pdfRenderer, reset)
  watch(scanRenderer, reset)
  watch(scale, reset)

  const save = async () => {
    try {
      finishedPages.value = 0
      totalPages.value = 0
      saving.value = true

      const pdf = get(pdfRenderer)
      const scan = get(scanRenderer)
      const scale_ = get(scale)
      const cfg = get(config)

      if (!pdf || !scan) {
        throw new Error('No PDF or Scan Renderer')
      }

      const numPages = await pdf.getNumPages()

      totalPages.value = numPages

      // generate pdf pages 1...n
      const pages = Array.from({ length: numPages }, (_, i) => i + 1)
      const scanPages = await Promise.all(
        pages.map(async (page) => {
          const { blob: pdfPage, height, width } = await pdf.renderPage(page, scale_)
          const { blob: scanPage } = await scan.renderPage(pdfPage)

          const ppi = scale_ * 72
          const pageIndex = page - 1

          // Decide whether this page needs the post-processing composite
          // (paper margins / background, watermark and signature & stamp).
          const stampApplies = shouldApplyStamp(pageIndex, numPages, cfg.stamp)
          const needsComposite =
            cfg.paper.size !== 'auto' ||
            cfg.paper.margin > 0 ||
            cfg.watermark.enabled ||
            (cfg.stamp.enabled && stampApplies)

          let finalBlob = scanPage
          let finalWidth = width
          let finalHeight = height

          if (needsComposite) {
            finalBlob = await compositePage(
              scanPage,
              cfg.paper,
              cfg.watermark,
              cfg.stamp,
              pageIndex,
              numPages,
              ppi
            )
            const layout = computePaperLayout(width, height, ppi, cfg.paper)
            finalWidth = layout.pageWidth
            finalHeight = layout.pageHeight
          }

          finishedPages.value += 1
          return {
            blob: finalBlob,
            width: finalWidth,
            height: finalHeight,
            ppi
          }
        })
      )

      // generate pdf from scan pages
      const pdfDocument = await buildPDF(scanPages, buildPDFMetadata(cfg.metadata))

      scannedPDF.value = new File([pdfDocument], outputFilename.value, {
        type: 'application/pdf'
      })

      return pdfDocument
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      saving.value = false
    }
  }

  return { save, progress, saving, scannedPDF }
}
