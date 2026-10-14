import { lazy, Suspense, useEffect, useState } from 'react'
import PageHeading from '../components/PageHeading.jsx'
import SignLangSwitch from '../components/SignLangSwitch.jsx'
import Tabs from '../components/Tabs.jsx'
import Icon from '../components/Icons.jsx'
import SliPlayer from '../components/SliPlayer.jsx'
import { looksArabic, translate, engineLabel } from '../services/translation/translate.js'
import Suggestions from '../components/Suggestions.jsx'
import useDictation from '../components/useDictation.js'
import { SUGGESTIONS } from '../services/suggestions.js'

const EnglishAvatar = lazy(() => import('../components/EnglishAvatar.jsx'))

const MAX = 500
const isEnglish = (s) => [...s.trim()].every((c) => c.charCodeAt(0) < 128)
const alreadyTarget = (text, from, target) =>
  from === 'auto' ? (target === 'ar' ? looksArabic(text) : isEnglish(text)) : from === target

function TextToSignPage({ messages, signLang, onSignLangChange }) {
  const [text, setText] = useState('')
  const from = 'auto' // the text can be in any language: it is always auto-detected
  const [translated, setTranslated] = useState('')
  const [err, setErr] = useState(false)
  const [arText, setArText] = useState('')
  const [runKey, setRunKey] = useState(0)
  const [enText, setEnText] = useState('')
  const [, setAvatarInfo] = useState(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const [tab, setTab] = useState('type')
  const target = signLang // text is always translated into the sign language's own language

  // Changing the sign language swaps the demo sentence for that language (typed text is kept).
  useEffect(() => {
    setEnText(''); setAvatarInfo(null); setNote(''); setArText('')
  }, [signLang])

  const toTarget = async (value) => (alreadyTarget(value, from, target) ? value : translate(value, from, target))

  // The translation line updates live while typing.
  useEffect(() => {
    if (!text.trim()) { setTranslated(''); setErr(false); return }
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
      if (signLang === 'ar') {
        setArText(t)
        setRunKey((k) => k + 1)
      } else {
        setAvatarInfo(null)
        setEnText(t)
        setRunKey((k) => k + 1) // the 3D avatar signs it
      }
    } catch {
      setErr(true)
      setNote(messages.translationDown)
    } finally {
      setBusy(false)
    }
  }

  const { listening, toggle: toggleMic } = useDictation({
    getLang: () => (document.documentElement.lang === 'ar' ? 'ar' : 'en'),
    onInterim: (t) => setText(t),
    onText: (t) => { setText(t); run(t) },
    setNote,
    unsupportedText: messages.micUnsupported,
  })
  const pick = (v) => { setText(v); run(v) }
  const same = text.trim() && !err && translated && alreadyTarget(text, from, target)
  const tabs = [
    { id: 'type', label: messages.tabType, icon: 'text' },
    { id: 'speak', label: messages.tabSpeak, icon: 'mic' },
  ]

  return (
    <div className="page">
      <PageHeading title={messages.textToSignTitle} description={messages.textToSignDescription}>
        <SignLangSwitch value={signLang} onChange={onSignLangChange} messages={messages} />
      </PageHeading>
      <div className="split">
        <section className="card in-card">
          <Tabs items={tabs} value={tab} onChange={setTab} label={messages.textToSignTitle} />
          <div className="panel" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            <div className="field-wrap">
              <textarea className="field" aria-label={messages.tabType} dir="auto" maxLength={MAX} value={text} placeholder={messages.typeHere} onChange={(e) => setText(e.target.value)} />
              <div className="field-tools">
                <button type="button" className={`field-btn${listening ? ' rec' : ''}`} aria-label={listening ? messages.stop : messages.tapToSpeak} aria-pressed={listening} onClick={toggleMic}><Icon name={listening ? 'stop' : 'mic'} size={17} /></button>
                {text && <button type="button" className="field-btn" aria-label={messages.clear} onClick={() => { setText(''); setNote(''); setEnText(''); setArText('') }}><Icon name="x" size={16} /></button>}
              </div>
              <span className="count">{text.length}/{MAX}</span>
            </div>
            {tab === 'speak' && (
              <button type="button" className={`mic-big${listening ? ' rec' : ''}`} onClick={toggleMic}>
                <Icon name={listening ? 'stop' : 'mic'} size={26} />
                <span>{listening ? messages.listening : messages.tapToSpeak}</span>
              </button>
            )}
            <div className="trans-line">
              <div className="trans-top">
                <b>{messages.translatedTo}</b>
                <span className="chip">{signLang === 'ar' ? messages.toArabicTag : messages.toEnglishTag}</span>
              </div>
              <p className="trans-text" dir={signLang === 'ar' ? 'rtl' : 'ltr'}>{err ? messages.translationDown : translated || '…'}</p>
              <small className="engine">{same ? messages.alreadyTarget : engineLabel()}</small>
            </div>
            <button type="button" className="btn primary wide" disabled={busy || !text.trim()} onClick={() => run()}>
              <Icon name="play" size={16} />{busy ? messages.working : messages.generate}
            </button>
            {note && <p className="note" role="status">{note}</p>}
            <Suggestions items={SUGGESTIONS} language={signLang} title={messages.suggested} onPick={pick} />
          </div>
        </section>

        <section className="card sign-card">
          <div className="card-head"><h2><Icon name="hand" size={19} />{messages.signDisplay}</h2><span className="chip">{signLang === 'ar' ? messages.arSignTag : messages.enSignTag}</span></div>
          <div className="sign-body">
            {signLang === 'en' ? (
              <Suspense fallback={<p className="sub">…</p>}>
                <EnglishAvatar text={enText} runKey={runKey} onInfo={setAvatarInfo} />
              </Suspense>
            ) : (
              <SliPlayer text={arText} runKey={runKey} />
            )}
          </div>
          {signLang === 'en' && enText && (
            <div className="btn-row center"><button type="button" className="btn" onClick={() => setRunKey((k) => k + 1)}><Icon name="replay" size={17} />{messages.replay}</button></div>
          )}
        </section>
      </div>
    </div>
  )
}

export default TextToSignPage
