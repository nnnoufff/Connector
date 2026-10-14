const P = {
  hand: <path d="M8 12V5a1.5 1.5 0 0 1 3 0v5-7a1.5 1.5 0 0 1 3 0v7-5a1.5 1.5 0 0 1 3 0v6l1-2a1.5 1.5 0 0 1 3 1l-2 6a5 5 0 0 1-5 4h-2a5 5 0 0 1-4-2l-3-4a1.5 1.5 0 0 1 2-2l2 2" />,
  text: <><path d="M4 6h16M4 12h16M4 18h10" /><path d="m17 16 2 2 3-4" /></>,
  translate: <><path d="M4 5h10M9 3v2c0 5-2 8-5 10" /><path d="M6 9c1 2 3 4 5 5M13 15l3-8 3 8M14 13h4" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  speaker: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>,
  undo: <><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></>,
  home: <><path d="M3 11 12 4l9 7" /><path d="M5 10v10h5v-6h4v6h5V10" /></>,
  camera: <><path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><circle cx="12" cy="13" r="3.5" /></>,
  swap: <><path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" /></>,
  check: <path d="m5 12 5 5 9-10" />,
  play: <path d="M7 4.5v15l12-7.5Z" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
  sparkle: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" /><path d="M19 17v4M17 19h4" /></>,
  bulb: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.6 3.6 5.6 3.6 9S14.6 18.4 12 21M12 3c-2.6 2.6-3.6 5.6-3.6 9S9.4 18.4 12 21" /></>,
  replay: <><path d="M4 12a8 8 0 1 0 3-6.2" /><path d="M4 4v5h5" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
}

export default function Icon({ name, size = 20 }) {
  const filled = name === 'play' || name === 'stop'
  return (
    <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {P[name]}
    </svg>
  )
}
