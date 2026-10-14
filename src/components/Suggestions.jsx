import { useState } from 'react'
import Icon from './Icons.jsx'

/** Suggested phrases, grouped. The list is shown in the interface language; tapping one calls onPick(text). */
export default function Suggestions({ items, language, title, onPick }) {
  const [open, setOpen] = useState(items[0].id)
  const group = items.find((g) => g.id === open) || items[0]
  return (
    <div className="sugg">
      <div className="sugg-title"><Icon name="sparkle" size={16} />{title}</div>
      <div className="sugg-cats" role="tablist" aria-label={title}>
        {items.map((g) => (
          <button key={g.id} type="button" role="tab" aria-selected={g.id === group.id} className={`sugg-cat${g.id === group.id ? ' on' : ''}`} onClick={() => setOpen(g.id)}>{g[language]}</button>
        ))}
      </div>
      <ul className="sugg-list">
        {group.items.map((p) => (
          <li key={p.en}><button type="button" className="sugg-item" dir="auto" onClick={() => onPick(p[language])}>{p[language]}</button></li>
        ))}
      </ul>
    </div>
  )
}
