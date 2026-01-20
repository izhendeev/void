'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { sdk } from '@farcaster/miniapp-sdk'
import GameUI from './components/Game/GameUI'

// Динамический импорт с отключением SSR для избежания проблем с Three.js при пререндеринге
const ModelLoader = dynamic(() => import('./components/Game/ModelLoader'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000011',
      color: '#4a9eff',
      fontFamily: '"Michroma", monospace',
    }}>
      <div style={{ fontSize: '24px', textTransform: 'uppercase', letterSpacing: '2px' }}>VOID³</div>
    </div>
  )
})

export default function Home() {
  useEffect(() => {
    // Вызываем ready() только если SDK доступен (в Base App)
    try {
      if (sdk?.actions?.ready) {
        sdk.actions.ready()
      }
    } catch (error) {
      // SDK может быть недоступен вне Base App - это нормально
      console.log('SDK not available (running outside Base App)')
    }
  }, [])

  return (
    <main style={{ 
      width: '100%', 
      height: '100vh', 
      overflow: 'hidden', 
      position: 'relative',
      margin: 0,
      padding: 0
    }}>
      <ModelLoader />
      <GameUI />
    </main>
  )
}
