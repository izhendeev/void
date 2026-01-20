'use client'

import { Canvas } from '@react-three/fiber'
import { useState, useRef, Suspense } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import Player from './Player'
import Stars from './Stars'
import Obstacles from './Obstacles'
import Bonus from './Bonus'
import CameraController from './CameraController'
import { useGameStore } from '@/app/stores/gameStore'

// Компоненты для предзагрузки моделей (скрыты, но загружают модели)
function ObstaclesPreload() {
  useLoader(GLTFLoader, '/models/asteroid.glb')
  useLoader(GLTFLoader, '/models/asteroid2.glb')
  return null
}

function BonusPreload() {
  useLoader(GLTFLoader, '/models/bonus.glb')
  return null
}

export default function GameScene() {
  const [touchDelta, setTouchDelta] = useState({ x: 0, y: 0 })
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null)
  const smoothedDeltaRef = useRef({ x: 0, y: 0 })
  const { isPlaying } = useGameStore()

  const handleMove = (clientX: number, clientY: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect()
    
    // Нормализуем координаты от -1 до 1
    const x = ((clientX - rect.left) / rect.width) * 2 - 1
    const y = -(((clientY - rect.top) / rect.height) * 2 - 1)
    
    if (lastPositionRef.current) {
      // Вычисляем относительное движение (delta)
      let deltaX = x - lastPositionRef.current.x
      let deltaY = y - lastPositionRef.current.y
      
      // Ограничиваем максимальное изменение для предотвращения резких скачков
      const maxDelta = 0.1
      deltaX = Math.max(-maxDelta, Math.min(maxDelta, deltaX))
      deltaY = Math.max(-maxDelta, Math.min(maxDelta, deltaY))
      
      // Применяем экспоненциальное сглаживание для более плавного движения
      const smoothingFactor = 0.7
      smoothedDeltaRef.current.x = smoothedDeltaRef.current.x * smoothingFactor + deltaX * (1 - smoothingFactor)
      smoothedDeltaRef.current.y = smoothedDeltaRef.current.y * smoothingFactor + deltaY * (1 - smoothingFactor)
      
      // Обновляем delta только если есть реальное движение
      if (Math.abs(smoothedDeltaRef.current.x) > 0.0001 || Math.abs(smoothedDeltaRef.current.y) > 0.0001) {
        setTouchDelta({ 
          x: smoothedDeltaRef.current.x, 
          y: smoothedDeltaRef.current.y 
        })
      } else {
        setTouchDelta({ x: 0, y: 0 })
      }
    }
    
    lastPositionRef.current = { x, y }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1
    const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1)
    lastPositionRef.current = { x, y }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY, e.currentTarget)
  }

  const handleTouchEnd = () => {
    lastPositionRef.current = null
    smoothedDeltaRef.current = { x: 0, y: 0 }
    setTouchDelta({ x: 0, y: 0 })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons === 1) { // Левая кнопка нажата
      e.preventDefault()
      handleMove(e.clientX, e.clientY, e.currentTarget)
    } else {
      // Если кнопка не нажата, обнуляем delta
      setTouchDelta({ x: 0, y: 0 })
      lastPositionRef.current = null
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    lastPositionRef.current = { x, y }
  }

  const handleMouseUp = () => {
    lastPositionRef.current = null
    smoothedDeltaRef.current = { x: 0, y: 0 }
    setTouchDelta({ x: 0, y: 0 })
  }

  const handleMouseLeave = () => {
    lastPositionRef.current = null
    smoothedDeltaRef.current = { x: 0, y: 0 }
    setTouchDelta({ x: 0, y: 0 })
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        touchAction: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 75 }}
        gl={{ 
          antialias: false,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
        }}
        dpr={[1, 2]} // Ограничиваем DPR для мобильных (не больше 2x)
        performance={{ min: 0.5 }} // Снижаем качество при низком FPS
        frameloop="always"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Космический туман для глубины - осветлен */}
        <fog attach="fog" args={['#000033', 50, 300]} />
        
        <ambientLight intensity={1.5} />
        <pointLight position={[5, 5, 5]} intensity={1.15} />
        {/* Источник света сзади для подсветки кубика */}
        <pointLight position={[0, 0, 3]} intensity={2.7} color="#4a9eff" />
        
        <CameraController />
        <Stars />
        <Suspense fallback={null}>
          <Player touchDelta={touchDelta} />
          {/* Предзагружаем Obstacles и Bonus заранее (скрыты, но модели загружены) */}
          <ObstaclesPreload />
          <BonusPreload />
        </Suspense>
        {isPlaying && (
          <Suspense fallback={null}>
            <Obstacles />
            <Bonus />
          </Suspense>
        )}
      </Canvas>
    </div>
  )
}
