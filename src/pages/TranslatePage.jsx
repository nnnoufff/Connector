import { useEffect, useRef, useState } from 'react'
import PageHeading from '../components/PageHeading.jsx'
import Icon from '../components/Icons.jsx'
import { LANGS, looksArabic, translate, engineLabel } from '../services/translation/translate.js'
import { speakText } from '../services/voice.js'
import { readTextFromImage } from '../services/ocr.js'
import Suggestions from '../components/Suggestions.jsx'
import useDictation from '../components/useDictation.js'
import { SUGGESTIONS } from '../services/suggestions.js'
import { copyText } from '../services/clipboard.js'

const RTL = ['ar', 'ur', 'fa', 'he']
const MAX = 1000

function TranslatePage({ messages, language }) {
  const [text, setText] = useState('')
  const [from, setFrom] = useState('auto')
  const [to, setTo] = useState(() => (language === 'ar' ? 'en' : 'ar'))
  const [out, setOut] = useState('')
  const [err, setErr] = useState(false)
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState(false)
  const [photo, setPhoto] = useState(null) // { url, progress, busy }
  const fileRef = useRef(null)

  useEffect(() => {
    if (!text.trim()) { setOut(''); setErr(false); return }
    let live = true
    const id = setTimeout(() => {
      translate(text, from, to).then((r) => { if (live) { setOut(r); setErr(false) } }).catch(() => live && setErr(true))
    }, 500)
    return () => { live = false; clearTimeout(id) }
  }, [text, from, to])

  const { listening, toggle: toggleMic } = useDictation({
    getLang: () => (from === 'auto' ? (document.documentElement.lang === 'ar' ? 'ar' : 'en') : from),
    onText: (t) => setText((p) => (p ? `${p} ${t}` : t)),
    setNote,
    unsupportedText: messages.micUnsupported,
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
      if (found) setText(found.slice(0, MAX))
      else setNote(messages.photoNone)
    } catch {
      setNote(messages.photoFail)
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
  const copy = async () => { if (await copyText(out)) { setCopied(true); setTimeout(() => setCopied(false), 1500) } }

  return (
    <div className="page">
      <PageHeading title={messages.translateTitle} description={messages.translateDescription} />
      <div className="lang-bar">
        <span className="select-wrap grow">
          <select aria-label={messages.from} value={from} onChange={(e) => setFrom(e.target.value)}>
            <option value="auto">{messages.autoDetect}</option>
            {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </span>
        <button type="button" className="round-btn" onClick={swap} aria-label={messages.swap} title={messages.swap}><Icon name="swap" size={20} /></button>
        <span className="select-wrap grow">
          <select aria-label={messages.to} value={to} onChange={(e) => setTo(e.target.value)}>
            {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </span>
      </div>
      <div className="split">
        <section className="card">
          <div className="card-head"><h2>{messages.sourceText}</h2><span className="count">{text.length}/{MAX}</span></div>
          {photo && (
            <div className="photo-strip">
              <img src={photo.url} alt="" />
              <div className="photo-info">
                {photo.busy ? <><b>{messages.photoReading}</b><span className="bar"><i style={{ inlineSize: `${Math.max(6, photo.progress)}%` }} /></span></> : <small>{messages.photoNote}</small>}
              </div>
              <button type="button" className="field-btn" aria-label={messages.photoRemove} onClick={removePhoto}><Icon name="x" size={16} /></button>
            </div>
          )}
          <textarea className="field" aria-label={messages.sourceText} dir="auto" maxLength={MAX} value={text} placeholder={messages.typeHere} onChange={(e) => setText(e.target.value)} />
          <div className="btn-row">
            <button type="button" className={`btn${listening ? ' rec' : ''}`} onClick={toggleMic}><Icon name={listening ? 'stop' : 'mic'} size={17} />{listening ? messages.stop : messages.speakBtn}</button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
            <button type="button" className="btn" disabled={photo?.busy} onClick={() => fileRef.current?.click()}><Icon name="camera" size={17} />{messages.photoBtn}</button>
            <button type="button" className="btn" disabled={!text} onClick={() => { setText(''); setOut(''); setNote(''); removePhoto() }}><Icon name="trash" size={17} />{messages.clear}</button>
          </div>
        </section>
        <section className="card">
          <div className="card-head"><h2>{messages.translatedText}</h2><span className="chip">{engineLabel()}</span></div>
          <div className="output grow" dir={RTL.includes(to) ? 'rtl' : 'ltr'}>
            {err ? <p className="output-text">{messages.translationDown}</p> : out ? <p className="output-text">{out}</p> : <div className="empty"><span>{messages.translateEmpty}</span></div>}
          </div>
          <div className="btn-row">
            <button type="button" className="btn" disabled={!out} onClick={copy}><Icon name="copy" size={17} />{copied ? messages.copied : messages.copy}</button>
            <button type="button" className="btn primary" disabled={!out} onClick={speak}><Icon name="speaker" size={18} />{messages.readAloud}</button>
          </div>
          {note && <p className="note" role="status">{note}</p>}
        </section>
      </div>
      <Suggestions items={SUGGESTIONS} language={language} title={messages.suggested} onPick={setText} />
    </div>
  )
}

export default TranslatePage
