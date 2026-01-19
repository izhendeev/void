'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/app/stores/gameStore'

const STAR_COUNT = 800 // Количество звезд (увеличено для космического ощущения)
const STAR_SPEED_MULTIPLIER = 1.6 // Множитель скорости движения звезд (замедлено на 20%)

export default function Stars() {
  const starsRef = useRef<THREE.Points>(null)
  const positionsRef = useRef<Float32Array | null>(null)
  const { isPlaying, gameSpeed } = useGameStore()

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3)
    const cols = new Float32Array(STAR_COUNT * 3)

    for (let i = 0; i < STAR_COUNT; i++) {
      // Случайные позиции - звезды впереди камеры (отрицательный Z)
      pos[i * 3] = (Math.random() - 0.5) * 150 // X - широкий диапазон для широкого космоса
      pos[i * 3 + 1] = (Math.random() - 0.5) * 150 // Y - широкий диапазон для широкого космоса
      pos[i * 3 + 2] = -100 - Math.random() * 200 // Z - позади камеры

      // Разноцветные звезды для космического ощущения
      const rand = Math.random()
      let r, g, b
      
      if (rand < 0.6) {
        // Белые звезды (60%) - сделаны ярче
        const intensity = 0.8 + Math.random() * 0.2
        r = g = b = intensity
      } else if (rand < 0.8) {
        // Синие звезды (20%) - сделаны ярче
        const intensity = 0.7 + Math.random() * 0.3
        r = intensity * 0.8
        g = intensity * 0.85
        b = intensity * 1.0
      } else {
        // Желтые/белые яркие звезды (20%) - сделаны ярче
        const intensity = 0.9 + Math.random() * 0.1
        r = intensity * 1.0
        g = intensity * 0.95
        b = intensity * 0.9
      }
      
      cols[i * 3] = r
      cols[i * 3 + 1] = g
      cols[i * 3 + 2] = b
    }

    positionsRef.current = pos
    return [pos, cols]
  }, [])

  useFrame((state, delta) => {
    if (!starsRef.current || !positionsRef.current || !isPlaying) return

    // Движение звезд к камере (они летят навстречу)
    for (let i = 0; i < STAR_COUNT; i++) {
      const zIndex = i * 3 + 2
      // Звезды движутся к камере (увеличиваем Z)
      positionsRef.current[zIndex] += gameSpeed * STAR_SPEED_MULTIPLIER * delta * 60

      // Если звезда прошла камеру, перемещаем её назад
      if (positionsRef.current[zIndex] > 5) {
        positionsRef.current[i * 3] = (Math.random() - 0.5) * 150 // Широкий диапазон X
        positionsRef.current[i * 3 + 1] = (Math.random() - 0.5) * 150 // Широкий диапазон Y
        positionsRef.current[zIndex] = -100 - Math.random() * 200
      }
    }

    // Обновляем геометрию
    if (starsRef.current.geometry) {
      const attr = starsRef.current.geometry.attributes.position as THREE.BufferAttribute
      if (attr) {
        attr.needsUpdate = true
      }
    }
  })

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={STAR_COUNT}
          array={positionsRef.current || positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={STAR_COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.15} vertexColors />
    </points>
  )
}
