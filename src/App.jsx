import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import SignToTextPage from './pages/SignToTextPage.jsx'
import TextToSignPage from './pages/TextToSignPage.jsx'
import HomePage from './pages/HomePage.jsx'
import TranslatePage from './pages/TranslatePage.jsx'
import { getMessages } from './i18n/translations.js'

function RoutedApp() {
  const [language, setLanguage] = useState(() => {
    try { const saved = localStorage.getItem('ui-lang'); if (saved === 'ar' || saved === 'en') return saved } catch { /* private mode */ }
    return (navigator.language || '').toLowerCase().startsWith('ar') ? 'ar' : 'en'
  })
  const [signLang, setSignLang] = useState('ar') // which sign language the whole app is using
  const messages = getMessages(language)
  const { pathname } = useLocation()

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    try { localStorage.setItem('ui-lang', language) } catch { /* private mode */ }
  }, [language])

  if (pathname === '/') return <HomePage messages={messages} language={language} onLanguageChange={setLanguage} />

  return (
    <AppShell language={language} onLanguageChange={setLanguage} messages={messages}>
      <Routes>
                <Route path="/translate" element={<TranslatePage messages={messages} language={language} />} />
        <Route path="/sign-to-text" element={<SignToTextPage messages={messages} signLang={signLang} onSignLangChange={setSignLang} />} />
        <Route path="/text-to-sign" element={<TextToSignPage messages={messages} signLang={signLang} onSignLangChange={setSignLang} />} />
        <Route path="*" element={<Navigate to="/translate" replace />} />
      </Routes>
    </AppShell>
  )
}

function App() {
  return <BrowserRouter><RoutedApp /></BrowserRouter>
}

export default App
