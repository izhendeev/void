'use client'

import { create } from 'zustand'
import { saveRecordToBlockchain } from '@/app/lib/blockchain'

interface GameState {
  isPlaying: boolean
  isGameOver: boolean
  score: number
  bestScore: number // Лучший рекорд (локально)
  gameSpeed: number
  baseGameSpeed: number // Базовая скорость без бонуса
  playerPosition: { x: number; y: number; z: number }
  isSavingRecord: boolean // Состояние сохранения рекорда
  isSpeedBonusActive: boolean // Активен ли бонус X2
  speedBonusEndTime: number // Время окончания бонуса
  startGame: () => void
  stopGame: () => void
  endGame: () => void
  addScore: (points: number) => void
  updatePlayerPosition: (x: number, y: number, z: number) => void
  saveRecordToBlockchain: () => Promise<void>
  setBestScore: (score: number) => void
  activateSpeedBonus: () => void // Активировать бонус X2 на 5 секунд
  updateSpeedBonus: () => void // Обновить состояние бонуса (проверка таймера)
}

export const useGameStore = create<GameState>((set, get) => ({
  isPlaying: false,
  isGameOver: false,
  score: 0,
  bestScore: 0, // Лучший рекорд (локально)
  gameSpeed: 0.39, // Замедлена скорость полета (уменьшена еще)
  baseGameSpeed: 0.39, // Базовая скорость без бонуса (уменьшена еще)
  playerPosition: { x: 0, y: 0, z: 0 },
  isSavingRecord: false,
  isSpeedBonusActive: false,
  speedBonusEndTime: 0,
  startGame: () => set({ 
    isPlaying: true, 
    isGameOver: false, 
    score: 0, 
    gameSpeed: 0.39, 
    baseGameSpeed: 0.39,
    isSpeedBonusActive: false,
    speedBonusEndTime: 0
  }),
  stopGame: () => set({ isPlaying: false }),
  endGame: () => {
    const currentScore = get().score
    const bestScore = get().bestScore
    // Обновляем лучший рекорд, если текущий счет лучше
    if (currentScore > bestScore) {
      set({ bestScore: currentScore, isPlaying: false, isGameOver: true, isSpeedBonusActive: false })
    } else {
      set({ isPlaying: false, isGameOver: true, isSpeedBonusActive: false })
    }
  },
  addScore: (points: number) => {
    const currentScore = get().score
    const newScore = currentScore + points
    const { isSpeedBonusActive, baseGameSpeed } = get()
    const newBaseSpeed = 0.39 + Math.floor(newScore / 100) * 0.04 // Увеличение скорости каждые 100 очков (от базовой 0.39)
    // Применяем бонус X2 к базовой скорости, если активен
    const newSpeed = isSpeedBonusActive ? newBaseSpeed * 2 : newBaseSpeed
    set({ 
      score: newScore, 
      baseGameSpeed: newBaseSpeed,
      gameSpeed: newSpeed 
    })
  },
  updatePlayerPosition: (x: number, y: number, z: number) => {
    set({ playerPosition: { x, y, z } })
  },
  setBestScore: (score: number) => {
    set({ bestScore: score })
  },
  activateSpeedBonus: () => {
    const { baseGameSpeed } = get()
    const endTime = Date.now() + 5000 // 5 секунд
    set({ 
      isSpeedBonusActive: true, 
      speedBonusEndTime: endTime,
      gameSpeed: baseGameSpeed * 2 // Увеличиваем скорость в 2 раза
    })
  },
  updateSpeedBonus: () => {
    const { isSpeedBonusActive, speedBonusEndTime, baseGameSpeed } = get()
    if (isSpeedBonusActive && Date.now() >= speedBonusEndTime) {
      // Бонус закончился
      set({ 
        isSpeedBonusActive: false, 
        gameSpeed: baseGameSpeed // Возвращаем базовую скорость
      })
    }
  },
  saveRecordToBlockchain: async () => {
    const { score, isSavingRecord } = get()
    if (isSavingRecord) return // Предотвращаем повторные вызовы

    set({ isSavingRecord: true })
    try {
      const txHash = await saveRecordToBlockchain(score)
      if (txHash) {
        console.log('Record saved to blockchain:', txHash)
        // Опционально: можно показать уведомление об успехе
      }
    } catch (error) {
      console.error('Failed to save record:', error)
    } finally {
      set({ isSavingRecord: false })
    }
  },
}))
