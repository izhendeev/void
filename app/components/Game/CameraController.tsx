'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from '@/app/stores/gameStore'
import * as THREE from 'three'

export default function CameraController() {
  const { camera } = useThree()
  const { playerPosition, isPlaying } = useGameStore()
  const targetPosition = useRef(new THREE.Vector3(0, 0, 3.5))

  useFrame(() => {
    if (!isPlaying) {
      // Если игра не идет, камера в центре
      targetPosition.current.set(0, 0, 3.5)
    } else {
      // Камера слегка следует за игроком по горизонтали, и более заметно по вертикали
      const followStrengthX = 0.3 // Горизонтальное следование (0-1)
      const followStrengthY = 0.6 // Вертикальное следование усилено для погружения
      const cameraOffsetX = playerPosition.x * followStrengthX
      const cameraOffsetY = playerPosition.y * followStrengthY
      
      targetPosition.current.set(cameraOffsetX, cameraOffsetY, 3.5)
    }

    // Плавное движение камеры к целевой позиции (lerp)
    const lerpSpeed = 0.1 // Скорость следования (чем больше, тем быстрее)
    camera.position.lerp(targetPosition.current, lerpSpeed)
  })

  return null
}
