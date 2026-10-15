import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import SignLangSwitch from '../components/SignLangSwitch.jsx'
import Icon from '../components/Icons.jsx'
import SliPlayer from '../components/SliPlayer.jsx'
import LangSheet from '../components/LangSheet.jsx'
import { LANGS, looksArabic, translate, engineLabel } from '../services/translation/translate.js'
import Suggestions from '../components/Suggestions.jsx'
import useDictation from '../components/useDictation.js'
import { speakText } from '../services/voice.js'
import { readTextFromImage } from '../services/ocr.js'
import { SUGGESTIONS } from '../services/suggestions.js'
import { useApp } from '../state/AppContext.jsx'

const EnglishAvatar = lazy(() => import('../components/EnglishAvatar.jsx'))

const MAX = 500
const isEnglish = (s) => [...s.trim()].every((c) => c.charCodeAt(0) < 128)
// Persian / Urdu use the Arabic script, so "looks Arabic" is not enough to skip the translation.
const PERSIAN_URDU = /[پچژگکیٹڈڑںےھۂۃ]/
// Text in any language is sent to the translator (it detects the language itself). Only text that is clearly
// Arabic is kept as it is when the sign language is Arabic.
const clearlyArabic = (text) => looksArabic(text) && !PERSIAN_URDU.test(text)

export default function TextToSignPage() {
  const { messages: m, signLang, setSignLang, settings, addHistory, buzz, language } = useApp()
  const pre = useLocation().state // opened from History or Saved: { text }
  const [text, setText] = useState(pre?.text || '')
  const [from, setFrom] = useState(pre?.from || 'auto') // 'auto' = detect the language, or pick the language the text is written in
  const [langOpen, setLangOpen] = useState(false)
  const fromItems = useMemo(() => [{ code: 'auto', label: m.autoDetect }, ...LANGS], [m.autoDetect])
  const fromLabel = from === 'auto' ? m.autoDetect : LANGS.find((l) => l.code === from)?.label || from
  const [translated, setTranslated] = useState('')
  const [err, setErr] = useState(false)
  const [arText, setArText] = useState('')
  const [runKey, setRunKey] = useState(0)
  const [enText, setEnText] = useState('')
  const [, setAvatarInfo] = useState(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState(null) // { url, progress, busy }
  const [interim, setInterim] = useState('')
  const fileRef = useRef(null)
  const target = signLang // text is always translated into the sign language's own language

  useEffect(() => { setEnText(''); setAvatarInfo(null); setNote(''); setArText('') }, [signLang])

  const toTarget = async (value) => {
    if (from !== 'auto' && from === target) return value
    if (from === 'auto' && target === 'ar' && clearlyArabic(value)) return value
    try {
      return await translate(value, from, target)
    } catch (e) {
      if (target === 'en' && isEnglish(value)) return value // the free translator refuses English -> English
      throw e
    }
  }

  // The translation line updates live while typing.
  useEffect(() => {
    if (!text.trim()) { setTranslated(''); setErr(false); return undefined }
    let live = true
    const id = setTimeout(() => {
      toTarget(text).then((r) => { if (live) { setTranslated(r); setErr(false) } }).catch(() => live && setErr(true))
    }, 500)
    return () => { live = false; clearTimeout(id) }
  }, [text, from, target]) // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (override) => {
    const value = typeof override === 'string' ? override : text
    if (!value.trim()) return
    setBusy(true)
    setNote('')
    try {
      const t = await toTarget(value)
      setTranslated(t)
      if (signLang === 'ar') { setArText(t); setRunKey((k) => k + 1) } else { setAvatarInfo(null); setEnText(t); setRunKey((k) => k + 1) }
      addHistory({ kind: 'text-sign', from: looksArabic(value) ? 'ar' : 'en', to: signLang, source: value.trim(), result: t })
      buzz()
    } catch {
      setErr(true)
      setNote(m.translationDown)
    } finally {
      setBusy(false)
    }
  }

  const { listening, toggle: toggleMic } = useDictation({
    getLang: () => (from === 'auto' ? (language === 'ar' ? 'ar' : 'en') : from),
    onInterim: (t) => { setInterim(t); setText(t) },
    onText: (t) => { setInterim(''); setText(t); run(t) },
    setNote,
    unsupportedText: m.micUnsupported,
  })

  const onPhoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setNote('')
    if (photo?.url) URL.revokeObjectURL(photo.url)
    setPhoto({ url: URL.createObjectURL(file), progress: 0, busy: true })
    try {
      const found = await readTextFromImage(file, from, (progress) => setPhoto((p) => (p ? { ...p, progress } : p)))
      if (found) { const v = found.slice(0, MAX); setText(v); run(v) } else setNote(m.photoNone)
    } catch {
      setNote(m.photoFail)
    } finally {
      setPhoto((p) => (p ? { ...p, busy: false } : p))
    }
  }
  const removePhoto = () => { if (photo?.url) URL.revokeObjectURL(photo.url); setPhoto(null) }
  const clearAll = () => { setText(''); setNote(''); setEnText(''); setArText(''); setInterim(''); removePhoto() }
  const pick = (v) => { setText(v); run(v) }
  const same = !!text.trim() && !err && !!translated && translated.trim() === text.trim()
  const shown = signLang === 'ar' ? arText : enText

  return (
    <div className="page cols-page">
      <h1 className="sr-only">{m.textToSignTitle}</h1>
      <div className="page-bar"><SignLangSwitch value={signLang} onChange={setSignLang} messages={m} /></div>
      <div className="cols">
        <div className="stack">
          <section className="card src">
            <div className="card-top">
              <button type="button" className="lang-btn slim" onClick={() => setLangOpen(true)} aria-haspopup="dialog" aria-label={m.writtenIn}><Icon name="globe" size={16} /><span dir="auto">{m.writtenIn}: {fromLabel}</span><Icon name="chevronDown" size={15} /></button>
              <span className="count">{listening ? m.listening : `${text.length}/${MAX}`}</span>
            </div>
            {photo && (
              <div className="photo-strip">
                <img src={photo.url} alt="" />
                <div className="photo-info">
                  {photo.busy ? <><b>{m.photoReading}</b><span className="bar"><i style={{ inlineSize: `${Math.max(6, photo.progress)}%` }} /></span></> : <small>{m.photoNote}</small>}
                </div>
                <button type="button" className="field-btn" aria-label={m.photoRemove} onClick={removePhoto}><Icon name="x" size={16} /></button>
              </div>
            )}
            <textarea className="field" aria-label={m.tabType} dir="auto" maxLength={MAX} value={text} placeholder={m.typeHere} onChange={(e) => { setInterim(''); setText(e.target.value) }} />
            <div className="tools">
              <button type="button" className="tool icon" disabled={!text.trim()} aria-label={m.readAloud} title={m.readAloud} onClick={() => speakText(text, from === 'auto' ? (looksArabic(text) ? 'ar' : 'en') : from).then((r) => setNote(r.ok ? '' : r.reason))}><Icon name="speaker" size={19} /></button>
              <button type="button" className={`tool${listening ? ' rec' : ''}`} aria-pressed={listening} onClick={toggleMic}><Icon name={listening ? 'stop' : 'mic'} size={17} /><span>{listening ? m.stop : m.tabSpeak}</span></button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
              <button type="button" className="tool" disabled={photo?.busy} onClick={() => fileRef.current?.click()}><Icon name="camera" size={17} /><span>{m.photoBtn}</span></button>
              <button type="button" className="tool" disabled={!text} onClick={clearAll}><Icon name="trash" size={17} /><span>{m.clear}</span></button>
            </div>
            {interim && <p className="interim" dir="auto">{interim}…</p>}
            <div className="trans-line">
              <div className="card-top"><span className="eyebrow">{m.translatedTo}</span><span className="chip soft">{signLang === 'ar' ? m.toArabicTag : m.toEnglishTag}</span></div>
              <p className="trans-text" dir={signLang === 'ar' ? 'rtl' : 'ltr'}>{err ? m.translationDown : translated || '…'}</p>
              <div className="tools">
                <button type="button" className="tool icon" disabled={!translated && !err} aria-label={m.readAloud} title={m.readAloud} onClick={() => speakText(translated, target).then((r) => setNote(r.ok ? '' : r.reason))}><Icon name="speaker" size={19} /></button>
                <small className="engine">{same ? m.alreadyTarget : engineLabel()}</small>
              </div>
            </div>
            <button type="button" className="btn primary wide" disabled={busy || !text.trim()} onClick={() => run()}>
              <Icon name="hand" size={18} />{busy ? m.working : m.signIt}
            </button>
            {note && <p className="note" role="status">{note}</p>}
          </section>
          <Suggestions items={SUGGESTIONS} language={signLang} title={m.suggested} onPick={pick} />
        </div>

        <section className="card sign-card">
          <div className="card-top"><span className="eyebrow"><Icon name="hand" size={15} />{m.signDisplay}</span><span className="chip soft">{signLang === 'ar' ? m.arSignTag : m.enSignTag}</span></div>
          <div className="sign-body">
            {signLang === 'en' ? (
              <Suspense fallback={<p className="sub">…</p>}>
                <EnglishAvatar text={enText} runKey={runKey} onInfo={setAvatarInfo} />
              </Suspense>
            ) : (
              <SliPlayer text={arText} runKey={runKey} />
            )}
          </div>
          {shown && settings.captions && <p className="sign-caption" dir={signLang === 'ar' ? 'rtl' : 'ltr'}>{shown}</p>}
          {shown && (
            <div className="tools center"><button type="button" className="tool" onClick={() => setRunKey((k) => k + 1)}><Icon name="replay" size={17} /><span>{m.replay}</span></button></div>
          )}
        </section>
      </div>
      <LangSheet open={langOpen} onClose={() => setLangOpen(false)} title={m.chooseLanguage} searchLabel={m.searchLanguages} emptyText={m.noResults} items={fromItems} value={from} onPick={setFrom} />
    </div>
  )
}
