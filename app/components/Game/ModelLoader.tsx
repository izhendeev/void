'use client'

import { Suspense, useState, useEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import GameScene from './GameScene'

// Компонент для предзагрузки моделей
function ModelPreloader({ onComplete }: { onComplete: () => void }) {
  // Загружаем модели заранее - они будут закэшированы для всех компонентов
  useLoader(GLTFLoader, '/models/player.glb')
  useLoader(GLTFLoader, '/models/asteroid.glb')
  useLoader(GLTFLoader, '/models/asteroid2.glb')
  useLoader(GLTFLoader, '/models/bonus.glb')
  
  // Уведомляем о завершении загрузки
  useEffect(() => {
    // Небольшая задержка чтобы убедиться что модели действительно загружены
    const timer = setTimeout(() => {
      onComplete()
    }, 300)
    return () => clearTimeout(timer)
  }, [onComplete])
  
  return null
}

// Loading индикатор
function LoadingScreen({ progress }: { progress: number }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000011',
        color: '#4a9eff',
        fontFamily: '"Michroma", monospace',
        zIndex: 1000,
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
        VOID³
      </div>
      <div style={{ width: '200px', height: '2px', background: 'rgba(74, 158, 255, 0.3)', marginBottom: '10px' }}>
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: '#4a9eff',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <div style={{ fontSize: '12px', color: '#888888' }}>Loading models...</div>
    </div>
  )
}

export default function ModelLoader() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleComplete = () => {
    setProgress(100)
    // Небольшая задержка перед показом игры для плавности
    setTimeout(() => {
      setIsLoaded(true)
    }, 200)
  }

  useEffect(() => {
    // Постепенный прогресс до завершения
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 85) {
          return prev + 5
        }
        return prev
      })
    }, 150)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {!isLoaded && <LoadingScreen progress={progress} />}
      <Suspense fallback={null}>
        <ModelPreloader onComplete={handleComplete} />
      </Suspense>
      {isLoaded && <GameScene />}
    </>
  )
}
