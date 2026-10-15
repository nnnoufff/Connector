import { useEffect, useMemo, useState } from 'react'
import Icon from './Icons.jsx'

/** "Choose a language": bottom sheet on phones, centred dialog on larger screens. */
export default function LangSheet({ open, onClose, title, items, value, onPick, searchLabel, emptyText }) {
  const [q, setQ] = useState('')
  useEffect(() => { if (open) setQ('') }, [open])
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? items.filter((i) => `${i.label} ${i.hint || ''} ${i.code}`.toLowerCase().includes(s)) : items
  }, [items, q])
  if (!open) return null
  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <span className="sheet-grip" aria-hidden="true" />
        <h2>{title}</h2>
        <label className="search">
          <Icon name="search" size={18} />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchLabel} aria-label={searchLabel} autoFocus={!window.matchMedia?.('(pointer: coarse)').matches} />
        </label>
        <ul className="sheet-list">
          {list.map((i) => (
            <li key={i.code}>
              <button type="button" className={`sheet-item${i.code === value ? ' on' : ''}`} onClick={() => { onPick(i.code); onClose() }}>
                <span dir="auto">{i.label}</span>
                {i.code === value && <Icon name="check" size={18} />}
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="sheet-empty">{emptyText}</li>}
        </ul>
      </div>
    </div>
  )
}
