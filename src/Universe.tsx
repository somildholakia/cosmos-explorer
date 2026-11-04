import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
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

type DeviceProfile = {
  mobile: boolean
  lowPower: boolean
  pixelRatio: number
  starCount: number
  sparkleCount: number
  galaxyPoints: number
  geometryDetail: number
}

function getDeviceProfile(): DeviceProfile {
  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: { saveData?: boolean; effectiveType?: string }
  }
  const mobile = window.matchMedia('(max-width: 760px)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4
  const constrainedNetwork = nav.connection?.saveData === true || nav.connection?.effectiveType === '2g'
  const lowPower = mobile || lowMemory || constrainedNetwork
  return {
    mobile,
    lowPower,
    pixelRatio: lowPower ? 0.85 : Math.min(window.devicePixelRatio || 1, 1.35),
    starCount: lowPower ? 1050 : 4300,
    sparkleCount: lowPower ? 26 : 115,
    galaxyPoints: lowPower ? 520 : 1500,
    geometryDetail: lowPower ? 28 : 56
  }
}

/**
 * Loads one texture only while its object is selected, then disposes the GPU
 * resource when the user moves to another object. This avoids preloading ten
 * large maps into phone memory at the same time.
 */
function useDisposableTexture(url?: string) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    if (!url) {
      setTexture(null)
      return
    }

    let disposed = false
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    const loaded = loader.load(
      url,
      (ready) => {
        ready.colorSpace = THREE.SRGBColorSpace
        ready.anisotropy = 2
        if (disposed) ready.dispose()
        else setTexture(ready)
      },
      undefined,
      () => {
        if (!disposed) setTexture(null)
      }
    )

    return () => {
      disposed = true
      loaded.dispose()
    }
  }, [url])

  return texture
}

function positionFor(item: SpaceObject, time: number, index: number) {
  if (item.id === 'sun') return new THREE.Vector3(0, 0, 0)
  if (item.id === 'moon') {
    const earthAngle = time * (.86 * .075) + 3 * .7
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

function OrbitTrack({ radius }: { radius: number }) {
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.035, 0]}>
    <ringGeometry args={[radius - .009, radius + .009, 112]} />
    <meshBasicMaterial color="#8292ad" transparent opacity={.18} side={THREE.DoubleSide} />
  </mesh>
}

function GalaxyStructure({ color, pointsCount }: { color: string; pointsCount: number }) {
  const geometry = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    const tint = new THREE.Color(color)
    const light = new THREE.Color('#fff1d7')
    for (let i = 0; i < pointsCount; i++) {
      const arm = i % 4
      const radius = .08 + Math.pow(Math.random(), .72) * 1.25
      const angle = arm * Math.PI / 2 + radius * 3.7 + (Math.random() - .5) * .62
      positions.push(Math.cos(angle) * radius, (Math.random() - .5) * .12, Math.sin(angle) * radius)
      const c = tint.clone().lerp(light, Math.random() * .48)
      colors.push(c.r, c.g, c.b)
    }
    const result = new THREE.BufferGeometry()
    result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    result.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return result
  }, [color, pointsCount])

  useEffect(() => () => geometry.dispose(), [geometry])

  return <points geometry={geometry}>
    <pointsMaterial size={.024} vertexColors transparent opacity={.92} depthWrite={false} sizeAttenuation />
  </points>
}

function NebulaStructure({ color, simple }: { color: string; simple: boolean }) {
  const cloudCount = simple ? 5 : 9
  return <group>
    {Array.from({ length: cloudCount }, (_, i) => (
      <mesh key={i} position={[
        Math.sin(i * 2.1) * .53,
        Math.cos(i * 1.7) * .3,
        Math.sin(i * .9) * .47
      ]} scale={[.38 + (i % 3) * .13, .3 + (i % 2) * .16, .35 + (i % 4) * .06]}>
        <sphereGeometry args={[1, simple ? 12 : 20, simple ? 12 : 20]} />
        <meshBasicMaterial color={color} transparent opacity={.12} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    ))}
    <Sparkles count={simple ? 18 : 65} scale={2.1} size={2} speed={.18} opacity={.72} color={color} />
  </group>
}

function EarthCloudLayer({ radius }: { radius: number }) {
  const clouds = useDisposableTexture('https://play.solarsystemscope.com/textures/download/2k_earth_clouds.jpg')
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(() => { if (ref.current) ref.current.rotation.y += .0003 })
  if (!clouds) return null

  return <mesh ref={ref} scale={1.018}>
    <sphereGeometry args={[radius, 32, 32]} />
    <meshStandardMaterial color="#ffffff" alphaMap={clouds} transparent opacity={.3} depthWrite={false} roughness={1} />
  </mesh>
}

function Planet({ item, index, selected, onSelect, profile }: {
  item: SpaceObject
  index: number
  selected: boolean
  onSelect: (item: SpaceObject) => void
  profile: DeviceProfile
}) {
  const mesh = useRef<THREE.Mesh>(null!)
  const group = useRef<THREE.Group>(null!)
  const isSun = item.id === 'sun'
  const isEarth = item.id === 'earth'
  const isSaturn = item.id === 'saturn'
  const isBlackHole = item.kind === 'Black hole'
  const radius = item.size * .64
  const texture = useDisposableTexture(selected ? textureUrls[item.id] : undefined)

  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.position.copy(positionFor(item, clock.elapsedTime, index))
    if (mesh.current && !isBlackHole) mesh.current.rotation.y += isSun ? .0008 : .0018
  })

  return <>
    {item.kind === 'Planet' && item.orbit > 0 && <OrbitTrack radius={item.orbit * .66} />}
    <group ref={group} position={[item.orbit * .66, 0, 0]}>
      {item.kind === 'Galaxy' ? <>
        <GalaxyStructure color={item.color} pointsCount={profile.galaxyPoints} />
        <mesh onClick={e => { e.stopPropagation(); onSelect(item) }}
          onPointerOver={e => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
          onPointerOut={() => { document.body.style.cursor = 'auto' }}>
          <sphereGeometry args={[Math.max(radius * 1.25, .68), 20, 20]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </> : item.kind === 'Nebula' ? <>
        <NebulaStructure color={item.color} simple={profile.lowPower} />
        <mesh onClick={e => { e.stopPropagation(); onSelect(item) }}
          onPointerOver={e => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
          onPointerOut={() => { document.body.style.cursor = 'auto' }}>
          <sphereGeometry args={[Math.max(radius * 1.2, .62), 20, 20]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </> : <>
        <mesh ref={mesh}
          onClick={e => { e.stopPropagation(); onSelect(item) }}
          onPointerOver={e => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
          onPointerOut={() => { document.body.style.cursor = 'auto' }}>
          <sphereGeometry args={[radius, profile.geometryDetail, profile.geometryDetail]} />
          <meshStandardMaterial
            map={texture ?? undefined}
            color={texture ? '#ffffff' : isBlackHole ? '#020308' : item.color}
            roughness={isSun ? .58 : .84}
            metalness={isBlackHole ? .18 : .025}
            emissive={isSun ? item.color : selected ? item.color : '#000000'}
            emissiveMap={isSun ? texture ?? undefined : undefined}
            emissiveIntensity={isSun ? .8 : selected ? .1 : .012}
          />
        </mesh>
        {isSun && <>
          <mesh scale={1.65}><sphereGeometry args={[radius, 32, 32]} /><meshBasicMaterial color="#ffbf69" transparent opacity={.065} side={THREE.BackSide} /></mesh>
          <mesh scale={2.2}><sphereGeometry args={[radius, 24, 24]} /><meshBasicMaterial color="#e89b51" transparent opacity={.022} side={THREE.BackSide} /></mesh>
        </>}
        {isEarth && selected && <><mesh scale={1.12}><sphereGeometry args={[radius, 32, 32]} /><meshBasicMaterial color="#6ebbe9" transparent opacity={.1} side={THREE.BackSide} /></mesh><EarthCloudLayer radius={radius} /></>}
        {isSaturn && <mesh rotation={[Math.PI / 2.25, 0, 0]}>
          <ringGeometry args={[radius * 1.18, radius * 2.05, profile.lowPower ? 56 : 96]} />
          <meshStandardMaterial color="#d7c29b" side={THREE.DoubleSide} transparent opacity={.76} roughness={1} />
        </mesh>}
        {isBlackHole && <>
          <mesh rotation={[Math.PI / 2.45, 0, 0]} scale={[1.75, .52, 1]}>
            <torusGeometry args={[radius * 1.16, radius * .25, 16, profile.lowPower ? 64 : 100]} />
            <meshBasicMaterial color="#ffac62" transparent opacity={.82} />
          </mesh>
          <mesh rotation={[Math.PI / 2.45, 0, 0]} scale={[1.58, .38, 1]}>
            <torusGeometry args={[radius * 1.22, radius * .07, 12, profile.lowPower ? 56 : 88]} />
            <meshBasicMaterial color="#fff0c2" transparent opacity={.7} />
          </mesh>
        </>}
        {selected && <mesh scale={1.3}>
          <sphereGeometry args={[radius, 24, 24]} />
          <meshBasicMaterial color="#f0c88e" wireframe transparent opacity={.24} />
        </mesh>}
      </>}
    </group>
  </>
}

function Scene({ items, selected, onSelect, profile }: {
  items: SpaceObject[]
  selected: SpaceObject
  onSelect: (item: SpaceObject) => void
  profile: DeviceProfile
}) {
  const controls = useRef<any>(null)
  const { camera } = useThree()
  const focusOffset = useRef(new THREE.Vector3())
  const shouldFocus = useRef(true)

  useEffect(() => {
    const distance = Math.max(4.6, selected.size * 7 + 2.8)
    focusOffset.current.set(distance * .42, distance * .42, distance)
    shouldFocus.current = true
  }, [selected.id, selected.size])

  useFrame(({ clock }) => {
    if (!shouldFocus.current || !controls.current) return
    const index = Math.max(0, items.findIndex(item => item.id === selected.id))
    const point = positionFor(selected, clock.elapsedTime, index)
    const destination = point.clone().add(focusOffset.current)
    controls.current.target.lerp(point, .09)
    camera.position.lerp(destination, .09)
    controls.current.update()
    if (camera.position.distanceTo(destination) < .035 && controls.current.target.distanceTo(point) < .035) {
      shouldFocus.current = false
    }
  })

  return <>
    <color attach="background" args={['#080b12']} />
    <fog attach="fog" args={['#080b12', 27, 78]} />
    <ambientLight intensity={.4} />
    <pointLight position={[0, 0, 0]} intensity={90} color="#ffd08a" distance={42} decay={2} />
    <hemisphereLight color="#b8c9e8" groundColor="#080a10" intensity={.18} />
    <Stars radius={100} depth={64} count={profile.starCount} factor={profile.lowPower ? 2.5 : 3.1} saturation={.26} fade speed={profile.lowPower ? .1 : .2} />
    <Sparkles count={profile.sparkleCount} scale={50} size={profile.lowPower ? 1.2 : 1.7} speed={.12} opacity={.3} color="#9bb8e9" />
    {items.map((item, index) => <Planet key={item.id} item={item} index={index} selected={selected.id === item.id} onSelect={onSelect} profile={profile} />)}
    <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={.06} minDistance={2.8} maxDistance={70} enablePan rotateSpeed={.55} zoomSpeed={.72} />
  </>
}

export default function Universe({ items, selected, onSelect, onReady }: {
  items: SpaceObject[]
  selected: SpaceObject
  onSelect: (item: SpaceObject) => void
  onReady?: () => void
}) {
  const profile = useMemo(() => getDeviceProfile(), [])
  return <Canvas
    camera={{ position: [0, 11, 23], fov: 45, near: .1, far: 180 }}
    dpr={profile.pixelRatio}
    gl={{
      antialias: !profile.lowPower,
      alpha: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false
    }}
    fallback={<div className="scene-fallback">This device cannot start the 3D view. Try enabling hardware acceleration in your browser, or open COSMOS on a device with WebGL support.</div>}
    onCreated={({ gl }) => {
      gl.domElement.addEventListener('webglcontextlost', (event) => {
        event.preventDefault()
        onReady?.()
      })
      onReady?.()
    }}
  >
    <Scene items={items} selected={selected} onSelect={onSelect} profile={profile} />
  </Canvas>
}
