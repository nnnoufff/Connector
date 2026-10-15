import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import Icon from '../components/Icons.jsx'
import LanguageChoice from '../components/LanguageChoice.jsx'
import { LangToggle } from '../components/AppShell.jsx'
import { useApp } from '../state/AppContext.jsx'

function Art({ step }) {
  const { messages: m } = useApp()
  if (step === 0) {
    return (
      <div className="art art-orb" aria-hidden="true">
        <span className="ring r1" /><span className="ring r2" /><span className="ring r3" />
        <span className="core">Hola</span>
        <span className="float f1"><b>مرحبًا</b><small>{m.arabicName}</small></span>
        <span className="float f2"><b>Hello</b><small>{m.englishName}</small></span>
        <span className="float f3"><b>Bonjour</b><small>{m.frenchName}</small></span>
        <span className="float f4"><Icon name="hand" size={16} /> Thank you</span>
      </div>
    )
  }
  if (step === 1) {
    return (
      <div className="art art-card" aria-hidden="true">
        <div className="mini-card">
          <small>Spanish → Arabic</small>
          <b>¿Dónde está la salida?</b>
          <span className="wave static"><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>
          <div className="mini-res" dir="rtl">أين المخرج؟</div>
        </div>
      </div>
    )
  }
  if (step === 2) {
    return (
      <div className="art art-cam" aria-hidden="true">
        <div className="cam-mock">
          <svg viewBox="0 0 200 240" width="100%" height="100%">
            <circle cx="100" cy="120" r="34" fill="#2a2630" />
            <ellipse cx="100" cy="230" rx="84" ry="70" fill="#2a2630" />
            <g stroke="#b7d972" strokeWidth="2" fill="none" strokeLinecap="round">
              <path d="M150 190 150 150M150 190 132 150M150 190 168 148M150 190 184 156M150 190 114 168" />
              <path d="M150 150 150 112M132 150 128 118M168 148 172 108M184 156 196 126M114 168 100 154" />
            </g>
            <g fill="#d8f08a">{[[150,112],[128,118],[172,108],[196,126],[100,154],[150,150],[132,150],[168,148],[184,156],[114,168],[150,190]].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3.2" />)}</g>
          </svg>
          <span className="mock-chip"><Icon name="speaker" size={13} /> Nice to meet you.</span>
        </div>
      </div>
    )
  }
  return (
    <div className="art art-sign" aria-hidden="true">
      <span className="float top"><Icon name="swap" size={14} /> SSL ⇄ ASL</span>
      <div className="figure">
        <span className="fig-head" /><span className="fig-body" />
        <span className="fig-arc" />
        <span className="fig-hand l"><Icon name="hand" size={26} /></span>
        <span className="fig-hand r"><Icon name="hand" size={26} /></span>
      </div>
      <span className="float bottom"><Icon name="check" size={14} /> Follow me, please.</span>
    </div>
  )
}

export default function WelcomePage() {
  const { messages: m, language, setSetting, settings } = useApp()
  const nav = useNavigate()
  const [stage, setStage] = useState(settings.onboarded ? 0 : -1) // -1 splash, 0..3 slides, 4 languages
  const data = [
    { t: m.onb1t, s: m.onb1s, b: m.getStarted },
    { t: m.onb2t, s: m.onb2s, b: m.next },
    { t: m.onb3t, s: m.onb3s, b: m.next },
    { t: m.onb4t, s: m.onb4s, b: m.chooseMyLanguage },
  ]
  useEffect(() => {
    if (stage !== -1) return undefined
    const id = setTimeout(() => setStage(0), 1700)
    return () => clearTimeout(id)
  }, [stage])
  const finish = () => { setSetting('onboarded', true); nav('/translate', { replace: true }) }
  const arrow = language === 'ar' ? 'back' : 'arrow'

  if (stage === -1) {
    return (
      <button type="button" className="splash" onClick={() => setStage(0)} aria-label={m.brand}>
        <span className="splash-glow" aria-hidden="true" />
        <Logo variant="white" className="splash-logo" label={m.brand} />
        <span className="splash-tag">{m.splashTag}</span>
      </button>
    )
  }

  return (
    <div className="onboard">
      <div className="onb-top">
        {stage > 0 ? <button type="button" className="icon-btn" aria-label={m.back} onClick={() => setStage(stage - 1)}><Icon name={language === 'ar' ? 'chevron' : 'back'} size={20} /></button> : <span className="onb-mark"><img src="/mark-purple.png" alt="" /></span>}
        <span className="onb-top-tools"><LangToggle />{stage < 4 && <button type="button" className="link-btn" onClick={() => setStage(4)}>{m.skip}</button>}</span>
      </div>

      {stage < 4 ? (
        <>
          <Art step={stage} />
          <div className="onb-copy"><h1>{data[stage].t}</h1><p>{data[stage].s}</p></div>
          <div className="onb-foot">
            <span className="dots" aria-hidden="true">{[0, 1, 2, 3].map((i) => <i key={i} className={i === stage ? 'on' : ''} />)}</span>
            <button type="button" className="btn primary wide" onClick={() => setStage(stage + 1)}>{data[stage].b}<Icon name={arrow} size={18} /></button>
          </div>
        </>
      ) : (
        <>
          <div className="onb-copy left"><h1>{m.chooseLanguages}</h1><p>{m.canChangeAnytime}</p></div>
          <LanguageChoice />
          <div className="onb-foot"><button type="button" className="btn primary wide" onClick={finish}>{m.continue}<Icon name={arrow} size={18} /></button></div>
        </>
      )}
    </div>
  )
}
