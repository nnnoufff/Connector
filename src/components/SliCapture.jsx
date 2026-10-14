import ShadowMount from './ShadowMount.jsx'
import { Capture } from '../sli/ui/capture'
import { Sentence } from '../sli/ui/sentence'

/** Camera + sign recognition from SLI. Calls onText(text) with the recognised text (Arabic).
 *  controlRef.current gets { undo(), clear() } so the page can offer delete buttons. */
export default function SliCapture({ onText, controlRef }) {
  return (
    <ShadowMount
      build={(box) => {
        let mode = () => 'auto'
        const sentence = new Sentence((text) => {
          if (mode() !== 'sentences') onText?.(text)
        })
        const capture = new Capture(sentence, undefined, (text) => onText?.(text))
        mode = () => capture.currentMode
        if (controlRef) {
          controlRef.current = {
            undo: () => sentence.undo(),
            clear: () => { sentence.clear(); onText?.('') },
          }
        }
        box.append(capture.el)
        return () => {
          capture.destroy()
          if (controlRef) controlRef.current = null
        }
      }}
    />
  )
}
