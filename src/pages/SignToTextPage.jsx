import { useEffect, useRef, useState } from 'react'
import PageHeading from '../components/PageHeading.jsx'
import SignLangSwitch from '../components/SignLangSwitch.jsx'
import Tabs from '../components/Tabs.jsx'
import Icon from '../components/Icons.jsx'
import SliCapture from '../components/SliCapture.jsx'
import EnglishLetters from '../components/EnglishLetters.jsx'
import { LANGS, translate, engineLabel } from '../services/translation/translate.js'
import { speakText } from '../services/voice.js'
import { copyText } from '../services/clipboard.js'

const RTL = ['ar', 'ur', 'fa', 'he']

function SignToTextPage({ messages, signLang, onSignLangChange }) {
  const [text, setText] = useState('')
  const [target, setTarget] = useState('en')
  const [out, setOut] = useState('')
  const [err, setErr] = useState(false)
  const [tab, setTab] = useState('recognized')
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState('')
  const control = useRef(null)

  // Switching the sign language starts a clean session.
  useEffect(() => { setText(''); setOut('') }, [signLang])

  useEffect(() => {
    if (!text.trim()) { setOut(''); return }
    let live = true
    const id = setTimeout(() => {
      translate(text, signLang === 'ar' ? 'ar' : 'en', target).then((r) => { if (live) { setOut(r); setErr(false) } }).catch(() => live && setErr(true))
    }, 600)
    return () => { live = false; clearTimeout(id) }
  }, [text, target, signLang])

  const clearAll = () => { control.current?.clear(); setText(''); setOut('') }
  const copy = async (which, value) => { if (await copyText(value)) { setCopied(which); setTimeout(() => setCopied(''), 1500) } }
  const say = async (value, code) => { const r = await speakText(value, code); setNote(r.ok ? '' : r.reason) }
  const tag = signLang === 'ar' ? messages.arSignTag : messages.enLettersTag
  const tabs = [
    { id: 'recognized', label: messages.tabRecognized, icon: 'text' },
    { id: 'translation', label: messages.tabTranslation, icon: 'translate' },
    { id: 'voice', label: messages.tabVoice, icon: 'speaker' },
  ]

  return (
    <div className="page">
      <PageHeading title={messages.signToTextTitle} description={messages.signToTextDescription}>
        <SignLangSwitch value={signLang} onChange={onSignLangChange} messages={messages} />
      </PageHeading>
      <div className="split">
        <section className="card cam-card">
          <div className="card-head"><h2><Icon name="camera" size={19} />{messages.camera}</h2><span className="chip">{tag}</span></div>
          <div className="card-scroll">
            {signLang === 'ar'
              ? <SliCapture key="ar" onText={setText} controlRef={control} />
              : <EnglishLetters key="en" onText={setText} controlRef={control} />}
          </div>
          <div className="tips">
            <h3><Icon name="sparkle" size={16} />{messages.tipsTitle}</h3>
            <ul>{messages.tips.map((t) => <li key={t}><Icon name="check" size={15} />{t}</li>)}</ul>
          </div>
        </section>

        <section className="card out-card">
          <Tabs items={tabs} value={tab} onChange={setTab} label={messages.signToTextTitle} />
          <div className="panel" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            {tab === 'recognized' && (
              <>
                <div className="output" lang={signLang} dir={signLang === 'ar' ? 'rtl' : 'ltr'}>
                  {text ? <p className="output-text">{text}</p> : <div className="empty" dir="auto"><b>{messages.recognizedEmptyTitle}</b><span>{messages.recognizedEmptyHint}</span></div>}
                </div>
                <div className="btn-row">
                  <button type="button" className="btn" disabled={!text} onClick={() => copy('r', text)}><Icon name="copy" size={17} />{copied === 'r' ? messages.copied : messages.copy}</button>
                  <button type="button" className="btn" disabled={!text} onClick={() => control.current?.undo()}><Icon name="undo" size={17} />{messages.undo}</button>
                  <button type="button" className="btn" disabled={!text} onClick={clearAll}><Icon name="trash" size={17} />{messages.clearAll}</button>
                  <button type="button" className="btn primary grow" disabled={!text} onClick={() => say(text, signLang)}><Icon name="speaker" size={18} />{messages.readAloud}</button>
                </div>
              </>
            )}
            {tab === 'translation' && (
              <>
                <label className="pick inline">
                  <span className="pick-label"><Icon name="globe" size={17} />{messages.translateTo}</span>
                  <span className="select-wrap"><select value={target} onChange={(e) => setTarget(e.target.value)}>{LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</select></span>
                </label>
                <div className="output" dir={RTL.includes(target) ? 'rtl' : 'ltr'}>
                  {err ? <p className="output-text">{messages.translationDown}</p> : out ? <p className="output-text">{out}</p> : <div className="empty" dir="auto"><span>{messages.translationEmpty}</span></div>}
                </div>
                <div className="btn-row">
                  <small className="engine">{engineLabel()}</small>
                  <button type="button" className="btn" disabled={!out} onClick={() => copy('t', out)}><Icon name="copy" size={17} />{copied === 't' ? messages.copied : messages.copy}</button>
                  <button type="button" className="btn primary" disabled={!out} onClick={() => say(out, target)}><Icon name="speaker" size={18} />{messages.readAloud}</button>
                </div>
              </>
            )}
            {tab === 'voice' && (
              <div className="voice">
                <h3>{messages.voiceTitle}</h3>
                <p>{messages.voiceHint}</p>
                <div className="voice-btns">
                  <button type="button" className="btn primary" disabled={!text} onClick={() => say(text, signLang)}><Icon name="speaker" size={18} />{messages.readRecognized}</button>
                  <button type="button" className="btn primary" disabled={!out} onClick={() => say(out, target)}><Icon name="speaker" size={18} />{messages.readTranslation}</button>
                </div>
              </div>
            )}
            {note && <p className="note" role="status">{note}</p>}
          </div>
        </section>
      </div>
    </div>
  )
}

export default SignToTextPage
