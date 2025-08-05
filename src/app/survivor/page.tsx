'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/components/LanguageProvider'

// 游戏配置
const GAME_CONFIG = {
  CANVAS_WIDTH: 1200,
  CANVAS_HEIGHT: 800,
  PLAYER_SPEED: 3,
  ENEMY_BASE_SPEED: 1.5,
  EXPERIENCE_RANGE: 50,
  LEVEL_UP_EXPERIENCE_BASE: 100,
  WEAPON_COOLDOWNS: {
    magic_missile: 800,
    fireball: 1200,
    lightning: 600,
    ice_shard: 1000,
    holy_water: 2000
  }
}

// 接口定义
interface Player {
  x: number
  y: number
  level: number
  experience: number
  experienceToNext: number
  health: number
  maxHealth: number
  speed: number
}

interface Enemy {
  id: number
  x: number
  y: number
  health: number
  maxHealth: number
  speed: number
  type: 'zombie' | 'skeleton' | 'bat' | 'ghost'
  damage: number
  experienceValue: number
}

interface Weapon {
  id: string
  name: string
  level: number
  damage: number
  cooldown: number
  lastFired: number
  projectileSpeed: number
  range: number
  description: string
}

interface Projectile {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  damage: number
  weaponId: string
  size: number
  color: string
}

interface ExperienceGem {
  id: number
  x: number
  y: number
  value: number
  collected: boolean
}

export default function VampireSurvivorGame() {
  const { t } = useLanguage()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const keysRef = useRef<Set<string>>(new Set())
  
  // 游戏状态
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'levelUp' | 'gameOver'>('menu')
  const [score, setScore] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [waveNumber, setWaveNumber] = useState(1)
  
  // 游戏对象
  const [player, setPlayer] = useState<Player>({
    x: GAME_CONFIG.CANVAS_WIDTH / 2,
    y: GAME_CONFIG.CANVAS_HEIGHT / 2,
    level: 1,
    experience: 0,
    experienceToNext: GAME_CONFIG.LEVEL_UP_EXPERIENCE_BASE,
    health: 100,
    maxHealth: 100,
    speed: GAME_CONFIG.PLAYER_SPEED
  })
  
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [projectiles, setProjectiles] = useState<Projectile[]>([])
  const [experienceGems, setExperienceGems] = useState<ExperienceGem[]>([])
  const [weapons, setWeapons] = useState<Weapon[]>([
    {
      id: 'magic_missile',
      name: '魔法导弹',
      level: 1,
      damage: 25,
      cooldown: GAME_CONFIG.WEAPON_COOLDOWNS.magic_missile,
      lastFired: 0,
      projectileSpeed: 8,
      range: 300,
      description: '自动追踪最近的敌人'
    }
  ])
  
  const [availableWeapons] = useState<Omit<Weapon, 'level' | 'lastFired'>[]>([
    {
      id: 'fireball',
      name: '火球术',
      damage: 45,
      cooldown: GAME_CONFIG.WEAPON_COOLDOWNS.fireball,
      projectileSpeed: 6,
      range: 250,
      description: '造成范围伤害的火球'
    },
    {
      id: 'lightning',
      name: '闪电链',
      damage: 35,
      cooldown: GAME_CONFIG.WEAPON_COOLDOWNS.lightning,
      projectileSpeed: 12,
      range: 400,
      description: '瞬间击中敌人的闪电'
    },
    {
      id: 'ice_shard',
      name: '冰锥术',
      damage: 30,
      cooldown: GAME_CONFIG.WEAPON_COOLDOWNS.ice_shard,
      projectileSpeed: 7,
      range: 280,
      description: '减慢敌人移动速度'
    },
    {
      id: 'holy_water',
      name: '圣水',
      damage: 80,
      cooldown: GAME_CONFIG.WEAPON_COOLDOWNS.holy_water,
      projectileSpeed: 5,
      range: 200,
      description: '对不死生物造成额外伤害'
    }
  ])
  
  const [levelUpOptions, setLevelUpOptions] = useState<(Weapon | { type: 'stat', name: string, description: string })[]>([])

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase())
      if (e.key === 'Escape') {
        setGameState(prev => prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev)
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase())
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // 生成敌人
  const spawnEnemies = useCallback(() => {
    const enemyTypes: Enemy['type'][] = ['zombie', 'skeleton', 'bat', 'ghost']
    // 调整敌人生成数量，降低初期难度
    const enemiesPerWave = Math.max(2, Math.min(3 + Math.floor(timeElapsed / 45), 15))
    
    for (let i = 0; i < enemiesPerWave; i++) {
      const side = Math.floor(Math.random() * 4)
      let x, y
      
      switch (side) {
        case 0: // 上
          x = Math.random() * GAME_CONFIG.CANVAS_WIDTH
          y = -50
          break
        case 1: // 右
          x = GAME_CONFIG.CANVAS_WIDTH + 50
          y = Math.random() * GAME_CONFIG.CANVAS_HEIGHT
          break
        case 2: // 下
          x = Math.random() * GAME_CONFIG.CANVAS_WIDTH
          y = GAME_CONFIG.CANVAS_HEIGHT + 50
          break
        default: // 左
          x = -50
          y = Math.random() * GAME_CONFIG.CANVAS_HEIGHT
      }
      
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)]
      // 降低初期敌人血量，让游戏更容易上手
      const baseHealth = 30 + Math.floor(timeElapsed / 15) * 8
      
      const enemy: Enemy = {
        id: Date.now() + Math.random(),
        x,
        y,
        type,
        health: baseHealth,
        maxHealth: baseHealth,
        speed: GAME_CONFIG.ENEMY_BASE_SPEED + Math.random() * 0.3, // 降低速度随机性
        damage: 8 + Math.floor(timeElapsed / 25) * 4, // 降低初期伤害
        experienceValue: 12 + Math.floor(timeElapsed / 20) * 3 // 增加经验值奖励
      }
      
      setEnemies(prev => [...prev, enemy])
    }
  }, [timeElapsed])

  // 发射投射物
  const fireWeapons = useCallback(() => {
    const currentTime = Date.now()
    
    weapons.forEach(weapon => {
      if (currentTime - weapon.lastFired >= weapon.cooldown && enemies.length > 0) {
        // 找到最近的敌人
        let nearestEnemy = enemies[0]
        let minDistance = Infinity
        
        enemies.forEach(enemy => {
          const distance = Math.sqrt(
            Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
          )
          if (distance < minDistance && distance <= weapon.range) {
            minDistance = distance
            nearestEnemy = enemy
          }
        })
        
        if (minDistance <= weapon.range) {
          const angle = Math.atan2(nearestEnemy.y - player.y, nearestEnemy.x - player.x)
          
          const projectile: Projectile = {
            id: Date.now() + Math.random(),
            x: player.x,
            y: player.y,
            vx: Math.cos(angle) * weapon.projectileSpeed,
            vy: Math.sin(angle) * weapon.projectileSpeed,
            damage: weapon.damage,
            weaponId: weapon.id,
            size: weapon.id === 'fireball' ? 12 : weapon.id === 'holy_water' ? 15 : 8,
            color: weapon.id === 'magic_missile' ? '#9333ea' : 
                   weapon.id === 'fireball' ? '#f97316' :
                   weapon.id === 'lightning' ? '#eab308' :
                   weapon.id === 'ice_shard' ? '#06b6d4' : '#10b981'
          }
          
          setProjectiles(prev => [...prev, projectile])
          setWeapons(prev => prev.map(w => 
            w.id === weapon.id ? { ...w, lastFired: currentTime } : w
          ))
        }
      }
    })
  }, [weapons, enemies, player])

  // 游戏主循环
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 清空画布
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT)
    
    // 移动玩家
    let newPlayerX = player.x
    let newPlayerY = player.y
    
    if (keysRef.current.has('w') || keysRef.current.has('arrowup')) {
      newPlayerY = Math.max(25, player.y - player.speed)
    }
    if (keysRef.current.has('s') || keysRef.current.has('arrowdown')) {
      newPlayerY = Math.min(GAME_CONFIG.CANVAS_HEIGHT - 25, player.y + player.speed)
    }
    if (keysRef.current.has('a') || keysRef.current.has('arrowleft')) {
      newPlayerX = Math.max(25, player.x - player.speed)
    }
    if (keysRef.current.has('d') || keysRef.current.has('arrowright')) {
      newPlayerX = Math.min(GAME_CONFIG.CANVAS_WIDTH - 25, player.x + player.speed)
    }
    
    setPlayer(prev => ({ ...prev, x: newPlayerX, y: newPlayerY }))
    
    // 绘制玩家
    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(newPlayerX, newPlayerY, 20, 0, Math.PI * 2)
    ctx.fill()
    
    // 玩家血条
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(newPlayerX - 25, newPlayerY - 35, 50, 6)
    ctx.fillStyle = '#22c55e'
    ctx.fillRect(newPlayerX - 25, newPlayerY - 35, (player.health / player.maxHealth) * 50, 6)
    
    // 发射武器
    fireWeapons()
    
    // 更新投射物
    setProjectiles(prev => prev.map(projectile => ({
      ...projectile,
      x: projectile.x + projectile.vx,
      y: projectile.y + projectile.vy
    })).filter(projectile => 
      projectile.x > -50 && projectile.x < GAME_CONFIG.CANVAS_WIDTH + 50 &&
      projectile.y > -50 && projectile.y < GAME_CONFIG.CANVAS_HEIGHT + 50
    ))
    
    // 绘制投射物
    projectiles.forEach(projectile => {
      ctx.fillStyle = projectile.color
      ctx.beginPath()
      ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2)
      ctx.fill()
      
      // 添加发光效果
      ctx.shadowColor = projectile.color
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(projectile.x, projectile.y, projectile.size / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    })
    
    // 更新敌人
    setEnemies(prev => prev.map(enemy => {
      const angle = Math.atan2(newPlayerY - enemy.y, newPlayerX - enemy.x)
      return {
        ...enemy,
        x: enemy.x + Math.cos(angle) * enemy.speed,
        y: enemy.y + Math.sin(angle) * enemy.speed
      }
    }))
    
    // 绘制敌人
    enemies.forEach(enemy => {
      let color = '#ef4444'
      switch (enemy.type) {
        case 'skeleton': color = '#f3f4f6'; break
        case 'bat': color = '#7c3aed'; break
        case 'ghost': color = '#6b7280'; break
      }
      
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(enemy.x, enemy.y, 15, 0, Math.PI * 2)
      ctx.fill()
      
      // 敌人血条
      if (enemy.health < enemy.maxHealth) {
        ctx.fillStyle = '#ef4444'
        ctx.fillRect(enemy.x - 15, enemy.y - 25, 30, 4)
        ctx.fillStyle = '#22c55e'
        ctx.fillRect(enemy.x - 15, enemy.y - 25, (enemy.health / enemy.maxHealth) * 30, 4)
      }
    })
    
    // 碰撞检测：投射物与敌人
    projectiles.forEach(projectile => {
      enemies.forEach(enemy => {
        const distance = Math.sqrt(
          Math.pow(projectile.x - enemy.x, 2) + Math.pow(projectile.y - enemy.y, 2)
        )
        
        if (distance < projectile.size + 15) {
          // 造成伤害
          setEnemies(prev => prev.map(e => 
            e.id === enemy.id ? { ...e, health: e.health - projectile.damage } : e
          ))
          
          // 移除投射物
          setProjectiles(prev => prev.filter(p => p.id !== projectile.id))
        }
      })
    })
    
    // 移除死亡敌人并生成经验宝石
    setEnemies(prev => {
      const aliveenemies = prev.filter(enemy => {
        if (enemy.health <= 0) {
          // 生成经验宝石
          setExperienceGems(prevGems => [...prevGems, {
            id: Date.now() + Math.random(),
            x: enemy.x,
            y: enemy.y,
            value: enemy.experienceValue,
            collected: false
          }])
          setScore(prevScore => prevScore + enemy.experienceValue * 10)
          return false
        }
        return true
      })
      return aliveenemies
    })
    
    // 绘制经验宝石
    experienceGems.forEach(gem => {
      if (!gem.collected) {
        ctx.fillStyle = '#10b981'
        ctx.beginPath()
        ctx.arc(gem.x, gem.y, 8, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.shadowColor = '#10b981'
        ctx.shadowBlur = 15
        ctx.beginPath()
        ctx.arc(gem.x, gem.y, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    })
    
    // 收集经验宝石
    setExperienceGems(prev => prev.map(gem => {
      const distance = Math.sqrt(
        Math.pow(gem.x - newPlayerX, 2) + Math.pow(gem.y - newPlayerY, 2)
      )
      
      if (distance < GAME_CONFIG.EXPERIENCE_RANGE && !gem.collected) {
        setPlayer(prevPlayer => {
          const newExp = prevPlayer.experience + gem.value
          if (newExp >= prevPlayer.experienceToNext) {
            // 升级
            setTimeout(() => {
              setGameState('levelUp')
              generateLevelUpOptions()
            }, 100)
            
            return {
              ...prevPlayer,
              experience: newExp - prevPlayer.experienceToNext,
              experienceToNext: Math.floor(prevPlayer.experienceToNext * 1.2),
              level: prevPlayer.level + 1,
              maxHealth: prevPlayer.maxHealth + 10,
              health: Math.min(prevPlayer.health + 20, prevPlayer.maxHealth + 10)
            }
          }
          return { ...prevPlayer, experience: newExp }
        })
        return { ...gem, collected: true }
      }
      return gem
    }).filter(gem => !gem.collected))
    
    // 碰撞检测：玩家与敌人
    enemies.forEach(enemy => {
      const distance = Math.sqrt(
        Math.pow(enemy.x - newPlayerX, 2) + Math.pow(enemy.y - newPlayerY, 2)
      )
      
      if (distance < 35) {
        setPlayer(prev => {
          const newHealth = prev.health - enemy.damage
          if (newHealth <= 0) {
            setGameState('gameOver')
          }
          return { ...prev, health: Math.max(0, newHealth) }
        })
      }
    })
    
    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gameState, player, enemies, projectiles, experienceGems, fireWeapons])

  // 生成升级选项
  const generateLevelUpOptions = useCallback(() => {
    const options: (Weapon | { type: 'stat', name: string, description: string })[] = []
    
    // 现有武器升级
    weapons.forEach(weapon => {
      if (weapon.level < 5) {
        options.push({
          ...weapon,
          level: weapon.level + 1,
          damage: Math.floor(weapon.damage * 1.3),
          description: `${weapon.description} (等级 ${weapon.level + 1})`
        })
      }
    })
    
    // 新武器
    availableWeapons.forEach(weaponTemplate => {
      if (!weapons.some(w => w.id === weaponTemplate.id)) {
        options.push({
          ...weaponTemplate,
          level: 1,
          lastFired: 0
        })
      }
    })
    
    // 属性提升
    options.push(
      { type: 'stat', name: '生命值提升', description: '最大生命值+20，回复全部生命值' },
      { type: 'stat', name: '移动速度提升', description: '移动速度+0.5' },
      { type: 'stat', name: '经验值吸取范围', description: '增加经验值收集范围' }
    )
    
    // 随机选择3个选项
    const shuffled = options.sort(() => 0.5 - Math.random())
    setLevelUpOptions(shuffled.slice(0, 3))
  }, [weapons, availableWeapons])

  // 选择升级选项
  const selectLevelUpOption = (option: any) => {
    if ('type' in option && option.type === 'stat') {
      switch (option.name) {
        case '生命值提升':
          setPlayer(prev => ({
            ...prev,
            maxHealth: prev.maxHealth + 20,
            health: prev.maxHealth + 20
          }))
          break
        case '移动速度提升':
          setPlayer(prev => ({ ...prev, speed: prev.speed + 0.5 }))
          break
        case '经验值吸取范围':
          // 这里可以增加经验值收集范围的逻辑
          break
      }
    } else {
      // 武器升级或新武器
      const existingWeapon = weapons.find(w => w.id === option.id)
      if (existingWeapon) {
        // 升级现有武器
        setWeapons(prev => prev.map(w => 
          w.id === option.id ? { ...w, level: option.level, damage: option.damage } : w
        ))
      } else {
        // 添加新武器
        setWeapons(prev => [...prev, option])
      }
    }
    
    setGameState('playing')
  }

  // 开始游戏
  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setTimeElapsed(0)
    setWaveNumber(1)
    setPlayer({
      x: GAME_CONFIG.CANVAS_WIDTH / 2,
      y: GAME_CONFIG.CANVAS_HEIGHT / 2,
      level: 1,
      experience: 0,
      experienceToNext: GAME_CONFIG.LEVEL_UP_EXPERIENCE_BASE,
      health: 100,
      maxHealth: 100,
      speed: GAME_CONFIG.PLAYER_SPEED
    })
    setEnemies([])
    setProjectiles([])
    setExperienceGems([])
    setWeapons([{
      id: 'magic_missile',
      name: '魔法导弹',
      level: 1,
      damage: 25,
      cooldown: GAME_CONFIG.WEAPON_COOLDOWNS.magic_missile,
      lastFired: 0,
      projectileSpeed: 8,
      range: 300,
      description: '自动追踪最近的敌人'
    }])
  }

  // 游戏时间和敌人生成
  useEffect(() => {
    if (gameState === 'playing') {
      // 游戏开始时立即生成第一批敌人
      spawnEnemies()
      
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
      
      const enemySpawner = setInterval(() => {
        spawnEnemies()
      }, 3000) // 调整生成间隔到3秒，降低初期难度
      
      return () => {
        clearInterval(timer)
        clearInterval(enemySpawner)
      }
    }
  }, [gameState, spawnEnemies])

  // 启动游戏循环
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState, gameLoop])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 游戏标题 */}
      <div className="text-center py-4">
        <h1 className="text-4xl font-bold text-purple-400 mb-2">吸血鬼幸存者</h1>
        <p className="text-gray-400">使用 WASD 或方向键移动，自动攻击敌人</p>
      </div>

      {/* 游戏菜单 */}
      {gameState === 'menu' && (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">开始游戏</h2>
            <p className="text-gray-300 mb-6">
              在这个类似吸血鬼幸存者的游戏中生存下去！<br/>
              击败敌人获得经验值，升级你的武器和能力。
            </p>
            <button
              onClick={startGame}
              className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-bold text-lg transition-colors"
            >
              开始游戏
            </button>
          </div>
        </div>
      )}

      {/* 游戏暂停 */}
      {gameState === 'paused' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">游戏暂停</h2>
            <button
              onClick={() => setGameState('playing')}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-bold mr-4"
            >
              继续游戏
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg font-bold"
            >
              返回菜单
            </button>
          </div>
        </div>
      )}

      {/* 升级选择 */}
      {gameState === 'levelUp' && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl">
            <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">升级！</h2>
            <p className="text-center mb-6">选择一个升级选项：</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {levelUpOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectLevelUpOption(option)}
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors text-left"
                >
                  <h3 className="font-bold text-lg mb-2">
                    {'type' in option ? option.name : option.name}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {'type' in option ? option.description : option.description}
                  </p>
                  {'damage' in option && (
                    <p className="text-purple-400 text-sm mt-2">
                      伤害: {option.damage}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 游戏结束 */}
      {gameState === 'gameOver' && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-3xl font-bold mb-4 text-red-400">游戏结束</h2>
            <p className="text-xl mb-2">最终得分: {score}</p>
            <p className="text-lg mb-2">生存时间: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</p>
            <p className="text-lg mb-6">等级: {player.level}</p>
            <button
              onClick={startGame}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-bold mr-4"
            >
              重新开始
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg font-bold"
            >
              返回菜单
            </button>
          </div>
        </div>
      )}

      {/* 固定的UI界面 */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <>
          {/* 固定在顶部的UI栏 */}
          <div className="fixed top-0 left-0 right-0 z-40 bg-gray-900 bg-opacity-95 backdrop-blur-sm border-b border-gray-700">
            {/* 游戏信息栏 */}
            <div className="flex justify-center py-2">
              <div className="flex flex-wrap gap-6 text-sm">
                <div>得分: <span className="text-yellow-400 font-bold">{score}</span></div>
                <div>时间: <span className="text-blue-400 font-bold">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</span></div>
                <div>等级: <span className="text-purple-400 font-bold">{player.level}</span></div>
                <div>敌人数量: <span className="text-orange-400 font-bold">{enemies.length}</span></div>
              </div>
            </div>

            {/* 生命值条 */}
            <div className="px-4 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-red-400 text-sm font-semibold">❤️ 生命值</span>
                <span className="text-red-400 text-sm">{player.health}/{player.maxHealth}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 border border-gray-600">
                <div 
                  className="bg-gradient-to-r from-red-600 to-red-400 h-4 rounded-full transition-all duration-300 shadow-lg"
                  style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* 经验值条 */}
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-green-400 text-sm font-semibold">⭐ 经验值</span>
                <span className="text-green-400 text-sm">{player.experience}/{player.experienceToNext}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 border border-gray-600">
                <div 
                  className="bg-gradient-to-r from-green-600 to-green-400 h-4 rounded-full transition-all duration-300 shadow-lg"
                  style={{ width: `${(player.experience / player.experienceToNext) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 游戏内容区域 */}
          <div className="flex flex-col items-center pt-32">

          {/* 游戏画布 */}
          <canvas
            ref={canvasRef}
            width={GAME_CONFIG.CANVAS_WIDTH}
            height={GAME_CONFIG.CANVAS_HEIGHT}
            className="border-2 border-gray-600 rounded-lg bg-gray-900"
          />

          {/* 武器信息 */}
          <div className="mt-4 bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-2">当前武器:</h3>
            <div className="flex flex-wrap gap-4">
              {weapons.map(weapon => (
                <div key={weapon.id} className="bg-gray-700 p-2 rounded text-sm">
                  <div className="font-bold">{weapon.name} (Lv.{weapon.level})</div>
                  <div className="text-gray-300">伤害: {weapon.damage}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 控制说明 */}
          <div className="mt-4 text-center text-gray-400 text-sm">
            <p>WASD 或方向键移动 | ESC 暂停游戏</p>
          </div>
          </div>
        </>
      )}
    </div>
  )
} 