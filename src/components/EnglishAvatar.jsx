import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { styleAvatar } from './avatarStyle.js'
import { compileUtterance, signLookup } from '@three-ws/sign-language'

// Experimental: a 3D avatar signs English text (ASL vocabulary + fingerspelling) in the browser.
// Avatar file: any humanoid .glb with finger bones. Bone names Hips, RightHand, RightHandIndex1 ... (Mixamo's 'mixamorig:' prefix is stripped).
// Included in public/avatars/: man-suit.glb (default), michelle.glb, cz.glb (Avaturn, gets the code-made suit).
const AVATAR_URL = '/avatars/man-suit.glb'

/** Plays `text` on the avatar whenever `runKey` changes. onInfo({signed, spelled, seconds}) reports what happened. */
export default function EnglishAvatar({ text, runKey, onInfo }) {
  const hostRef = useRef(null)
  const api = useRef(null)
  const [status, setStatus] = useState('Loading avatar…')
  const [caption, setCaption] = useState('')
  const timers = useRef([])

  useEffect(() => {
    const host = hostRef.current
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    host.appendChild(renderer.domElement)
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'
    const scene = new THREE.Scene()
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a9a90, 2.1))
    const key = new THREE.DirectionalLight(0xffffff, 2)
    key.position.set(1, 2, 3)
    scene.add(key)
    const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 50)
    let mixer = null
    let root = null
    let idle = null
    let lastClip = null
    let raf = 0
    let disposed = false
    const clock = new THREE.Clock()

    const resize = () => {
      const w = host.clientWidth || 400
      const h = host.clientHeight || 400
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()

    new GLTFLoader().load(
      AVATAR_URL,
      (gltf) => {
        if (disposed) return
        root = gltf.scene
        scene.add(root)
        root.traverse((o) => { if (o.name?.startsWith('mixamorig')) o.name = o.name.replace(/^mixamorig:?/, '') })
        if (root.getObjectByName('avaturn_look_0')) { try { styleAvatar(root) } catch (e) { console.warn('avatar styling skipped', e) } }
        mixer = new THREE.AnimationMixer(root)
        if (gltf.animations[0]) { idle = mixer.clipAction(gltf.animations[0]); idle.play() }
        else {
          // No idle animation in the file: hold the first frame of a signing clip (arms down) as the rest pose.
          const rc = compileUtterance('a', { signs: signLookup({ dominant: 'Right' }) }).clip
          rc.tracks = rc.tracks.filter((t) => t.values.length % t.times.length === 0 && !t.name.startsWith('Face'))
          const pc = THREE.AnimationClip.parse(rc); pc.uuid = THREE.MathUtils.generateUUID()
          idle = mixer.clipAction(pc); idle.play(); idle.paused = true; idle.time = 0
          const r = idle.reset.bind(idle)
          idle.reset = () => { r(); idle.paused = true; idle.time = 0; return idle }
        }
        // frame head to waist so the hands stay in view
        const head = root.getObjectByName('Head')
        const hp = new THREE.Vector3()
        head?.getWorldPosition(hp)
        const y = hp.y - 0.28
        camera.position.set(0, y + 0.05, 2.2)
        camera.lookAt(0, y, 0)
        setStatus('')
      },
      undefined,
      () => setStatus('Avatar file not found. Put an Avaturn .glb at public/avatar.glb.'),
    )

    api.current = {
      play(text) {
        if (!mixer) return null
        const signs = signLookup({ dominant: 'Right' })
        let res = compileUtterance(text, { signs })
        // Only sign when every word is in the ASL lexicon; otherwise show the whole text as letters.
        if (res.spelled.length > 0) res = compileUtterance(text, { signs: () => null })
        const { clip, signed, spelled } = res
        // Caption: show the word / letter being signed, in sync with the animation.
        timers.current.forEach(clearTimeout); timers.current = []
        const at = (sec, txt) => timers.current.push(setTimeout(() => setCaption(txt), sec * 1000))
        for (const seg of res.segments || []) {
          if (seg.letters?.length) seg.letters.forEach((l) => { at(l.start, `${seg.word}  ·  ${l.letter}`) })
          else at(seg.start, seg.word)
        }
        at(clip.duration, '')
        // The package's face tracks are malformed (values do not match times) and make three.js loop forever,
        // and this avatar has no 'Face' mesh anyway, so drop them.
        clip.tracks = clip.tracks.filter((t) => t.values.length % t.times.length === 0 && !t.name.startsWith('Face'))
        const parsed = THREE.AnimationClip.parse(clip)
        // parse() leaves uuid undefined, so the mixer would reuse the FIRST cached action for every text.
        parsed.uuid = THREE.MathUtils.generateUUID()
        mixer.stopAllAction()
        if (lastClip) mixer.uncacheClip(lastClip)
        lastClip = parsed
        const action = mixer.clipAction(parsed)
        action.setLoop(THREE.LoopOnce, 1)
        action.clampWhenFinished = false
        mixer.stopAllAction()
        action.reset().play()
        const onDone = (e) => { if (e.action === action) { mixer.removeEventListener('finished', onDone); mixer.stopAllAction(); idle?.reset().play() } }
        mixer.addEventListener('finished', onDone)
        return { signed, spelled, seconds: clip.duration }
      },
    }

    const loop = () => {
      raf = requestAnimationFrame(loop)
      mixer?.update(clock.getDelta())
      renderer.render(scene, camera)
    }
    loop()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.dispose()
      host.removeChild(renderer.domElement)
      api.current = null
    }
  }, [])

  useEffect(() => {
    if (!runKey || !text?.trim()) return
    let tries = 0
    const go = () => {
      const info = api.current?.play(text)
      if (info) onInfo?.(info)
      else if (tries++ < 40) setTimeout(go, 250) // avatar still loading
    }
    go()
  }, [runKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="avatar-stage">
      <div ref={hostRef} className="avatar-canvas" />
      {status && <div className="en-status">{status}</div>}
      {caption && <div className="en-caption">{caption}</div>}
    </div>
  )
}
