import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import type { SpaceObject } from './data'


const textureUrls: Record<string, string> = {
  sun: 'https://play.solarsystemscope.com/textures/download/2k_sun.jpg',
  mercury: 'https://play.solarsystemscope.com/textures/download/2k_mercury.jpg',
  venus: 'https://play.solarsystemscope.com/textures/download/2k_venus_surface.jpg',
  earth: 'https://play.solarsystemscope.com/textures/download/2k_earth_daymap.jpg',
  moon: 'https://play.solarsystemscope.com/textures/download/2k_moon.jpg',
  mars: 'https://play.solarsystemscope.com/textures/download/2k_mars.jpg',
  jupiter: 'https://play.solarsystemscope.com/textures/download/2k_jupiter.jpg',
  saturn: 'https://play.solarsystemscope.com/textures/download/2k_saturn.jpg',
  uranus: 'https://play.solarsystemscope.com/textures/download/2k_uranus.jpg',
  neptune: 'https://play.solarsystemscope.com/textures/download/2k_neptune.jpg'
}

function TexturedSphere({ item, radius, selected, onSelect }: {
  item: SpaceObject
  radius: number
  selected: boolean
  onSelect: (item: SpaceObject) => void
}) {
  const texture = useLoader(THREE.TextureLoader, textureUrls[item.id])
  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    return texture
  }, [texture])
  const isSun = item.id === 'sun'
  const rotation = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    if (rotation.current) rotation.current.rotation.y += isSun ? .0008 : .0019
  })
  return <mesh ref={rotation}
    onClick={e => { e.stopPropagation(); onSelect(item) }}
    onPointerOver={e => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
    onPointerOut={() => { document.body.style.cursor = 'auto' }}>
    <sphereGeometry args={[radius, 64, 64]} />
    <meshStandardMaterial
      map={texture}
      roughness={isSun ? .58 : .92}
      metalness={0}
      emissive={isSun ? '#ffffff' : selected ? item.color : '#000000'}
      emissiveMap={isSun ? texture : undefined}
      emissiveIntensity={isSun ? 1.05 : selected ? .1 : 0}
    />
  </mesh>
}

function EarthCloudLayer({ radius }: { radius: number }) {
  const clouds = useLoader(THREE.TextureLoader, 'https://play.solarsystemscope.com/textures/download/2k_earth_clouds.jpg')
  useMemo(() => {
    clouds.colorSpace = THREE.SRGBColorSpace
    clouds.anisotropy = 8
    return clouds
  }, [clouds])
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(() => { if (ref.current) ref.current.rotation.y += .00035 })
  return <mesh ref={ref} scale={1.018}>
    <sphereGeometry args={[radius, 64, 64]} />
    <meshStandardMaterial color="#ffffff" alphaMap={clouds} transparent opacity={.38} depthWrite={false} roughness={1} />
  </mesh>
}

function positionFor(item: SpaceObject, time: number, index: number) {
  if (item.id === 'sun') return new THREE.Vector3(0, 0, 0)
  if (item.id === 'moon') {
    const earthAngle = time * objectsSpeed('earth') + 3 * .7
    const moonAngle = time * item.speed * .075 + index * .7
    const earthX = Math.cos(earthAngle) * 4.25 * .66
    const earthZ = Math.sin(earthAngle) * 4.25 * .66 * .68
    return new THREE.Vector3(earthX + Math.cos(moonAngle) * .74, .12, earthZ + Math.sin(moonAngle) * .74)
  }
  const angle = time * item.speed * .075 + index * .7
  return new THREE.Vector3(
    Math.cos(angle) * item.orbit * .66,
    item.kind === 'Galaxy' ? 1.4 : item.kind === 'Nebula' ? -.7 : 0,
    Math.sin(angle) * item.orbit * .66 * .68
  )
}

function objectsSpeed(id: string) {
  return id === 'earth' ? .86 * .075 : .075
}

function OrbitTrack({ radius }: { radius: number }) {
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.035, 0]}>
    <ringGeometry args={[radius - .009, radius + .009, 180]} />
    <meshBasicMaterial color="#8292ad" transparent opacity={.19} side={THREE.DoubleSide} />
  </mesh>
}

function GalaxyStructure({ color }: { color: string }) {
  const geometry = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    const tint = new THREE.Color(color)
    for (let i = 0; i < 1700; i++) {
      const arm = i % 4
      const radius = .08 + Math.pow(Math.random(), .72) * 1.25
      const angle = arm * Math.PI / 2 + radius * 3.7 + (Math.random() - .5) * .62
      positions.push(Math.cos(angle) * radius, (Math.random() - .5) * .12, Math.sin(angle) * radius)
      const c = tint.clone().lerp(new THREE.Color('#fff1d7'), Math.random() * .48)
      colors.push(c.r, c.g, c.b)
    }
    const result = new THREE.BufferGeometry()
    result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    result.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return result
  }, [color])
  return <points geometry={geometry}>
    <pointsMaterial size={.024} vertexColors transparent opacity={.92} depthWrite={false} sizeAttenuation />
  </points>
}

function NebulaStructure({ color }: { color: string }) {
  return <group>
    {Array.from({ length: 9 }, (_, i) => (
      <mesh key={i} position={[
        Math.sin(i * 2.1) * .53,
        Math.cos(i * 1.7) * .3,
        Math.sin(i * .9) * .47
      ]} scale={[.38 + (i % 3) * .13, .3 + (i % 2) * .16, .35 + (i % 4) * .06]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={.12} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    ))}
    <Sparkles count={65} scale={2.1} size={2} speed={.22} opacity={.72} color={color} />
  </group>
}

function Planet({ item, index, selected, onSelect }: {
  item: SpaceObject
  index: number
  selected: boolean
  onSelect: (item: SpaceObject) => void
}) {
  const mesh = useRef<THREE.Mesh>(null!)
  const group = useRef<THREE.Group>(null!)
  const isSun = item.id === 'sun'
  const isEarth = item.id === 'earth'
  const isSaturn = item.id === 'saturn'
  const isBlackHole = item.kind === 'Black hole'
  const radius = item.size * .64
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: isBlackHole ? '#020308' : item.color,
    roughness: isSun ? .36 : .84,
    metalness: isBlackHole ? .18 : .025,
    emissive: isSun ? item.color : selected ? item.color : '#000000',
    emissiveIntensity: isSun ? 1.5 : selected ? .13 : .012
  }), [item.color, isSun, isBlackHole, selected])

  useFrame(({ clock }) => {
    if (!group.current) return
    const p = positionFor(item, clock.elapsedTime, index)
    group.current.position.copy(p)
    if (mesh.current && !isBlackHole) mesh.current.rotation.y += isSun ? .0008 : .0022
  })

  return <>
    {item.kind === 'Planet' && item.orbit > 0 && <OrbitTrack radius={item.orbit * .66} />}
    <group ref={group} position={[item.orbit * .66, 0, 0]}>
      {item.kind === 'Galaxy' ? <GalaxyStructure color={item.color} /> :
       item.kind === 'Nebula' ? <NebulaStructure color={item.color} /> : <>
        {textureUrls[item.id] ? (
          <Suspense fallback={<mesh material={material} onClick={e => { e.stopPropagation(); onSelect(item) }}>
            <sphereGeometry args={[radius, 48, 48]} />
          </mesh>}>
            <TexturedSphere item={item} radius={radius} selected={selected} onSelect={onSelect} />
          </Suspense>
        ) : (
          <mesh ref={mesh} material={material}
            onClick={e => { e.stopPropagation(); onSelect(item) }}
            onPointerOver={e => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
            onPointerOut={() => { document.body.style.cursor = 'auto' }}>
            <sphereGeometry args={[radius, 64, 64]} />
          </mesh>
        )}
        {isSun && <>
          <mesh scale={1.65}><sphereGeometry args={[radius, 40, 40]} /><meshBasicMaterial color="#ffbf69" transparent opacity={.075} side={THREE.BackSide} /></mesh>
          <mesh scale={2.2}><sphereGeometry args={[radius, 32, 32]} /><meshBasicMaterial color="#e89b51" transparent opacity={.025} side={THREE.BackSide} /></mesh>
        </>}
        {isEarth && <><mesh scale={1.12}><sphereGeometry args={[radius, 48, 48]} /><meshBasicMaterial color="#6ebbe9" transparent opacity={.13} side={THREE.BackSide} /></mesh><Suspense fallback={null}><EarthCloudLayer radius={radius} /></Suspense></>}
        {isSaturn && <mesh rotation={[Math.PI / 2.25, 0, 0]}>
          <ringGeometry args={[radius * 1.18, radius * 2.05, 128]} />
          <meshStandardMaterial color="#d7c29b" side={THREE.DoubleSide} transparent opacity={.76} roughness={1} />
        </mesh>}
        {isBlackHole && <>
          <mesh rotation={[Math.PI / 2.45, 0, 0]} scale={[1.75, .52, 1]}>
            <torusGeometry args={[radius * 1.16, radius * .25, 24, 140]} />
            <meshBasicMaterial color="#ffac62" transparent opacity={.82} />
          </mesh>
          <mesh rotation={[Math.PI / 2.45, 0, 0]} scale={[1.58, .38, 1]}>
            <torusGeometry args={[radius * 1.22, radius * .07, 16, 120]} />
            <meshBasicMaterial color="#fff0c2" transparent opacity={.7} />
          </mesh>
        </>}
        {selected && <mesh scale={1.3}>
          <sphereGeometry args={[radius, 36, 36]} />
          <meshBasicMaterial color="#f0c88e" wireframe transparent opacity={.28} />
        </mesh>}
      </>}
    </group>
  </>
}

function Scene({ items, selected, onSelect }: {
  items: SpaceObject[]
  selected: SpaceObject
  onSelect: (item: SpaceObject) => void
}) {
  const controls = useRef<any>(null)
  const { camera } = useThree()

  useEffect(() => {
    const index = items.findIndex(item => item.id === selected.id)
    const point = positionFor(selected, 0, Math.max(0, index))
    const distance = Math.max(5.5, selected.size * 8 + 3)
    camera.position.set(point.x + distance * .42, point.y + distance * .42, point.z + distance)
    controls.current?.target.copy(point)
    controls.current?.update()
  }, [camera, items, selected, selected.id])

  return <>
    <color attach="background" args={['#080b12']} />
    <fog attach="fog" args={['#080b12', 27, 78]} />
    <ambientLight intensity={.38} />
    <pointLight position={[0, 0, 0]} intensity={105} color="#ffd08a" distance={42} decay={2} />
    <hemisphereLight color="#b8c9e8" groundColor="#080a10" intensity={.2} />
    <Stars radius={110} depth={70} count={5200} factor={3.1} saturation={.26} fade speed={.22} />
    <Sparkles count={145} scale={54} size={1.7} speed={.16} opacity={.35} color="#9bb8e9" />
    {items.map((item, index) => <Suspense key={item.id} fallback={null}><Planet item={item} index={index} selected={selected.id === item.id} onSelect={onSelect} /></Suspense>)}
    <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={.06} minDistance={2.8} maxDistance={70} enablePan rotateSpeed={.58} zoomSpeed={.78} />
  </>
}

export default function Universe({ items, selected, onSelect }: {
  items: SpaceObject[]
  selected: SpaceObject
  onSelect: (item: SpaceObject) => void
}) {
  return <Canvas camera={{ position: [0, 11, 23], fov: 45, near: .1, far: 180 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: false }}>
    <Scene items={items} selected={selected} onSelect={onSelect} />
  </Canvas>
}
