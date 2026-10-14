import { useRef, useState } from 'react'
import { micErrorText, startListening } from '../services/voice.js'

/**
 * Voice typing. Always usable from the UI: when the browser has no speech recognition the person gets a
 * clear message (phones can still dictate with the keyboard's own microphone key).
 */
export default function useDictation({ getLang, onInterim, onText, setNote, unsupportedText }) {
  const [listening, setListening] = useState(false)
  const stopRef = useRef(null)
  const toggle = () => {
    if (stopRef.current) { stopRef.current(); return }
    setNote('')
    setListening(true)
    stopRef.current = startListening(getLang(), {
      onInterim,
      onText,
      onEnd: () => { stopRef.current = null; setListening(false) },
      onError: (c) => setNote(c === 'unsupported' ? unsupportedText : micErrorText(c)),
    })
  }
  return { listening, toggle }
}
