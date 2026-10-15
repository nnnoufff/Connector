// Connector logo (image): dark-ink wordmark in light mode, white wordmark in dark mode, all-white on the purple splash.
export default function Logo({ variant = 'auto', className = '', label = 'Connector' }) {
  if (variant === 'white') return <span className={`logo ${className}`}><img className="logo-img" src="/logo-white.png" alt={label} /></span>
  return (
    <span className={`logo ${className}`}>
      <img className="logo-img logo-l" src="/logo-light.png" alt={label} />
      <img className="logo-img logo-d" src="/logo-dark.png" alt="" aria-hidden="true" />
    </span>
  )
}
