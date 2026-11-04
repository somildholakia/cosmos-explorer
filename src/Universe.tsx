import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import type { SpaceObject } from './data'

function Planet({ item, index, selected, onSelect }: { item: SpaceObject; index: number; selected: boolean; onSelect: (item: SpaceObject) => void }) {
  const mesh = useRef<THREE.Mesh>(null!)
  const group = useRef<THREE.Group>(null!)
  const isSun = item.id === 'sun'
  const isMoon = item.kind === 'Moon'
  const isRinged = item.id === 'saturn'
  const orbitRadius = item.orbit * .66
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: item.color, roughness: item.kind === 'Star' ? .38 : .82, metalness: .02, emissive: isSun ? item.color : item.color, emissiveIntensity: isSun ? 1.35 : selected ? .22 : .035 }), [item.color, item.kind, isSun, selected])
  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.elapsedTime * item.speed * .075 + index * .7
    if (!isSun) {
      group.current.position.x = Math.cos(t) * orbitRadius
      group.current.position.z = Math.sin(t) * orbitRadius * .68
    }
    if (mesh.current) mesh.current.rotation.y += .0025
  })
  return <group ref={group} position={[isSun ? 0 : orbitRadius, 0, 0]}>
    {!isSun && <mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[orbitRadius-.008,orbitRadius+.008,128]} /><meshBasicMaterial color="#71839e" transparent opacity={.14} side={THREE.DoubleSide} /></mesh>}
    <mesh ref={mesh} onClick={(e) => { e.stopPropagation(); onSelect(item) }} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }} material={material}>
      <sphereGeometry args={[item.size * (isSun ? 1 : .64), 48, 48]} />
    </mesh>
    {isSun && <mesh scale={1.55}><sphereGeometry args={[item.size*.64,32,32]} /><meshBasicMaterial color="#f7b85d" transparent opacity={.08} side={THREE.BackSide} /></mesh>}
    {isRinged && <mesh rotation={[Math.PI/2.35,0,0]}><ringGeometry args={[item.size*.72,item.size*1.28,96]} /><meshStandardMaterial color="#d5bd91" side={THREE.DoubleSide} transparent opacity={.72} roughness={1} /></mesh>}
    {selected && <mesh><sphereGeometry args={[item.size*.64*1.22,32,32]} /><meshBasicMaterial color="#f1c98a" wireframe transparent opacity={.34} /></mesh>}
    {isMoon && <pointLight color="#b8d8ff" intensity={.12} distance={2} />}
  </group>
}

function Scene({ selected, onSelect }: { selected: SpaceObject; onSelect: (item: SpaceObject) => void }) {
  return <>
    <color attach="background" args={['#080b12']} />
    <fog attach="fog" args={['#080b12', 22, 52]} />
    <ambientLight intensity={.42} />
    <pointLight position={[0,0,0]} intensity={95} color="#ffd08a" distance={36} decay={2} />
    <Stars radius={90} depth={55} count={4800} factor={3.2} saturation={.22} fade speed={.28} />
    <Sparkles count={110} scale={38} size={1.6} speed={.18} opacity={.38} color="#9bb8e9" />
    <Float speed={.28} rotationIntensity={.02} floatIntensity={.06}>
      {/** Keep the solar system deliberately legible rather than physically scaled. */}
      {/** The outer catalogue objects act as navigable deep-space landmarks. */}
    </Float>
    {/** scene items are mapped in parent */}
    <OrbitControls makeDefault enableDamping dampingFactor={.055} minDistance={4} maxDistance={42} enablePan rotateSpeed={.55} zoomSpeed={.72} />
  </>
}

export default function Universe({ items, selected, onSelect }: { items: SpaceObject[]; selected: SpaceObject; onSelect: (item: SpaceObject) => void }) {
  return <Canvas camera={{ position:[0,13,23], fov:46 }} dpr={[1,1.7]} gl={{ antialias:true, alpha:false }}>
    <Scene selected={selected} onSelect={onSelect} />
    {items.map((item,index) => <Planet key={item.id} item={item} index={index} selected={selected.id===item.id} onSelect={onSelect} />)}
  </Canvas>
}