import { Navigate, Route, Routes, BrowserRouter, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AppProvider, useApp } from './state/AppContext.jsx'
import AppShell from './components/AppShell.jsx'
import WelcomePage from './pages/WelcomePage.jsx'
import TranslatePage from './pages/TranslatePage.jsx'
import SignToTextPage from './pages/SignToTextPage.jsx'
import TextToSignPage from './pages/TextToSignPage.jsx'
import SignToSignPage from './pages/SignToSignPage.jsx'
import { AccessibilityPage, LanguagesPage } from './pages/SettingsPage.jsx'
import { HistoryPage, SavedPage } from './pages/LibraryPages.jsx'
import { AboutPage, ContactPage, HelpPage } from './pages/InfoPages.jsx'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

// There is no separate home page: "/" opens Translate (the first time, the short welcome tour comes first).
function Root() {
  const { settings } = useApp()
  return <Navigate to={settings.onboarded ? '/translate' : '/welcome'} replace />
}

function Shell({ children }) {
  return <AppShell>{children}</AppShell>
}

function RoutedApp() {
  return (
    <>
      <ScrollTop />
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/translate" element={<Shell><TranslatePage /></Shell>} />
        <Route path="/sign-to-text" element={<Shell><SignToTextPage /></Shell>} />
        <Route path="/text-to-sign" element={<Shell><TextToSignPage /></Shell>} />
        <Route path="/sign-to-sign" element={<Shell><SignToSignPage /></Shell>} />
        <Route path="/settings" element={<Navigate to="/translate" replace />} />
        <Route path="/history" element={<Shell><HistoryPage /></Shell>} />
        <Route path="/saved" element={<Shell><SavedPage /></Shell>} />
        <Route path="/languages" element={<Shell><LanguagesPage /></Shell>} />
        <Route path="/accessibility" element={<Shell><AccessibilityPage /></Shell>} />
        <Route path="/help" element={<Shell><HelpPage /></Shell>} />
        <Route path="/contact" element={<Shell><ContactPage /></Shell>} />
        <Route path="/about" element={<Shell><AboutPage /></Shell>} />
        <Route path="*" element={<Navigate to="/translate" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return <BrowserRouter><AppProvider><RoutedApp /></AppProvider></BrowserRouter>
}
