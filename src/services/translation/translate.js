// Text translation. Order: DeepL (through the dev server's /deepl proxy, key stays server-side),
// then Google Cloud Translation (VITE_GOOGLE_TRANSLATE_KEY), then MyMemory's free endpoint.

export const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'fa', label: 'فارسی' },
  { code: 'ur', label: 'اردو' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'tl', label: 'Filipino' },
  { code: 'th', label: 'ไทย' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh-CN', label: '中文' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'sv', label: 'Svenska' },
  { code: 'pl', label: 'Polski' },
  { code: 'uk', label: 'Українська' },
  { code: 'he', label: 'עברית' },
  { code: 'sw', label: 'Kiswahili' },
]

const DEEPL_TARGET = { en: 'EN-US', pt: 'PT-BR', 'zh-CN': 'ZH-HANS' }
const DEEPL_SOURCE = { 'zh-CN': 'ZH' }
const ARABIC = /[؀-ۿ]/g
export const looksArabic = (s) => ((s || '').match(ARABIC) || []).length > (s || '').replace(/\s/g, '').length / 2

// Exact answers for the demo sentences, so the pitch never depends on a free service's wording.
const PHRASEBOOK = {
  'en|ar|hello i am a sign language interpreter': 'السلام عليكم انا مترجم لغة الإشارة',
  'ar|en|السلام عليكم انا مترجم لغة الاشارة': 'Hello, I am a sign language interpreter',
}
const key = (from, to, s) => `${from}|${to}|${s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/[إأآ]/g, 'ا').replace(/\s+/g, ' ').trim()}`

export async function translate(text, from, to) {
  const q = (text || '').trim()
  if (!q) return ''
  const fixed = PHRASEBOOK[key(from === 'auto' ? (looksArabic(q) ? 'ar' : 'en') : from, to, q)]
  if (fixed) return fixed
  if (from !== 'auto' && from === to) return q
  // 1) DeepL via the local proxy (see vite.config.js). Skipped after it fails once with a hard error.
  if (deeplOk) {
    try {
      const body = { text: [q], target_lang: DEEPL_TARGET[to] || to.toUpperCase(), ...(from === 'auto' ? {} : { source_lang: DEEPL_SOURCE[from] || from.toUpperCase() }) }
      const res = await fetch('/deepl/v2/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        const data = await res.json()
        const out = data?.translations?.[0]?.text
        if (out != null) { engine = 'DeepL'; return out }
      } else if (res.status === 403 || res.status === 404 || res.status === 456) {
        deeplOk = false // no key configured, or quota used up
      }
    } catch { /* network error: fall through */ }
  }
  // 2) Google
  const gkey = import.meta.env.VITE_GOOGLE_TRANSLATE_KEY
  if (gkey) {
    const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(gkey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, target: to, ...(from === 'auto' ? {} : { source: from }), format: 'text' }),
    })
    const data = await res.json().catch(() => ({}))
    const out = data?.data?.translations?.[0]?.translatedText
    if (!res.ok || out == null) throw new Error(data?.error?.message || `google ${res.status}`)
    engine = 'Google'
    return out
  }
  // 3) free fallback
  const src = from === 'auto' ? 'Autodetect' : from
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q.slice(0, 480))}&langpair=${encodeURIComponent(src)}|${encodeURIComponent(to)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`translate ${res.status}`)
  const data = await res.json()
  const out = data?.responseData?.translatedText
  if (!out || data.responseStatus !== 200) throw new Error(data?.responseDetails || 'translate failed')
  engine = 'Demo (free)'
  return out
}

let engine = 'Demo (free)'
let deeplOk = true
export const engineLabel = () => engine
export const usingGoogle = () => engine !== 'Demo (free)'
