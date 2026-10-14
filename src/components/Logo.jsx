// Connector logo: two-people infinity mark (image) + live text, so the name stays sharp and translatable.
export default function Logo({ tone = 'light', tagline = true, className = '' }) {
  return (
    <span className={`logo ${tone} ${className}`}>
      <img className="logo-mark" src={tone === 'light' ? '/logo-mark-light.png' : '/logo-mark.png'} alt="" />
      <span className="logo-txt" dir="ltr">
        <b>Connector</b>
        {tagline && <small>COMMUNICATION WITHOUT BARRIERS</small>}
      </span>
    </span>
  )
}
