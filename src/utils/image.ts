/**
 * Читает выбранную картинку, обрезает по центру до квадрата и сжимает до JPEG size×size.
 * Результат — маленькая data-URL строка (≈10–25 КБ), её безопасно хранить в localStorage.
 */
export function imageToAvatar(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Выберите файл-картинку'))
    if (file.size > 15 * 1024 * 1024) return reject(new Error('Файл слишком большой (максимум 15 МБ)'))
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.width, img.height)
      const sx = (img.width - side) / 2
      const sy = (img.height - side) / 2
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        return reject(new Error('Не удалось обработать картинку'))
      }
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Не удалось открыть картинку'))
    }
    img.src = url
  })
}
