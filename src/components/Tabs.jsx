/** Simple accessible tab bar. items: [{ id, label, icon? }] */
import Icon from './Icons.jsx'

export default function Tabs({ items, value, onChange, label }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map((t) => (
        <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={value === t.id} aria-controls={`panel-${t.id}`} className={`tab${value === t.id ? ' on' : ''}`} onClick={() => onChange(t.id)}>
          {t.icon && <Icon name={t.icon} size={17} />}<span>{t.label}</span>
        </button>
      ))}
    </div>
  )
}
