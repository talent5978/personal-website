'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface Player {
    x: number
    y: number
    size: number
    speed: number
    health: number
    maxHealth: number
    experience: number
    level: number
}

interface Enemy {
    id: number
    x: number
    y: number
    size: number
    speed: number
    health: number
    maxHealth: number
    type: 'normal' | 'fast' | 'tank' | 'boss'
    lastDamageTime: number
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
    projectileCount: number
    penetration: number
    unlocked: boolean
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
    range: number
    distanceTraveled: number
    penetration: number
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
    isPaused: boolean
    wave: number
    nextWaveTime: number
}

interface ParticleEffect {
    id: number
    x: number
    y: number
    vx: number
    vy: number
    life: number
    maxLife: number
    color: string
    size: number
}

// 优化后的武器配置
const WEAPONS = {
    whip: {
        name: '鞭子',
        damage: 25,
        range: 80,
        cooldown: 400,
        maxLevel: 8,
        projectileCount: 3,
        penetration: 1,
        unlocked: true
    },
    magicWand: {
        name: '魔法杖',
        damage: 20,
        range: 150,
        cooldown: 250,
        maxLevel: 8,
        projectileCount: 1,
        penetration: 2,
        unlocked: true
    },
    fireball: {
        name: '火球术',
        damage: 35,
        range: 200,
        cooldown: 600,
        maxLevel: 6,
        projectileCount: 5,
        penetration: 1,
        unlocked: false
    },
    lightning: {
        name: '闪电链',
        damage: 30,
        range: 180,
        cooldown: 800,
        maxLevel: 5,
        projectileCount: 1,
        penetration: 5,
        unlocked: false
    },
    iceSpike: {
        name: '冰锥',
        damage: 40,
        range: 120,
        cooldown: 500,
        maxLevel: 6,
        projectileCount: 2,
        penetration: 3,
        unlocked: false
    },
    laser: {
        name: '激光炮',
        damage: 60,
        range: 300,
        cooldown: 1000,
        maxLevel: 4,
        projectileCount: 1,
        penetration: 10,
        unlocked: false
    }
}

const ENEMY_TYPES = {
    normal: { health: 25, speed: 0.8, size: 12, color: '#ff4444', score: 10 },
    fast: { health: 15, speed: 1.8, size: 8, color: '#ffaa44', score: 15 },
    tank: { health: 80, speed: 0.4, size: 18, color: '#aa4444', score: 25 },
    boss: { health: 200, speed: 0.6, size: 25, color: '#ff0000', score: 100 }
}

const SPEED_PRESETS = [
    { label: '慢速', value: 1.5 },
    { label: '标准', value: 1 },
    { label: '快速', value: 0.7 },
    { label: '极限', value: 0.5 }
]

// 对象池类
class ObjectPool<T> {
    private pool: T[] = []
    private createFn: () => T
    private resetFn: (obj: T) => void

    constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize: number = 50) {
        this.createFn = createFn
        this.resetFn = resetFn
        
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(createFn())
        }
    }

    get(): T {
        if (this.pool.length > 0) {
            return this.pool.pop()!
        }
        return this.createFn()
    }

    release(obj: T): void {
        this.resetFn(obj)
        this.pool.push(obj)
    }
}

export default function SurvivorGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationRef = useRef<number>()
    const lastFrameTime = useRef<number>(0)
    
    const [gameState, setGameState] = useState<GameState>({
        player: {
            x: 400,
            y: 300,
            size: 15,
            speed: 5,
            health: 100,
            maxHealth: 100,
            experience: 0,
            level: 1
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
        showSubmitForm: false,
        isPaused: false,
        wave: 1,
        nextWaveTime: 30
    })

    const [speedFactor, setSpeedFactor] = useState(1)
    const [keys, setKeys] = useState<Set<string>>(new Set())
    const [particleEffects, setParticleEffects] = useState<ParticleEffect[]>([])
    const [showSettings, setShowSettings] = useState(false)
    const [showMiniMap, setShowMiniMap] = useState(true)

    // 对象池初始化
    const enemyPool = useMemo(() => new ObjectPool<Enemy>(
        () => ({ id: 0, x: 0, y: 0, size: 0, speed: 0, health: 0, maxHealth: 0, type: 'normal', lastDamageTime: 0 }),
        (enemy) => { enemy.health = 0; enemy.x = -100; enemy.y = -100; }
    ), [])

    const projectilePool = useMemo(() => new ObjectPool<Projectile>(
        () => ({ id: 0, x: 0, y: 0, vx: 0, vy: 0, size: 0, damage: 0, weaponId: '', range: 0, distanceTraveled: 0, penetration: 0 }),
        (projectile) => { projectile.x = -100; projectile.y = -100; projectile.distanceTraveled = 0; }
    ), [])

    const particlePool = useMemo(() => new ObjectPool<ParticleEffect>(
        () => ({ id: 0, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, color: '', size: 0 }),
        (particle) => { particle.life = 0; particle.x = -100; particle.y = -100; }
    ), [])

    // 键盘事件处理
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))
                return
            }
            if (e.key === ' ') {
                e.preventDefault()
                setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))
                return
            }
            if (e.key === 'm' || e.key === 'M') {
                setShowMiniMap(prev => !prev)
                return
            }
            setKeys(prev => new Set(prev).add(e.key.toLowerCase()))
        }

        const handleKeyUp = (e: KeyboardEvent) => {
            setKeys(prev => {
                const newKeys = new Set(prev)
                newKeys.delete(e.key.toLowerCase())
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
    const startGame = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            gameStarted: true,
            gameOver: false,
            showGameOver: false,
            score: 0,
            time: 0,
            wave: 1,
            nextWaveTime: 30,
            player: {
                ...prev.player,
                health: prev.player.maxHealth,
                experience: 0,
                level: 1,
                x: 400,
                y: 300
            },
            enemies: [],
            projectiles: [],
            weapons: [
                { ...WEAPONS.whip, id: 'whip', lastFired: 0, level: 1 },
                { ...WEAPONS.magicWand, id: 'magicWand', lastFired: 0, level: 1 }
            ]
        }))
        setParticleEffects([])
    }, [])

    // 创建粒子效果
    const createParticleEffect = useCallback((x: number, y: number, color: string, count: number = 5) => {
        const newParticles: ParticleEffect[] = []
        for (let i = 0; i < count; i++) {
            const particle = particlePool.get()
            particle.id = Date.now() + Math.random()
            particle.x = x
            particle.y = y
            particle.vx = (Math.random() - 0.5) * 4
            particle.vy = (Math.random() - 0.5) * 4
            particle.life = 30
            particle.maxLife = 30
            particle.color = color
            particle.size = 2 + Math.random() * 3
            newParticles.push(particle)
        }
        setParticleEffects(prev => [...prev, ...newParticles])
    }, [particlePool])

    // 找到最近的敌人
    const findNearestEnemy = useCallback((player: Player, enemies: Enemy[], maxDistance: number): Enemy | null => {
        let nearestEnemy: Enemy | null = null
        let minDistance = maxDistance

        enemies.forEach(enemy => {
            const dx = enemy.x - player.x
            const dy = enemy.y - player.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance < minDistance) {
                nearestEnemy = enemy
                minDistance = distance
            }
        })

        return nearestEnemy
    }, [])

    // 生成敌人
    const spawnEnemy = useCallback((type: keyof typeof ENEMY_TYPES = 'normal') => {
        const side = Math.floor(Math.random() * 4)
        let x = 0, y = 0

        switch (side) {
            case 0: x = Math.random() * 800; y = -20; break
            case 1: x = 820; y = Math.random() * 600; break
            case 2: x = Math.random() * 800; y = 620; break
            case 3: x = -20; y = Math.random() * 600; break
        }

        const enemy = enemyPool.get()
        const enemyType = ENEMY_TYPES[type]
        const waveMultiplier = 1 + Math.floor(gameState.wave / 5) * 0.5

        enemy.id = Date.now() + Math.random()
        enemy.x = x
        enemy.y = y
        enemy.size = enemyType.size
        enemy.speed = enemyType.speed * (0.8 + Math.random() * 0.4) * speedFactor
        enemy.health = Math.floor(enemyType.health * waveMultiplier)
        enemy.maxHealth = enemy.health
        enemy.type = type
        enemy.lastDamageTime = 0

        setGameState(prev => ({
            ...prev,
            enemies: [...prev.enemies, enemy]
        }))
    }, [gameState.wave, speedFactor, enemyPool])

    // 武器射击系统
    const fireWeapon = useCallback((weapon: Weapon, player: Player, enemies: Enemy[]) => {
        const now = Date.now()
        if (now - weapon.lastFired < weapon.cooldown / speedFactor) return

        const projectiles: Projectile[] = []
        const nearestEnemy: Enemy | null = findNearestEnemy(player, enemies, weapon.range)

        switch (weapon.id) {
            case 'whip':
                const whipAngleSpread = Math.PI / 3
                for (let i = 0; i < weapon.projectileCount; i++) {
                    const angle = nearestEnemy ? 
                        Math.atan2(nearestEnemy.y - player.y, nearestEnemy.x - player.x) + 
                        (i - Math.floor(weapon.projectileCount / 2)) * (whipAngleSpread / weapon.projectileCount) :
                        (i - Math.floor(weapon.projectileCount / 2)) * 0.3
                    
                    const projectile = projectilePool.get()
                    projectile.id = Date.now() + i
                    projectile.x = player.x
                    projectile.y = player.y
                    projectile.vx = Math.cos(angle) * 8
                    projectile.vy = Math.sin(angle) * 8
                    projectile.size = 8
                    projectile.damage = weapon.damage * weapon.level
                    projectile.weaponId = weapon.id
                    projectile.range = weapon.range
                    projectile.distanceTraveled = 0
                    projectile.penetration = weapon.penetration
                    projectiles.push(projectile)
                }
                break

            case 'magicWand':
                if (nearestEnemy) {
                    const dx = nearestEnemy.x - player.x
                    const dy = nearestEnemy.y - player.y
                    const distance = Math.sqrt(dx * dx + dy * dy) || 1

                    const projectile = projectilePool.get()
                    projectile.id = Date.now()
                    projectile.x = player.x
                    projectile.y = player.y
                    projectile.vx = (dx / distance) * 6
                    projectile.vy = (dy / distance) * 6
                    projectile.size = 6
                    projectile.damage = weapon.damage * weapon.level
                    projectile.weaponId = weapon.id
                    projectile.range = weapon.range
                    projectile.distanceTraveled = 0
                    projectile.penetration = weapon.penetration
                    projectiles.push(projectile)
                }
                break

            case 'fireball':
                const fireballAngleSpread = Math.PI / 2
                for (let i = 0; i < weapon.projectileCount; i++) {
                    const angle = nearestEnemy ? 
                        Math.atan2(nearestEnemy.y - player.y, nearestEnemy.x - player.x) + 
                        (i - Math.floor(weapon.projectileCount / 2)) * (fireballAngleSpread / weapon.projectileCount) :
                        (i - Math.floor(weapon.projectileCount / 2)) * 0.4
                    
                    const projectile = projectilePool.get()
                    projectile.id = Date.now() + i
                    projectile.x = player.x
                    projectile.y = player.y
                    projectile.vx = Math.cos(angle) * 5
                    projectile.vy = Math.sin(angle) * 5
                    projectile.size = 10
                    projectile.damage = weapon.damage * weapon.level
                    projectile.weaponId = weapon.id
                    projectile.range = weapon.range
                    projectile.distanceTraveled = 0
                    projectile.penetration = weapon.penetration
                    projectiles.push(projectile)
                }
                break

            case 'lightning':
                if (nearestEnemy) {
                    const dx = nearestEnemy.x - player.x
                    const dy = nearestEnemy.y - player.y
                    const distance = Math.sqrt(dx * dx + dy * dy) || 1

                    const projectile = projectilePool.get()
                    projectile.id = Date.now()
                    projectile.x = player.x
                    projectile.y = player.y
                    projectile.vx = (dx / distance) * 8
                    projectile.vy = (dy / distance) * 8
                    projectile.size = 4
                    projectile.damage = weapon.damage * weapon.level
                    projectile.weaponId = weapon.id
                    projectile.range = weapon.range
                    projectile.distanceTraveled = 0
                    projectile.penetration = weapon.penetration
                    projectiles.push(projectile)
                }
                break

            case 'iceSpike':
                for (let i = 0; i < weapon.projectileCount; i++) {
                    const angle = nearestEnemy ? 
                        Math.atan2(nearestEnemy.y - player.y, nearestEnemy.x - player.x) + (i - 0.5) * 0.2 :
                        i * (Math.PI * 2 / weapon.projectileCount)
                    
                    const projectile = projectilePool.get()
                    projectile.id = Date.now() + i
                    projectile.x = player.x
                    projectile.y = player.y
                    projectile.vx = Math.cos(angle) * 7
                    projectile.vy = Math.sin(angle) * 7
                    projectile.size = 7
                    projectile.damage = weapon.damage * weapon.level
                    projectile.weaponId = weapon.id
                    projectile.range = weapon.range
                    projectile.distanceTraveled = 0
                    projectile.penetration = weapon.penetration
                    projectiles.push(projectile)
                }
                break

            case 'laser':
                if (nearestEnemy) {
                    const dx = nearestEnemy.x - player.x
                    const dy = nearestEnemy.y - player.y
                    const distance = Math.sqrt(dx * dx + dy * dy) || 1

                    const projectile = projectilePool.get()
                    projectile.id = Date.now()
                    projectile.x = player.x
                    projectile.y = player.y
                    projectile.vx = (dx / distance) * 10
                    projectile.vy = (dy / distance) * 10
                    projectile.size = 5
                    projectile.damage = weapon.damage * weapon.level
                    projectile.weaponId = weapon.id
                    projectile.range = weapon.range
                    projectile.distanceTraveled = 0
                    projectile.penetration = weapon.penetration
                    projectiles.push(projectile)
                }
                break
        }

        if (projectiles.length > 0) {
            weapon.lastFired = now
            setGameState(prev => ({
                ...prev,
                projectiles: [...prev.projectiles, ...projectiles]
            }))
        }
    }, [projectilePool, findNearestEnemy, speedFactor])

    // 游戏主循环
    const gameLoop = useCallback((currentTime: number) => {
        if (!gameState.gameStarted || gameState.gameOver || gameState.isPaused) {
            animationRef.current = requestAnimationFrame(gameLoop)
            return
        }

        const deltaTime = currentTime - lastFrameTime.current
        lastFrameTime.current = currentTime

        // 限制帧率到60FPS
        if (deltaTime < 16.67) {
            animationRef.current = requestAnimationFrame(gameLoop)
            return
        }

        setGameState(prev => {
            const newState = { ...prev }

            // 更新玩家位置
            const moveSpeed = newState.player.speed * (deltaTime / 16.67)
            if (keys.has('w') || keys.has('arrowup')) newState.player.y -= moveSpeed
            if (keys.has('s') || keys.has('arrowdown')) newState.player.y += moveSpeed
            if (keys.has('a') || keys.has('arrowleft')) newState.player.x -= moveSpeed
            if (keys.has('d') || keys.has('arrowright')) newState.player.x += moveSpeed

            // 边界检查
            newState.player.x = Math.max(newState.player.size, Math.min(800 - newState.player.size, newState.player.x))
            newState.player.y = Math.max(newState.player.size, Math.min(600 - newState.player.size, newState.player.y))

            // 更新敌人
            newState.enemies = newState.enemies.map(enemy => {
                const dx = newState.player.x - enemy.x
                const dy = newState.player.y - enemy.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance > 0) {
                    const moveSpeed = enemy.speed * speedFactor * (deltaTime / 16.67)
                    enemy.x += (dx / distance) * moveSpeed
                    enemy.y += (dy / distance) * moveSpeed
                }

                return enemy
            }).filter(enemy => {
                return enemy.x > -50 && enemy.x < 850 && enemy.y > -50 && enemy.y < 650
            })

            // 更新投射物
            newState.projectiles = newState.projectiles.map(projectile => {
                const moveSpeed = deltaTime / 16.67
                projectile.x += projectile.vx * moveSpeed
                projectile.y += projectile.vy * moveSpeed
                projectile.distanceTraveled += Math.sqrt(projectile.vx * projectile.vx + projectile.vy * projectile.vy) * moveSpeed
                return projectile
            }).filter(projectile => {
                return projectile.x > -20 && projectile.x < 820 && 
                       projectile.y > -20 && projectile.y < 620 &&
                       projectile.distanceTraveled < projectile.range
            })

            // 碰撞检测
            newState.projectiles = newState.projectiles.filter(projectile => {
                let hitCount = 0
                newState.enemies = newState.enemies.map(enemy => {
                    const dx = projectile.x - enemy.x
                    const dy = projectile.y - enemy.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < enemy.size + projectile.size && hitCount < projectile.penetration) {
                        enemy.health -= projectile.damage
                        hitCount++
                        createParticleEffect(enemy.x, enemy.y, '#ffff00', 3)
                    }
                    return enemy
                })

                // 移除死亡的敌人
                newState.enemies = newState.enemies.filter(enemy => {
                    if (enemy.health <= 0) {
                        const scoreGain = ENEMY_TYPES[enemy.type].score
                        newState.score += scoreGain
                        newState.player.experience += scoreGain / 2
                        createParticleEffect(enemy.x, enemy.y, '#00ff00', 8)
                        enemyPool.release(enemy)
                        return false
                    }
                    return true
                })

                if (hitCount >= projectile.penetration) {
                    projectilePool.release(projectile)
                    return false
                }
                return true
            })

            // 玩家与敌人碰撞
            newState.enemies.forEach(enemy => {
                const dx = newState.player.x - enemy.x
                const dy = newState.player.y - enemy.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < newState.player.size + enemy.size) {
                    const now = Date.now()
                    if (now - enemy.lastDamageTime > 1000) {
                        newState.player.health -= 10
                        enemy.lastDamageTime = now
                        createParticleEffect(newState.player.x, newState.player.y, '#ff0000', 5)
                    }
                }
            })

            // 检查游戏结束
            if (newState.player.health <= 0) {
                newState.gameOver = true
                newState.showGameOver = true
                return newState
            }

            // 等级提升
            const expNeeded = newState.player.level * 100
            if (newState.player.experience >= expNeeded) {
                newState.player.level++
                newState.player.experience -= expNeeded
                newState.player.maxHealth += 20
                newState.player.health = Math.min(newState.player.health + 50, newState.player.maxHealth)
                
                // 解锁新武器
                const weaponKeys = Object.keys(WEAPONS) as (keyof typeof WEAPONS)[]
                weaponKeys.forEach(key => {
                    const weaponConfig = WEAPONS[key]
                    if (!weaponConfig.unlocked && newState.player.level >= (key === 'fireball' ? 3 : key === 'lightning' ? 5 : key === 'iceSpike' ? 7 : key === 'laser' ? 10 : 999)) {
                        const existingWeapon = newState.weapons.find(w => w.id === key)
                        if (!existingWeapon) {
                            newState.weapons.push({ ...weaponConfig, id: key, lastFired: 0, level: 1 })
                        }
                    }
                })
            }

            // 武器射击
            newState.weapons.forEach(weapon => {
                fireWeapon(weapon, newState.player, newState.enemies)
            })

            // 生成敌人
            const spawnRate = 0.008 + newState.wave * 0.002
            if (Math.random() < spawnRate) {
                const rand = Math.random()
                let enemyType: keyof typeof ENEMY_TYPES
                
                if (newState.wave >= 10 && rand < 0.05) enemyType = 'boss'
                else if (newState.wave >= 5 && rand < 0.15) enemyType = 'tank'
                else if (newState.wave >= 3 && rand < 0.3) enemyType = 'fast'
                else enemyType = 'normal'
                
                spawnEnemy(enemyType)
            }

            // 波次系统
            if (newState.time % 1800 === 0 && newState.time > 0) { // 每30秒一波
                newState.wave++
                newState.nextWaveTime = newState.time + 1800
                
                // 武器升级
                newState.weapons = newState.weapons.map(weapon => {
                    if (weapon.level < weapon.maxLevel && Math.random() < 0.3) {
                        return { ...weapon, level: weapon.level + 1 }
                    }
                    return weapon
                })
            }

            newState.time += 1
            return newState
        })

        animationRef.current = requestAnimationFrame(gameLoop)
    }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, keys, fireWeapon, spawnEnemy, speedFactor, createParticleEffect, enemyPool, projectilePool])

    // 启动游戏循环
    useEffect(() => {
        if (gameState.gameStarted && !gameState.gameOver) {
            lastFrameTime.current = performance.now()
            animationRef.current = requestAnimationFrame(gameLoop)
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

        // 绘制背景渐变
        const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 400)
        gradient.addColorStop(0, '#2a2a3a')
        gradient.addColorStop(1, '#1a1a2e')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 800, 600)

        // 绘制网格
        ctx.strokeStyle = '#333344'
        ctx.lineWidth = 0.5
        for (let i = 0; i < 800; i += 40) {
            ctx.beginPath()
            ctx.moveTo(i, 0)
            ctx.lineTo(i, 600)
            ctx.stroke()
        }
        for (let i = 0; i < 600; i += 40) {
            ctx.beginPath()
            ctx.moveTo(0, i)
            ctx.lineTo(800, i)
            ctx.stroke()
        }

        // 绘制玩家
        ctx.fillStyle = '#4CAF50'
        ctx.shadowColor = '#4CAF50'
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(gameState.player.x, gameState.player.y, gameState.player.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // 绘制玩家血条
        const healthBarWidth = 40
        const healthBarHeight = 6
        const healthPercentage = gameState.player.health / gameState.player.maxHealth

        ctx.fillStyle = '#ff4444'
        ctx.fillRect(gameState.player.x - healthBarWidth / 2, gameState.player.y - gameState.player.size - 15, healthBarWidth, healthBarHeight)
        ctx.fillStyle = '#44ff44'
        ctx.fillRect(gameState.player.x - healthBarWidth / 2, gameState.player.y - gameState.player.size - 15, healthBarWidth * healthPercentage, healthBarHeight)

        // 绘制玩家等级
        ctx.fillStyle = '#ffffff'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`Lv.${gameState.player.level}`, gameState.player.x, gameState.player.y - gameState.player.size - 20)

        // 绘制敌人
        gameState.enemies.forEach(enemy => {
            const enemyColor = ENEMY_TYPES[enemy.type].color
            ctx.fillStyle = enemyColor
            ctx.shadowColor = enemyColor
            ctx.shadowBlur = 5
            ctx.beginPath()
            ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2)
            ctx.fill()
            ctx.shadowBlur = 0

            // 绘制敌人血条
            if (enemy.health < enemy.maxHealth) {
                const enemyHealthPercentage = enemy.health / enemy.maxHealth
                ctx.fillStyle = '#ff0000'
                ctx.fillRect(enemy.x - enemy.size, enemy.y - enemy.size - 8, enemy.size * 2, 3)
                ctx.fillStyle = '#00ff00'
                ctx.fillRect(enemy.x - enemy.size, enemy.y - enemy.size - 8, enemy.size * 2 * enemyHealthPercentage, 3)
            }
        })

        // 绘制投射物
        gameState.projectiles.forEach(projectile => {
            let color = '#ffffff'
            switch (projectile.weaponId) {
                case 'whip': color = '#ffaa00'; break
                case 'magicWand': color = '#00aaff'; break
                case 'fireball': color = '#ff4400'; break
                case 'lightning': color = '#ffff00'; break
                case 'iceSpike': color = '#00ffff'; break
                case 'laser': color = '#ff00ff'; break
            }

            ctx.fillStyle = color
            ctx.shadowColor = color
            ctx.shadowBlur = 5
            ctx.beginPath()
            ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2)
            ctx.fill()
            ctx.shadowBlur = 0
        })

        // 绘制粒子效果
        setParticleEffects(prev => prev.filter(particle => {
            particle.x += particle.vx
            particle.y += particle.vy
            particle.life--
            particle.vx *= 0.98
            particle.vy *= 0.98
            
            if (particle.life > 0) {
                const alpha = particle.life / particle.maxLife
                ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0')
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2)
                ctx.fill()
                return true
            }
            particlePool.release(particle)
            return false
        }))

        // 重置文本样式
        ctx.textAlign = 'left'
        ctx.fillStyle = '#ffffff'
        ctx.shadowBlur = 0

    }, [gameState, particleEffects, particlePool])

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
                        ⚔️ 幸存者游戏 2.0
                    </h1>

                    <p className="text-gray-300 mb-6 text-lg">
                        使用 WASD 或方向键移动，自动攻击敌人，生存越久分数越高！按 ESC 或空格暂停，按 M 切换小地图
                    </p>

                    {/* 游戏状态显示 */}
                    {gameState.gameStarted && !gameState.gameOver && (
                        <div className="bg-black bg-opacity-50 rounded-lg p-4 mb-4 inline-block">
                            <div className="text-white text-sm grid grid-cols-2 md:grid-cols-4 gap-4">
                                <span>🎯 分数: {gameState.score}</span>
                                <span>⏱️ 时间: {Math.floor(gameState.time / 60)}:{(gameState.time % 60).toString().padStart(2, '0')}</span>
                                <span>❤️ 生命: {gameState.player.health}/{gameState.player.maxHealth}</span>
                                <span>🌟 等级: {gameState.player.level} ({gameState.player.experience}/{gameState.player.level * 100} EXP)</span>
                                <span>🌊 波次: {gameState.wave}</span>
                                <span>👹 敌人: {gameState.enemies.length}</span>
                                <span>💥 投射物: {gameState.projectiles.length}</span>
                                <span>⚡ 速度: {SPEED_PRESETS.find(p => p.value === speedFactor)?.label || '自定义'}</span>
                            </div>
                        </div>
                    )}

                    {gameState.isPaused && gameState.gameStarted && !gameState.gameOver && (
                        <div className="bg-black bg-opacity-80 rounded-lg p-4 mb-4 inline-block">
                            <h2 className="text-2xl font-bold text-yellow-400 mb-2">⏸️ 游戏已暂停</h2>
                            <p className="text-gray-300">按 ESC 或空格键继续游戏</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-center gap-6 mb-6">
                    {/* 主游戏画布 */}
                    <div className="bg-black bg-opacity-30 p-6 rounded-xl shadow-2xl border border-purple-500">
                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={600}
                            className="border border-purple-400 rounded-lg shadow-lg"
                        />
                    </div>

                    {/* 侧边栏信息 */}
                    {gameState.gameStarted && !gameState.gameOver && (
                        <div className="bg-black bg-opacity-50 p-4 rounded-xl border border-purple-500 w-64">
                            <h3 className="text-white font-bold mb-3">⚔️ 武器状态</h3>
                            <div className="space-y-2">
                                {gameState.weapons.map(weapon => (
                                    <div key={weapon.id} className="bg-gray-800 p-2 rounded">
                                        <div className="text-sm text-white font-semibold">{weapon.name} Lv.{weapon.level}</div>
                                        <div className="text-xs text-gray-300">
                                            伤害: {weapon.damage * weapon.level} | 射程: {weapon.range}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            穿透: {weapon.penetration} | 冷却: {weapon.cooldown}ms
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {showMiniMap && (
                                <div className="mt-4">
                                    <h3 className="text-white font-bold mb-2">🗺️ 小地图</h3>
                                    <div className="bg-gray-900 border border-gray-600 rounded" style={{width: '200px', height: '150px', position: 'relative'}}>
                                        {/* 玩家位置 */}
                                        <div 
                                            className="absolute bg-green-400 rounded-full"
                                            style={{
                                                width: '4px',
                                                height: '4px',
                                                left: `${(gameState.player.x / 800) * 200 - 2}px`,
                                                top: `${(gameState.player.y / 600) * 150 - 2}px`
                                            }}
                                        />
                                        {/* 敌人位置 */}
                                        {gameState.enemies.map(enemy => (
                                            <div
                                                key={enemy.id}
                                                className="absolute bg-red-400 rounded-full"
                                                style={{
                                                    width: '2px',
                                                    height: '2px',
                                                    left: `${(enemy.x / 800) * 200 - 1}px`,
                                                    top: `${(enemy.y / 600) * 150 - 1}px`
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="text-center">
                    {!gameState.gameStarted && !gameState.gameOver && (
                        <div className="space-y-4">
                            {/* 速度选择 */}
                            <div className="bg-black bg-opacity-50 p-4 rounded-xl inline-block">
                                <h3 className="text-white font-bold mb-3">⚡ 游戏速度</h3>
                                <div className="flex gap-2">
                                    {SPEED_PRESETS.map(preset => (
                                        <button
                                            key={preset.value}
                                            onClick={() => setSpeedFactor(preset.value)}
                                            className={`px-3 py-1 rounded ${
                                                speedFactor === preset.value
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={startGame}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                            >
                                🎮 开始游戏
                            </button>
                        </div>
                    )}

                    {gameState.gameOver && gameState.showGameOver && (
                        <div className="bg-black bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-md mx-auto border border-purple-500">
                            <h2 className="text-3xl font-bold text-white mb-6">🏁 游戏结束</h2>
                            <div className="space-y-3 mb-6">
                                <p className="text-purple-300 text-lg">🎯 最终分数: <span className="text-yellow-400 font-bold">{gameState.score}</span></p>
                                <p className="text-purple-300 text-lg">⏱️ 生存时间: <span className="text-cyan-400 font-bold">{Math.floor(gameState.time / 60)}:{(gameState.time % 60).toString().padStart(2, '0')}</span></p>
                                <p className="text-purple-300 text-lg">🌟 最高等级: <span className="text-green-400 font-bold">{gameState.player.level}</span></p>
                                <p className="text-purple-300 text-lg">🌊 到达波次: <span className="text-blue-400 font-bold">{gameState.wave}</span></p>
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
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="font-semibold text-purple-300 mb-3 text-lg">🎮 控制方式</h4>
                            <ul className="text-gray-300 space-y-2">
                                <li>• <span className="text-yellow-400">WASD</span> 或 <span className="text-yellow-400">方向键</span>：移动角色</li>
                                <li>• <span className="text-green-400">ESC/空格</span>：暂停游戏</li>
                                <li>• <span className="text-blue-400">M键</span>：切换小地图显示</li>
                                <li>• <span className="text-red-400">躲避敌人</span>：不要让敌人碰到你</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-purple-300 mb-3 text-lg">⚔️ 武器系统</h4>
                            <ul className="text-gray-300 space-y-2">
                                <li>• <span className="text-orange-400">鞭子</span>：近距离扇形攻击</li>
                                <li>• <span className="text-blue-400">魔法杖</span>：智能追踪弹</li>
                                <li>• <span className="text-red-400">火球术</span>：大范围爆炸攻击</li>
                                <li>• <span className="text-yellow-400">闪电链</span>：高穿透攻击</li>
                                <li>• <span className="text-cyan-400">冰锥</span>：高伤害直线攻击</li>
                                <li>• <span className="text-purple-400">激光炮</span>：超高穿透伤害</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-purple-300 mb-3 text-lg">🌟 升级系统</h4>
                            <ul className="text-gray-300 space-y-2">
                                <li>• <span className="text-green-400">击杀敌人</span>：获得经验值</li>
                                <li>• <span className="text-blue-400">等级提升</span>：增加生命值上限</li>
                                <li>• <span className="text-purple-400">解锁武器</span>：等级3/5/7/10解锁新武器</li>
                                <li>• <span className="text-yellow-400">波次奖励</span>：每30秒武器有机会升级</li>
                                <li>• <span className="text-red-400">敌人类型</span>：普通/快速/坦克/Boss</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 