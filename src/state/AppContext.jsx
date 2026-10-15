import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getMessages } from '../i18n/translations.js'
import Icon from '../components/Icons.jsx'

// One place for the app's shared state: interface language, appearance & accessibility settings,
// history, saved phrases and toasts. Everything is kept on the device (localStorage) and never uploaded.
const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

const read = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v) } catch { return fallback }
}
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* private mode */ } }

const DEFAULTS = { theme: 'system', textSize: 100, contrast: false, captions: true, vibrate: true, saveHistory: true, onboarded: false }
const HISTORY_MAX = 200

export function AppProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try { const s = localStorage.getItem('ui-lang'); if (s === 'ar' || s === 'en') return s } catch { /* ignore */ }
    return (navigator.language || '').toLowerCase().startsWith('ar') ? 'ar' : 'en'
  })
  const [settings, setSettings] = useState(() => ({ ...DEFAULTS, ...read('connector-settings', {}) }))
  const [signLang, setSignLangState] = useState(() => read('connector-signlang', 'ar'))
  const [history, setHistory] = useState(() => read('connector-history', []))
  const [saved, setSaved] = useState(() => read('connector-saved', []))
  const [toastItem, setToastItem] = useState(null)
  const [systemDark, setSystemDark] = useState(() => !!window.matchMedia?.('(prefers-color-scheme: dark)').matches)
  const toastTimer = useRef(0)
  const messages = useMemo(() => getMessages(language), [language])

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return undefined
    const on = (e) => setSystemDark(e.matches)
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])

  const dark = settings.theme === 'dark' || (settings.theme === 'system' && systemDark)

  useEffect(() => {
    const el = document.documentElement
    el.lang = language
    el.dir = language === 'ar' ? 'rtl' : 'ltr'
    try { localStorage.setItem('ui-lang', language) } catch { /* ignore */ }
  }, [language])
  useEffect(() => {
    const el = document.documentElement
    el.dataset.theme = dark ? 'dark' : 'light'
    el.dataset.contrast = settings.contrast ? 'high' : 'normal'
    el.style.fontSize = `${settings.textSize}%`
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', dark ? '#100c17' : '#f6f3eb')
  }, [dark, settings.contrast, settings.textSize])
  useEffect(() => { write('connector-settings', settings) }, [settings])
  useEffect(() => { write('connector-signlang', signLang) }, [signLang])
  useEffect(() => { write('connector-history', history) }, [history])
  useEffect(() => { write('connector-saved', saved) }, [saved])

  const setSetting = useCallback((key, value) => setSettings((s) => ({ ...s, [key]: value })), [])
  const setLanguage = useCallback((l) => setLanguageState(l === 'ar' ? 'ar' : 'en'), [])
  const setSignLang = useCallback((l) => setSignLangState(l === 'en' ? 'en' : 'ar'), [])

  const toast = useCallback((text, icon = 'check') => {
    clearTimeout(toastTimer.current)
    setToastItem({ text, icon, id: Date.now() })
    toastTimer.current = setTimeout(() => setToastItem(null), 2400)
  }, [])

  const buzz = useCallback(() => {
    if (settings.vibrate) { try { navigator.vibrate?.(40) } catch { /* not supported */ } }
  }, [settings.vibrate])

  /** kind: 'spoken' (typed/voice translation), 'signed' (sign to text), 'text-sign', 'sign-sign' */
  const addHistory = useCallback((entry) => {
    if (!settings.saveHistory || !entry?.source?.trim()) return
    setHistory((h) => {
      const same = (x) => x.kind === entry.kind && x.source === entry.source && x.result === entry.result
      const rest = h.filter((x) => !same(x))
      return [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, t: Date.now(), ...entry }, ...rest].slice(0, HISTORY_MAX)
    })
  }, [settings.saveHistory])
  const clearHistory = useCallback(() => setHistory([]), [])
  const removeHistory = useCallback((id) => setHistory((h) => h.filter((x) => x.id !== id)), [])

  const isSaved = useCallback((text) => saved.some((x) => x.text === text), [saved])
  const toggleSaved = useCallback((text, lang) => {
    if (!text?.trim()) return false
    let added = false
    setSaved((s) => {
      if (s.some((x) => x.text === text)) return s.filter((x) => x.text !== text)
      added = true
      return [{ id: `${Date.now()}`, text, lang: lang || '', t: Date.now(), pinned: false }, ...s]
    })
    return added
  }, [])
  const togglePinned = useCallback((id) => setSaved((s) => s.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x))), [])
  const removeSaved = useCallback((id) => setSaved((s) => s.filter((x) => x.id !== id)), [])

  const value = {
    language, setLanguage, messages, settings, setSetting, dark, signLang, setSignLang,
    history, addHistory, clearHistory, removeHistory,
    saved, isSaved, toggleSaved, togglePinned, removeSaved,
    toast, buzz,
  }
  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toast-host" aria-live="polite" role="status">
        {toastItem && <div key={toastItem.id} className="toast"><Icon name={toastItem.icon} size={18} /><span>{toastItem.text}</span><button type="button" aria-label="Close" onClick={() => setToastItem(null)}><Icon name="x" size={15} /></button></div>}
      </div>
    </Ctx.Provider>
  )
}
