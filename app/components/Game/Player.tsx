'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { useGameStore } from '@/app/stores/gameStore'

interface PlayerProps {
  touchDelta: { x: number; y: number }
}

const MODEL_SCALE = 0.5 // Масштаб модели игрока (увеличен)

export default function Player({ touchDelta }: PlayerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const basePosition = useRef(new THREE.Vector3(0, 0, 0))
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0))
  const { updatePlayerPosition } = useGameStore()

  // Загружаем модель игрока
  const playerModel = useLoader(GLTFLoader, '/models/player.glb')
  const playerScene = useMemo(() => {
    const scene = playerModel.scene.clone()
    // Убеждаемся, что все материалы видимы
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.visible = true
      }
    })
    return scene
  }, [playerModel])

  // Обновляем целевую позицию при изменении touchDelta
  useEffect(() => {
    if (Math.abs(touchDelta.x) > 0.0001 || Math.abs(touchDelta.y) > 0.0001) {
      // Базовая скорость движения
      const baseSpeed = 1.61
      // Множитель для вертикального движения (увеличен для лучшей чувствительности)
      const verticalMultiplier = 1.55
      
      // Нормализуем вектор движения, чтобы скорость была одинаковой во всех направлениях
      const magnitude = Math.sqrt(touchDelta.x * touchDelta.x + touchDelta.y * touchDelta.y)
      if (magnitude > 0.0001) {
        // Нормализованный вектор направления
        const normalizedX = touchDelta.x / magnitude
        const normalizedY = touchDelta.y / magnitude
        
        // Применяем скорость с учетом множителя для вертикали
        const moveDistance = magnitude * baseSpeed
        
        // Обновляем целевую позицию (будет плавно достигнута через lerp в useFrame)
        targetPosition.current.x += normalizedX * moveDistance
        targetPosition.current.y += normalizedY * moveDistance * verticalMultiplier
      }

      // Ограничиваем целевую позицию в пределах экрана (более строгие границы)
      const playerRadius = 0.35
      const safeMargin = 0.4 // Увеличен отступ для предотвращения выхода за края
      const maxPos = 2.4 - playerRadius - safeMargin // Более строгие границы (было 2.8)
      targetPosition.current.x = Math.max(-maxPos, Math.min(maxPos, targetPosition.current.x))
      targetPosition.current.y = Math.max(-maxPos, Math.min(maxPos, targetPosition.current.y))
    }
  }, [touchDelta])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Плавное движение к целевой позиции через lerp (linear interpolation)
    const lerpSpeed = 8.0 // Скорость сглаживания (чем больше, тем быстрее реакция, но меньше сглаживание)
    basePosition.current.x += (targetPosition.current.x - basePosition.current.x) * lerpSpeed * delta
    basePosition.current.y += (targetPosition.current.y - basePosition.current.y) * lerpSpeed * delta

    // Дополнительная проверка границ после lerp (на всякий случай)
    const playerRadius = 0.35
    const safeMargin = 0.4
    const maxPos = 2.4 - playerRadius - safeMargin
    basePosition.current.x = Math.max(-maxPos, Math.min(maxPos, basePosition.current.x))
    basePosition.current.y = Math.max(-maxPos, Math.min(maxPos, basePosition.current.y))

    // Применяем сглаженную позицию
    groupRef.current.position.x = basePosition.current.x
    groupRef.current.position.y = basePosition.current.y
    groupRef.current.position.z = 0

    // Обновляем позицию игрока в store для проверки столкновений
    updatePlayerPosition(
      basePosition.current.x,
      basePosition.current.y,
      groupRef.current.position.z
    )

    // Плавное медленное вращение во всех осях (эффект невесомости)
    const rotationSpeed = 0.3 // Скорость вращения (медленное вращение)
    const time = state.clock.elapsedTime * rotationSpeed
    
    // Постоянное вращение вокруг всех осей с разной скоростью для более естественного вида
    groupRef.current.rotation.x = time * 0.5 // Вращение вокруг X
    groupRef.current.rotation.y = time * 0.7 // Вращение вокруг Y (быстрее)
    groupRef.current.rotation.z = time * 0.3 // Вращение вокруг Z (медленнее)

    // Легкое покачивание масштаба (дополнительный визуальный эффект невесомости)
    const floatSpeed = 0.5
    const scaleFloat = 1 + Math.sin(state.clock.elapsedTime * floatSpeed * 0.5) * 0.03
    groupRef.current.scale.set(MODEL_SCALE * scaleFloat, MODEL_SCALE * scaleFloat, MODEL_SCALE * scaleFloat)
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Источник свечения в кубике */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2.5}
        color="#4a9eff"
        distance={10}
        decay={1}
      />
      {/* Модель игрока */}
      <primitive
        object={playerScene}
        position={[0, 0, 0]}
        scale={MODEL_SCALE}
      />
    </group>
  )
}
