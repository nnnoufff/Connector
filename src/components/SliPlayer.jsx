import { useEffect, useRef } from 'react'
import ShadowMount from './ShadowMount.jsx'
import { SignPlayer } from '../sli/ui/player'
import { plan } from '../sli/translate/planner'

/** Plays Arabic text as real signer videos (SLI dictionary). Re-plays whenever `runKey` changes. */
export default function SliPlayer({ text, runKey }) {
  const playerRef = useRef(null)
  const textRef = useRef(text)
  textRef.current = text

  useEffect(() => {
    if (runKey && playerRef.current) playerRef.current.load(plan(textRef.current || ''))
  }, [runKey])

  return (
    <ShadowMount
      build={(box) => {
        const player = new SignPlayer()
        playerRef.current = player
        box.append(player.el)
        return () => {
          player.stop()
          playerRef.current = null
        }
      }}
    />
  )
}
