import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo.jsx'
import Icon from './Icons.jsx'
import { useState } from 'react'
import { MoreSheet } from '../pages/SettingsPage.jsx'
import { useApp } from '../state/AppContext.jsx'

const navigation = [
  { to: '/translate', key: 'tabTranslate', icon: 'translate' },
  { to: '/sign-to-text', key: 'tabSignToText', icon: 'hand' },
  { to: '/text-to-sign', key: 'tabTextToSign', icon: 'text' },
  { to: '/sign-to-sign', key: 'tabSignToSign', icon: 'swap' },
]

/** EN | ع pills, as in the design. */
export function LangToggle({ className = '' }) {
  const { language, setLanguage, messages } = useApp()
  return (
    <div className={`lang-toggle ${className}`} role="group" aria-label={messages.interfaceLang}>
      <button type="button" className={language === 'en' ? 'on' : ''} aria-pressed={language === 'en'} aria-label="English" onClick={() => setLanguage('en')}>EN</button>
      <button type="button" className={language === 'ar' ? 'on' : ''} aria-pressed={language === 'ar'} aria-label="العربية" onClick={() => setLanguage('ar')}>ع</button>
    </div>
  )
}

export function ThemeButton() {
  const { dark, setSetting, messages } = useApp()
  return (
    <button type="button" className="icon-btn" aria-label={dark ? messages.lightMode : messages.darkMode} title={dark ? messages.lightMode : messages.darkMode} onClick={() => setSetting('theme', dark ? 'light' : 'dark')}>
      <Icon name={dark ? 'sun' : 'moon'} size={19} />
    </button>
  )
}

export default function AppShell({ children }) {
  const { messages } = useApp()
  const [more, setMore] = useState(false)
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-in">
          <Link to="/translate" className="top-logo" aria-label={messages.brand}><Logo /></Link>
          <nav className="top-nav" aria-label={messages.workspace}>
            {navigation.map((item) => (
              <NavLink to={item.to} key={item.key} className={({ isActive }) => `top-link${isActive ? ' on' : ''}`}>
                <Icon name={item.icon} size={18} /><span>{messages[item.key]}</span>
              </NavLink>
            ))}
          </nav>
          <div className="top-tools"><LangToggle /><ThemeButton /><button type="button" className="icon-btn" aria-label={messages.moreTitle} title={messages.moreTitle} onClick={() => setMore(true)}><Icon name="settings" size={19} /></button></div>
        </div>
      </header>

      <MoreSheet open={more} onClose={() => setMore(false)} />
      <main className="main">{children}</main>

      <nav className="tabbar" aria-label={messages.workspace}>
        {navigation.map((item) => (
          <NavLink to={item.to} key={item.key} className={({ isActive }) => `tab-item${isActive ? ' on' : ''}`}>
            <span className="tab-ic"><Icon name={item.icon} size={21} /></span>
            <span className="tab-tx">{messages[item.key]}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
