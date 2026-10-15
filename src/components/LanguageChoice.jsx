import Icon from './Icons.jsx'
import { useApp } from '../state/AppContext.jsx'

/** "Choose your languages": interface language + which sign language the person uses. Used in onboarding and in Settings. */
export default function LanguageChoice() {
  const { messages: m, language, setLanguage, settings, setSetting, setSignLang } = useApp()
  const signUse = settings.signUse || 'ar'
  const pickSign = (v) => { setSetting('signUse', v); if (v === 'ar' || v === 'en') setSignLang(v) }
  const Row = ({ on, onClick, title, sub }) => (
    <button type="button" className={`choice${on ? ' on' : ''}`} role="radio" aria-checked={on} onClick={onClick}>
      <span className="choice-tx"><b dir="auto">{title}</b>{sub && <small dir="auto">{sub}</small>}</span>
      <span className="radio" aria-hidden="true">{on && <i />}</span>
    </button>
  )
  return (
    <div className="lang-choice">
      <h3 className="group-h">{m.appLanguage}</h3>
      <div role="radiogroup" aria-label={m.appLanguage} className="choices">
        <Row on={language === 'en'} onClick={() => setLanguage('en')} title="English" sub="الإنجليزية" />
        <Row on={language === 'ar'} onClick={() => setLanguage('ar')} title="العربية" sub="Arabic" />
      </div>
      <h3 className="group-h">{m.signLanguage}</h3>
      <div role="radiogroup" aria-label={m.signLanguage} className="choices">
        <Row on={signUse === 'ar'} onClick={() => pickSign('ar')} title={m.arSignTag} sub={m.signArabicSub} />
        <Row on={signUse === 'en'} onClick={() => pickSign('en')} title={m.enSignTag} sub="ASL" />
        <Row on={signUse === 'none'} onClick={() => pickSign('none')} title={m.noSignTitle} sub={m.noSignSub} />
      </div>
      <p className="muted-note"><Icon name="info" size={15} />{m.changeLaterNote}</p>
    </div>
  )
}
