'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { useGameStore } from '@/app/stores/gameStore'

interface Bonus {
  id: number
  position: THREE.Vector3
  collected: boolean
}

const BONUS_SPAWN_DISTANCE = -70
const BONUS_DESPAWN_DISTANCE = 5
const BONUS_SPAWN_INTERVAL_MIN = 10000 // 10 секунд
const BONUS_SPAWN_INTERVAL_MAX = 20000 // 20 секунд
const BONUS_SPEED_MULTIPLIER = 1.5
const BONUS_SIZE = 1.2 // Размер бонуса (увеличен для коллизии)
const MODEL_SCALE = 1.5 // Масштаб модели

export default function Bonus() {
  const bonusRef = useRef<THREE.Group>(null)
  const [bonuses, setBonuses] = useState<Bonus[]>([])
  const lastSpawnTime = useRef(Date.now())
  const bonusIdCounter = useRef(0)
  const nextSpawnDelay = useRef(BONUS_SPAWN_INTERVAL_MIN + Math.random() * (BONUS_SPAWN_INTERVAL_MAX - BONUS_SPAWN_INTERVAL_MIN))
  const meshRefs = useRef<Map<number, THREE.Group>>(new Map())
  const { isPlaying, baseGameSpeed, playerPosition, activateSpeedBonus } = useGameStore()

  // Загружаем модель бонуса
  const bonusModel = useLoader(GLTFLoader, '/models/bonus.glb')
  const bonusScene = useMemo(() => {
    const scene = bonusModel.scene.clone()
    // Убеждаемся, что все материалы видимы
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.visible = true
        // Делаем материалы более яркими для лучшей видимости
        const material = child.material
        const materials = Array.isArray(material) ? material : [material]
        materials.forEach((mat: any) => {
          if (mat) {
            mat.visible = true
            // Увеличиваем эмиссию для неонового эффекта
            if (mat.emissive) {
              mat.emissive = mat.emissive || new THREE.Color()
              mat.emissive.multiplyScalar(2)
            }
            if (typeof mat.emissiveIntensity !== 'undefined') {
              mat.emissiveIntensity = (mat.emissiveIntensity || 0.5) * 2
            }
          }
        })
      }
    })
    return scene
  }, [bonusModel])

  // Генерация бонусов
  useEffect(() => {
    if (!isPlaying) {
      setBonuses([])
      lastSpawnTime.current = Date.now()
      nextSpawnDelay.current = BONUS_SPAWN_INTERVAL_MIN + Math.random() * (BONUS_SPAWN_INTERVAL_MAX - BONUS_SPAWN_INTERVAL_MIN)
      return
    }

    const checkSpawn = setInterval(() => {
      const now = Date.now()
      if (now - lastSpawnTime.current >= nextSpawnDelay.current) {
        const newBonus: Bonus = {
          id: bonusIdCounter.current++,
          position: new THREE.Vector3(
            (Math.random() - 0.5) * 7, // Случайная позиция X
            (Math.random() - 0.5) * 7, // Случайная позиция Y
            BONUS_SPAWN_DISTANCE
          ),
          collected: false,
        }

        setBonuses((prev) => [...prev, newBonus])
        lastSpawnTime.current = now
        // Следующий бонус появится через случайный интервал 10-20 секунд
        nextSpawnDelay.current = BONUS_SPAWN_INTERVAL_MIN + Math.random() * (BONUS_SPAWN_INTERVAL_MAX - BONUS_SPAWN_INTERVAL_MIN)
      }
    }, 1000) // Проверяем каждую секунду

    return () => clearInterval(checkSpawn)
  }, [isPlaying])

  // Обновление бонусов
  useFrame((state, delta) => {
    if (!bonusRef.current || !isPlaying) return

    const playerPos = playerPosition

    setBonuses((prev) => {
      const updated: Bonus[] = []
      
      prev.forEach((bonus) => {
        if (bonus.collected) {
          return
        }

        // Движение бонуса к игроку (используем базовую скорость, не умноженную бонусом)
        bonus.position.z += baseGameSpeed * BONUS_SPEED_MULTIPLIER * delta * 60

        // Обновляем позицию модели
        const group = meshRefs.current.get(bonus.id)
        if (group) {
          group.position.set(bonus.position.x, bonus.position.y, bonus.position.z)
          
          // Вращение бонуса
          const rotationSpeed = 2.0
          group.rotation.y += rotationSpeed * delta
          group.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.3
          
          // Пульсация размера ореола для лучшей видимости
          const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15
          group.children.forEach((child) => {
            if (child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry) {
              child.scale.set(pulse, pulse, pulse)
            }
          })
        }

        // Проверка подбора бонуса
        const dx = bonus.position.x - playerPos.x
        const dy = bonus.position.y - playerPos.y
        const dz = Math.abs(bonus.position.z - playerPos.z)
        
        const distance = Math.sqrt(dx * dx + dy * dy)
        const playerRadius = 0.5 // Увеличен радиус игрока для легче подбора
        
        // Подбор бонуса если близко (увеличен радиус подбора)
        if (distance < playerRadius + BONUS_SIZE && dz < 1.5) {
          activateSpeedBonus()
          meshRefs.current.delete(bonus.id)
          return // Удаляем бонус
        }

        // Удаляем бонус если он прошел мимо
        if (bonus.position.z > BONUS_DESPAWN_DISTANCE) {
          meshRefs.current.delete(bonus.id)
          return // Удаляем бонус
        }

        updated.push(bonus)
      })

      return updated
    })
  })

  return (
    <group ref={bonusRef}>
      {bonuses.map((bonus) => {
        // Клонируем модель для каждого бонуса
        const clonedScene = bonusScene.clone()
        
        return (
          <group
            key={bonus.id}
            ref={(group: THREE.Group | null) => {
              if (group) {
                meshRefs.current.set(bonus.id, group)
              }
            }}
            position={[bonus.position.x, bonus.position.y, bonus.position.z]}
          >
            {/* Пульсирующий светящийся ореол вокруг бонуса */}
            <mesh>
              <sphereGeometry args={[BONUS_SIZE * 1.3, 16, 16]} />
              <meshStandardMaterial
                color="#00ff00"
                emissive="#00ff00"
                emissiveIntensity={0.3}
                transparent
                opacity={0.2}
              />
            </mesh>
            {/* Модель бонуса */}
            <primitive
              object={clonedScene}
              scale={MODEL_SCALE}
            />
          </group>
        )
      })}
    </group>
  )
}
