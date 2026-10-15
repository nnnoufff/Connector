import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../components/Icons.jsx'
import LangBar from '../components/LangBar.jsx'
import SliCapture from '../components/SliCapture.jsx'
import SliPlayer from '../components/SliPlayer.jsx'
import EnglishLetters from '../components/EnglishLetters.jsx'
import { translate } from '../services/translation/translate.js'
import { speakText } from '../services/voice.js'
import { useApp } from '../state/AppContext.jsx'

const EnglishAvatar = lazy(() => import('../components/EnglishAvatar.jsx'))

// Arabic sign <-> English (ASL) conversation.
// Signer side: camera -> recognized text. Send: text is translated into the other language
// and shown to the other person as signs (Arabic: real signer clips, English: the avatar).
export default function SignToSignPage() {
  const { messages: m, settings, addHistory, buzz, toast } = useApp()
  const say = (value, code) => speakText(value, code).then((r) => { if (!r.ok) toast(r.reason, 'info') })
  const [speaker, setSpeaker] = useState('ar') // who is signing now: 'ar' | 'en'
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)
  const [shown, setShown] = useState({ lang: '', text: '' }) // what the other person sees
  const [runKey, setRunKey] = useState(0)
  const control = useRef(null)
  const other = speaker === 'ar' ? 'en' : 'ar'
  const items = useMemo(() => [{ code: 'ar', label: m.arabicSign }, { code: 'en', label: m.englishSign }], [m.arabicSign, m.englishSign])
  const name = (l) => (l === 'ar' ? m.arabicSign : m.englishSign)

  useEffect(() => { setText('') }, [speaker])

  const send = async () => {
    const value = text.trim()
    if (!value) return
    setBusy(true); setErr(false)
    try {
      const t = await translate(value, speaker, other)
      setShown({ lang: other, text: t })
      setRunKey((k) => k + 1)
      addHistory({ kind: 'sign-sign', from: speaker, to: other, source: value, result: t })
      buzz()
    } catch { setErr(true) } finally { setBusy(false) }
  }
  const clearAll = () => { control.current?.clear(); setText(''); setShown({ lang: '', text: '' }); setRunKey((k) => k + 1) }
  const switchTurn = () => { setSpeaker(other); control.current = null }

  return (
    <div className="page cols-page">
      <h1 className="sr-only">{m.s2s.title}</h1>
      <LangBar from={speaker} to={other} fromItems={items} toItems={items} onFrom={setSpeaker} onTo={(c) => setSpeaker(c === 'ar' ? 'en' : 'ar')} onSwap={switchTurn} />
      <div className="cols">
        <section className="card cam-card">
          <div className="card-top"><span className="eyebrow"><Icon name="camera" size={15} />{m.s2s.signing}</span><span className="chip soft">{name(speaker)}</span></div>
          <div className="cam-slot">
            {speaker === 'ar'
              ? <SliCapture key="ar" onText={setText} controlRef={control} />
              : <EnglishLetters key="en" onText={setText} controlRef={control} />}
          </div>
          <div className="s2s-msg">
            <span className="eyebrow">{m.s2s.yourMessage}</span>
            <div className="transcript" lang={speaker} dir={speaker === 'ar' ? 'rtl' : 'ltr'}>
              {text ? <p className="result-text sm">{text}</p> : <div className="empty" dir="auto"><span>{m.s2s.emptyMessage}</span></div>}
            </div>
            <div className="tools">
              <button type="button" className="tool icon" disabled={!text.trim()} aria-label={m.readAloud} title={m.readAloud} onClick={() => say(text, speaker)}><Icon name="speaker" size={19} /></button>
              <button type="button" className="tool" disabled={!text} onClick={() => control.current?.undo()}><Icon name="undo" size={17} /><span>{m.undo}</span></button>
              {speaker === 'en' && <button type="button" className="tool" onClick={() => control.current?.space()}><span aria-hidden="true">␣</span><span>{m.s2s.space}</span></button>}
              <button type="button" className="tool" disabled={!text} onClick={clearAll}><Icon name="trash" size={17} /><span>{m.clearAll}</span></button>
              <button type="button" className="btn primary grow" disabled={busy || !text.trim()} onClick={send}><Icon name="play" size={16} />{busy ? m.s2s.sending : m.s2s.send}</button>
            </div>
            {err && <p className="note" role="status">{m.translationDown}</p>}
          </div>
        </section>

        <section className="card sign-card">
          <div className="card-top"><span className="eyebrow"><Icon name="hand" size={15} />{m.s2s.otherSees}</span><span className="chip soft">{name(other)}</span></div>
          <div className="sign-body">
            {other === 'en' ? (
              <Suspense fallback={<p className="sub">…</p>}>
                <EnglishAvatar text={shown.lang === 'en' ? shown.text : ''} runKey={shown.lang === 'en' ? runKey : 0} onInfo={() => {}} />
              </Suspense>
            ) : (
              <SliPlayer text={shown.lang === 'ar' ? shown.text : ''} runKey={shown.lang === 'ar' ? runKey : 0} />
            )}
          </div>
          <div className="s2s-msg">
            {settings.captions && (
              <>
                <span className="eyebrow">{m.s2s.textLine}</span>
                <div className="transcript" lang={other} dir={other === 'ar' ? 'rtl' : 'ltr'}>
                  {shown.lang === other && shown.text ? <p className="result-text sm">{shown.text}</p> : <div className="empty" dir="auto"><span>{m.s2s.waiting}</span></div>}
                </div>
              </>
            )}
            <div className="tools">
              <button type="button" className="tool icon" disabled={!shown.text} aria-label={m.readAloud} title={m.readAloud} onClick={() => say(shown.text, other)}><Icon name="speaker" size={19} /></button>
              <button type="button" className="tool" disabled={!shown.text} onClick={() => setRunKey((k) => k + 1)}><Icon name="replay" size={17} /><span>{m.s2s.replay}</span></button>
              <button type="button" className="btn primary grow" onClick={switchTurn}><Icon name="swap" size={17} />{m.s2s.switchTurn}</button>
            </div>
            <small className="engine">{other === 'en' ? m.s2s.avatarNote : m.s2s.lettersNote}</small>
          </div>
        </section>
      </div>
    </div>
  )
}
