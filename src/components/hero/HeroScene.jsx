import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/** cm de lâmina → altura da água na cena (40 cm ≈ meio da porta do carro). */
const alturaAgua = (cm) => -0.02 + cm * 0.016

const CORES = {
  dark: { fundo: '#0e0f0c', asfalto: '#1b1c19', agua: '#2f6f8f', luz: 1 },
  light: { fundo: '#eeebe3', asfalto: '#4a4a46', agua: '#3d86ab', luz: 1.7 },
}

/* ---------- Água: plano com ondulação feita em shader ---------- */
const vertexAgua = /* glsl */ `
  uniform float uTempo;
  uniform float uAgitacao;
  varying float vOnda;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    float onda = sin(p.x * 2.2 + uTempo * 1.6) * 0.5 + sin(p.y * 3.1 - uTempo * 1.2) * 0.5;
    p.z += onda * 0.025 * uAgitacao;
    vOnda = onda;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`
const fragmentAgua = /* glsl */ `
  uniform vec3 uCor;
  uniform float uOpacidade;
  varying float vOnda;
  varying vec2 vUv;
  void main() {
    float brilho = smoothstep(0.55, 1.0, vOnda) * 0.35;
    float borda = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
    gl_FragColor = vec4(uCor + brilho, uOpacidade * borda);
  }
`

function Agua({ laminaCm, chuvaMmH, cor }) {
  const malha = useRef()
  const uniforms = useMemo(
    () => ({
      uTempo: { value: 0 },
      uAgitacao: { value: 1 },
      uCor: { value: new THREE.Color(cor) },
      uOpacidade: { value: 0.78 },
    }),
    [cor],
  )

  useFrame((estado, delta) => {
    uniforms.uTempo.value = estado.clock.elapsedTime
    uniforms.uAgitacao.value = 0.6 + chuvaMmH / 30
    // sobe/desce suavemente até a altura alvo
    const alvo = alturaAgua(laminaCm)
    malha.current.position.y += (alvo - malha.current.position.y) * Math.min(1, delta * 3)
    malha.current.visible = malha.current.position.y > 0.005
  })

  return (
    <mesh ref={malha} rotation-x={-Math.PI / 2} position-y={alturaAgua(laminaCm)}>
      <planeGeometry args={[7.6, 40, 48, 160]} />
      <shaderMaterial
        vertexShader={vertexAgua}
        fragmentShader={fragmentAgua}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

/* ---------- Chuva: segmentos de linha caindo ---------- */
const MAX_GOTAS = 1400

function Chuva({ chuvaMmH }) {
  const linhas = useRef()
  const posicoes = useMemo(() => {
    const arr = new Float32Array(MAX_GOTAS * 6)
    for (let i = 0; i < MAX_GOTAS; i++) {
      const x = (Math.random() - 0.5) * 14
      const y = Math.random() * 8
      const z = (Math.random() - 0.5) * 18
      arr.set([x, y, z, x + 0.02, y + 0.28, z], i * 6)
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    const geo = linhas.current.geometry
    const quantidade = Math.round((chuvaMmH / 60) * MAX_GOTAS)
    geo.setDrawRange(0, quantidade * 2)
    const pos = geo.attributes.position.array
    const queda = delta * 9
    for (let i = 0; i < quantidade; i++) {
      const k = i * 6
      pos[k + 1] -= queda
      pos[k + 4] -= queda
      if (pos[k + 1] < 0) {
        pos[k + 1] += 8
        pos[k + 4] += 8
      }
    }
    geo.attributes.position.needsUpdate = true
  })

  return (
    <lineSegments ref={linhas}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posicoes, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#9fb7c4" transparent opacity={0.45} />
    </lineSegments>
  )
}

/* ---------- Táxi carioca (amarelo com faixa azul), low-poly ---------- */
function Roda({ x, z }) {
  return (
    <group position={[x, 0.34, z]} rotation-z={Math.PI / 2}>
      <mesh>
        <cylinderGeometry args={[0.34, 0.34, 0.26, 20]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.9} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.18, 0.18, 0.28, 12]} />
        <meshStandardMaterial color="#8d8d86" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Taxi() {
  const carro = useRef()
  useFrame((estado) => {
    // leve balanço, como um carro parado com o motor ligado
    carro.current.position.y = Math.sin(estado.clock.elapsedTime * 9) * 0.004
  })
  return (
    <group ref={carro} rotation-y={-0.5}>
      <mesh position={[0, 0.62, 0]} castShadow>
        <boxGeometry args={[1.7, 0.52, 3.9]} />
        <meshStandardMaterial color="#f2b705" roughness={0.35} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.66, 0]}>
        <boxGeometry args={[1.72, 0.12, 3.92]} />
        <meshStandardMaterial color="#1f4fa0" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.12, -0.25]} castShadow>
        <boxGeometry args={[1.5, 0.5, 2]} />
        <meshStandardMaterial color="#f2b705" roughness={0.35} metalness={0.15} />
      </mesh>
      <mesh position={[0, 1.13, -0.25]}>
        <boxGeometry args={[1.52, 0.36, 1.7]} />
        <meshStandardMaterial color="#10161c" roughness={0.1} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.42, -0.2]}>
        <boxGeometry args={[0.5, 0.12, 0.22]} />
        <meshStandardMaterial color="#f5f1e6" emissive="#f5f1e6" emissiveIntensity={0.5} />
      </mesh>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.66, 1.96]}>
          <boxGeometry args={[0.36, 0.14, 0.04]} />
          <meshStandardMaterial color="#fff6d8" emissive="#fff1c0" emissiveIntensity={2} />
        </mesh>
      ))}
      {[-0.55, 0.55].map((x) => (
        <mesh key={`t${x}`} position={[x, 0.7, -1.96]}>
          <boxGeometry args={[0.36, 0.12, 0.04]} />
          <meshStandardMaterial color="#ff2a1a" emissive="#ff2a1a" emissiveIntensity={1.4} />
        </mesh>
      ))}
      <Roda x={-0.86} z={1.25} />
      <Roda x={0.86} z={1.25} />
      <Roda x={-0.86} z={-1.25} />
      <Roda x={0.86} z={-1.25} />
    </group>
  )
}

/* ---------- Pista: asfalto, faixas e meio-fio ---------- */
function Pista({ cor }) {
  const faixas = useMemo(() => Array.from({ length: 12 }, (_, i) => -20 + i * 3.6), [])
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[7.6, 40]} />
        <meshStandardMaterial color={cor} roughness={0.55} metalness={0.2} />
      </mesh>
      {faixas.map((z) => (
        <mesh key={z} rotation-x={-Math.PI / 2} position={[1.9, 0.004, z]}>
          <planeGeometry args={[0.12, 1.8]} />
          <meshStandardMaterial color="#e9e6dc" roughness={0.6} />
        </mesh>
      ))}
      <mesh rotation-x={-Math.PI / 2} position={[-3.5, 0.004, 0]}>
        <planeGeometry args={[0.12, 40]} />
        <meshStandardMaterial color="#f2b705" roughness={0.6} />
      </mesh>
      {[-3.95, 3.95].map((x) => (
        <mesh key={x} position={[x, 0.09, 0]}>
          <boxGeometry args={[0.3, 0.18, 40]} />
          <meshStandardMaterial color="#6d6c64" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

/** Câmera acompanha o ponteiro de leve (paralaxe). */
function Camera() {
  const { camera, pointer } = useThree()
  useFrame(() => {
    camera.position.x += (5.2 + pointer.x * 0.8 - camera.position.x) * 0.04
    camera.position.y += (2.6 + pointer.y * 0.4 - camera.position.y) * 0.04
    camera.lookAt(0, 0.5, 0)
  })
  return null
}

export default function HeroScene({ laminaCm, chuvaMmH, tema }) {
  const caixa = useRef()
  const [visivel, setVisivel] = useState(true)
  const cores = CORES[tema] ?? CORES.dark

  // pausa a renderização quando o hero sai da tela (economiza bateria)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => setVisivel(e.isIntersecting))
    obs.observe(caixa.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={caixa} style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        frameloop={visivel ? 'always' : 'never'}
        dpr={[1, 1.5]}
        camera={{ position: [5.2, 2.6, 6.4], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        aria-hidden="true"
      >
        <fog attach="fog" args={[cores.fundo, 9, 24]} />
        <ambientLight intensity={0.35 * cores.luz} />
        <hemisphereLight args={['#9fb7c4', '#0e0f0c', 0.5 * cores.luz]} />
        <pointLight position={[-3.2, 4.2, 1.5]} color="#ffb347" intensity={28} distance={14} />
        <directionalLight position={[4, 6, 3]} intensity={0.6 * cores.luz} />
        <Camera />
        <Pista cor={cores.asfalto} />
        <Taxi />
        <Agua laminaCm={laminaCm} chuvaMmH={chuvaMmH} cor={cores.agua} />
        <Chuva chuvaMmH={chuvaMmH} />
      </Canvas>
    </div>
  )
}
