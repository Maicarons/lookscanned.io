import { fileOpen } from 'browser-fs-access'

/** Read a Blob/File as a base64 data URL. */
export function readFileAsDataURL(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/** Open the native file picker for an image and return it as a data URL. */
export async function pickImageDataUrl(): Promise<string | undefined> {
  const file = await fileOpen({
    description: 'Images',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    extensions: ['.png', '.jpg', '.jpeg', '.webp', '.gif']
  })
  return await readFileAsDataURL(file)
}
