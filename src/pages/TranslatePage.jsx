import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Icon from '../components/Icons.jsx'
import LangBar from '../components/LangBar.jsx'
import ShowScreen from '../components/ShowScreen.jsx'
import Suggestions from '../components/Suggestions.jsx'
import useDictation from '../components/useDictation.js'
import { LANGS, looksArabic, translate, engineLabel } from '../services/translation/translate.js'
import { speakText } from '../services/voice.js'
import { readTextFromImage } from '../services/ocr.js'
import { SUGGESTIONS } from '../services/suggestions.js'
import { copyText } from '../services/clipboard.js'
import { useApp } from '../state/AppContext.jsx'

const RTL = ['ar', 'ur', 'fa', 'he']
const MAX = 1000

export default function TranslatePage() {
  const { messages, language, addHistory, isSaved, toggleSaved, toast, buzz } = useApp()
  const pre = useLocation().state // opened again from History: { text, from, to }
  const [text, setText] = useState(pre?.text || '')
  const [from, setFrom] = useState(pre?.from || 'auto')
  const [to, setTo] = useState(() => pre?.to || (language === 'ar' ? 'en' : 'ar'))
  const [out, setOut] = useState('')
  const [err, setErr] = useState(false)
  const [note, setNote] = useState('')
  const [interim, setInterim] = useState('')
  const [viaVoice, setViaVoice] = useState(false)
  const [photo, setPhoto] = useState(null) // { url, progress, busy }
  const [showing, setShowing] = useState(false)
  const [online, setOnline] = useState(() => navigator.onLine !== false)
  const [retry, setRetry] = useState(0)
  const fileRef = useRef(null)
  const areaRef = useRef(null)
  const m = messages

  const fromItems = useMemo(() => [{ code: 'auto', label: m.autoDetect }, ...LANGS], [m.autoDetect])
  const label = (code) => (code === 'auto' ? (text && looksArabic(text) ? 'العربية' : m.autoDetect) : LANGS.find((l) => l.code === code)?.label || code)
  const srcCode = from === 'auto' ? (looksArabic(text) ? 'ar' : 'en') : from

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  // Live translation while typing / after dictation.
  useEffect(() => {
    if (!text.trim()) { setOut(''); setErr(false); return undefined }
    let live = true
    const id = setTimeout(() => {
      translate(text, from, to).then((r) => { if (live) { setOut(r); setErr(false); buzz() } }).catch(() => live && setErr(true))
    }, 500)
    return () => { live = false; clearTimeout(id) }
  }, [text, from, to, retry]) // eslint-disable-line react-hooks/exhaustive-deps

  // A finished translation is added to History once the person pauses (voice: right away).
  useEffect(() => {
    if (!out || text.trim().length < 2) return undefined
    const id = setTimeout(() => addHistory({ kind: 'spoken', from: srcCode, to, source: text.trim(), result: out, via: viaVoice ? 'voice' : 'typed' }), viaVoice ? 300 : 2500)
    return () => clearTimeout(id)
  }, [out]) // eslint-disable-line react-hooks/exhaustive-deps

  const { listening, toggle: toggleMic } = useDictation({
    getLang: () => (from === 'auto' ? (language === 'ar' ? 'ar' : 'en') : from),
    onInterim: (t) => setInterim(t),
    onText: (t) => { setInterim(''); setViaVoice(true); setText((p) => (p ? `${p} ${t}` : t)) },
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
      if (found) { setViaVoice(false); setText(found.slice(0, MAX)) } else setNote(m.photoNone)
    } catch {
      setNote(m.photoFail)
    } finally {
      setPhoto((p) => (p ? { ...p, busy: false } : p))
    }
  }
  const removePhoto = () => { if (photo?.url) URL.revokeObjectURL(photo.url); setPhoto(null) }

  const swap = () => {
    const src = from === 'auto' ? (looksArabic(text) ? 'ar' : 'en') : from
    setFrom(to); setTo(src); setText(out); setOut(text)
  }
  const speak = async () => { const r = await speakText(out, to); setNote(r.ok ? '' : r.reason) }
  const copy = async () => { if (await copyText(out)) toast(m.copiedToast) }
  const save = () => {
    const added = toggleSaved(out, to)
    toast(added ? m.savedToast : m.unsavedToast, added ? 'bookmark' : 'check')
  }
  const clearAll = () => { setText(''); setOut(''); setNote(''); setInterim(''); removePhoto(); areaRef.current?.focus() }
  const reply = () => { setShowing(false); swap() }

  const status = listening ? `${m.listeningIn.replace('{lang}', label(from))}` : viaVoice && text ? `${label(from)} · ${m.fromSpeech}` : text ? `${label(from)} · ${m.typed}` : label(from)
  const failed = err || !online

  return (
    <div className="page translate">
      <h1 className="sr-only">{m.translateTitle}</h1>
      <LangBar from={from} to={to} fromItems={fromItems} toItems={LANGS} onFrom={setFrom} onTo={setTo} onSwap={swap} />

      <div className="cols">
        <section className="card src">
          <div className="card-top"><span className="eyebrow">{status}</span><span className="count">{text.length}/{MAX}</span></div>
          {photo && (
            <div className="photo-strip">
              <img src={photo.url} alt="" />
              <div className="photo-info">
                {photo.busy ? <><b>{m.photoReading}</b><span className="bar"><i style={{ inlineSize: `${Math.max(6, photo.progress)}%` }} /></span></> : <small>{m.photoNote}</small>}
              </div>
              <button type="button" className="field-btn" aria-label={m.photoRemove} onClick={removePhoto}><Icon name="x" size={16} /></button>
            </div>
          )}
          <textarea ref={areaRef} className="field" aria-label={m.sourceText} dir="auto" maxLength={MAX} value={text} placeholder={m.typeHere} onChange={(e) => { setViaVoice(false); setText(e.target.value) }} />
          {listening && <div className="listen-row"><span className="wave live" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span>{interim && <p className="interim" dir="auto">{interim}…</p>}</div>}
          <div className="tools">
            <button type="button" className="tool icon" disabled={!text.trim()} aria-label={m.readAloud} title={m.readAloud} onClick={() => speakText(text, srcCode).then((r) => setNote(r.ok ? '' : r.reason))}><Icon name="speaker" size={19} /></button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
            <button type="button" className="tool" disabled={photo?.busy} onClick={() => fileRef.current?.click()}><Icon name="camera" size={17} /><span>{m.photoBtn}</span></button>
            <button type="button" className="tool" disabled={!text} onClick={clearAll}><Icon name="trash" size={17} /><span>{m.clear}</span></button>
          </div>
        </section>

        <section className={`card res${out && !failed ? ' blue' : ' outline'}`}>
          {failed ? (
            <div className="warn-card" role="alert">
              <Icon name="alert" size={20} />
              <div><b>{online ? m.translationDownTitle : m.offlineTitle}</b><p>{online ? m.translationDown : m.offlineText}</p></div>
              <button type="button" className="btn outline" onClick={() => { setErr(false); setRetry((r) => r + 1) }}><Icon name="replay" size={16} />{m.tryAgain}</button>
            </div>
          ) : out ? (
            <>
              <div className="card-top"><span className="eyebrow">{label(to)}</span><span className="chip soft">{engineLabel()}</span></div>
              <p className="result-text" dir={RTL.includes(to) ? 'rtl' : 'ltr'}>{out}</p>
              <div className="tools">
                <button type="button" className="tool icon" aria-label={m.readAloud} title={m.readAloud} onClick={speak}><Icon name="speaker" size={19} /></button>
                <button type="button" className="tool icon" aria-label={m.copy} title={m.copy} onClick={copy}><Icon name="copy" size={19} /></button>
                <button type="button" className={`tool icon${isSaved(out) ? ' on' : ''}`} aria-label={m.save} aria-pressed={isSaved(out)} title={m.save} onClick={save}><Icon name="bookmark" size={19} fill={isSaved(out)} /></button>
                <button type="button" className="tool primary" onClick={() => { setShowing(true); addHistory({ kind: 'spoken', from: srcCode, to, source: text.trim(), result: out }) }}><Icon name="monitor" size={17} /><span>{m.show}</span></button>
              </div>
            </>
          ) : (
            <div className="empty"><Icon name="translate" size={26} /><span>{m.translateEmpty}</span></div>
          )}
          {note && <p className="note" role="status">{note}</p>}
        </section>
      </div>

      <Suggestions items={SUGGESTIONS} language={language} title={m.suggested} onPick={(v) => { setViaVoice(false); setText(v) }} />

      <div className="mic-zone">
        <button type="button" className={`mic-btn${listening ? ' rec' : ''}`} disabled={!online && !listening} onClick={toggleMic} aria-label={listening ? m.stop : m.tapToSpeak}>
          <Icon name={listening ? 'stop' : 'mic'} size={26} />
        </button>
        <span className={`mic-label${listening ? ' rec' : ''}`}>{!online && !listening ? m.micOffline : listening ? m.tapToStop : (from === 'auto' ? m.tapToSpeak : m.tapToSpeakIn.replace('{lang}', label(from)))}</span>
      </div>

      {showing && <ShowScreen text={out} original={text} fromLabel={label(srcCode)} dir={RTL.includes(to) ? 'rtl' : 'ltr'} onClose={() => setShowing(false)} onSpeak={speak} onReply={reply} />}
    </div>
  )
}
