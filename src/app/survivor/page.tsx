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
        damage: 25,
        range: 80,
        cooldown: 400,
        maxLevel: 5
    },
    magicWand: {
        name: '魔法杖',
        damage: 20,
        range: 150,
        cooldown: 250,
        maxLevel: 5
    },
    fireball: {
        name: '火球术',
        damage: 35,
        range: 200,
        cooldown: 600,
        maxLevel: 4
    },
    lightning: {
        name: '闪电链',
        damage: 30,
        range: 180,
        cooldown: 800,
        maxLevel: 3
    },
    iceSpike: {
        name: '冰锥',
        damage: 40,
        range: 120,
        cooldown: 500,
        maxLevel: 4
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
            { ...WEAPONS.magicWand, id: 'magicWand', lastFired: 0, level: 1 },
            { ...WEAPONS.fireball, id: 'fireball', lastFired: 0, level: 1 },
            { ...WEAPONS.lightning, id: 'lightning', lastFired: 0, level: 1 },
            { ...WEAPONS.iceSpike, id: 'iceSpike', lastFired: 0, level: 1 }
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
                { ...WEAPONS.magicWand, id: 'magicWand', lastFired: 0, level: 1 },
                { ...WEAPONS.fireball, id: 'fireball', lastFired: 0, level: 1 },
                { ...WEAPONS.lightning, id: 'lightning', lastFired: 0, level: 1 },
                { ...WEAPONS.iceSpike, id: 'iceSpike', lastFired: 0, level: 1 }
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
            size: 12 + Math.random() * 8,
            speed: 0.8 + Math.random() * 1.5,
            health: 25 + Math.floor(gameState.time / 60) * 8,
            maxHealth: 25 + Math.floor(gameState.time / 60) * 8
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

            case 'fireball':
                // 火球术：大范围爆炸
                for (let i = 0; i < 5; i++) {
                    const angle = (i - 2) * 0.4
                    projectiles.push({
                        id: Date.now() + i,
                        x: player.x,
                        y: player.y,
                        vx: Math.cos(angle) * 5,
                        vy: Math.sin(angle) * 5,
                        size: 10,
                        damage: weapon.damage * weapon.level,
                        weaponId: weapon.id
                    })
                }
                break

            case 'lightning':
                // 闪电链：穿透攻击
                const lightningTargetX = player.x + (Math.random() - 0.5) * 300
                const lightningTargetY = player.y + (Math.random() - 0.5) * 300
                const lightningDx = lightningTargetX - player.x
                const lightningDy = lightningTargetY - player.y
                const lightningDistance = Math.sqrt(lightningDx * lightningDx + lightningDy * lightningDy) || 1

                projectiles.push({
                    id: Date.now(),
                    x: player.x,
                    y: player.y,
                    vx: (lightningDx / lightningDistance) * 8,
                    vy: (lightningDy / lightningDistance) * 8,
                    size: 4,
                    damage: weapon.damage * weapon.level,
                    weaponId: weapon.id
                })
                break

            case 'iceSpike':
                // 冰锥：高伤害直线攻击
                const iceTargetX = player.x + (Math.random() - 0.5) * 150
                const iceTargetY = player.y + (Math.random() - 0.5) * 150
                const iceDx = iceTargetX - player.x
                const iceDy = iceTargetY - player.y
                const iceDistance = Math.sqrt(iceDx * iceDx + iceDy * iceDy) || 1

                projectiles.push({
                    id: Date.now(),
                    x: player.x,
                    y: player.y,
                    vx: (iceDx / iceDistance) * 7,
                    vy: (iceDy / iceDistance) * 7,
                    size: 7,
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

            // 生成敌人（降低生成频率）
            if (Math.random() < 0.01 + newState.time / 2000) {
                spawnEnemy()
            }

            // 升级武器（每45秒）
            if (newState.time % 45 === 0 && newState.time > 0) {
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
        ctx.fillRect(gameState.player.x - healthBarWidth / 2, gameState.player.y - gameState.player.size - 10, healthBarWidth, healthBarHeight)

        ctx.fillStyle = '#44ff44'
        ctx.fillRect(gameState.player.x - healthBarWidth / 2, gameState.player.y - gameState.player.size - 10, healthBarWidth * healthPercentage, healthBarHeight)

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
                case 'fireball':
                    ctx.fillStyle = '#ff4400'
                    break
                case 'lightning':
                    ctx.fillStyle = '#ffff00'
                    break
                case 'iceSpike':
                    ctx.fillStyle = '#00ffff'
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
        ctx.font = '12px Arial'
        gameState.weapons.forEach((weapon, index) => {
            ctx.fillStyle = '#ffffff'
            ctx.fillText(`${weapon.name} Lv.${weapon.level}`, 10, 120 + index * 15)
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        ⚔️ 幸存者游戏
                    </h1>
                    <p className="text-gray-300 mb-6 text-lg">
                        使用 WASD 或方向键移动，自动攻击敌人，生存越久分数越高！
                    </p>

                    {/* 游戏状态显示 */}
                    {gameState.gameStarted && !gameState.gameOver && (
                        <div className="bg-black bg-opacity-50 rounded-lg p-4 mb-4 inline-block">
                            <div className="text-white text-sm">
                                <span className="mr-4">🎯 分数: {gameState.score}</span>
                                <span className="mr-4">⏱️ 时间: {Math.floor(gameState.time / 60)}:{(gameState.time % 60).toString().padStart(2, '0')}</span>
                                <span className="mr-4">❤️ 生命: {gameState.player.health}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center mb-6">
                    <div className="bg-black bg-opacity-30 p-6 rounded-xl shadow-2xl border border-purple-500">
                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={600}
                            className="border border-purple-400 rounded-lg shadow-lg"
                        />
                    </div>
                </div>

                <div className="text-center">
                    {!gameState.gameStarted && !gameState.gameOver && (
                        <button
                            onClick={startGame}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                        >
                            🎮 开始游戏
                        </button>
                    )}

                    {gameState.gameOver && gameState.showGameOver && (
                        <div className="bg-black bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-md mx-auto border border-purple-500">
                            <h2 className="text-3xl font-bold text-white mb-6">🏁 游戏结束</h2>
                            <div className="space-y-3 mb-6">
                                <p className="text-purple-300 text-lg">🎯 最终分数: <span className="text-yellow-400 font-bold">{gameState.score}</span></p>
                                <p className="text-purple-300 text-lg">⏱️ 生存时间: <span className="text-cyan-400 font-bold">{Math.floor(gameState.time / 60)}:{(gameState.time % 60).toString().padStart(2, '0')}</span></p>
                            </div>

                            {!gameState.showSubmitForm ? (
                                <button
                                    onClick={() => setGameState(prev => ({ ...prev, showSubmitForm: true }))}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 mr-3"
                                >
                                    📊 提交分数
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={gameState.playerName}
                                        onChange={(e) => setGameState(prev => ({ ...prev, playerName: e.target.value }))}
                                        placeholder="请输入你的名字"
                                        className="w-full px-4 py-3 border border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-black bg-opacity-50 text-white placeholder-gray-400"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={submitScore}
                                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105"
                                        >
                                            提交
                                        </button>
                                        <button
                                            onClick={() => setGameState(prev => ({ ...prev, showSubmitForm: false }))}
                                            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105"
                                        >
                                            取消
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={startGame}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 mt-4"
                            >
                                🔄 重新开始
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-8 bg-black bg-opacity-50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-purple-500">
                    <h3 className="text-2xl font-bold text-white mb-6">📖 游戏说明</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-semibold text-purple-300 mb-3 text-lg">🎮 控制方式</h4>
                            <ul className="text-gray-300 space-y-2">
                                <li>• <span className="text-yellow-400">WASD</span> 或 <span className="text-yellow-400">方向键</span>：移动角色</li>
                                <li>• <span className="text-green-400">自动攻击</span>：武器会自动攻击附近的敌人</li>
                                <li>• <span className="text-red-400">躲避敌人</span>：不要让敌人碰到你</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-purple-300 mb-3 text-lg">⚔️ 武器系统</h4>
                            <ul className="text-gray-300 space-y-2">
                                <li>• <span className="text-orange-400">鞭子</span>：近距离扇形攻击</li>
                                <li>• <span className="text-blue-400">魔法杖</span>：直线魔法弹</li>
                                <li>• <span className="text-red-400">火球术</span>：大范围爆炸攻击</li>
                                <li>• <span className="text-yellow-400">闪电链</span>：穿透攻击</li>
                                <li>• <span className="text-cyan-400">冰锥</span>：高伤害直线攻击</li>
                                <li>• <span className="text-purple-400">每45秒武器自动升级</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 