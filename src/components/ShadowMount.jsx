import { useEffect, useRef } from 'react'
import sliCss from '../sli/styles.css?inline'
import { setUiLang } from '../sli/i18n'

// SLI's own stylesheet is global (:root, body, .btn ...). Mounting its elements inside a shadow
// root keeps that CSS from touching the rest of the site, and the site's CSS from touching SLI.
const scoped = sliCss.replace(/:root/g, ':host').replace(/(^|\n)body\b/g, '$1:host')
const extra = `
:host { display: block; background: transparent; color: inherit; }
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
