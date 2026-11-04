import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { lunarOrbit, orbitalElements, type SpaceObject } from './data'

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
    pixelRatio: lowPower ? 0.78 : Math.min(window.devicePixelRatio || 1, 1.35),
    starCount: lowPower ? 760 : 4300,
    sparkleCount: lowPower ? 18 : 115,
    galaxyPoints: lowPower ? 360 : 1500,
    geometryDetail: lowPower ? 24 : 56
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

const AU_SCALE=2.05
const deepSpacePositions:Record<string,[number,number,number]>={sirius:[17,3.6,-13],andromeda:[-17,8,-18],orion:[12,-6,-18],m87:[-19,-3.5,15]}
const radians=(d:number)=>d*Math.PI/180
const displayOrbitRadius=(a:number)=>AU_SCALE*Math.pow(a,.52)
function solveEccentricAnomaly(M:number,e:number){
 let E=M
 for(let i=0;i<7;i++){const correction=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));E-=correction;if(Math.abs(correction)<1e-8)break}
 return E
}
function orbitalPlanePosition(a:number,e:number,M:number){
 const E=solveEccentricAnomaly(M,e)
 return new THREE.Vector2(a*(Math.cos(E)-e),a*Math.sqrt(1-e*e)*Math.sin(E))
}
function orientOrbitPoint(p:THREE.Vector2,iDeg:number,nodeDeg:number,periDeg:number){
 const w=radians(periDeg),O=radians(nodeDeg),i=radians(iDeg)
 const xp=p.x*Math.cos(w)-p.y*Math.sin(w),yp=p.x*Math.sin(w)+p.y*Math.cos(w)
 return new THREE.Vector3(xp*Math.cos(O)-yp*Math.cos(i)*Math.sin(O),yp*Math.sin(i),xp*Math.sin(O)+yp*Math.cos(i)*Math.cos(O))
}
function planetPosition(id:string,days:number){
 const el=orbitalElements[id];if(!el)return new THREE.Vector3()
 const M=radians(el.meanAnomalyAtEpochDeg)+Math.PI*2*days/el.periodDays
 return orientOrbitPoint(orbitalPlanePosition(displayOrbitRadius(el.semiMajorAxisAU),el.eccentricity,M),el.inclinationDeg,el.ascendingNodeDeg,el.argumentOfPerihelionDeg)
}
function positionFor(item:SpaceObject,days:number){
 if(item.id==='sun')return new THREE.Vector3()
 if(item.id==='moon'){
   const earth=planetPosition('earth',days),M=radians(lunarOrbit.meanAnomalyAtEpochDeg)+Math.PI*2*days/lunarOrbit.periodDays
   return earth.add(orientOrbitPoint(orbitalPlanePosition(lunarOrbit.semiMajorAxisScene,lunarOrbit.eccentricity,M),lunarOrbit.inclinationDeg,0,0))
 }
 if(item.kind!=='Planet')return new THREE.Vector3(...(deepSpacePositions[item.id]??[0,0,0]))
 return planetPosition(item.id,days)
}
function OrbitTrack({item}:{item:SpaceObject}){
 const el=orbitalElements[item.id]
 const geometry=useMemo(()=>{
  if(!el)return new THREE.BufferGeometry()
  const points:number[]=[],a=displayOrbitRadius(el.semiMajorAxisAU)
  for(let step=0;step<=240;step++){
    const M=step/240*Math.PI*2
    const p=orientOrbitPoint(orbitalPlanePosition(a,el.eccentricity,M),el.inclinationDeg,el.ascendingNodeDeg,el.argumentOfPerihelionDeg)
    points.push(p.x,p.y,p.z)
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));return g
 },[el])
 useEffect(()=>()=>geometry.dispose(),[geometry])
 return <line geometry={geometry}><lineBasicMaterial color="#c98b68" transparent opacity={.34} depthWrite={false}/></line>
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
  useFrame((_,delta) => { if (ref.current) ref.current.rotation.y += delta*.006 })
  if (!clouds) return null

  return <mesh ref={ref} scale={1.018}>
    <sphereGeometry args={[radius, 32, 32]} />
    <meshStandardMaterial color="#ffffff" alphaMap={clouds} transparent opacity={.3} depthWrite={false} roughness={1} />
  </mesh>
}

function Planet({ item, selected, onSelect, profile, simulationDays, simulationRunning }: {
  item: SpaceObject
  selected: boolean
  onSelect: (item: SpaceObject) => void
  profile: DeviceProfile
  simulationDays: { current: number }
  simulationRunning: boolean
}) {
  const mesh = useRef<THREE.Mesh>(null!)
  const group = useRef<THREE.Group>(null!)
  const isSun = item.id === 'sun'
  const isEarth = item.id === 'earth'
  const isSaturn = item.id === 'saturn'
  const isUranus = item.id === 'uranus'
  const isNeptune = item.id === 'neptune'
  const isJupiter = item.id === 'jupiter'
  const isBlackHole = item.kind === 'Black hole'
  const orbit = orbitalElements[item.id]
  const radius = item.size * .64
  const texture = useDisposableTexture(selected ? textureUrls[item.id] : undefined)

  useFrame((_,delta) => {
    if (!group.current) return
    group.current.position.copy(positionFor(item,simulationDays.current))
    if (simulationRunning && mesh.current && !isBlackHole && item.id!=='moon') {
      const spinPeriod=orbit?.visualSpinSeconds ?? (isSun?30:20)
      mesh.current.rotation.y += delta*(Math.PI*2/spinPeriod)*(orbit?.retrograde?-1:1)
    }
  })

  return <>
    {item.kind === 'Planet' && <OrbitTrack item={item} />}
    <group ref={group} rotation={[radians(orbit?.axialTiltDeg ?? (isSun?7.25:0)),0,0]}>
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
        {!isSun && !isBlackHole && <mesh scale={item.id === 'venus' ? 1.1 : 1.055}>
          <sphereGeometry args={[radius, profile.lowPower ? 18 : 32, profile.lowPower ? 18 : 32]} />
          <meshBasicMaterial color={item.color} transparent opacity={profile.lowPower ? (item.id === 'venus' ? .055 : .025) : (item.id === 'venus' ? .1 : .045)} side={THREE.BackSide} depthWrite={false} />
        </mesh>}
        {isJupiter && <mesh position={[radius * .94, radius * .11, 0]} scale={[.085, .035, .018]}>
          <sphereGeometry args={[radius, 16, 12]} /><meshBasicMaterial color="#a95742" transparent opacity={.78} />
        </mesh>}
        {isSun && <>
          <mesh scale={1.65}><sphereGeometry args={[radius, 32, 32]} /><meshBasicMaterial color="#ffbf69" transparent opacity={.065} side={THREE.BackSide} /></mesh>
          <mesh scale={2.2}><sphereGeometry args={[radius, 24, 24]} /><meshBasicMaterial color="#e89b51" transparent opacity={.022} side={THREE.BackSide} /></mesh>
        </>}
        {isEarth && selected && <><mesh scale={1.12}><sphereGeometry args={[radius, 32, 32]} /><meshBasicMaterial color="#6ebbe9" transparent opacity={.1} side={THREE.BackSide} /></mesh><EarthCloudLayer radius={radius} /></>}
        {isSaturn && <>
          <mesh rotation={[Math.PI / 2.25, 0, 0]}><ringGeometry args={[radius * 1.12, radius * 1.34, profile.lowPower ? 40 : 72]} /><meshStandardMaterial color="#9e896e" side={THREE.DoubleSide} transparent opacity={.62} roughness={1} /></mesh>
          <mesh rotation={[Math.PI / 2.25, 0, 0]}><ringGeometry args={[radius * 1.38, radius * 1.78, profile.lowPower ? 48 : 88]} /><meshStandardMaterial color="#e4d0a5" side={THREE.DoubleSide} transparent opacity={.86} roughness={1} /></mesh>
          <mesh rotation={[Math.PI / 2.25, 0, 0]}><ringGeometry args={[radius * 1.82, radius * 2.1, profile.lowPower ? 40 : 72]} /><meshStandardMaterial color="#b9a27d" side={THREE.DoubleSide} transparent opacity={.5} roughness={1} /></mesh>
          <mesh rotation={[Math.PI / 2.25, 0, 0]}><ringGeometry args={[radius * 1.34, radius * 1.38, profile.lowPower ? 32 : 64]} /><meshBasicMaterial color="#171921" side={THREE.DoubleSide} transparent opacity={.88} /></mesh>
        </>}
        {(isUranus || isNeptune) && <mesh rotation={[Math.PI / 2.1, 0, 0]}>
          <ringGeometry args={[radius * 1.42, radius * 1.62, profile.lowPower ? 40 : 76]} />
          <meshBasicMaterial color={isUranus ? '#809a9d' : '#7588b5'} side={THREE.DoubleSide} transparent opacity={.2} />
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

function Scene({ items, selected, onSelect, profile, simulationRunning, simulationSpeed }: {
  items: SpaceObject[]
  selected: SpaceObject
  onSelect: (item: SpaceObject) => void
  profile: DeviceProfile
  simulationRunning: boolean
  simulationSpeed: number
}) {
  const controls = useRef<any>(null)
  const { camera } = useThree()
  const focusOffset = useRef(new THREE.Vector3())
  const shouldFocus = useRef(true)
  const simulationDays = useRef(0)
  const lastFollowPoint = useRef(new THREE.Vector3())

  useEffect(() => {
    lastFollowPoint.current.copy(positionFor(selected,simulationDays.current))
    const distance = Math.max(4.6, selected.size * 7 + 2.8)
    focusOffset.current.set(distance * .42, distance * .42, distance)
    shouldFocus.current = true
  }, [selected.id, selected.size])

  useFrame((_,delta) => {
    if(simulationRunning)simulationDays.current+=delta*(365.256/90)*simulationSpeed
    if(!controls.current)return
    const point=positionFor(selected,simulationDays.current)
    const shift=point.clone().sub(lastFollowPoint.current)
    if(!shouldFocus.current){controls.current.target.add(shift);camera.position.add(shift)}
    else {controls.current.target.lerp(point,.09);camera.position.lerp(point.clone().add(focusOffset.current),.09)}
    lastFollowPoint.current.copy(point)
    controls.current.update()
    if(shouldFocus.current){
      const destination=point.clone().add(focusOffset.current)
      if(camera.position.distanceTo(destination)<.035&&controls.current.target.distanceTo(point)<.035)shouldFocus.current=false
    }
  })

  return <>
    <color attach="background" args={['#120d16']} />
    <fog attach="fog" args={['#120d16', 33, 92]} />
    <ambientLight intensity={.4} />
    <pointLight position={[0, 0, 0]} intensity={90} color="#ffd08a" distance={42} decay={2} />
    <hemisphereLight color="#f2d2aa" groundColor="#21151b" intensity={.22} />
    <Stars radius={100} depth={64} count={profile.starCount} factor={profile.lowPower ? 2.5 : 3.1} saturation={.52} fade speed={profile.lowPower ? .1 : .2} />
    <Sparkles count={profile.sparkleCount} scale={50} size={profile.lowPower ? 1.2 : 1.7} speed={.12} opacity={.35} color="#f3c99a" />
    {items.map(item => <Planet key={item.id} item={item} selected={selected.id === item.id} onSelect={onSelect} profile={profile} simulationDays={simulationDays} simulationRunning={simulationRunning} />)}
    <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={.06} minDistance={2.8} maxDistance={70} enablePan rotateSpeed={.55} zoomSpeed={.72} />
  </>
}

function StaticUniverse({ items, selected, onSelect }: {
  items: SpaceObject[]
  selected: SpaceObject
  onSelect: (item: SpaceObject) => void
}) {
  return <div className="map-fallback" role="group" aria-label="Interactive 2D star map">
    <div className="map-fallback-orbit map-orbit-one" />
    <div className="map-fallback-orbit map-orbit-two" />
    <div className="map-fallback-orbit map-orbit-three" />
    <div className="map-fallback-core" />
    <div className="map-fallback-hud"><span className="eyebrow">INTERACTIVE STAR MAP</span><b>GPU-SAFE MODE</b></div>
    {items.map((item, index) => {
      const angle = (index * 137.508 - 90) * Math.PI / 180
      const radius = item.id === 'sun' ? 0 : 16 + ((index * 7) % 4) * 5.5
      const left = 50 + Math.cos(angle) * radius
      const top = 50 + Math.sin(angle) * radius * .72
      return <button
        key={item.id}
        type="button"
        className={selected.id === item.id ? 'map-fallback-node is-selected' : 'map-fallback-node'}
        style={{ left: `${left}%`, top: `${top}%`, '--planet-color': item.color } as React.CSSProperties}
        onClick={() => onSelect(item)}
        aria-label={`Select ${item.name}`}
        title={item.name}
      >
        <span className="map-fallback-node-dot" />
        {selected.id === item.id && <span className="map-fallback-node-label">{item.name}</span>}
      </button>
    })}
    <div className="map-fallback-caption">SELECT ANY OBJECT TO OPEN ITS DOSSIER</div>
  </div>
}

export default function Universe({ items, selected, onSelect, onReady, simulationRunning = true, simulationSpeed = 1 }: {
  items: SpaceObject[]
  selected: SpaceObject
  onSelect: (item: SpaceObject) => void
  onReady?: () => void
  simulationRunning?: boolean
  simulationSpeed?: number
}) {
  const profile = useMemo(() => getDeviceProfile(), [])
  const [contextLost, setContextLost] = useState(false)
  const [canvasKey, setCanvasKey] = useState(0)

  if (contextLost) {
    return <div className="scene-fallback-shell">
      <StaticUniverse items={items} selected={selected} onSelect={onSelect} />
      <div className="scene-fallback-banner" role="status">
        <div><span className="eyebrow">2D SAFE MODE</span><strong>3D graphics paused to protect this device.</strong></div>
        <button className="scene-retry" onClick={() => {
          setContextLost(false)
          setCanvasKey(value => value + 1)
        }}>Retry 3D</button>
      </div>
    </div>
  }

  return <Canvas
    key={canvasKey}
    camera={{ position: [0, 11, 23], fov: 45, near: .1, far: 180 }}
    dpr={profile.pixelRatio}
    gl={{
      antialias: !profile.lowPower,
      alpha: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false
    }}
    fallback={<StaticUniverse items={items} selected={selected} onSelect={onSelect} />}
    onCreated={({ gl }) => {
      gl.domElement.addEventListener('webglcontextlost', (event) => {
        event.preventDefault()
        setContextLost(true)
        onReady?.()
      }, { once: true })
      onReady?.()
    }}
  >
    <Scene items={items} selected={selected} onSelect={onSelect} profile={profile} simulationRunning={simulationRunning} simulationSpeed={simulationSpeed} />
  </Canvas>
}
