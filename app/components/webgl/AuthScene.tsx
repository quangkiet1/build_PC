'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

const COPPER = '#F7931A'
const GOLD = '#FFD600'
const CYAN = '#38BDF8'

// Neural network node particles
function NeuralNodes() {
  const groupRef = useRef<THREE.Group>(null)
  const count = 60

  const nodes = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6 - 2,
      ] as [number, number, number],
      phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.4,
      size: 0.04 + Math.random() * 0.07,
      color: [COPPER, GOLD, CYAN, '#FFFFFF'][Math.floor(Math.random() * 4)],
    }))
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.children.forEach((child, i) => {
      const node = nodes[i]
      child.position.x = node.position[0] + Math.sin(t * node.speed + node.phase) * 0.3
      child.position.y = node.position[1] + Math.cos(t * node.speed * 0.7 + node.phase) * 0.25
      child.position.z = node.position[2]
    })
  })

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[node.size, 6, 6]} />
          <meshBasicMaterial color={node.color} transparent opacity={0.7} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

// Connection lines between nodes (neural network edges)
function NeuralEdges() {
  const lineRef = useRef<THREE.LineSegments>(null)

  const { positions, colors } = useMemo(() => {
    const pts: number[] = []
    const cols: number[] = []
    const nodeCount = 30
    const nodePositions = Array.from({ length: nodeCount }).map(() => new THREE.Vector3(
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 4 - 2,
    ))

    const colorOptions = [
      new THREE.Color(COPPER),
      new THREE.Color(GOLD),
      new THREE.Color(CYAN),
    ]

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = nodePositions[i].distanceTo(nodePositions[j])
        if (dist < 4.5) {
          pts.push(nodePositions[i].x, nodePositions[i].y, nodePositions[i].z)
          pts.push(nodePositions[j].x, nodePositions[j].y, nodePositions[j].z)
          const c = colorOptions[(i + j) % 3]
          cols.push(c.r, c.g, c.b, c.r, c.g, c.b)
        }
      }
    }
    return { positions: new Float32Array(pts), colors: new Float32Array(cols) }
  }, [])

  useFrame(({ clock }) => {
    if (!lineRef.current) return
    lineRef.current.rotation.y = clock.elapsedTime * 0.03
    lineRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.1) * 0.05
    ;(lineRef.current.material as THREE.LineBasicMaterial).opacity =
      0.15 + Math.sin(clock.elapsedTime * 0.5) * 0.05
  })

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={0.2} toneMapped={false} />
    </lineSegments>
  )
}

// Floating geometric shapes
function FloatingGeometry() {
  const shapes = useMemo(() => [
    { pos: [-5, 2, -3] as [number,number,number], type: 'torus', color: COPPER, phase: 0 },
    { pos: [5, -2, -4] as [number,number,number], type: 'octahedron', color: GOLD, phase: 1.5 },
    { pos: [-3, -3, -2] as [number,number,number], type: 'tetrahedron', color: CYAN, phase: 3 },
    { pos: [4, 3, -5] as [number,number,number], type: 'torus', color: GOLD, phase: 4.5 },
  ], [])

  const refs = [
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
  ]

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    refs.forEach((ref, i) => {
      if (!ref.current) return
      ref.current.rotation.x = t * 0.15 + shapes[i].phase
      ref.current.rotation.y = t * 0.2 + shapes[i].phase
      ref.current.position.y = shapes[i].pos[1] + Math.sin(t * 0.4 + shapes[i].phase) * 0.4
    })
  })

  return (
    <group>
      {shapes.map((shape, i) => (
        <mesh key={i} ref={refs[i]} position={shape.pos}>
          {shape.type === 'torus'
            ? <torusGeometry args={[0.6, 0.05, 8, 40]} />
            : shape.type === 'octahedron'
            ? <octahedronGeometry args={[0.4]} />
            : <tetrahedronGeometry args={[0.5]} />}
          <meshBasicMaterial
            color={shape.color}
            transparent
            opacity={0.35}
            wireframe
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// Data stream particles flowing from bottom to top
function DataStream() {
  const groupRef = useRef<THREE.Group>(null)
  const streamCount = 20
  const streams = useMemo(() =>
    Array.from({ length: streamCount }).map((_, i) => ({
      x: -7 + (i % 10) * 1.6,
      z: -3 - Math.floor(i / 10) * 1.5,
      phase: (i / streamCount) * Math.PI * 2,
      color: i % 3 === 0 ? COPPER : i % 2 === 0 ? GOLD : CYAN,
    })),
    []
  )

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.children.forEach((child, i) => {
      const s = streams[i]
      const y = ((t * 1.2 + s.phase * 1.5) % 12) - 6
      child.position.set(s.x, y, s.z)
      ;(child as THREE.Mesh).material && (((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity =
        0.3 + 0.5 * (1 - Math.abs(y) / 6))
    })
  })

  return (
    <group ref={groupRef}>
      {streams.map((s, i) => (
        <mesh key={i} position={[s.x, 0, s.z]}>
          <boxGeometry args={[0.04, 0.25, 0.04]} />
          <meshBasicMaterial color={s.color} transparent opacity={0.5} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

export function AuthScene() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.9 }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={20} color={COPPER} />
        <pointLight position={[-5, -5, 3]} intensity={15} color={CYAN} />

        <NeuralEdges />
        <NeuralNodes />
        <FloatingGeometry />
        <DataStream />
        <Sparkles
          count={80}
          scale={[16, 12, 8]}
          size={1.2}
          speed={0.15}
          opacity={0.35}
          color={GOLD}
        />
      </Canvas>
    </div>
  )
}
