import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { lunarOrbit, orbitalElements, satelliteOrbits, type SpaceObject } from './data'

const textureUrls: Record<string, string> = {
  sun: 'https://play.solarsystemscope.com/textures/download/2k_sun.jpg',
  mercury: 'https://play.solarsystemscope.com/textures/download/2k_mercury.jpg',
  venus: 'https://play.solarsystemscope.com/textures/download/2k_venus_surface.jpg',
  'venus-atmosphere': 'https://play.solarsystemscope.com/textures/download/2k_venus_atmosphere.jpg',
  earth: 'https://play.solarsystemscope.com/textures/download/2k_earth_daymap.jpg',
  'earth-night': 'https://play.solarsystemscope.com/textures/download/2k_earth_nightmap.jpg',
  'earth-clouds': 'https://play.solarsystemscope.com/textures/download/2k_earth_clouds.jpg',
  moon: 'https://play.solarsystemscope.com/textures/download/2k_moon.jpg',
  mars: 'https://play.solarsystemscope.com/textures/download/2k_mars.jpg',
  jupiter: 'https://play.solarsystemscope.com/textures/download/2k_jupiter.jpg',
  saturn: 'https://play.solarsystemscope.com/textures/download/2k_saturn.jpg',
  'saturn-rings': 'https://play.solarsystemscope.com/textures/download/2k_saturn_ring_alpha.png',
  uranus: 'https://play.solarsystemscope.com/textures/download/2k_uranus.jpg',
  neptune: 'https://play.solarsystemscope.com/textures/download/2k_neptune.jpg',
  ceres: 'https://play.solarsystemscope.com/textures/download/2k_ceres_fictional.jpg',
  haumea: 'https://play.solarsystemscope.com/textures/download/2k_haumea_fictional.jpg',
  makemake: 'https://play.solarsystemscope.com/textures/download/2k_makemake_fictional.jpg',
  eris: 'https://play.solarsystemscope.com/textures/download/2k_eris_fictional.jpg',
  io: 'https://space.jpl.nasa.gov/tmaps/pix/jup1vss2.jpg',
  europa: 'https://space.jpl.nasa.gov/tmaps/pix/jup2vss2.jpg',
  ganymede: 'https://space.jpl.nasa.gov/tmaps/pix/jup3vss2.jpg',
  callisto: 'https://space.jpl.nasa.gov/tmaps/pix/jup4vss2.jpg',
  enceladus: 'https://space.jpl.nasa.gov/tmaps/pix/sat2vss2.jpg'
}
}

// Ultra maps load only for the focused body on desktop-class devices.
const ultraTextureUrls: Record<string,string> = {
  sun:'https://play.solarsystemscope.com/textures/download/8k_sun.jpg',
  mercury:'https://play.solarsystemscope.com/textures/download/8k_mercury.jpg',
  venus:'https://play.solarsystemscope.com/textures/download/8k_venus_surface.jpg',
  earth:'https://play.solarsystemscope.com/textures/download/8k_earth_daymap.jpg',
  moon:'https://play.solarsystemscope.com/textures/download/8k_moon.jpg',
  mars:'https://play.solarsystemscope.com/textures/download/8k_mars.jpg',
  jupiter:'https://play.solarsystemscope.com/textures/download/8k_jupiter.jpg',
  saturn:'https://play.solarsystemscope.com/textures/download/8k_saturn.jpg'
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
        ready.anisotropy = 8
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


/** Deterministic equirectangular maps keep unselected bodies textured without large downloads. */
function createProceduralSurface(id:string,color:string,simple:boolean):THREE.CanvasTexture{
  const canvas=document.createElement('canvas')
  canvas.width=simple?256:512
  canvas.height=canvas.width/2
  const ctx=canvas.getContext('2d')
  if(!ctx)throw new Error('Canvas 2D context unavailable for procedural surface')
  const base=new THREE.Color(color)
  const tint=(hex:string,amount:number)=>`#${base.clone().lerp(new THREE.Color(hex),amount).getHexString()}`
  let seed=0x45d9f3b
  for(let i=0;i<id.length;i++)seed=(Math.imul(seed^id.charCodeAt(i),2654435761)>>>0)
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
  const w=canvas.width,h=canvas.height
  const gas=['jupiter','saturn','uranus','neptune'].includes(id)
  const star=['sun','sirius','proxima','betelgeuse'].includes(id)
  const gradient=ctx.createLinearGradient(0,0,0,h)
  gradient.addColorStop(0,tint('#ffffff',.28));gradient.addColorStop(.48,color);gradient.addColorStop(1,tint('#241c2a',.48))
  ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h)
  if(gas){
    const bands=id==='jupiter'?22:id==='saturn'?17:12
    for(let band=0;band<bands;band++){
      const y=band/bands*h,bh=h/bands*(.38+random()*.55)
      ctx.fillStyle=band%2===0?tint('#fff0d9',.25+random()*.22):tint('#4a2631',.14+random()*.2)
      ctx.globalAlpha=.42+random()*.32;ctx.beginPath();ctx.moveTo(0,y)
      for(let x=0;x<=w;x+=w/16)ctx.lineTo(x,y+Math.sin(x/w*Math.PI*(2+random()*2)+band)*bh*.34)
      ctx.lineTo(w,y+bh);ctx.lineTo(0,y+bh);ctx.closePath();ctx.fill()
    }
    ctx.globalAlpha=.28
    for(let i=0;i<(simple?28:86);i++){
      const x=random()*w,y=random()*h,rx=4+random()*26,ry=1+random()*5
      ctx.fillStyle=random()>.5?tint('#fff6d8',.55):tint('#492d38',.38)
      ctx.beginPath();ctx.ellipse(x,y,rx,ry,random()*.2,0,Math.PI*2);ctx.fill()
    }
  }else if(star){
    for(let i=0;i<(simple?220:760);i++){
      const x=random()*w,y=random()*h,r=.5+random()*3.2
      ctx.fillStyle=random()>.48?'#fff4d1':tint('#662f25',.55);ctx.globalAlpha=.14+random()*.44
      ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()
    }
    if(id==='sun')for(let i=0;i<18;i++){const x=random()*w,y=random()*h,r=3+random()*12;ctx.fillStyle='rgba(255,247,194,.22)';ctx.beginPath();ctx.ellipse(x,y,r*1.8,r,random()*Math.PI,0,Math.PI*2);ctx.fill()}
  }else{
    const cratered=!['venus','earth','trappist-1e','kepler-186f'].includes(id)
    if(cratered){
      for(let i=0;i<(simple?75:220);i++){
        const x=random()*w,y=8+random()*(h-16),r=1.2+Math.pow(random(),2)*13
        const shade=ctx.createRadialGradient(x-r*.24,y-r*.3,r*.08,x,y,r)
        shade.addColorStop(0,tint('#ffffff',.46));shade.addColorStop(.52,tint('#42363a',.14));shade.addColorStop(.82,tint('#18141c',.48));shade.addColorStop(1,tint('#ffffff',.22))
        ctx.fillStyle=shade;ctx.globalAlpha=.24+random()*.42;ctx.beginPath();ctx.ellipse(x,y,r,r*(.45+random()*.22),0,0,Math.PI*2);ctx.fill()
      }
    }else{
      for(let i=0;i<(simple?60:180);i++){
        const x=random()*w,y=random()*h
        ctx.strokeStyle=i%3===0?tint('#f9e7ca',.46):tint('#1c5268',.42);ctx.globalAlpha=.15+random()*.2;ctx.lineWidth=1+random()*4
        ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+random()*26,y-8,x+random()*38,y+14,x+random()*60,y+random()*18);ctx.stroke()
      }
    }
    for(let i=0;i<(simple?900:2400);i++){
      const x=random()*w,y=random()*h;ctx.fillStyle=random()>.5?'rgba(255,244,225,.5)':'rgba(26,19,24,.45)';ctx.globalAlpha=.06+random()*.14;ctx.fillRect(x,y,.5+random()*1.5,.5+random()*1.5)
    }
  }
  ctx.globalAlpha=1
  const texture=new THREE.CanvasTexture(canvas)
  texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=THREE.RepeatWrapping;texture.anisotropy=4;texture.needsUpdate=true
  return texture
}
function useProceduralSurface(item:SpaceObject,simple:boolean){
  const texture=useMemo(()=>{
    if(item.kind==='Black hole'||item.kind==='Galaxy'||item.kind==='Nebula')return null
    return createProceduralSurface(item.id,item.color,simple)
  },[item.id,item.color,item.kind,simple])
  useEffect(()=>()=>texture?.dispose(),[texture])
  return texture
}
function AtmosphereHalo({radius,color,opacity=0.16}:{radius:number;color:string;opacity?:number}){
  return <mesh scale={1.055}>
    <sphereGeometry args={[radius,32,32]}/>
    <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending}/>
  </mesh>
}

const AU_SCALE=2.05
const deepSpacePositions:Record<string,[number,number,number]>={sirius:[17,3.6,-13],andromeda:[-17,8,-18],orion:[12,-6,-18],m87:[-19,-3.5,15],proxima:[-15,-5,-21],betelgeuse:[20,9,12],triangulum:[-22,1,12],crab:[8,10,-23],'sagittarius-a':[-8,-10,22],'trappist-1e':[23,-5,-12],'kepler-186f':[-24,-7,-8]}
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

function satelliteFor(id:string){
 if(id==='moon')return {parentId:'earth',semiMajorAxisScene:lunarOrbit.semiMajorAxisScene,eccentricity:lunarOrbit.eccentricity,inclinationDeg:lunarOrbit.inclinationDeg,ascendingNodeDeg:0,argumentOfPerihelionDeg:0,meanAnomalyAtEpochDeg:lunarOrbit.meanAnomalyAtEpochDeg,periodDays:lunarOrbit.periodDays}
 return satelliteOrbits[id]
}
function positionForId(id:string,days:number):THREE.Vector3{
 if(id==='sun')return new THREE.Vector3()
 const satellite=satelliteFor(id)
 if(satellite){
  const parent=positionForId(satellite.parentId,days)
  const M=radians(satellite.meanAnomalyAtEpochDeg)+Math.PI*2*days/satellite.periodDays
  return parent.add(orientOrbitPoint(orbitalPlanePosition(satellite.semiMajorAxisScene,satellite.eccentricity,M),satellite.inclinationDeg,satellite.ascendingNodeDeg,satellite.argumentOfPerihelionDeg))
 }
 if(orbitalElements[id])return planetPosition(id,days)
 return new THREE.Vector3(...(deepSpacePositions[id]??[0,0,0]))
}
function positionFor(item:SpaceObject,days:number){return positionForId(item.id,days)}
function OrbitTrack({item,simulationDays}:{item:SpaceObject;simulationDays:{current:number}}){
 const el=orbitalElements[item.id],satellite=satelliteFor(item.id),anchor=useRef<THREE.Group>(null!)
 const geometry=useMemo(()=>{
  const points:number[]=[]
  if(el){
   const a=displayOrbitRadius(el.semiMajorAxisAU)
   for(let step=0;step<=240;step++){const M=step/240*Math.PI*2;const p=orientOrbitPoint(orbitalPlanePosition(a,el.eccentricity,M),el.inclinationDeg,el.ascendingNodeDeg,el.argumentOfPerihelionDeg);points.push(p.x,p.y,p.z)}
  }else if(satellite){
   for(let step=0;step<=160;step++){const M=step/160*Math.PI*2;const p=orientOrbitPoint(orbitalPlanePosition(satellite.semiMajorAxisScene,satellite.eccentricity,M),satellite.inclinationDeg,satellite.ascendingNodeDeg,satellite.argumentOfPerihelionDeg);points.push(p.x,p.y,p.z)}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));return g
 },[el,satellite])
 useEffect(()=>()=>geometry.dispose(),[geometry])
 const orbitLine=useMemo(()=>new THREE.Line(geometry,new THREE.LineBasicMaterial({color:satellite?'#d8a57c':'#c98b68',transparent:true,opacity:satellite?.24:.34,depthWrite:false})),[geometry,satellite])
 useEffect(()=>()=>orbitLine.material.dispose(),[orbitLine])
 useFrame(()=>{if(anchor.current)anchor.current.position.copy(satellite?positionForId(satellite.parentId,simulationDays.current):new THREE.Vector3())})
 return <group ref={anchor}><primitive object={orbitLine}/></group>
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

function EarthCloudLayer({ radius, running }: { radius: number; running:boolean }) {
  const clouds = useDisposableTexture(textureUrls['earth-clouds'])
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((_,delta) => { if (running && ref.current) ref.current.rotation.y += delta*.006 })
  if (!clouds) return null

  return <mesh ref={ref} scale={1.018}>
    <sphereGeometry args={[radius, 32, 32]} />
    <meshStandardMaterial color="#ffffff" alphaMap={clouds} transparent opacity={.3} depthWrite={false} roughness={1} />
  </mesh>
}

function EarthNightLayer({radius}:{radius:number}){
  const night=useDisposableTexture(textureUrls['earth-night'])
  if(!night)return null
  return <mesh scale={1.003}><sphereGeometry args={[radius,40,40]}/><meshBasicMaterial map={night} alphaMap={night} color="#ffd58b" transparent opacity={.76} depthWrite={false} blending={THREE.AdditiveBlending}/></mesh>
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
  const isStar = item.kind === 'Star'
  const isComet = item.kind === 'Comet'
  const isEarth = item.id === 'earth'
  const isVenus = item.id === 'venus'
  const isSaturn = item.id === 'saturn'
  const isUranus = item.id === 'uranus'
  const isNeptune = item.id === 'neptune'
  const isJupiter = item.id === 'jupiter'
  const isBlackHole = item.kind === 'Black hole'
  const orbit = orbitalElements[item.id]
  const radius = item.size * .64
  const selectedMapUrl = selected && !profile.lowPower ? (ultraTextureUrls[item.id] ?? textureUrls[item.id]) : (selected ? textureUrls[item.id] : undefined)
  const texture = useDisposableTexture(selectedMapUrl)
  const proceduralTexture = useProceduralSurface(item,profile.lowPower)
  const surfaceMap = texture ?? proceduralTexture
  const venusClouds = useDisposableTexture(isVenus && selected ? textureUrls['venus-atmosphere'] : undefined)
  const saturnRings = useDisposableTexture(isSaturn && selected ? textureUrls['saturn-rings'] : undefined)

  useFrame((_,delta) => {
    if (!group.current) return
    group.current.position.copy(positionFor(item,simulationDays.current))
    if (simulationRunning && mesh.current && !isBlackHole && item.kind!=='Moon') {
      const spinPeriod=orbit?.visualSpinSeconds ?? (isSun?30:20)
      mesh.current.rotation.y += delta*(Math.PI*2/spinPeriod)*(orbit?.retrograde?-1:1)
    }
  })

  return <>
    {(orbitalElements[item.id] || satelliteFor(item.id)) && <OrbitTrack item={item} simulationDays={simulationDays} />}
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
          <sphereGeometry args={[radius, selected ? (profile.lowPower ? 48 : 96) : (profile.lowPower ? 16 : 32), selected ? (profile.lowPower ? 48 : 96) : (profile.lowPower ? 16 : 32)]} />
          <meshStandardMaterial
            map={surfaceMap ?? undefined}
            bumpMap={surfaceMap ?? undefined}
            bumpScale={isBlackHole ? 0 : (selected ? (profile.lowPower ? .012 : .026) : .008)}
            color={surfaceMap ? '#ffffff' : isBlackHole ? '#020308' : item.color}
            roughness={isSun ? .72 : isJupiter || isSaturn || isUranus || isNeptune ? .96 : .88}
            metalness={isBlackHole ? .18 : .015}
            emissive={(isSun || isStar) ? item.color : selected ? item.color : '#000000'}
            emissiveMap={isSun ? surfaceMap ?? undefined : undefined}
            emissiveIntensity={isSun ? .68 : isStar ? .3 : selected ? .07 : .008}
          />
        </mesh>
        {!isSun && !isBlackHole && <mesh scale={item.id === 'venus' ? 1.1 : 1.055}>
          <sphereGeometry args={[radius, profile.lowPower ? 18 : 32, profile.lowPower ? 18 : 32]} />
          <meshBasicMaterial color={item.color} transparent opacity={profile.lowPower ? (item.id === 'venus' ? .055 : .025) : (item.id === 'venus' ? .1 : .045)} side={THREE.BackSide} depthWrite={false} />
        </mesh>}
        {/* Jupiter's storms are rendered in the mapped cloud bands instead of a detached placeholder. */}
        {isStar && !isSun && <>
          <AtmosphereHalo radius={radius} color={item.color} opacity={.18}/>
          <mesh scale={2.05}><sphereGeometry args={[radius,16,16]}/><meshBasicMaterial color={item.color} transparent opacity={.035} side={THREE.BackSide} depthWrite={false}/></mesh>
        </>}
        {isSun && <>
          <mesh scale={1.65}><sphereGeometry args={[radius, 32, 32]} /><meshBasicMaterial color="#ffbf69" transparent opacity={.065} side={THREE.BackSide} /></mesh>
          <mesh scale={2.2}><sphereGeometry args={[radius, 24, 24]} /><meshBasicMaterial color="#e89b51" transparent opacity={.022} side={THREE.BackSide} /></mesh>
        </>}
        {isEarth && selected && <>
          <AtmosphereHalo radius={radius} color="#72bfe7" opacity={.2}/>
          <EarthNightLayer radius={radius}/>
          <EarthCloudLayer radius={radius} running={simulationRunning}/>
        </>}
        {isVenus && selected && venusClouds && <mesh scale={1.018}>
          <sphereGeometry args={[radius,40,40]}/>
          <meshBasicMaterial map={venusClouds} color="#fff0cf" transparent opacity={.24} depthWrite={false}/>
        </mesh>}
        {isEarth && !selected && <AtmosphereHalo radius={radius} color="#72bfe7" opacity={.09}/>}

        {isSaturn && <>
          <mesh rotation={[Math.PI / 2.25, 0, 0]}>
            <ringGeometry args={[radius * 1.12, radius * 2.1, profile.lowPower ? 64 : 128]}/>
            <meshStandardMaterial map={saturnRings ?? undefined} color={saturnRings ? '#ffffff' : '#d8c4a0'} side={THREE.DoubleSide} transparent opacity={saturnRings ? .96 : .76} roughness={1} depthWrite={false}/>
          </mesh>
          <mesh rotation={[Math.PI / 2.25, 0, 0]}>
            <ringGeometry args={[radius * 1.34, radius * 1.38, profile.lowPower ? 32 : 64]}/>
            <meshBasicMaterial color="#171018" side={THREE.DoubleSide} transparent opacity={.84}/>
          </mesh>
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
        {isComet && <>
          <mesh position={[-radius*2.9,0,0]} rotation={[0,0,-Math.PI/2]} scale={[radius*7,radius*2.1,radius*2.1]}>
            <coneGeometry args={[1,1,16]}/><meshBasicMaterial color="#9ecdc6" transparent opacity={.16} depthWrite={false}/>
          </mesh>
          <mesh scale={1.45}><sphereGeometry args={[radius,16,16]}/><meshBasicMaterial color="#d6ece0" transparent opacity={.16} side={THREE.BackSide}/></mesh>
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
