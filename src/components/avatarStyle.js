import * as THREE from 'three'

// Dresses the Avaturn avatar in code: dark suit with long sleeves, white shirt, green tie, short hair.
// No extra assets. Pieces are attached to bones so they follow the signing animation.
export function styleAvatar(root) {
  root.updateMatrixWorld(true)
  const look = root.getObjectByName('avaturn_look_0')
  const body = root.getObjectByName('avaturn_body')
  const get = (n) => root.getObjectByName(n)
  const wpos = (o) => o.getWorldPosition(new THREE.Vector3())
  const vp = (mesh, i, out) => (mesh.getVertexPosition(i, out), out.applyMatrix4(mesh.matrixWorld))
  const SUIT = 0x1c2733
  const suitMat = new THREE.MeshStandardMaterial({ color: SUIT, roughness: 0.85 })
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.9, side: THREE.DoubleSide })
  const tieMat = new THREE.MeshStandardMaterial({ color: 0x173b33, roughness: 0.6, side: THREE.DoubleSide })
  const info = {}

  // 1) solid suit colour instead of the football jersey texture
  if (look) {
    const m = look.material
    m.map = null; m.color.set(SUIT); m.roughness = 0.85; m.metalness = 0; m.needsUpdate = true
  }

  // 2) white shirt V + tie on the chest (front surface found from the mesh)
  const spine = get('Spine2') || get('Spine1') || get('Spine')
  const neck = get('Neck')
  if (look && spine && neck) {
    const ny = wpos(neck).y
    let front = -1e9
    const v = new THREE.Vector3()
    const pc = look.geometry.attributes.position.count
    for (let i = 0; i < pc; i++) { vp(look, i, v); if (v.y > ny - 0.2 && v.y < ny - 0.02 && Math.abs(v.x) < 0.05) front = Math.max(front, v.z) }
    info.front = front
    const z = front + 0.004
    const top = ny + 0.015, bot = ny - 0.2
    const mk = (pts, mat, dz) => {
      const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)))
      const mesh = new THREE.Mesh(new THREE.ShapeGeometry(sh), mat)
      mesh.position.set(0, 0, z + dz)
      root.add(mesh); spine.attach(mesh)
    }
    mk([[-0.07, top], [0.07, top], [0.0, bot]], shirtMat, 0)               // shirt V
    mk([[-0.014, top - 0.03], [0.014, top - 0.03], [0.02, bot + 0.03], [0, bot], [-0.02, bot + 0.03]], tieMat, 0.003) // tie
    mk([[-0.02, top - 0.005], [0.02, top - 0.005], [0.015, top - 0.04], [-0.015, top - 0.04]], tieMat, 0.004)        // knot
  }

  // 3) long sleeves: cylinders along arm bones
  for (const side of ['Right', 'Left']) {
    const a = get(side + 'Arm'), f = get(side + 'ForeArm'), h = get(side + 'Hand')
    if (!a || !f || !h) continue
    const seg = (from, to, t0, t1, r0, r1, parent) => {
      const p0 = wpos(from).lerp(wpos(to), t0), p1 = wpos(from).lerp(wpos(to), t1)
      const len = p0.distanceTo(p1)
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 16, 1, true), suitMat)
      mesh.material.side = THREE.DoubleSide
      mesh.position.copy(p0.clone().add(p1).multiplyScalar(0.5))
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p1.clone().sub(p0).normalize())
      root.add(mesh); parent.attach(mesh)
    }
    seg(a, f, 0.45, 1.1, 0.064, 0.058, a)
    seg(f, h, -0.1, 0.97, 0.058, 0.044, f)
    const el = new THREE.Mesh(new THREE.SphereGeometry(0.062, 16, 12), suitMat)
    el.position.copy(wpos(f)); root.add(el); f.attach(el)
  }

  // 4) short hair: a cap over the top/back of the head, hairline above the forehead
  const head = get('Head')
  if (head && body) {
    const hp = wpos(head)
    const p = body.geometry.attributes.position
    const bv = new THREE.Vector3()
    let top = -1e9, w = 0, front = -1e9, back = 1e9
    for (let i = 0; i < p.count; i++) {
      vp(body, i, bv)
      if (bv.y > hp.y) { top = Math.max(top, bv.y); w = Math.max(w, Math.abs(bv.x)); front = Math.max(front, bv.z); back = Math.min(back, bv.z) }
    }
    const cy = hp.y + 0.08, cz = (front + back) / 2
    const rx = w * 1.09, ry = (top - cy) * 1.12, rz = ((front - back) / 2) * 1.1
    const geo = new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.5)
    const hair = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x241810, roughness: 0.95 }))
    hair.scale.set(rx, ry, rz)
    hair.position.set(0, cy, cz)
    hair.rotation.x = -0.3
    root.add(hair); head.attach(hair)
    info.hair = { top, w, front, back }
  }
  return info
}
