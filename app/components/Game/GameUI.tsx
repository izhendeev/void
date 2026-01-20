'use client'

import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/app/stores/gameStore'
import Leaderboard from './Leaderboard'

const retroStyle = {
  fontFamily: '"Michroma", monospace',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  textShadow: '0 0 10px rgba(74, 158, 255, 0.8), 0 0 20px rgba(74, 158, 255, 0.5)',
  color: 'var(--accent-color)',
  // Улучшенная контрастность для Base App guidelines
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
} as const

export default function GameUI() {
  const { isPlaying, isGameOver, score, bestScore, isSavingRecord, isSpeedBonusActive, speedBonusEndTime, startGame, stopGame, saveRecordToBlockchain, updateSpeedBonus } = useGameStore()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [bonusTimeLeft, setBonusTimeLeft] = useState(0)

  // Управление музыкой в зависимости от состояния игры
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Инициализация audio элемента
    audio.loop = true
    audio.volume = isMuted ? 0 : 0.5 // Устанавливаем громкость в зависимости от isMuted
    audio.muted = isMuted

    // Запускаем музыку когда игра начинается
    if (isPlaying && !isGameOver && !isMuted) {
      audio.play().catch((err) => {
        console.log('Music play failed:', err)
      })
    } else if (!isPlaying || isGameOver) {
      // Останавливаем музыку при остановке игры или Game Over
      audio.pause()
      if (isGameOver) {
        audio.currentTime = 0 // Сбрасываем на начало при Game Over
      }
    }
  }, [isPlaying, isGameOver, isMuted])

  // Обновление таймера бонуса
  useEffect(() => {
    if (!isPlaying || !isSpeedBonusActive) {
      setBonusTimeLeft(0)
      return
    }

    const updateTimer = setInterval(() => {
      updateSpeedBonus()
      if (speedBonusEndTime > 0) {
        const timeLeft = Math.max(0, Math.ceil((speedBonusEndTime - Date.now()) / 1000))
        setBonusTimeLeft(timeLeft)
      }
    }, 100) // Обновляем каждые 100мс для плавности

    return () => clearInterval(updateTimer)
  }, [isPlaying, isSpeedBonusActive, speedBonusEndTime, updateSpeedBonus])

  if (isGameOver) {
    return (
      <>
        {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
        
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-overlay)',
            zIndex: 100,
          }}
        >
          {/* Кнопки управления в правом верхнем углу */}
          <div
            style={{
              position: 'fixed',
              top: '15px',
              right: '15px',
              display: 'flex',
              gap: '10px',
              zIndex: 101,
              pointerEvents: 'auto',
            }}
          >
            {/* Кнопка звука */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{
                ...retroStyle,
                width: '44px',
                height: '44px',
                minWidth: '44px',
                minHeight: '44px',
                fontSize: '20px',
                  background: 'var(--bg-button)',
                color: '#4a9eff',
                  border: '1px solid var(--border-color)',
                borderRadius: '0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#4a9eff'
                e.currentTarget.style.color = '#000000'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'
                e.currentTarget.style.color = '#4a9eff'
              }}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ ...retroStyle, fontSize: '36px', marginBottom: '30px' }}>Game Over</h2>
            <p style={{ ...retroStyle, fontSize: '20px', marginBottom: '10px', color: '#ffffff' }}>
              Final Score: {score}
            </p>
            {bestScore > 0 && (
              <p style={{ ...retroStyle, fontSize: '16px', marginBottom: '30px', color: '#aaaaaa' }}>
                Best Score: {bestScore}
              </p>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
              {score === bestScore && score > 0 && (
              <button
                onClick={saveRecordToBlockchain}
                disabled={isSavingRecord}
                style={{
                  ...retroStyle,
                  padding: '14px 40px',
                  minHeight: '44px',
                  fontSize: '16px',
                  background: 'transparent',
                  color: isSavingRecord ? '#888888' : '#4a9eff',
                  border: `2px solid ${isSavingRecord ? '#888888' : '#4a9eff'}`,
                  borderRadius: '0',
                  cursor: isSavingRecord ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: isSavingRecord ? 0.6 : 1,
                }}
                  onMouseEnter={(e) => {
                    if (!isSavingRecord) {
                      e.currentTarget.style.background = '#4a9eff'
                      e.currentTarget.style.color = '#000000'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSavingRecord) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#4a9eff'
                    }
                  }}
                >
                  {isSavingRecord ? 'Saving...' : 'Save Record'}
                </button>
              )}
              
              <button
                onClick={startGame}
                style={{
                  ...retroStyle,
                  padding: '16px 45px',
                  minHeight: '44px',
                  fontSize: '18px',
                  background: 'transparent',
                  color: 'var(--accent-color)',
                  border: '2px solid var(--border-color)',
                  borderRadius: '0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#4a9eff'
                  e.currentTarget.style.color = '#000000'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#4a9eff'
                }}
              >
                Restart
              </button>

              <button
                onClick={() => setShowLeaderboard(true)}
                style={{
                  ...retroStyle,
                  padding: '14px 40px',
                  minHeight: '44px',
                  fontSize: '14px',
                  background: 'transparent',
                  color: 'var(--text-tertiary)',
                  border: '1px solid #888888',
                  borderRadius: '0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#4a9eff'
                  e.currentTarget.style.color = '#000000'
                  e.currentTarget.style.borderColor = '#4a9eff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#888888'
                  e.currentTarget.style.borderColor = '#888888'
                }}
              >
                Leaderboard
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!isPlaying) {
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
          background: 'rgba(0, 0, 0, 0.9)',
          zIndex: 100,
          padding: '40px',
        }}
      >
        <h1 style={{ ...retroStyle, fontSize: '48px', marginBottom: '40px' }}>
          VOID³
        </h1>
        
        <div style={{ textAlign: 'center', marginBottom: '50px', maxWidth: '500px' }}>
          <p style={{ ...retroStyle, fontSize: '14px', color: '#ffffff', marginBottom: '20px', lineHeight: '1.8' }}>
            Dodge the asteroids
          </p>
          <p style={{ ...retroStyle, fontSize: '13px', color: '#888888', lineHeight: '1.8', letterSpacing: '1.5px' }}>
            Swipe to move
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
          <button
            onClick={startGame}
            style={{
              ...retroStyle,
              padding: '18px 50px',
              minHeight: '44px',
              fontSize: '20px',
              background: 'transparent',
              color: '#4a9eff',
              border: '2px solid #4a9eff',
              borderRadius: '0',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4a9eff'
              e.currentTarget.style.color = '#000000'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#4a9eff'
            }}
          >
            Start
          </button>

          <button
            onClick={() => setShowLeaderboard(true)}
            style={{
              ...retroStyle,
              padding: '12px 35px',
              fontSize: '14px',
              background: 'transparent',
              color: '#888888',
              border: '1px solid #888888',
              borderRadius: '0',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4a9eff'
              e.currentTarget.style.color = '#000000'
              e.currentTarget.style.borderColor = '#4a9eff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#888888'
              e.currentTarget.style.borderColor = '#888888'
            }}
          >
            Leaderboard
          </button>
        </div>
      </div>
    )
  }

  // Игровой интерфейс - счет
  return (
    <>
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      
      {/* Скрытый audio элемент для фоновой музыки */}
      <audio
        id="background-music"
        ref={audioRef}
        src="/music.mp3"
        preload="auto"
        loop
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          padding: '20px',
          ...retroStyle,
          fontSize: '20px',
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        <div>Score: {score}</div>
        {isSpeedBonusActive && bonusTimeLeft > 0 && (
          <div
            style={{
              marginTop: '10px',
              fontSize: '16px',
              color: '#FFD700',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5)',
            }}
          >
            X2 SPEED! {bonusTimeLeft}s
          </div>
        )}
      </div>
      
      {/* Кнопки управления в правом верхнем углу */}
      <div
        style={{
          position: 'fixed',
          top: '15px',
          right: '15px',
          display: 'flex',
          gap: '10px',
          zIndex: 100,
          pointerEvents: 'auto',
        }}
      >
        {/* Кнопка звука */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          style={{
            ...retroStyle,
            width: '44px',
            height: '44px',
            minWidth: '44px',
            minHeight: '44px',
            fontSize: '20px',
                  background: 'var(--bg-button)',
            color: '#4a9eff',
                  border: '1px solid var(--border-color)',
            borderRadius: '0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#4a9eff'
            e.currentTarget.style.color = '#000000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'
            e.currentTarget.style.color = '#4a9eff'
          }}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        
        {/* Кнопка рестарта */}
        <button
          onClick={stopGame}
          style={{
            ...retroStyle,
            width: '44px',
            height: '44px',
            minWidth: '44px',
            minHeight: '44px',
            fontSize: '18px',
                  background: 'var(--bg-button)',
            color: '#4a9eff',
                  border: '1px solid var(--border-color)',
            borderRadius: '0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#4a9eff'
            e.currentTarget.style.color = '#000000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'
            e.currentTarget.style.color = '#4a9eff'
          }}
        >
          ⏸
        </button>
        
        {/* Кнопка лидерборда */}
        <button
          onClick={() => setShowLeaderboard(true)}
          style={{
            ...retroStyle,
            width: '44px',
            height: '44px',
            minWidth: '44px',
            minHeight: '44px',
            fontSize: '18px',
                  background: 'var(--bg-button)',
            color: '#4a9eff',
                  border: '1px solid var(--border-color)',
            borderRadius: '0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#4a9eff'
            e.currentTarget.style.color = '#000000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'
            e.currentTarget.style.color = '#4a9eff'
          }}
        >
          🏆
        </button>
      </div>
    </>
  )
}
