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

    // 生成敌人
    const spawnEnemy = useCallback(() => {
        const side = Math.floor(Math.random() * 4)
        let x = 0, y = 0
        
        switch (side) {
            case 0: // 上
                x = Math.random() * 800
                y = -20
                break
            case 1: // 右
                x = 820
                y = Math.random() * 600
                break
            case 2: // 下
                x = Math.random() * 800
                y = 620
                break
            case 3: // 左
                x = -20
                y = Math.random() * 600
                break
        }

        const enemy: Enemy = {
            id: Date.now() + Math.random(),
            x,
            y,
            size: 15 + Math.random() * 10,
            speed: 1 + Math.random() * 2,
            health: 30 + Math.floor(gameState.time / 30) * 10,
            maxHealth: 30 + Math.floor(gameState.time / 30) * 10
        }

        setGameState(prev => ({
            ...prev,
            enemies: [...prev.enemies, enemy]
        }))
    }, [gameState.time])

    // 武器射击
    const fireWeapon = useCallback((weapon: Weapon, player: Player) => {
        const now = Date.now()
        if (now - weapon.lastFired < weapon.cooldown) return

        const projectiles: Projectile[] = []
        
        // 根据武器类型生成不同的投射物
        switch (weapon.id) {
            case 'whip':
                // 鞭子：近距离扇形攻击
                for (let i = 0; i < 3; i++) {
                    const angle = (i - 1) * 0.3
                    projectiles.push({
                        id: Date.now() + i,
                        x: player.x,
                        y: player.y,
                        vx: Math.cos(angle) * 8,
                        vy: Math.sin(angle) * 8,
                        size: 8,
                        damage: weapon.damage * weapon.level,
                        weaponId: weapon.id
                    })
                }
                break
            
            case 'magicWand':
                // 魔法杖：直线魔法弹
                const targetX = player.x + (Math.random() - 0.5) * 200
                const targetY = player.y + (Math.random() - 0.5) * 200
                const dx = targetX - player.x
                const dy = targetY - player.y
                const distance = Math.sqrt(dx * dx + dy * dy) || 1
                
                projectiles.push({
                    id: Date.now(),
                    x: player.x,
                    y: player.y,
                    vx: (dx / distance) * 6,
                    vy: (dy / distance) * 6,
                    size: 6,
                    damage: weapon.damage * weapon.level,
                    weaponId: weapon.id
                })
                break
        }

        setGameState(prev => ({
            ...prev,
            projectiles: [...prev.projectiles, ...projectiles],
            weapons: prev.weapons.map(w => 
                w.id === weapon.id ? { ...w, lastFired: now } : w
            )
        }))
    }, [])

    // 游戏主循环
    const gameLoop = useCallback(() => {
        if (!gameState.gameStarted || gameState.gameOver) return

        setGameState(prev => {
            const newState = { ...prev }
            
            // 更新玩家位置
            if (keys.has('w') || keys.has('ArrowUp')) newState.player.y -= newState.player.speed
            if (keys.has('s') || keys.has('ArrowDown')) newState.player.y += newState.player.speed
            if (keys.has('a') || keys.has('ArrowLeft')) newState.player.x -= newState.player.speed
            if (keys.has('d') || keys.has('ArrowRight')) newState.player.x += newState.player.speed

            // 边界检查
            newState.player.x = Math.max(newState.player.size, Math.min(800 - newState.player.size, newState.player.x))
            newState.player.y = Math.max(newState.player.size, Math.min(600 - newState.player.size, newState.player.y))

            // 更新敌人
            newState.enemies = newState.enemies.map(enemy => {
                // 敌人向玩家移动
                const dx = newState.player.x - enemy.x
                const dy = newState.player.y - enemy.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                
                if (distance > 0) {
                    enemy.x += (dx / distance) * enemy.speed
                    enemy.y += (dy / distance) * enemy.speed
                }

                return enemy
            }).filter(enemy => {
                // 移除超出屏幕的敌人
                return enemy.x > -50 && enemy.x < 850 && enemy.y > -50 && enemy.y < 650
            })

            // 更新投射物
            newState.projectiles = newState.projectiles.map(projectile => {
                projectile.x += projectile.vx
                projectile.y += projectile.vy
                return projectile
            }).filter(projectile => {
                // 移除超出屏幕的投射物
                return projectile.x > -20 && projectile.x < 820 && projectile.y > -20 && projectile.y < 620
            })

            // 检测投射物与敌人的碰撞
            newState.projectiles = newState.projectiles.filter(projectile => {
                let hit = false
                newState.enemies = newState.enemies.map(enemy => {
                    const dx = projectile.x - enemy.x
                    const dy = projectile.y - enemy.y
                    const distance = Math.sqrt(dx * dx + dy * dy)
                    
                    if (distance < enemy.size + projectile.size) {
                        enemy.health -= projectile.damage
                        hit = true
                    }
                    return enemy
                })

                // 移除死亡的敌人
                newState.enemies = newState.enemies.filter(enemy => {
                    if (enemy.health <= 0) {
                        newState.score += 10
                        return false
                    }
                    return true
                })

                return !hit
            })

            // 检测玩家与敌人的碰撞
            newState.enemies.forEach(enemy => {
                const dx = newState.player.x - enemy.x
                const dy = newState.player.y - enemy.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                
                if (distance < newState.player.size + enemy.size) {
                    newState.player.health -= 1
                }
            })

            // 检查游戏结束
            if (newState.player.health <= 0) {
                newState.gameOver = true
                newState.showGameOver = true
                return newState
            }

            // 武器射击
            newState.weapons.forEach(weapon => {
                fireWeapon(weapon, newState.player)
            })

            // 生成敌人
            if (Math.random() < 0.02 + newState.time / 1000) {
                spawnEnemy()
            }

            // 升级武器（每30秒）
            if (newState.time % 30 === 0 && newState.time > 0) {
                newState.weapons = newState.weapons.map(weapon => {
                    if (weapon.level < weapon.maxLevel) {
                        return { ...weapon, level: weapon.level + 1 }
                    }
                    return weapon
                })
            }

            newState.time += 1
            return newState
        })

        animationRef.current = requestAnimationFrame(gameLoop)
    }, [gameState.gameStarted, gameState.gameOver, keys, fireWeapon, spawnEnemy])

    // 游戏循环
    useEffect(() => {
        if (gameState.gameStarted && !gameState.gameOver) {
            gameLoop()
        }
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [gameState.gameStarted, gameState.gameOver, gameLoop])

    // 渲染游戏
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // 清空画布
        ctx.clearRect(0, 0, 800, 600)

        // 绘制背景
        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(0, 0, 800, 600)

        // 绘制玩家
        ctx.fillStyle = '#4CAF50'
        ctx.beginPath()
        ctx.arc(gameState.player.x, gameState.player.y, gameState.player.size, 0, Math.PI * 2)
        ctx.fill()

        // 绘制玩家血条
        const healthBarWidth = 40
        const healthBarHeight = 4
        const healthPercentage = gameState.player.health / gameState.player.maxHealth
        
        ctx.fillStyle = '#ff4444'
        ctx.fillRect(gameState.player.x - healthBarWidth/2, gameState.player.y - gameState.player.size - 10, healthBarWidth, healthBarHeight)
        
        ctx.fillStyle = '#44ff44'
        ctx.fillRect(gameState.player.x - healthBarWidth/2, gameState.player.y - gameState.player.size - 10, healthBarWidth * healthPercentage, healthBarHeight)

        // 绘制敌人
        gameState.enemies.forEach(enemy => {
            ctx.fillStyle = '#ff4444'
            ctx.beginPath()
            ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2)
            ctx.fill()

            // 绘制敌人血条
            const enemyHealthPercentage = enemy.health / enemy.maxHealth
            ctx.fillStyle = '#ff0000'
            ctx.fillRect(enemy.x - enemy.size, enemy.y - enemy.size - 8, enemy.size * 2, 3)
            ctx.fillStyle = '#00ff00'
            ctx.fillRect(enemy.x - enemy.size, enemy.y - enemy.size - 8, enemy.size * 2 * enemyHealthPercentage, 3)
        })

        // 绘制投射物
        gameState.projectiles.forEach(projectile => {
            switch (projectile.weaponId) {
                case 'whip':
                    ctx.fillStyle = '#ffaa00'
                    break
                case 'magicWand':
                    ctx.fillStyle = '#00aaff'
                    break
                default:
                    ctx.fillStyle = '#ffffff'
            }
            
            ctx.beginPath()
            ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2)
            ctx.fill()
        })

        // 绘制UI
        ctx.fillStyle = '#ffffff'
        ctx.font = '20px Arial'
        ctx.fillText(`分数: ${gameState.score}`, 10, 30)
        ctx.fillText(`时间: ${Math.floor(gameState.time / 60)}:${(gameState.time % 60).toString().padStart(2, '0')}`, 10, 60)
        ctx.fillText(`生命: ${gameState.player.health}`, 10, 90)

        // 绘制武器信息
        ctx.font = '14px Arial'
        gameState.weapons.forEach((weapon, index) => {
            ctx.fillStyle = '#ffffff'
            ctx.fillText(`${weapon.name} Lv.${weapon.level}`, 10, 120 + index * 20)
        })

    }, [gameState])

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

                    {gameState.gameOver && gameState.showGameOver && (
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">游戏结束</h2>
                            <p className="text-gray-600 mb-4">最终分数: {gameState.score}</p>
                            <p className="text-gray-600 mb-4">生存时间: {Math.floor(gameState.time / 60)}:{(gameState.time % 60).toString().padStart(2, '0')}</p>
                            
                            {!gameState.showSubmitForm ? (
                                <button
                                    onClick={() => setGameState(prev => ({ ...prev, showSubmitForm: true }))}
                                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg mr-2"
                                >
                                    提交分数
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={gameState.playerName}
                                        onChange={(e) => setGameState(prev => ({ ...prev, playerName: e.target.value }))}
                                        placeholder="请输入你的名字"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={submitScore}
                                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                                        >
                                            提交
                                        </button>
                                        <button
                                            onClick={() => setGameState(prev => ({ ...prev, showSubmitForm: false }))}
                                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                                        >
                                            取消
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            <button
                                onClick={startGame}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg mt-4"
                            >
                                重新开始
                            </button>
                        </div>
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