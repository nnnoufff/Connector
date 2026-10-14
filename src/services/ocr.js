// Reads text from a photo, entirely in the browser (Tesseract.js, Apache-2.0): the image is never uploaded.
// English and Arabic data ship with the app (works offline at the expo); other languages load from a CDN on demand.
const BASE = import.meta.env.BASE_URL
const MAX_SIDE = 2000 // phone photos are huge; this keeps reading fast without hurting accuracy

const TESS = {
  en: 'eng', ar: 'ara', fr: 'fra', es: 'spa', de: 'deu', it: 'ita', pt: 'por', ru: 'rus', tr: 'tur', fa: 'fas', ur: 'urd',
  hi: 'hin', bn: 'ben', id: 'ind', ms: 'msa', tl: 'fil', th: 'tha', vi: 'vie', ja: 'jpn', ko: 'kor', 'zh-CN': 'chi_sim',
  nl: 'nld', sv: 'swe', pl: 'pol', uk: 'ukr', he: 'heb', sw: 'swa',
}

async function toCanvas(file) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const k = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * k)
  c.height = Math.round(bmp.height * k)
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height)
  bmp.close?.()
  return c
}

/** Returns the text found in the image. `from` is a language code or 'auto' (English + Arabic). */
export async function readTextFromImage(file, from = 'auto', onProgress) {
  const { createWorker } = await import('tesseract.js')
  const code = TESS[from]
  const local = from === 'auto' || from === 'en' || from === 'ar'
  const langs = from === 'auto' ? 'eng+ara' : code || 'eng'
  const worker = await createWorker(langs, 1, {
    workerPath: `${BASE}runtime/tesseract/worker.min.js`,
    corePath: `${BASE}runtime/tesseract/`,
    langPath: local ? `${BASE}tessdata` : `https://cdn.jsdelivr.net/npm/@tesseract.js-data/${(code || 'eng').replace('_', '-')}/4.0.0_best_int`,
    logger: (m) => { if (m.status === 'recognizing text') onProgress?.(Math.round(m.progress * 100)) },
  })
  try {
    const canvas = await toCanvas(file)
    const { data } = await worker.recognize(canvas)
    return (data.text || '').replace(/[\u200e\u200f]/g, '').replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim()
  } finally {
    await worker.terminate()
  }
}
