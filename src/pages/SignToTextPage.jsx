import { useEffect, useMemo, useRef, useState } from 'react'
import SignLangSwitch from '../components/SignLangSwitch.jsx'
import Icon from '../components/Icons.jsx'
import SliCapture from '../components/SliCapture.jsx'
import EnglishLetters from '../components/EnglishLetters.jsx'
import LangSheet from '../components/LangSheet.jsx'
import { LANGS, translate, engineLabel } from '../services/translation/translate.js'
import { speakText } from '../services/voice.js'
import { copyText } from '../services/clipboard.js'
import { useApp } from '../state/AppContext.jsx'

const RTL = ['ar', 'ur', 'fa', 'he']
const clock = (t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function SignToTextPage() {
  const { messages: m, signLang, setSignLang, addHistory, isSaved, toggleSaved, toast, buzz } = useApp()
  const [text, setText] = useState('')
  const [target, setTarget] = useState('en')
  const [out, setOut] = useState('')
  const [err, setErr] = useState(false)
  const [note, setNote] = useState('')
  const [pick, setPick] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [stamp, setStamp] = useState(0)
  const spoken = useRef('')
  const control = useRef(null)

  // Switching the sign language starts a clean session.
  useEffect(() => { setText(''); setOut(''); spoken.current = '' }, [signLang])
  useEffect(() => { if (text) setStamp((s) => s || Date.now()); else setStamp(0) }, [text])

  useEffect(() => {
    if (!text.trim()) { setOut(''); return undefined }
    let live = true
    const id = setTimeout(() => {
      translate(text, signLang === 'ar' ? 'ar' : 'en', target).then((r) => { if (live) { setOut(r); setErr(false) } }).catch(() => live && setErr(true))
    }, 600)
    return () => { live = false; clearTimeout(id) }
  }, [text, target, signLang])

  // History: once the recognized text has settled.
  useEffect(() => {
    if (text.trim().length < 2) return undefined
    const id = setTimeout(() => addHistory({ kind: 'signed', from: signLang, to: target, source: text.trim(), result: out }), 3500)
    return () => clearTimeout(id)
  }, [text, out]) // eslint-disable-line react-hooks/exhaustive-deps

  // "Speak aloud": read what was just recognized (only the new part).
  useEffect(() => {
    if (!autoSpeak || !text.trim()) { if (!text) spoken.current = ''; return undefined }
    const id = setTimeout(async () => {
      const prev = spoken.current
      const piece = prev && text.startsWith(prev) ? text.slice(prev.length).trim() : text
      spoken.current = text
      if (!piece) return
      const r = await speakText(piece, signLang)
      if (!r.ok) setNote(r.reason)
      buzz()
    }, 1400)
    return () => clearTimeout(id)
  }, [text, autoSpeak, signLang]) // eslint-disable-line react-hooks/exhaustive-deps

  const clearAll = () => { control.current?.clear(); setText(''); setOut(''); spoken.current = '' }
  const copy = async (value) => { if (await copyText(value)) toast(m.copiedToast) }
  const say = async (value, code) => { const r = await speakText(value, code); setNote(r.ok ? '' : r.reason) }
  const save = () => { const added = toggleSaved(text, signLang); toast(added ? m.savedToast : m.unsavedToast, added ? 'bookmark' : 'check') }
  const tag = signLang === 'ar' ? m.arSignTag : m.enLettersTag
  const targetLabel = LANGS.find((l) => l.code === target)?.label || target
  const items = useMemo(() => LANGS, [])

  return (
    <div className="page cols-page">
      <h1 className="sr-only">{m.signToTextTitle}</h1>
      <div className="page-bar"><SignLangSwitch value={signLang} onChange={setSignLang} messages={m} /></div>
      <div className="cols">
        <section className="card cam-card">
          <div className="card-top"><span className="eyebrow"><Icon name="camera" size={15} />{m.camera}</span><span className="chip soft">{tag}</span></div>
          <div className="cam-slot">
            {signLang === 'ar'
              ? <SliCapture key="ar" onText={setText} controlRef={control} />
              : <EnglishLetters key="en" onText={setText} controlRef={control} />}
          </div>
          <div className="tips">
            <h3><Icon name="sparkle" size={16} />{m.tipsTitle}</h3>
            <ul>{m.tips.map((t) => <li key={t}><Icon name="check" size={15} />{t}</li>)}</ul>
          </div>
        </section>

        <div className="stack">
          <section className="card">
            <div className="card-top">
              <h2 className="h-sm">{m.transcript}</h2>
              <label className="switch-row"><span>{m.speakAloud}</span><span className="switch"><input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} /><i /></span></label>
            </div>
            <div className="transcript" lang={signLang} dir={signLang === 'ar' ? 'rtl' : 'ltr'}>
              {text ? <div className="tr-item"><small>{stamp ? clock(stamp) : ''} · {m.signingLabel}</small><p>{text}</p></div> : <div className="empty" dir="auto"><b>{m.recognizedEmptyTitle}</b><span>{m.recognizedEmptyHint}</span></div>}
            </div>
            <div className="tools">
              <button type="button" className="tool icon" disabled={!text} aria-label={m.readAloud} title={m.readAloud} onClick={() => say(text, signLang)}><Icon name="speaker" size={19} /></button>
              <button type="button" className="tool icon" disabled={!text} aria-label={m.copy} title={m.copy} onClick={() => copy(text)}><Icon name="copy" size={19} /></button>
              <button type="button" className={`tool icon${isSaved(text) ? ' on' : ''}`} disabled={!text} aria-label={m.save} aria-pressed={isSaved(text)} title={m.save} onClick={save}><Icon name="bookmark" size={19} fill={isSaved(text)} /></button>
              <button type="button" className="tool" disabled={!text} onClick={() => control.current?.undo()}><Icon name="undo" size={17} /><span>{m.undo}</span></button>
              <button type="button" className="tool" disabled={!text} onClick={clearAll}><Icon name="trash" size={17} /><span>{m.clearAll}</span></button>
            </div>
          </section>

          <section className={`card${out && !err ? ' blue' : ' outline'}`}>
            <div className="card-top">
              <button type="button" className="lang-btn slim" onClick={() => setPick(true)} aria-haspopup="dialog" aria-label={m.translateTo}><Icon name="globe" size={16} /><span dir="auto">{m.translateTo}: {targetLabel}</span><Icon name="chevronDown" size={15} /></button>
              <span className="chip soft">{engineLabel()}</span>
            </div>
            <div className="transcript" dir={RTL.includes(target) ? 'rtl' : 'ltr'}>
              {err ? <p className="result-text">{m.translationDown}</p> : out ? <p className="result-text">{out}</p> : <div className="empty" dir="auto"><span>{m.translationEmpty}</span></div>}
            </div>
            <div className="tools">
              <button type="button" className="tool icon" disabled={!out} aria-label={m.readTranslation} title={m.readTranslation} onClick={() => say(out, target)}><Icon name="speaker" size={19} /></button>
              <button type="button" className="tool icon" disabled={!out} aria-label={m.copy} title={m.copy} onClick={() => copy(out)}><Icon name="copy" size={19} /></button>
            </div>
          </section>
          {note && <p className="note" role="status">{note}</p>}
        </div>
      </div>
      <LangSheet open={pick} onClose={() => setPick(false)} title={m.chooseLanguage} searchLabel={m.searchLanguages} emptyText={m.noResults} items={items} value={target} onPick={setTarget} />
    </div>
  )
}
