'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Player {
  x: number
  y: number
  size: number
  speed: number
  health: number
  maxHealth: number
}

interface Enemy {
  id: number
  x: number
  y: number
  size: number
  speed: number
  health: number
  maxHealth: number
}

interface Weapon {
  id: string
  name: string
  damage: number
  range: number
  cooldown: number
  lastFired: number
  level: number
  maxLevel: number
}

interface Projectile {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  damage: number
  weaponId: string
}

interface GameState {
  player: Player
  enemies: Enemy[]
  weapons: Weapon[]
  projectiles: Projectile[]
  score: number
  time: number
  gameStarted: boolean
  gameOver: boolean
  showGameOver: boolean
  playerName: string
  showSubmitForm: boolean
}

const WEAPONS = {
  whip: {
    name: '鞭子',
    damage: 20,
    range: 80,
    cooldown: 500,
    maxLevel: 3
  },
  magicWand: {
    name: '魔法杖',
    damage: 15,
    range: 120,
    cooldown: 300,
    maxLevel: 3
  }
}

export default function SurvivorGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<GameState>({
    player: {
      x: 400,
      y: 300,
      size: 20,
      speed: 3,
      health: 100,
      maxHealth: 100
    },
    enemies: [],
    weapons: [
      { ...WEAPONS.whip, id: 'whip', lastFired: 0, level: 1 },
      { ...WEAPONS.magicWand, id: 'magicWand', lastFired: 0, level: 1 }
    ],
    projectiles: [],
    score: 0,
    time: 0,
    gameStarted: false,
    gameOver: false,
    showGameOver: false,
    playerName: '',
    showSubmitForm: false
  })

  const [keys, setKeys] = useState<Set<string>>(new Set())
  const animationRef = useRef<number>()

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev)
        newKeys.delete(e.key)
        return newKeys
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // 开始游戏
  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      gameOver: false,
      showGameOver: false,
      score: 0,
      time: 0,
      player: {
        ...prev.player,
        health: prev.player.maxHealth
      },
      enemies: [],
      projectiles: [],
      weapons: [
        { ...WEAPONS.whip, id: 'whip', lastFired: 0, level: 1 },
        { ...WEAPONS.magicWand, id: 'magicWand', lastFired: 0, level: 1 }
      ]
    }))
  }

  // 提交分数
  const submitScore = async () => {
    if (!gameState.playerName.trim()) {
      alert('请输入你的名字')
      return
    }

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: gameState.playerName,
          score: gameState.score,
          gameType: 'survivor'
        }),
      })

      if (response.ok) {
        alert('分数提交成功！')
        setGameState(prev => ({
          ...prev,
          showSubmitForm: false,
          playerName: ''
        }))
      } else {
        alert('分数提交失败，请重试')
      }
    } catch (error) {
      console.error('提交分数失败:', error)
      alert('分数提交失败，请重试')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">幸存者游戏</h1>
          <p className="text-gray-600 mb-4">
            使用 WASD 或方向键移动，自动攻击敌人，生存越久分数越高！
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="text-center">
          {!gameState.gameStarted && !gameState.gameOver && (
            <button
              onClick={startGame}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              开始游戏
            </button>
          )}
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">游戏说明</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">控制方式</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• WASD 或方向键：移动角色</li>
                <li>• 自动攻击：武器会自动攻击附近的敌人</li>
                <li>• 躲避敌人：不要让敌人碰到你</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">武器系统</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• 鞭子：近距离扇形攻击</li>
                <li>• 魔法杖：直线魔法弹</li>
                <li>• 每30秒武器自动升级</li>
                <li>• 生存时间越长，敌人越强</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 