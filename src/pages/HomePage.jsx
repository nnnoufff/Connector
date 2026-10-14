import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import Icon from '../components/Icons.jsx'
import { LangToggle } from '../components/AppShell.jsx'

export default function HomePage({ messages, language, onLanguageChange }) {
  const h = messages.home
  return (
    <div className="home">
      <header className="home-top">
        <Logo className="home-logo" />
        <div className="home-actions">
          <LangToggle language={language} onLanguageChange={onLanguageChange} messages={messages} className="compact" />
          <Link to="/translate" className="btn primary home-open">{h.openApp}</Link>
        </div>
      </header>

      <section className="home-hero">
        <h1>{h.heroTitle}</h1>
        <p>{h.heroText}</p>
        <div className="home-cta">
          <Link to="/translate" className="btn lime">{h.openApp}</Link>
          <a href="#how" className="btn ghost-light">{h.how}</a>
        </div>
        <div className="home-aud">
          <span>{h.audienceTitle}</span>
          <ul>{h.audience.map((a) => <li key={a}>{a}</li>)}</ul>
        </div>
      </section>

      <main className="home-main">
        <h2>{h.featuresTitle}</h2>
        <div className="home-grid">
          {h.features.map((f) => (
            <Link key={f.to} to={f.to} className="home-card">
              <span className="home-ic"><Icon name={f.icon} size={26} /></span>
              <small>{f.title}</small>
              <b>{f.headline}</b>
              <p>{f.text}</p>
              <span className="home-link">{f.cta} <span aria-hidden="true">{language === 'ar' ? '←' : '→'}</span></span>
            </Link>
          ))}
        </div>

        <h2 id="how">{h.stepsTitle}</h2>
        <ol className="home-steps">
          {h.steps.map((s, i) => (
            <li key={s.title}><span className="home-num">{i + 1}</span><div><b>{s.title}</b><p>{s.text}</p></div></li>
          ))}
        </ol>

        <section className="home-privacy">
          <Icon name="check" size={22} />
          <div><b>{h.privacyTitle}</b><p>{h.privacyText}</p></div>
        </section>

        <div className="home-status">
          <div>
            <h3>{h.statusTitle}</h3>
            <ul>{h.works.map((w) => <li key={w}><Icon name="check" size={16} />{w}</li>)}</ul>
          </div>
          <div>
            <h3>{h.experimentalTitle}</h3>
            <ul className="exp">{h.experimental.map((w) => <li key={w}><Icon name="sparkle" size={16} />{w}</li>)}</ul>
          </div>
        </div>
        <section className="home-mission">
          <h2>{h.missionTitle}</h2>
          <p>{h.missionText}</p>
          <b>{messages.brand} — {messages.tagline}</b>
        </section>
      </main>
      <footer className="home-foot">{h.footer}</footer>
    </div>
  )
}
