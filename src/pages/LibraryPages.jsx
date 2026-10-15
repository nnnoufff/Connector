import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icons.jsx'
import SubPage from '../components/SubPage.jsx'
import ShowScreen from '../components/ShowScreen.jsx'
import { LANGS } from '../services/translation/translate.js'
import { speakText } from '../services/voice.js'
import { copyText } from '../services/clipboard.js'
import { useApp } from '../state/AppContext.jsx'

const RTL = ['ar', 'ur', 'fa', 'he']
const clock = (t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime() }

function useLangName() {
  const { messages: m } = useApp()
  return (code, sign) => (sign ? (code === 'ar' ? m.arabicSign : m.englishSign) : (LANGS.find((l) => l.code === code)?.label || code))
}

function Empty({ title, text, cta, to, icon = 'history' }) {
  return (
    <div className="lib-empty">
      <span className="lib-empty-ic"><Icon name={icon} size={30} /></span>
      <h2>{title}</h2>
      <p>{text}</p>
      {cta && <Link to={to} className="btn primary"><Icon name="translate" size={17} />{cta}</Link>}
    </div>
  )
}

const KIND_ICON = { spoken: 'translate', signed: 'hand', 'text-sign': 'text', 'sign-sign': 'swap' }

export function HistoryPage() {
  const { messages: m, history, clearHistory, removeHistory, toast, settings, language } = useApp()
  const nav = useNavigate()
  const name = useLangName()
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState('')
  const [confirm, setConfirm] = useState(false)

  const groups = useMemo(() => {
    const list = history.filter((x) => filter === 'all' || (filter === 'spoken' ? x.kind === 'spoken' : x.kind !== 'spoken'))
    const today = startOfDay(Date.now())
    const out = []
    for (const x of list) {
      const d = startOfDay(x.t)
      const label = d === today ? m.today : d === today - 86400000 ? m.yesterday : new Date(x.t).toLocaleDateString(language === 'ar' ? 'ar' : undefined, { day: 'numeric', month: 'short', year: 'numeric' })
      const g = out.find((o) => o.label === label)
      if (g) g.items.push(x); else out.push({ label, items: [x] })
    }
    return out
  }, [history, filter, m, language])

  const route = (x) => {
    if (x.kind === 'text-sign') return ['/text-to-sign', { text: x.source }]
    if (x.kind === 'sign-sign') return ['/sign-to-sign', null]
    if (x.kind === 'signed') return ['/translate', { text: x.source, from: x.from, to: x.to }]
    return ['/translate', { text: x.source, from: x.from, to: x.to }]
  }
  const meta = (x) => {
    const a = x.kind === 'text-sign' ? name(x.from, false) : name(x.from, x.kind === 'signed' || x.kind === 'sign-sign')
    const b = x.kind === 'text-sign' ? name(x.to, true) : name(x.to, x.kind === 'sign-sign')
    return [`${a} → ${b}`, m[`kind_${x.kind}`], clock(x.t)].filter(Boolean).join(' · ')
  }

  return (
    <SubPage title={m.historyTitle} action={history.length > 0 && (
      <button type="button" className={`link-btn${confirm ? ' danger' : ''}`} onClick={() => { if (confirm) { clearHistory(); setConfirm(false); toast(m.historyCleared) } else { setConfirm(true); setTimeout(() => setConfirm(false), 3000) } }}>{confirm ? m.tapAgainToClear : m.clearHistory}</button>
    )}>
      {!settings.saveHistory && <p className="note">{m.historyOff}</p>}
      {history.length === 0 ? (
        <Empty title={m.noConversations} text={m.noConversationsText} cta={m.startTranslating} to="/translate" />
      ) : (
        <>
          <div className="filters" role="tablist" aria-label={m.historyTitle}>
            {[['all', m.all], ['spoken', m.spoken], ['signed', m.signed]].map(([v, l]) => <button key={v} type="button" role="tab" aria-selected={filter === v} className={filter === v ? 'on' : ''} onClick={() => setFilter(v)}>{l}</button>)}
          </div>
          {groups.length === 0 && <p className="muted-note">{m.nothingHere}</p>}
          {groups.map((g) => (
            <section key={g.label} className="hist-group">
              <h3 className="group-h">{g.label}</h3>
              <ul className="group list">
                {g.items.map((x) => (
                  <li key={x.id} className={`hist${open === x.id ? ' open' : ''}`}>
                    <button type="button" className="hist-main" aria-expanded={open === x.id} onClick={() => setOpen(open === x.id ? '' : x.id)}>
                      <span className="srow-ic"><Icon name={KIND_ICON[x.kind] || 'translate'} size={18} /></span>
                      <span className="srow-tx"><b dir="auto">{x.source}</b><small>{meta(x)}</small></span>
                      <span className="srow-chev"><Icon name="chevronDown" size={17} /></span>
                    </button>
                    {open === x.id && (
                      <div className="hist-more">
                        {x.result && <p className="hist-result" dir={RTL.includes(x.to) ? 'rtl' : 'auto'}>{x.result}</p>}
                        <div className="tools">
                          <button type="button" className="tool primary" onClick={() => { const [p, s] = route(x); nav(p, { state: s }) }}><Icon name="arrow" size={16} /><span>{m.openAgain}</span></button>
                          {x.result && <button type="button" className="tool icon" aria-label={m.readAloud} title={m.readAloud} onClick={() => speakText(x.result, x.to).then((r) => { if (!r.ok) toast(r.reason, 'info') })}><Icon name="speaker" size={18} /></button>}
                          {x.result && <button type="button" className="tool icon" aria-label={m.copy} onClick={async () => { if (await copyText(x.result)) toast(m.copiedToast) }}><Icon name="copy" size={18} /></button>}
                          <button type="button" className="tool icon" aria-label={m.delete} onClick={() => removeHistory(x.id)}><Icon name="trash" size={18} /></button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </SubPage>
  )
}

export function SavedPage() {
  const { messages: m, saved, togglePinned, removeSaved, toast } = useApp()
  const nav = useNavigate()
  const [show, setShow] = useState(null)
  const list = [...saved].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.t - a.t)
  return (
    <SubPage title={m.savedTitle}>
      <p className="muted-note">{m.savedHint}</p>
      {list.length === 0 ? (
        <Empty icon="bookmark" title={m.noSaved} text={m.noSavedText} cta={m.startTranslating} to="/translate" />
      ) : (
        <ul className="saved-list">
          {list.map((x) => (
            <li key={x.id} className={`card saved${x.pinned ? ' pinned' : ''}`}>
              <div className="card-top">
                <span className="eyebrow">{x.lang ? (LANGS.find((l) => l.code === x.lang)?.label || x.lang) : ''}{x.pinned ? ` · ${m.pinned}` : ''}</span>
                <button type="button" className={`tool icon${x.pinned ? ' on' : ''}`} aria-label={m.pin} aria-pressed={x.pinned} onClick={() => togglePinned(x.id)}><Icon name="star" size={18} fill={x.pinned} /></button>
              </div>
              <p className="saved-text" dir="auto">{x.text}</p>
              <div className="tools">
                <button type="button" className="tool icon" aria-label={m.readAloud} title={m.readAloud} onClick={() => speakText(x.text, x.lang || (/[\u0600-\u06FF]/.test(x.text) ? 'ar' : 'en')).then((r) => { if (!r.ok) toast(r.reason, 'info') })}><Icon name="speaker" size={18} /></button>
                <button type="button" className="tool" onClick={() => setShow(x)}><Icon name="monitor" size={16} /><span>{m.show}</span></button>
                <button type="button" className="tool" onClick={() => nav('/text-to-sign', { state: { text: x.text } })}><Icon name="hand" size={16} /><span>{m.signIt}</span></button>
                <button type="button" className="tool icon" aria-label={m.delete} onClick={() => { removeSaved(x.id); toast(m.removedToast) }}><Icon name="trash" size={18} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {show && <ShowScreen text={show.text} original="" fromLabel={m.brand} dir="auto" onClose={() => setShow(null)} onSpeak={() => speakText(show.text, show.lang || 'en')} onReply={() => { setShow(null); nav('/translate') }} />}
    </SubPage>
  )
}
