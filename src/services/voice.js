// Voice helpers on top of the browser's Web Speech API (no extra service needed).

const AR = () => typeof document !== 'undefined' && document.documentElement.lang === 'ar'
const T = (en, ar) => (AR() ? ar : en)

export const speakSupported = () => 'speechSynthesis' in window

const getRec = () => (typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null)
export const micSupported = () => !!getRec()

/** Starts listening in any language code from LANGS; returns a stop function. */
export function startListening(code, { onText, onInterim, onEnd, onError }) {
  const Rec = getRec()
  if (!Rec) { onError?.('unsupported'); onEnd?.(); return () => {} }
  const rec = new Rec()
  rec.lang = BCP[code] || code
  rec.continuous = false
  rec.interimResults = true
  rec.onresult = (e) => {
    let interim = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i]
      if (r.isFinal) onText?.(r[0].transcript.trim())
      else interim += r[0].transcript
    }
    if (interim) onInterim?.(interim.trim())
  }
  rec.onerror = (e) => onError?.(e.error || 'error')
  rec.onend = () => onEnd?.()
  try { rec.start() } catch { onError?.('error'); onEnd?.(); return () => {} }
  return () => { try { rec.stop() } catch { /* already stopped */ } }
}

export const BCP = { en: 'en-US', ar: 'ar-SA', fr: 'fr-FR', es: 'es-ES', de: 'de-DE', it: 'it-IT', pt: 'pt-BR', ru: 'ru-RU', tr: 'tr-TR', fa: 'fa-IR', ur: 'ur-PK', hi: 'hi-IN', bn: 'bn-BD', id: 'id-ID', ms: 'ms-MY', tl: 'fil-PH', th: 'th-TH', vi: 'vi-VN', ja: 'ja-JP', ko: 'ko-KR', 'zh-CN': 'zh-CN', nl: 'nl-NL', sv: 'sv-SE', pl: 'pl-PL', uk: 'uk-UA', he: 'he-IL', sw: 'sw-KE' }

function loadVoices() {
  return new Promise((resolve) => {
    const have = speechSynthesis.getVoices()
    if (have.length) return resolve(have)
    const done = () => resolve(speechSynthesis.getVoices())
    speechSynthesis.addEventListener('voiceschanged', done, { once: true })
    setTimeout(done, 1500)
  })
}

/** Speaks text. Resolves to { ok: true } or { ok: false, reason } so the page can tell the person why. */
export async function speakText(text, code) {
  if (!speakSupported()) return { ok: false, reason: T('This browser has no text-to-speech.', 'هذا المتصفح لا يدعم القراءة الصوتية.') }
  if (!text?.trim()) return { ok: false, reason: T('Nothing to read yet.', 'لا يوجد نص للقراءة بعد.') }
  const voices = await loadVoices()
  const tag = BCP[code] || code
  const voice = voices.find((v) => v.lang.toLowerCase().replace('_', '-') === tag.toLowerCase()) || voices.find((v) => v.lang.toLowerCase().startsWith(tag.slice(0, 2).toLowerCase()))
  if (!voice) return { ok: false, reason: T(`This device has no ${tag} voice, so it cannot read this language aloud. Try another language, or add the voice in the device's speech settings.`, `لا يوجد على هذا الجهاز صوت للغة (${tag}) فلا يمكنه قراءتها. جرّب لغة أخرى، أو أضف الصوت من إعدادات الكلام في الجهاز.`) }
  const busy = speechSynthesis.speaking || speechSynthesis.pending
  if (busy) speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = voice.lang
  u.voice = voice
  u.volume = 1
  return new Promise((resolve) => {
    let started = false
    u.onstart = () => { started = true }
    u.onend = () => resolve({ ok: true })
    u.onerror = (e) => resolve(e.error === 'canceled' || e.error === 'interrupted' ? { ok: true } : { ok: false, reason: T(`Voice error: ${e.error || 'unknown'}`, `خطأ في الصوت: ${e.error || 'غير معروف'}`) })
    // Chrome drops speech queued right after cancel(), so wait only when something was playing.
    // When idle, speak at once: iOS Safari only allows speech started right after a tap.
    if (busy) setTimeout(() => speechSynthesis.speak(u), 60)
    else speechSynthesis.speak(u)
    setTimeout(() => { if (!started && !speechSynthesis.speaking) resolve({ ok: false, reason: T('The browser did not play any sound. Check the volume and that this tab is not muted.', 'لم يصدر المتصفح أي صوت. تأكد من مستوى الصوت ومن أن التبويب غير مكتوم.') }) }, 2500)
  })
}

export const micErrorText = (code) =>
  ({
    'not-allowed': T('Microphone is blocked. Allow the microphone in the browser settings (the lock icon in the address bar).', 'الميكروفون محظور. اسمح باستخدامه من إعدادات المتصفح (أيقونة القفل في شريط العنوان).'),
    'service-not-allowed': T('Microphone is blocked. Allow the microphone in the browser settings (the lock icon in the address bar).', 'الميكروفون محظور. اسمح باستخدامه من إعدادات المتصفح (أيقونة القفل في شريط العنوان).'),
    'no-speech': T('No speech heard. Try again closer to the microphone.', 'لم يُسمع كلام. حاول مرة أخرى وأنت أقرب للميكروفون.'),
    'audio-capture': T('No microphone found.', 'لم يتم العثور على ميكروفون.'),
    network: T('Speech recognition needs an internet connection.', 'التعرف على الكلام يحتاج اتصالًا بالإنترنت.'),
    unsupported: T('Speech recognition works in Chrome, Edge or Safari.', 'التعرف على الكلام يعمل في Chrome أو Edge أو Safari.'),
  })[code] || T(`Microphone error: ${code}`, `خطأ في الميكروفون: ${code}`)
