'use client'

import { useState, useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
import { getRecordFromBlockchain } from '@/app/lib/blockchain'
import { ethers } from 'ethers'

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

interface LeaderboardEntry {
  player: string // address для связи с блокчейном
  username?: string
  avatarUrl?: string
  score: number
  timestamp: number
}

interface LeaderboardProps {
  onClose: () => void
}

export default function Leaderboard({ onClose }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [myAddress, setMyAddress] = useState<string | null>(null)
  const [myUsername, setMyUsername] = useState<string | null>(null)
  const [myAvatarUrl, setMyAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    // Получаем информацию о текущем пользователе через SDK context
    const getUserInfo = async () => {
      try {
        // Получаем адрес через wallet
        if (sdk?.wallet) {
          const provider = await sdk.wallet.getEthereumProvider()
          if (provider) {
            const ethersProvider = new ethers.BrowserProvider(provider)
            const signer = await ethersProvider.getSigner()
            const address = await signer.getAddress()
            setMyAddress(address)
          }
        }

        // Получаем username и avatar через context
        if (sdk?.context) {
          try {
            // sdk.context уже является промисом
            const context = await sdk.context
            if (context?.user) {
              setMyUsername(context.user.username || null)
              setMyAvatarUrl(context.user.pfpUrl || null)
            }
          } catch (error) {
            // Context может быть недоступен вне Base App
            console.log('Could not get user context:', error)
          }
        }
      } catch (error) {
        console.log('Could not get user info:', error)
      }
    }

    getUserInfo()
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      // Простой лидерборд: показываем только рекорд текущего игрока
      // Контракт хранит только индивидуальные рекорды, без общего топ-листа
      if (!myAddress) {
        setLeaderboard([])
        return
      }

      const myRecord = await getRecordFromBlockchain(myAddress)
      if (myRecord && myRecord.bestScore > 0) {
        setLeaderboard([
          {
            player: myAddress.toLowerCase(),
            score: myRecord.bestScore,
            timestamp: myRecord.timestamp,
            username: myUsername || undefined,
            avatarUrl: myAvatarUrl || undefined,
          },
        ])
      } else {
        setLeaderboard([])
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  const formatDisplayName = (entry: LeaderboardEntry) => {
    // Показываем username если есть, иначе форматированный адрес
    if (entry.username) {
      return entry.username
    }
    if (entry.player) {
      return `${entry.player.slice(0, 6)}...${entry.player.slice(-4)}`
    }
    return '---'
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp || timestamp === 0) return '---'
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleDateString()
  }

  return (
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
        zIndex: 200,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-overlay-light)',
          border: '2px solid var(--border-color)',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ ...retroStyle, fontSize: '32px', margin: 0 }}>Leaderboard</h2>
          <button
            onClick={onClose}
            style={{
              ...retroStyle,
              width: '44px',
              height: '44px',
              minWidth: '44px',
              minHeight: '44px',
              fontSize: '24px',
              background: 'transparent',
              color: 'var(--accent-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '0',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p style={{ ...retroStyle, color: 'var(--text-secondary)', textAlign: 'center' }}>Loading...</p>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ ...retroStyle, color: 'var(--text-secondary)', marginBottom: '10px' }}>
              No records saved yet.
            </p>
            <p style={{ ...retroStyle, fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
              Save your best score on blockchain to see it here.
            </p>
            {myUsername && (
              <p style={{ ...retroStyle, fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Logged in as: {myUsername}
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {leaderboard.map((entry, index) => {
              const isMyRecord = myAddress?.toLowerCase() === entry.player?.toLowerCase()
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 15px',
                    background: isMyRecord ? 'rgba(74, 158, 255, 0.2)' : 'rgba(74, 158, 255, 0.05)',
                    border: isMyRecord ? '1px solid var(--border-color)' : '1px solid var(--border-color-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ ...retroStyle, fontSize: '18px', minWidth: '30px' }}>
                      #{index + 1}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {entry.avatarUrl && (
                        <img
                          src={entry.avatarUrl}
                          alt=""
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                      <div>
                        <div style={{ ...retroStyle, fontSize: '14px', color: 'var(--text-primary)' }}>
                          {formatDisplayName(entry)}
                          {isMyRecord && (
                            <span style={{ marginLeft: '8px', color: 'var(--accent-color)' }}>(You)</span>
                          )}
                        </div>
                        <div style={{ ...retroStyle, fontSize: '10px', color: 'var(--text-secondary)' }}>
                          {formatDate(entry.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <span style={{ ...retroStyle, fontSize: '20px', color: 'var(--accent-color)' }}>
                    {entry.score}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ ...retroStyle, fontSize: '10px', color: 'var(--text-tertiary)' }}>
            * Your best score is saved on Base blockchain
          </p>
        </div>
      </div>
    </div>
  )
}
