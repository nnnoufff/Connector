import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icons.jsx'
import SubPage from '../components/SubPage.jsx'
import { copyText } from '../services/clipboard.js'
import { SUPPORT_EMAIL } from '../config.js'
import { useApp } from '../state/AppContext.jsx'

export function HelpPage() {
  const { messages: m } = useApp()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(0)
  const faq = useMemo(() => {
    const s = q.trim().toLowerCase()
    return m.helpFaq.filter((f) => !s || `${f.q} ${f.a}`.toLowerCase().includes(s))
  }, [m, q])
  return (
    <SubPage title={m.helpTitle}>
      <label className="search"><Icon name="search" size={18} /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={m.searchHelp} aria-label={m.searchHelp} /></label>
      <h2 className="group-h">{m.popularQuestions}</h2>
      <ul className="faq">
        {faq.map((f, i) => (
          <li key={f.q}>
            <button type="button" className="faq-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}><span>{f.q}</span><Icon name={open === i ? 'minus' : 'plus'} size={18} /></button>
            {open === i && <p className="faq-a">{f.a}</p>}
          </li>
        ))}
        {faq.length === 0 && <li className="muted-note">{m.noResults}</li>}
      </ul>
      <div className="card still-stuck">
        <h3>{m.stillStuck}</h3>
        <p>{m.stillStuckText}</p>
        <Link to="/contact" className="btn primary"><Icon name="mail" size={17} />{m.contactSupport}</Link>
      </div>
      <p className="version">{m.versionLine}</p>
    </SubPage>
  )
}

export function ContactPage() {
  const { messages: m, toast } = useApp()
  const nav = useNavigate()
  const [topic, setTopic] = useState(0)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [reply, setReply] = useState('email')
  const send = async (e) => {
    e.preventDefault()
    const body = `${message}\n\n— ${m.replyBy}: ${reply === 'email' ? email : m.replySigned}`
    const subject = `Connector: ${m.topics[topic]}`
    if (SUPPORT_EMAIL) {
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      return
    }
    await copyText(`${subject}\n\n${body}`)
    toast(m.contactDemo, 'info')
    nav('/help')
  }
  return (
    <SubPage title={m.contactSupport}>
      <form className="contact" onSubmit={send}>
        <label className="fld"><span>{m.topic}</span>
          <span className="select-wrap"><select value={topic} onChange={(e) => setTopic(Number(e.target.value))}>{m.topics.map((t, i) => <option key={t} value={i}>{t}</option>)}</select></span>
        </label>
        <label className="fld"><span>{m.messageLabel}</span>
          <textarea className="field" rows={6} required value={message} onChange={(e) => setMessage(e.target.value)} placeholder={m.howCanWeHelp} />
        </label>
        <fieldset className="fld"><legend>{m.howReply}</legend>
          <div role="radiogroup" className="choices">
            {[['email', m.byEmail], ['sign', m.bySignVideo]].map(([v, t]) => (
              <button key={v} type="button" className={`choice${reply === v ? ' on' : ''}`} role="radio" aria-checked={reply === v} onClick={() => setReply(v)}>
                <span className="choice-tx"><b>{t}</b>{v === 'sign' && <small>{m.bySignVideoSub}</small>}</span><span className="radio" aria-hidden="true">{reply === v && <i />}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <label className="fld"><span>{m.emailLabel}</span><input className="input" type="email" required={reply === 'email'} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" dir="ltr" /></label>
        <button className="btn primary wide" type="submit"><Icon name="send" size={17} />{m.sendMessage}</button>
      </form>
    </SubPage>
  )
}

export function AboutPage() {
  const { messages: m, language } = useApp()
  const h = m.home
  const arrow = language === 'ar' ? '←' : '→'
  return (
    <SubPage title={m.aboutTitle} wide>
      <section className="about-hero">
        <p className="vision">{h.vision}</p>
        <h2>{h.heroTitle}</h2>
        <p>{h.heroText}</p>
        <div className="aud"><span>{h.audienceTitle}</span><ul>{h.audience.map((a) => <li key={a}>{a}</li>)}</ul></div>
      </section>

      <h2 className="group-h">{h.featuresTitle}</h2>
      <div className="about-grid">
        {h.features.map((f) => (
          <Link key={f.to} to={f.to} className="card about-card">
            <span className="srow-ic"><Icon name={f.icon} size={20} /></span>
            <small>{f.title}</small>
            <b>{f.headline}</b>
            <p>{f.text}</p>
            <span className="more">{f.cta} <span aria-hidden="true">{arrow}</span></span>
          </Link>
        ))}
      </div>

      <h2 className="group-h">{h.stepsTitle}</h2>
      <ol className="about-steps">
        {h.steps.map((s, i) => <li key={s.title} className="card"><span className="num">{i + 1}</span><div><b>{s.title}</b><p>{s.text}</p></div></li>)}
      </ol>

      <section className="card privacy"><Icon name="shield" size={22} /><div><b>{h.privacyTitle}</b><p>{h.privacyText}</p></div></section>

      <div className="about-status">
        <div className="card"><h3>{h.statusTitle}</h3><ul>{h.works.map((w) => <li key={w}><Icon name="check" size={16} />{w}</li>)}</ul></div>
        <div className="card"><h3>{h.experimentalTitle}</h3><ul className="exp">{h.experimental.map((w) => <li key={w}><Icon name="sparkle" size={16} />{w}</li>)}</ul></div>
      </div>

      <section className="about-mission">
        <h2>{h.missionTitle}</h2>
        <p>{h.missionText}</p>
        <b>{m.brand} — {m.tagline}</b>
        <small>{h.footer}</small>
      </section>
    </SubPage>
  )
}
