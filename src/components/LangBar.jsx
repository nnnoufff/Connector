import { useState } from 'react'
import Icon from './Icons.jsx'
import LangSheet from './LangSheet.jsx'
import { useApp } from '../state/AppContext.jsx'

/** [ From ▾ ]  ⇄  [ To ▾ ] : two language pills that open the "Choose a language" sheet. */
export default function LangBar({ from, to, fromItems, toItems, onFrom, onTo, onSwap, className = '' }) {
  const { messages: m } = useApp()
  const [open, setOpen] = useState(null) // 'from' | 'to' | null
  const label = (items, code) => items.find((i) => i.code === code)?.label ?? code
  return (
    <>
      <div className={`langs ${className}`}>
        <button type="button" className="lang-btn" aria-label={m.from} aria-haspopup="dialog" onClick={() => setOpen('from')}>
          <span dir="auto">{label(fromItems, from)}</span><Icon name="chevronDown" size={15} />
        </button>
        <button type="button" className="swap-btn" onClick={onSwap} aria-label={m.swap} title={m.swap}><Icon name="swap" size={18} /></button>
        <button type="button" className="lang-btn" aria-label={m.to} aria-haspopup="dialog" onClick={() => setOpen('to')}>
          <span dir="auto">{label(toItems, to)}</span><Icon name="chevronDown" size={15} />
        </button>
      </div>
      <LangSheet open={open === 'from'} onClose={() => setOpen(null)} title={m.chooseLanguage} searchLabel={m.searchLanguages} emptyText={m.noResults} items={fromItems} value={from} onPick={onFrom} />
      <LangSheet open={open === 'to'} onClose={() => setOpen(null)} title={m.chooseLanguage} searchLabel={m.searchLanguages} emptyText={m.noResults} items={toItems} value={to} onPick={onTo} />
    </>
  )
}
