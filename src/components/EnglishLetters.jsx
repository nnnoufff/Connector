import { useEffect, useRef, useState } from 'react'
import * as ort from 'onnxruntime-web/wasm'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'

// English (ASL) fingerspelling from the camera: MediaPipe hand landmarks -> small ONNX classifier.
// Model: nocontextdoruk/asl-landmark-mlp (CC BY-NC 4.0). Files go in public/models/asl/.
const BASE = import.meta.env.BASE_URL
const HOLD_FRAMES = 14 // a letter must be held steady this long to be typed
const MIN_CONF = 0.7

const TX = {
  en: { off: 'Camera is off', loading: 'Loading models…', starting: 'Starting camera…', ready: 'Show a hand and hold each letter still', insecure: 'On phones the camera only works over a secure (https) link. Open the deployed site instead of the local address.', missing: 'The English letter model files are missing from public/models/asl.', blocked: 'Camera is blocked. Allow the camera in the address bar.', fail: 'Could not start the camera', note: 'Fingerspelling only (A–Z). Hold each letter until it is typed.', space: '␣ Space', stop: '■ Stop camera', start: '📷 Start camera' },
  ar: { off: 'الكاميرا متوقفة', loading: 'جارٍ تحميل النماذج…', starting: 'جارٍ تشغيل الكاميرا…', ready: 'أظهر يدك وثبّت كل حرف لحظة', insecure: 'الكاميرا على الجوال تعمل فقط عبر رابط آمن (https). افتح الموقع المنشور بدل الرابط المحلي.', missing: 'ملفات نموذج الحروف الإنجليزية غير موجودة في public/models/asl.', blocked: 'الكاميرا محظورة. اسمح باستخدامها من شريط العنوان.', fail: 'تعذر تشغيل الكاميرا', note: 'هجاء الأحرف فقط (A–Z). ثبّت كل حرف حتى يُكتب.', space: '␣ مسافة', stop: '■ إيقاف الكاميرا', start: '📷 تشغيل الكاميرا' },
}
const tx = () => TX[document.documentElement.lang === 'ar' ? 'ar' : 'en']

function normalize(pts) {
  const w = pts[0]
  const rel = pts.map((p) => [p.x - w.x, p.y - w.y, p.z - w.z])
  const scale = Math.hypot(rel[9][0], rel[9][1], rel[9][2]) || 1
  return rel.map((p) => p.map((v) => v / scale))
}

function softmax(a) {
  const m = Math.max(...a)
  const e = a.map((v) => Math.exp(v - m))
  const s = e.reduce((x, y) => x + y, 0)
  return e.map((v) => v / s)
}

export default function EnglishLetters({ onText, controlRef }) {
  const videoRef = useRef(null)
  const [status, setStatus] = useState(() => tx().off)
  const [running, setRunning] = useState(false)
  const [live, setLive] = useState('')
  const state = useRef({ letters: [], stream: null, raf: 0, hand: null, session: null, classes: null, steady: 0, last: '', locked: '', lost: 0 })

  const emit = () => onText?.(state.current.letters.join(''))

  useEffect(() => {
    if (controlRef) {
      controlRef.current = {
        undo: () => { state.current.letters.pop(); emit() },
        clear: () => { state.current.letters = []; emit() },
        space: () => { const l = state.current.letters; if (l.length && l[l.length - 1] !== ' ') { l.push(' '); emit() } },
      }
    }
    return () => { stop(); if (controlRef) controlRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadModels() {
    const s = state.current
    if (s.hand && s.session) return
    setStatus(tx().loading)
    const fileset = await FilesetResolver.forVisionTasks(`${BASE}runtime/mediapipe`)
    const make = (delegate) => HandLandmarker.createFromOptions(fileset, { baseOptions: { modelAssetPath: `${BASE}mediapipe/hand_landmarker.task`, delegate }, runningMode: 'VIDEO', numHands: 1 })
    try { s.hand = await make('GPU') } catch { s.hand = await make('CPU') }
    const res = await fetch(`${BASE}models/asl/mlp_classes.json`)
    if (!res.ok) throw new Error('model-missing')
    s.classes = await res.json()
    ort.env.wasm.numThreads = 1
    s.session = await ort.InferenceSession.create(`${BASE}models/asl/mlp_asl.onnx`, { executionProviders: ['wasm'] })
  }

  const label = (i) => (Array.isArray(state.current.classes) ? state.current.classes[i] : state.current.classes[String(i)])

  async function classify(flat) {
    const s = state.current
    const out = await s.session.run({ [s.session.inputNames[0]]: new ort.Tensor('float32', Float32Array.from(flat), [1, 63]) })
    const probs = softmax(Array.from(out[s.session.outputNames[0]].data))
    // letters only: skip the digit classes
    let best = -1
    for (let i = 0; i < probs.length; i++) {
      const l = label(i)
      if (/^[A-Za-z]$/.test(l) && (best < 0 || probs[i] > probs[best])) best = i
    }
    return { letter: label(best).toUpperCase(), p: probs[best] }
  }

  async function loop() {
    const s = state.current
    const v = videoRef.current
    if (!s.stream || !v) return
    if (v.readyState >= 2) {
      const res = s.hand.detectForVideo(v, performance.now())
      const pts = res.landmarks?.[0]
      if (pts) {
        s.lost = 0
        const n = normalize(pts)
        let r = await classify(n.flat())
        if (r.p < MIN_CONF) {
          // the model may expect the other hand: try the mirrored shape too
          const m = await classify(n.map(([x, y, z]) => [-x, y, z]).flat())
          if (m.p > r.p) r = m
        }
        if (r.p >= MIN_CONF) {
          setLive(r.letter)
          if (r.letter === s.last) s.steady++
          else { s.last = r.letter; s.steady = 1; if (r.letter !== s.locked) s.locked = '' }
          if (s.steady >= HOLD_FRAMES && s.locked !== r.letter) {
            s.locked = r.letter
            s.letters.push(r.letter)
            emit()
          }
        } else { setLive(''); s.steady = 0; s.last = '' }
      } else {
        setLive('')
        s.steady = 0
        s.last = ''
        if (++s.lost > 10) s.locked = '' // hand left the picture: the same letter can be typed again
      }
    }
    s.raf = requestAnimationFrame(loop)
  }

  async function start() {
    const s = state.current
    if (!navigator.mediaDevices) { setStatus(tx().insecure); return }
    try {
      await loadModels()
      setStatus(tx().starting)
      s.stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      videoRef.current.srcObject = s.stream
      await videoRef.current.play()
      setRunning(true)
      setStatus(tx().ready)
      loop()
    } catch (e) {
      stop()
      const m = String(e?.message || e)
      setStatus(m === 'model-missing' ? tx().missing : /NotAllowed|Permission/i.test(m) ? tx().blocked : `${tx().fail}: ${m}`)
    }
  }

  function stop() {
    const s = state.current
    cancelAnimationFrame(s.raf)
    s.stream?.getTracks().forEach((t) => t.stop())
    s.stream = null
    setRunning(false)
    setLive('')
  }

  return (
    <div className="en-letters">
      <div className="en-stage">
        <video ref={videoRef} muted playsInline className="en-video" />
        {live && <div className="en-live">{live}</div>}
        <div className="en-status">{status}</div>
      </div>
      <div className="card-footer">
        <span className="sample-note">{tx().note}</span>
        <div className="actions">
          <button type="button" className="btn-ghost" onClick={() => controlRef?.current?.space()}>{tx().space}</button>
          <button type="button" className={running ? 'btn-ghost' : 'btn-primary'} onClick={running ? stop : start}>{running ? tx().stop : tx().start}</button>
        </div>
      </div>
    </div>
  )
}
