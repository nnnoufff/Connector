import { useEffect } from 'react'
import Icon from './Icons.jsx'
import { useApp } from '../state/AppContext.jsx'

/** Full-screen big text to show the other person. */
export default function ShowScreen({ text, original, fromLabel, dir = 'auto', onClose, onSpeak, onReply }) {
  const { messages: m } = useApp()
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div className="show" role="dialog" aria-modal="true" aria-label={m.showingToOther}>
      <div className="show-top">
        <span><Icon name="monitor" size={16} />{m.showingToOther}</span>
        <button type="button" className="icon-btn" aria-label={m.close} onClick={onClose}><Icon name="x" size={19} /></button>
      </div>
      <div className="show-body">
        <p className="show-big" dir={dir}>{text}</p>
        {original && <p className="show-orig" dir="auto">{original}</p>}
        {original && <span className="show-tag"><Icon name="translate" size={14} />{m.translatedFromBy.replace('{lang}', fromLabel)}</span>}
      </div>
      <div className="show-actions">
        <button type="button" className="round-btn" aria-label={m.readAloud} onClick={onSpeak}><Icon name="speaker" size={22} /></button>
        <button type="button" className="btn primary grow" onClick={onReply}><Icon name="mic" size={18} />{m.reply}</button>
      </div>
    </div>
  )
}
