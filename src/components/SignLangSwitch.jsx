import Icon from './Icons.jsx'

/** Which sign language is used: Arabic or English (ASL). A two-option segmented control. */
export default function SignLangSwitch({ value, onChange, messages }) {
  return (
    <div className="seg-wrap">
      <span className="pick-label"><Icon name="hand" size={17} />{messages.signLanguage}</span>
      <div className="seg" role="group" aria-label={messages.signLanguage}>
        {[['ar', messages.arabicSign], ['en', messages.englishSign]].map(([code, name]) => (
          <button key={code} type="button" className={value === code ? 'on' : ''} aria-pressed={value === code} onClick={() => onChange(code)}>{name}</button>
        ))}
      </div>
    </div>
  )
}
