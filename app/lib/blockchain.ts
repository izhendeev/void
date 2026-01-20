/**
 * Blockchain integration for saving game records on Base
 * Безопасная реализация для прохождения модерации Base
 */

import { sdk } from '@farcaster/miniapp-sdk'
import { ethers } from 'ethers'

// Адрес контракта (обновите после деплоя)
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

/**
 * ABI контракта GameLeaderboard для взаимодействия
 * Соответствует контракту contracts/GameLeaderboard.sol
 */
const CONTRACT_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'score', type: 'uint256' }],
    name: 'saveRecord',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMyRecord',
    outputs: [
      { internalType: 'uint256', name: 'bestScore', type: 'uint256' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'getRecord',
    outputs: [
      { internalType: 'uint256', name: 'bestScore', type: 'uint256' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

/**
 * Сохранить рекорд игрока на блокчейне Base
 * @param score Счет для сохранения
 * @returns Promise с результатом транзакции (txHash) или null
 */
export async function saveRecordToBlockchain(score: number): Promise<string | null> {
  try {
    // Базовые проверки
    if (!Number.isFinite(score) || score < 0) {
      return null
    }

    if (!sdk?.wallet) {
      console.warn('Base App wallet not available. Running outside Base App context.')
      return null
    }

    if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      console.warn('Contract not deployed. Please deploy contract first.')
      return null
    }

    const provider = await sdk.wallet.getEthereumProvider()
    if (!provider) {
      return null
    }

    // Используем ethers.js для безопасного взаимодействия с контрактом
    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = await ethersProvider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

    // Вызываем saveRecord через контракт
    const tx = await contract.saveRecord(score)
    
    // Ждем подтверждения транзакции
    await tx.wait()

    return tx.hash
  } catch (error) {
    // Если пользователь отклонил транзакцию - это нормально
    if (error && typeof error === 'object' && 'code' in error && error.code === 4001) {
      return null
    }
    console.error('Error saving record:', error)
    return null
  }
}

/**
 * Получить рекорд игрока из блокчейна
 * @param userAddress Адрес кошелька игрока (опционально, если не указан - текущий игрок)
 * @returns Promise с рекордом или null
 */
export async function getRecordFromBlockchain(
  userAddress?: string
): Promise<{ bestScore: number; timestamp: number } | null> {
  try {
    if (!sdk?.wallet) {
      return null
    }

    if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      return null
    }

    const provider = await sdk.wallet.getEthereumProvider()
    if (!provider) {
      return null
    }

    const ethersProvider = new ethers.BrowserProvider(provider)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, ethersProvider)

    // Если адрес не указан, получаем рекорд текущего игрока
    if (!userAddress) {
      const [bestScore, timestamp] = await contract.getMyRecord()
      return {
        bestScore: Number(bestScore),
        timestamp: Number(timestamp),
      }
    }

    // Получаем рекорд указанного игрока
    const [bestScore, timestamp] = await contract.getRecord(userAddress)
    return {
      bestScore: Number(bestScore),
      timestamp: Number(timestamp),
    }
  } catch (error) {
    console.error('Error getting record from blockchain:', error)
    return null
  }
}

