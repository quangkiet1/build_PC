'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Edges, Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

const copper = '#F7931A'
const gold = '#FFD600'
const cyan = '#38BDF8'
const graphite = '#090B10'

function CircuitBoard() {
  const pads = useMemo(
    () =>
      Array.from({ length: 32 }).map((_, index) => ({
        position: [
          -2.8 + (index % 8) * 0.8,
          -0.18,
          -1.55 + Math.floor(index / 8) * 0.9,
        ] as [number, number, number],
        scale: (index % 3 === 0 ? [0.18, 0.018, 0.18] : [0.11, 0.018, 0.11]) as [number, number, number],
        color: index % 4 === 0 ? cyan : index % 2 === 0 ? gold : copper,
      })),
    []
  )

  return (
    <group position={[0.72, -0.42, -0.28]} rotation={[0.18, -0.38, 0.08]} scale={1.08}>
      <mesh>
        <boxGeometry args={[6.1, 0.08, 3.75]} />
        <meshStandardMaterial
          color="#05070B"
          emissive="#111827"
          emissiveIntensity={0.34}
          roughness={0.38}
          metalness={0.42}
        />
        <Edges color={copper} linewidth={1.2} />
      </mesh>

      {pads.map((pad, index) => (
        <mesh key={`board-pad-${index}`} position={pad.position} scale={pad.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={pad.color} transparent opacity={0.5} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function AbstractChip() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const elapsed = state.clock.elapsedTime
    groupRef.current.rotation.y = -0.42 + Math.sin(elapsed * 0.24) * 0.16
    groupRef.current.rotation.x = 0.18 + Math.sin(elapsed * 0.18) * 0.06
    groupRef.current.position.y = Math.sin(elapsed * 0.7) * 0.06
  })

  return (
    <group ref={groupRef} position={[1.2, -0.02, 0.12]} rotation={[0.16, -0.42, 0.08]} scale={1.38}>
      <Float speed={1.15} rotationIntensity={0.12} floatIntensity={0.2}>
        <mesh>
          <boxGeometry args={[3, 0.18, 3]} />
          <meshStandardMaterial color={graphite} roughness={0.16} metalness={0.82} />
          <Edges color={gold} linewidth={1.3} />
        </mesh>

        <mesh position={[0, 0.13, 0]}>
          <boxGeometry args={[1.58, 0.12, 1.58]} />
          <meshStandardMaterial
            color="#171C26"
            emissive={copper}
            emissiveIntensity={0.36}
            roughness={0.22}
            metalness={0.72}
          />
          <Edges color={cyan} linewidth={1} />
        </mesh>

        <mesh position={[0, 0.215, 0]}>
          <boxGeometry args={[0.92, 0.035, 0.92]} />
          <meshStandardMaterial
            color="#111827"
            emissive={gold}
            emissiveIntensity={1.35}
            roughness={0.16}
            metalness={0.68}
          />
          <Edges color="#FFFFFF" linewidth={0.8} />
        </mesh>

        {Array.from({ length: 6 }).map((_, index) => {
          const offset = -0.95 + index * 0.38

          return (
            <mesh key={`heat-${index}`} position={[offset, 0.34, -0.08]}>
              <boxGeometry args={[0.055, 0.28, 1.16]} />
              <meshStandardMaterial color="#252B35" roughness={0.22} metalness={0.76} />
            </mesh>
          )
        })}

        {Array.from({ length: 4 }).map((_, side) => (
          <group key={`pin-side-${side}`} rotation={[0, (Math.PI / 2) * side, 0]}>
            {Array.from({ length: 9 }).map((__, index) => (
              <mesh key={`pin-${side}-${index}`} position={[1.62, -0.02, -1.15 + index * 0.285]}>
                <boxGeometry args={[0.28, 0.08, 0.055]} />
                <meshStandardMaterial
                  color={index % 2 === 0 ? gold : copper}
                  emissive={index % 2 === 0 ? gold : copper}
                  emissiveIntensity={0.18}
                  roughness={0.14}
                  metalness={1}
                />
              </mesh>
            ))}
          </group>
        ))}
      </Float>
    </group>
  )
}

function CircuitTraces() {
  const groupRef = useRef<THREE.Group>(null)
  const traces = useMemo(
    () => [
      { position: [-2.7, -1.18, -0.7], scale: [2.5, 0.018, 0.018], rotation: [0, 0, 0.05], color: copper },
      { position: [-1.5, -0.78, -0.4], scale: [1.7, 0.018, 0.018], rotation: [0, 0, -0.18], color: cyan },
      { position: [-2.1, 0.05, -0.9], scale: [2.2, 0.018, 0.018], rotation: [0, 0, 0.38], color: gold },
      { position: [2.15, 1.05, -0.8], scale: [2.1, 0.018, 0.018], rotation: [0, 0, -0.28], color: cyan },
      { position: [2.45, -1.1, -1.05], scale: [1.8, 0.018, 0.018], rotation: [0, 0, 0.48], color: copper },
      { position: [0.1, 1.58, -1.1], scale: [2.7, 0.018, 0.018], rotation: [0, 0, 0.02], color: gold },
    ],
    []
  )

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.18) * 0.03
  })

  return (
    <group ref={groupRef}>
      {traces.map((trace, index) => (
        <mesh
          key={`trace-${index}`}
          position={trace.position as [number, number, number]}
          rotation={trace.rotation as [number, number, number]}
          scale={trace.scale as [number, number, number]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={trace.color} transparent opacity={0.64} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function OrbitalRings() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const elapsed = state.clock.elapsedTime
    groupRef.current.rotation.x = 0.92 + Math.sin(elapsed * 0.16) * 0.08
    groupRef.current.rotation.y = elapsed * 0.1
  })

  return (
    <group ref={groupRef} position={[1.05, -0.08, -0.38]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.1, 0.012, 10, 160]} />
        <meshBasicMaterial color={copper} transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2.25, 0.48, 0.1]}>
        <torusGeometry args={[2.62, 0.009, 10, 160]} />
        <meshBasicMaterial color={cyan} transparent opacity={0.36} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2.8, -0.68, 0.38]}>
        <torusGeometry args={[3.08, 0.008, 10, 160]} />
        <meshBasicMaterial color={gold} transparent opacity={0.28} toneMapped={false} />
      </mesh>
    </group>
  )
}

function SignalBits() {
  const groupRef = useRef<THREE.Group>(null)
  const bits = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, index) => ({
        base: [
          -3.6 + (index % 6) * 1.32,
          -1.65 + Math.floor(index / 6) * 1.12,
          -1.4 + (index % 3) * 0.28,
        ] as [number, number, number],
        phase: index * 0.72,
        color: index % 3 === 0 ? cyan : index % 2 === 0 ? gold : copper,
      })),
    []
  )

  useFrame((state) => {
    if (!groupRef.current) return
    const elapsed = state.clock.elapsedTime

    groupRef.current.children.forEach((child, index) => {
      const bit = bits[index]
      child.position.x = bit.base[0] + Math.sin(elapsed * 0.8 + bit.phase) * 0.16
      child.position.y = bit.base[1] + Math.cos(elapsed * 0.65 + bit.phase) * 0.11
      child.rotation.z = elapsed * 0.35 + bit.phase
    })
  })

  return (
    <group ref={groupRef}>
      {bits.map((bit, index) => (
        <mesh key={`bit-${index}`} position={bit.base}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshBasicMaterial color={bit.color} transparent opacity={0.78} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function SceneRig() {
  const rigRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!rigRef.current) return

    const scrollY = typeof window === 'undefined' ? 0 : window.scrollY
    const viewportHeight = typeof window === 'undefined' ? 1 : Math.max(window.innerHeight, 1)
    const progress = THREE.MathUtils.clamp(scrollY / (viewportHeight * 0.9), 0, 1.2)
    const eased = progress * progress * (3 - 2 * progress)
    const elapsed = state.clock.elapsedTime

    rigRef.current.position.x = THREE.MathUtils.lerp(rigRef.current.position.x, -eased * 0.55, 0.08)
    rigRef.current.position.y = THREE.MathUtils.lerp(rigRef.current.position.y, -eased * 0.72, 0.08)
    rigRef.current.position.z = THREE.MathUtils.lerp(rigRef.current.position.z, eased * 0.35, 0.08)
    rigRef.current.rotation.y = THREE.MathUtils.lerp(rigRef.current.rotation.y, eased * 0.32, 0.08)
    rigRef.current.rotation.z = THREE.MathUtils.lerp(
      rigRef.current.rotation.z,
      -eased * 0.2 + Math.sin(elapsed * 0.18) * 0.03,
      0.08
    )

    const targetScale = 1 - eased * 0.08
    const nextScale = THREE.MathUtils.lerp(rigRef.current.scale.x, targetScale, 0.08)
    rigRef.current.scale.setScalar(nextScale)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 1.4 + eased * 0.42, 0.05)
  })

  return (
    <group ref={rigRef}>
      <CircuitBoard />
      <OrbitalRings />
      <AbstractChip />
      <CircuitTraces />
      <SignalBits />
      <Sparkles count={120} scale={[7.5, 4.8, 2.5]} size={1.35} speed={0.24} opacity={0.44} color={gold} />
    </group>
  )
}

export function Hero3D() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 pointer-events-none opacity-95 mix-blend-screen will-change-transform [mask-image:linear-gradient(90deg,transparent_0%,black_20%,black_100%)]"
    >
      <Canvas
        camera={{ position: [0.18, 1.26, 5.25], fov: 40 }}
        dpr={[1.25, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.86} />
        <directionalLight position={[4, 6, 4]} intensity={2.4} color={gold} />
        <directionalLight position={[-3.5, 2.5, 2]} intensity={1.2} color={cyan} />
        <pointLight position={[2.6, 1.2, 2.8]} intensity={60} color={copper} />
        <pointLight position={[-3.2, -1.5, 2]} intensity={32} color={cyan} />

        <SceneRig />
      </Canvas>
    </div>
  )
}
