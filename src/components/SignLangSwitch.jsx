import Icon from './Icons.jsx'

/** The one place where the person chooses which sign language is used: Arabic or English (ASL). */
export default function SignLangSwitch({ value, onChange, messages }) {
  return (
    <label className="pick">
      <span className="pick-label"><Icon name="hand" size={17} />{messages.signLanguage}</span>
      <span className="select-wrap">
        <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={messages.signLanguage}>
          <option value="ar">{messages.arabicSign}</option>
          <option value="en">{messages.englishSign}</option>
        </select>
      </span>
    </label>
  )
}
