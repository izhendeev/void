'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { useGameStore } from '@/app/stores/gameStore'

interface Obstacle {
  id: number
  position: THREE.Vector3
  size: number
  rotationOffset: { x: number; y: number; z: number } // Начальное смещение вращения для уникальности каждого астероида
  modelType: 'asteroid1' | 'asteroid2' // Тип модели астероида
  isLarge: boolean // Большой астероид или обычный
  isTargeting: boolean // Целится ли астероид в игрока
  targetPosition: { x: number; y: number } | null // Целевая позиция при спавне (позиция игрока)
}

const OBSTACLE_SPAWN_DISTANCE = -100 // Расстояние перед игроком для спавна (далеко, чтобы были видны издалека)
const OBSTACLE_DESPAWN_DISTANCE = 5 // Расстояние за игроком для удаления
const SPAWN_INTERVAL = 640 // Интервал спавна в миллисекундах (уменьшен на 20% для большего количества астероидов)
const OBSTACLE_SPEED_MULTIPLIER = 1.5 // Множитель скорости движения препятствий

const MODEL_BASE_SCALE = 2.3 // Базовый масштаб модели (слегка увеличен)
const LARGE_ASTEROID_CHANCE = 0.08 // 8% шанс появления большого астероида (уменьшено с 12%)
const LARGE_ASTEROID_SCALE = 2.8 // Масштаб больших астероидов (уменьшен с 3.5)
const TARGETING_ASTEROID_CHANCE = 0.08 // 8% шанс появления астероида, который целится в игрока

export default function Obstacles() {
  const obstaclesRef = useRef<THREE.Group>(null)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const lastSpawnTime = useRef(Date.now())
  const obstacleIdCounter = useRef(0)
  const meshRefs = useRef<Map<number, THREE.Group>>(new Map())
  const { isPlaying, gameSpeed, playerPosition, endGame, addScore } = useGameStore()
  const playerPositionRef = useRef(playerPosition) // Сохраняем позицию игрока для спавна целевых астероидов

  // Загружаем обе модели астероидов (загружаются только один раз)
  const asteroidModel1 = useLoader(GLTFLoader, '/models/asteroid.glb')
  const asteroidModel2 = useLoader(GLTFLoader, '/models/asteroid2.glb')
  
  const originalScene1 = useMemo(() => {
    const scene = asteroidModel1.scene.clone()
    // Убеждаемся, что все материалы видимы и непрозрачные
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.visible = true
        const material = child.material
        const materials = Array.isArray(material) ? material : [material]
        materials.forEach((mat: any) => {
          if (mat) {
            mat.visible = true
            mat.opacity = 1.0
            mat.transparent = false
          }
        })
      }
    })
    return scene
  }, [asteroidModel1])
  
  const originalScene2 = useMemo(() => {
    const scene = asteroidModel2.scene.clone()
    // Убеждаемся, что все материалы видимы и непрозрачные
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.visible = true
        const material = child.material
        const materials = Array.isArray(material) ? material : [material]
        materials.forEach((mat: any) => {
          if (mat) {
            mat.visible = true
            mat.opacity = 1.0
            mat.transparent = false
          }
        })
      }
    })
    return scene
  }, [asteroidModel2])

  // Генерация препятствий
  useEffect(() => {
    if (!isPlaying) {
      setObstacles([])
      return
    }

    const spawnInterval = setInterval(() => {
      const now = Date.now()
      if (now - lastSpawnTime.current >= SPAWN_INTERVAL) {
        const isLarge = Math.random() < LARGE_ASTEROID_CHANCE // Редкий большой астероид
        const isTargeting = Math.random() < TARGETING_ASTEROID_CHANCE // Редкий астероид, который целится в игрока
        
        const size = isLarge 
          ? 0.8 + Math.random() * 0.4 // Большие астероиды: 0.8-1.2 (уменьшено)
          : 0.2 + Math.random() * 0.8 // Обычные астероиды: 0.2-1.0
        const modelType = Math.random() < 0.5 ? 'asteroid1' : 'asteroid2' // Случайный выбор типа модели

        // Если астероид целевой, спавним его в случайном месте, но он будет двигаться к позиции игрока
        // Если обычный - случайная позиция
        let spawnX = (Math.random() - 0.5) * 7
        let spawnY = (Math.random() - 0.5) * 7
        
        // Для целевых астероидов - спавним в случайном месте, но запоминаем целевую позицию игрока
        const targetPos = isTargeting 
          ? { x: playerPositionRef.current.x, y: playerPositionRef.current.y }
          : null

        // Большие астероиды спавнятся дальше, чтобы были видны издалека
        const spawnDistance = isLarge ? OBSTACLE_SPAWN_DISTANCE - 30 : OBSTACLE_SPAWN_DISTANCE

        const newObstacle: Obstacle = {
          id: obstacleIdCounter.current++,
          position: new THREE.Vector3(
            spawnX,
            spawnY,
            spawnDistance
          ),
          size,
          modelType,
          isLarge,
          isTargeting,
          targetPosition: targetPos,
          rotationOffset: {
            x: Math.random() * Math.PI * 2, // Начальное смещение вращения X для уникальности
            y: Math.random() * Math.PI * 2, // Начальное смещение вращения Y
            z: Math.random() * Math.PI * 2, // Начальное смещение вращения Z
          },
        }

        setObstacles((prev) => [...prev, newObstacle])
        lastSpawnTime.current = now
      }
    }, 100)

    return () => clearInterval(spawnInterval)
  }, [isPlaying])

  // Обновление препятствий
  useFrame((state, delta) => {
    if (!obstaclesRef.current || !isPlaying) return

    const playerPos = playerPosition
    // Обновляем позицию игрока для спавна целевых астероидов
    playerPositionRef.current = playerPos

    setObstacles((prev) => {
      const updated = prev
        .map((obstacle) => {
          // Движение препятствия к игроку
          obstacle.position.z += gameSpeed * OBSTACLE_SPEED_MULTIPLIER * delta * 60
          
          // Если астероид целевой, двигаем его к сохраненной целевой позиции
          if (obstacle.isTargeting && obstacle.targetPosition) {
            const targetX = obstacle.targetPosition.x
            const targetY = obstacle.targetPosition.y
            const currentX = obstacle.position.x
            const currentY = obstacle.position.y
            
            // Плавное движение к цели (lerp)
            const lerpSpeed = 0.02 * delta * 60 // Скорость приближения к цели
            obstacle.position.x += (targetX - currentX) * lerpSpeed
            obstacle.position.y += (targetY - currentY) * lerpSpeed
          }

          // Обновление позиции и вращение астероидов
          const group = meshRefs.current.get(obstacle.id)
          if (group) {
            // Обновляем позицию группы напрямую
            group.position.set(obstacle.position.x, obstacle.position.y, obstacle.position.z)
            
            // Убеждаемся что астероид полностью видим (без fade-in, появляются издалека)
            group.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.visible = true
                const material = child.material
                const materials = Array.isArray(material) ? material : [material]
                materials.forEach((mat: any) => {
                  if (mat) {
                    // Убеждаемся что материал полностью непрозрачный и видимый
                    mat.opacity = 1.0
                    mat.transparent = false
                    mat.visible = true
                  }
                })
              }
            })
            
            // Вращение астероидов - более заметное вращение
            const rotationSpeed = obstacle.isLarge ? 0.25 : 0.4 // Большие вращаются медленнее
            const time = state.clock.elapsedTime * rotationSpeed
            
            // Вращение вокруг всех осей с разной скоростью для уникальности
            group.rotation.x = obstacle.rotationOffset.x + time * 0.6 // Вращение вокруг X
            group.rotation.y = obstacle.rotationOffset.y + time * 0.8 // Вращение вокруг Y (быстрее)
            group.rotation.z = obstacle.rotationOffset.z + time * 0.4 // Вращение вокруг Z
          }

          // Проверка столкновения с игроком
          const dx = obstacle.position.x - playerPos.x
          const dy = obstacle.position.y - playerPos.y
          const dz = Math.abs(obstacle.position.z - playerPos.z)
          
          // Точная проверка коллизии: расстояние по XY в плоскости
          const distanceXY = Math.sqrt(dx * dx + dy * dy)
          const playerRadius = 0.32 // Радиус игрока (немного уменьшен для более точной коллизии)
          const collisionRadius = playerRadius + obstacle.size
          
          // Более строгая проверка по Z (только реальное касание)
          const collisionDepthZ = 0.6 // Уменьшено для более точной коллизии

          // Коллизия срабатывает только при реальном касании
          if (distanceXY < collisionRadius && dz < collisionDepthZ) {
            endGame()
            return null
          }

          // Удаляем препятствие если оно прошло мимо
          if (obstacle.position.z > OBSTACLE_DESPAWN_DISTANCE) {
            meshRefs.current.delete(obstacle.id)
            addScore(10) // Очки за пройденное препятствие
            return null
          }

          return obstacle
        })
        .filter((o): o is Obstacle => o !== null)

      return updated
    })
  })

  return (
    <group ref={obstaclesRef}>
      {obstacles.map((obstacle) => {
        // Выбираем соответствующую модель в зависимости от типа астероида
        const originalScene = obstacle.modelType === 'asteroid1' ? originalScene1 : originalScene2
        // Клонируем сцену для каждого астероида
        const clonedScene = originalScene.clone()
        
        // Масштаб зависит от размера и типа (большие астероиды больше)
        const finalScale = obstacle.isLarge 
          ? obstacle.size * MODEL_BASE_SCALE * LARGE_ASTEROID_SCALE / MODEL_BASE_SCALE
          : obstacle.size * MODEL_BASE_SCALE
        
        return (
          <primitive
            key={obstacle.id}
            object={clonedScene}
            ref={(group: THREE.Group | null) => {
              if (group) {
                meshRefs.current.set(obstacle.id, group)
                // Убеждаемся что астероид полностью видим
                group.traverse((child) => {
                  if (child instanceof THREE.Mesh) {
                    child.visible = true
                    const material = child.material
                    const materials = Array.isArray(material) ? material : [material]
                    materials.forEach((mat: any) => {
                      if (mat) {
                        // Убеждаемся что материал полностью непрозрачный и видимый
                        mat.opacity = 1.0
                        mat.transparent = false
                        mat.visible = true
                        // Убираем любые эффекты прозрачности
                        if (mat.emissive) mat.emissive.setScalar(0)
                      }
                    })
                  }
                })
              }
            }}
            position={[obstacle.position.x, obstacle.position.y, obstacle.position.z]}
            scale={finalScale}
          />
        )
      })}
    </group>
  )
}
