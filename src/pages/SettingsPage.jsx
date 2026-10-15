import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icons.jsx'
import SubPage from '../components/SubPage.jsx'
import LanguageChoice from '../components/LanguageChoice.jsx'
import { useApp } from '../state/AppContext.jsx'

function Row({ to, onClick, icon, title, sub, end }) {
  const body = (
    <>
      <span className="srow-ic"><Icon name={icon} size={19} /></span>
      <span className="srow-tx"><b>{title}</b>{sub && <small>{sub}</small>}</span>
      {end ?? <span className="srow-chev"><Icon name="chevron" size={18} /></span>}
    </>
  )
  return to ? <Link to={to} className="srow">{body}</Link> : <button type="button" className="srow" onClick={onClick}>{body}</button>
}

export function Switch({ checked, onChange, label }) {
  return <span className="switch"><input type="checkbox" checked={checked} aria-label={label} onChange={(e) => onChange(e.target.checked)} /><i /></span>
}

export function MoreSheet({ open, onClose }) {
  const { messages: m, settings, setSetting, language } = useApp()
  const nav = useNavigate()
  if (!open) return null
  const signName = (settings.signUse || 'ar') === 'en' ? m.enSignTag : (settings.signUse === 'none' ? m.noSignTitle : m.arSignTag)
  const go = (to) => { onClose(); nav(to) }
  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet more-sheet" role="dialog" aria-modal="true" aria-label={m.moreTitle} onClick={(e) => e.stopPropagation()}>
        <span className="sheet-grip" aria-hidden="true" />
        <div className="more-head"><h2>{m.moreTitle}</h2><button type="button" className="icon-btn" aria-label={m.close} onClick={onClose}><Icon name="x" size={18} /></button></div>
        <div className="more-body">
          <div className="group">
            <Row onClick={() => go('/history')} icon="history" title={m.historyTitle} sub={m.historySub} />
            <Row onClick={() => go('/saved')} icon="bookmark" title={m.savedTitle} sub={m.savedSub} />
          </div>
          <div className="group">
            <Row onClick={() => go('/languages')} icon="language" title={m.languagesTitle} sub={`${language === 'ar' ? 'العربية' : 'English'} · ${signName}`} />
            <Row onClick={() => go('/accessibility')} icon="access" title={m.accessibilityTitle} sub={m.accessibilitySub} />
          </div>
          <div className="group pad">
            <h3 className="group-h">{m.appearance}</h3>
            <div className="seg full" role="radiogroup" aria-label={m.appearance}>
              {[['light', 'sun', m.light], ['dark', 'moon', m.dark], ['system', 'monitor', m.system]].map(([v, ic, label]) => (
                <button key={v} type="button" role="radio" aria-checked={settings.theme === v} className={settings.theme === v ? 'on' : ''} onClick={() => setSetting('theme', v)}><Icon name={ic} size={16} />{label}</button>
              ))}
            </div>
          </div>
          <div className="group">
            <div className="srow static">
              <span className="srow-ic"><Icon name="history" size={19} /></span>
              <span className="srow-tx"><b>{m.saveHistory}</b><small>{m.saveHistorySub}</small></span>
              <Switch checked={settings.saveHistory} onChange={(v) => setSetting('saveHistory', v)} label={m.saveHistory} />
            </div>
            <Row onClick={() => go('/help')} icon="help" title={m.helpTitle} />
            <Row onClick={() => go('/about')} icon="info" title={m.aboutTitle} sub={m.aboutSub} />
            <Row onClick={() => { setSetting('onboarded', false); onClose(); nav('/welcome') }} icon="replay" title={m.replayIntro} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function LanguagesPage() {
  const { messages: m } = useApp()
  return <SubPage title={m.languagesTitle}><LanguageChoice /></SubPage>
}

export function AccessibilityPage() {
  const { messages: m, settings, setSetting } = useApp()
  return (
    <SubPage title={m.accessibilityTitle}>
      <div className="group pad">
        <h3 className="group-h">{m.reading}</h3>
        <div className="size-row">
          <span className="size-label"><b>{m.textSize}</b><small>{settings.textSize === 100 ? m.sizeDefault : `${settings.textSize}%`}</small></span>
          <span className="slider-row"><small aria-hidden="true">A</small><input type="range" min="90" max="140" step="5" value={settings.textSize} aria-label={m.textSize} onChange={(e) => setSetting('textSize', Number(e.target.value))} /><span className="a-big" aria-hidden="true">A</span></span>
        </div>
        <p className="size-preview">{m.sizePreview}</p>
      </div>
      <div className="group">
        {[
          ['contrast', 'eye', m.highContrast, m.highContrastSub],
          ['captions', 'captions', m.captionsOn, m.captionsOnSub],
          ['vibrate', 'vibrate', m.vibrateOn, m.vibrateOnSub],
        ].map(([key, icon, title, sub]) => (
          <div className="srow static" key={key}>
            <span className="srow-ic"><Icon name={icon} size={19} /></span>
            <span className="srow-tx"><b>{title}</b><small>{sub}</small></span>
            <Switch checked={!!settings[key]} onChange={(v) => setSetting(key, v)} label={title} />
          </div>
        ))}
      </div>
    </SubPage>
  )
}
