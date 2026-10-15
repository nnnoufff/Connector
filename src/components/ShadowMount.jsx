import { useEffect, useRef } from 'react'
import sliCss from '../sli/styles.css?inline'
import { setUiLang } from '../sli/i18n'

// SLI's own stylesheet is global (:root, body, .btn ...). Mounting its elements inside a shadow
// root keeps that CSS from touching the rest of the site, and the site's CSS from touching SLI.
const scoped = sliCss.replace(/:root/g, ':host').replace(/(^|\n)body\b/g, '$1:host')
const extra = `
:host { display: block; background: transparent; color: var(--x-ink); font-family: var(--x-font);
  --bg: transparent; --surface: var(--x-surface); --surface-2: var(--x-panel); --ink: var(--x-ink); --muted: var(--x-muted);
  --line: var(--x-line); --brand: var(--x-brand); --brand-ink: #fff; --font: var(--x-font); --radius-l: 22px; --stage: #1d1a22; }
.capture-actions a { display: none; }
.stage { width: max(min(100%, calc((100vh - 540px) * 1.333), 600px), min(100%, 260px)); margin-inline: auto; }
.mode-hint { margin: 6px 0; font-size: 12px; }
@media (max-width: 900px) { .stage { width: 100%; } }
`

/** build(container) mounts something into the container and returns a cleanup function. */
export default function ShadowMount({ build, className }) {
  const hostRef = useRef(null)
  const buildRef = useRef(build)
  buildRef.current = build

  useEffect(() => {
    setUiLang(document.documentElement.lang === 'ar' ? 'ar' : 'en')
    const host = hostRef.current
    const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = scoped + extra
    const box = document.createElement('div')
    root.replaceChildren(style, box)
    const cleanup = buildRef.current(box)
    return () => {
      cleanup?.()
      root.replaceChildren()
    }
  }, [])

  return <div ref={hostRef} className={className} />
}
