import { useNavigate } from 'react-router-dom'
import Icon from './Icons.jsx'
import { useApp } from '../state/AppContext.jsx'

/** A Settings sub-screen: back arrow + title. */
export default function SubPage({ title, children, action, wide = false }) {
  const nav = useNavigate()
  const { language, messages: m } = useApp()
  return (
    <div className={`page sub-page${wide ? ' wide' : ''}`}>
      <header className="sub-head">
        <button type="button" className="icon-btn" aria-label={m.back} onClick={() => (window.history.length > 1 ? nav(-1) : nav('/translate'))}><Icon name={language === 'ar' ? 'chevron' : 'back'} size={20} /></button>
        <h1>{title}</h1>
        <span className="sub-action">{action}</span>
      </header>
      {children}
    </div>
  )
}
