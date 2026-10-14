import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo.jsx'
import Icon from './Icons.jsx'

const navigation = [
  { to: '/', key: 'navHome', sub: 'navHomeSub', icon: 'home', end: true },
  { to: '/translate', key: 'translate', sub: 'translateSub', icon: 'translate' },
  { to: '/sign-to-text', key: 'signToText', sub: 'signToTextSub', icon: 'hand' },
  { to: '/text-to-sign', key: 'textToSign', sub: 'textToSignSub', icon: 'text' },
]

export function LangToggle({ language, onLanguageChange, messages, className = '' }) {
  return (
    <div className={`lang-toggle ${className}`} role="group" aria-label={messages.interfaceLang}>
      <button type="button" className={language === 'ar' ? 'on' : ''} aria-pressed={language === 'ar'} onClick={() => onLanguageChange('ar')}>العربية</button>
      <button type="button" className={language === 'en' ? 'on' : ''} aria-pressed={language === 'en'} onClick={() => onLanguageChange('en')}>English</button>
    </div>
  )
}

function AppShell({ children, language, onLanguageChange, messages }) {
  return (
    <div className="app">
      {/* Phones: slim top bar + bottom tab bar. Desktop: sidebar. */}
      <div className="m-top">
        <Link to="/" aria-label={messages.brand}><Logo className="m-logo" /></Link>
        <LangToggle language={language} onLanguageChange={onLanguageChange} messages={messages} className="compact" />
      </div>

      <aside className="sidebar">
        <Link to="/" className="brand">
          <Logo />
        </Link>
        <nav className="nav" aria-label={messages.workspace}>
          {navigation.map((item) => (
            <NavLink to={item.to} end={item.end} key={item.key} className={({ isActive }) => `nav-item${isActive ? ' on' : ''}`}>
              <span className="nav-ic"><Icon name={item.icon} size={22} /></span>
              <span className="nav-tx"><b>{messages[item.key]}</b><small>{messages[item.sub]}</small></span>
            </NavLink>
          ))}
        </nav>
        <div className="side-box">
          <div className="side-box-title"><Icon name="globe" size={16} />{messages.langSettings}</div>
          <small>{messages.interfaceLang}</small>
          <LangToggle language={language} onLanguageChange={onLanguageChange} messages={messages} />
        </div>
        <div className="side-note">
          <div className="side-box-title"><Icon name="bulb" size={16} />{messages.noteTitle}</div>
          <p>{messages.noteBody}</p>
        </div>
      </aside>

      <main className="main">{children}</main>

      <nav className="tabbar" aria-label={messages.workspace}>
        {navigation.map((item) => (
          <NavLink to={item.to} end={item.end} key={item.key} className={({ isActive }) => `tab-item${isActive ? ' on' : ''}`}>
            <Icon name={item.icon} size={22} />
            <span>{messages[item.key]}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default AppShell
