const P = {
  hand: <path d="M8 12V5a1.5 1.5 0 0 1 3 0v5-7a1.5 1.5 0 0 1 3 0v7-5a1.5 1.5 0 0 1 3 0v6l1-2a1.5 1.5 0 0 1 3 1l-2 6a5 5 0 0 1-5 4h-2a5 5 0 0 1-4-2l-3-4a1.5 1.5 0 0 1 2-2l2 2" />,
  text: <><path d="M4 6h16M4 12h16M4 18h10" /><path d="m17 16 2 2 3-4" /></>,
  translate: <><path d="M4 5h10M9 3v2c0 5-2 8-5 10" /><path d="M6 9c1 2 3 4 5 5M13 15l3-8 3 8M14 13h4" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  speaker: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>,
  undo: <><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></>,
  camera: <><path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><circle cx="12" cy="13" r="3.5" /></>,
  swap: <><path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" /></>,
  check: <path d="m5 12 5 5 9-10" />,
  play: <path d="M7 4.5v15l12-7.5Z" />,
  pause: <><rect x="6" y="5" width="4" height="14" rx="1.2" /><rect x="14" y="5" width="4" height="14" rx="1.2" /></>,
  stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
  sparkle: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" /><path d="M19 17v4M17 19h4" /></>,
  bulb: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.6 3.6 5.6 3.6 9S14.6 18.4 12 21M12 3c-2.6 2.6-3.6 5.6-3.6 9S9.4 18.4 12 21" /></>,
  replay: <><path d="M4 12a8 8 0 1 0 3-6.2" /><path d="M4 4v5h5" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  settings: <><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2.2" /><circle cx="9" cy="17" r="2.2" /></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></>,
  monitor: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  bookmark: <path d="M6 4h12v17l-6-4.5L6 21Z" />,
  star: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8Z" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  chevron: <path d="m9 6 6 6-6 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  back: <path d="m15 6-6 6 6 6" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  history: <><path d="M4 12a8 8 0 1 0 2.5-5.8" /><path d="M4 4v4.5h4.5M12 8v4l3 2" /></>,
  language: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.6 3.6 5.6 3.6 9S14.6 18.4 12 21M12 3c-2.6 2.6-3.6 5.6-3.6 9S9.4 18.4 12 21" /></>,
  access: <><circle cx="12" cy="5" r="2" /><path d="M5 9l7 1.5L19 9M12 10.5V15l-3 5M12 15l3 5" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.6 2.6 0 1 1 3.6 2.4c-.7.4-1.1.9-1.1 1.8M12 17h.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5h.01" /></>,
  send: <path d="m21 3-9.5 18-2.5-7.5L3 11Zm-11.8 10.5L21 3" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></>,
  captions: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M7.5 11h3M7.5 14.5h6M14 11h2.5" /></>,
  vibrate: <><rect x="8" y="3.5" width="8" height="17" rx="2" /><path d="M4 8v8M20 8v8M1.5 10.5v3M22.5 10.5v3" /></>,
  alert: <><path d="M12 3.5 2.8 19.5h18.4Z" /><path d="M12 10v4.5M12 17.2h.01" /></>,
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c.8-4 3.7-6 7.5-6s6.7 2 7.5 6" /></>,
  shield: <path d="M12 3 4.5 6v5.5c0 4.5 3 8 7.5 9.5 4.5-1.5 7.5-5 7.5-9.5V6Z" />,
  home: <path d="M4 11 12 4l8 7v9h-5v-6H9v6H4Z" />,
}

const FILLED = ['play', 'pause', 'stop']

export default function Icon({ name, size = 20, fill = false }) {
  const filled = FILLED.includes(name) || fill
  return (
    <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke={filled && FILLED.includes(name) ? 'none' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {P[name]}
    </svg>
  )
}
