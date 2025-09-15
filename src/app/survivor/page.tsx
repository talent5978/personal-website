'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/components/LanguageProvider'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const PLAYER_SIZE = 20
const ENEMY_SIZE = 15
const BULLET_SIZE = 5

interface Player {
    x: number
    y: number
    health: number
    maxHealth: number
}

interface Enemy {
    id: number
    x: number
    y: number
    health: number
}

interface Bullet {
    id: number
    x: number
    y: number
    vx: number
    vy: number
    damage: number
    type: 'normal' | 'shotgun' | 'laser' | 'explosive'
}

interface PowerUp {
    id: number
    x: number
    y: number
    type: 'health' | 'weapon' | 'speed' | 'shield'
    value: number
}

interface Weapon {
    name: string
    damage: number
    fireRate: number
    bulletSpeed: number
    spread: number
    ammo: number
    maxAmmo: number
    color: string
}

export default function SurvivorGame() {
    const { t } = useLanguage()
    const [player, setPlayer] = useState<Player>({
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        health: 100,
        maxHealth: 100
    })
    const [enemies, setEnemies] = useState<Enemy[]>([])
    const [bullets, setBullets] = useState<Bullet[]>([])
    const [score, setScore] = useState(0)
    const [gameOver, setGameOver] = useState(false)
    const [gameStarted, setGameStarted] = useState(false)
    const [keys, setKeys] = useState<Set<string>>(new Set())
    const [showScoreSubmission, setShowScoreSubmission] = useState(false)
    const [playerName, setPlayerName] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [gameTime, setGameTime] = useState(0)
    const [level, setLevel] = useState(1)
    const [powerUps, setPowerUps] = useState<PowerUp[]>([])
    const [currentWeapon, setCurrentWeapon] = useState<Weapon>({
        name: '手枪',
        damage: 10,
        fireRate: 300,
        bulletSpeed: 8,
        spread: 0,
        ammo: 30,
        maxAmmo: 30,
        color: '#fbbf24'
    })
    const [playerSpeed, setPlayerSpeed] = useState(3)
    const [shield, setShield] = useState(0)
    const [lastFireTime, setLastFireTime] = useState(0)
    const [lastReloadTime, setLastReloadTime] = useState(0)
    const [weaponLevel, setWeaponLevel] = useState(1)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const gameLoopRef = useRef<NodeJS.Timeout>()
    const bulletIdRef = useRef(0)
    const startTimeRef = useRef<number>(0)

    // 计算难度等级
    const calculateLevel = (time: number) => {
        return Math.floor(time / 15) + 1 // 每15秒增加一级
    }

    // 获取当前难度参数
    const getDifficultyParams = () => {
        const enemySpeed = 1 + (level - 1) * 0.4 // 敌人速度随等级增加更快
        const enemyHealth = 30 + (level - 1) * 8 // 敌人血量随等级增加
        const spawnRate = Math.max(1500 - (level - 1) * 150, 300) // 生成频率更快，最快300ms
        const enemySize = Math.max(ENEMY_SIZE - (level - 1) * 1, 6) // 敌人大小随等级减小（更难击中）
        const spawnCount = Math.min(1 + Math.floor((level - 1) / 1.5), 6) // 每1.5级增加1个敌人，最多6个

        return { enemySpeed, enemyHealth, spawnRate, enemySize, spawnCount }
    }

    // 生成单个敌人
    const spawnSingleEnemy = () => {
        const side = Math.floor(Math.random() * 4)
        let x, y
        const { enemyHealth, enemySize } = getDifficultyParams()

        switch (side) {
            case 0: // 上
                x = Math.random() * CANVAS_WIDTH
                y = -enemySize
                break
            case 1: // 右
                x = CANVAS_WIDTH + enemySize
                y = Math.random() * CANVAS_HEIGHT
                break
            case 2: // 下
                x = Math.random() * CANVAS_WIDTH
                y = CANVAS_HEIGHT + enemySize
                break
            default: // 左
                x = -enemySize
                y = Math.random() * CANVAS_HEIGHT
                break
        }

        return {
            id: Date.now() + Math.random() + Math.random(), // 确保唯一ID
            x,
            y,
            health: enemyHealth
        }
    }

    // 生成敌人（可能多个）
    const spawnEnemy = () => {
        const { spawnCount } = getDifficultyParams()
        const newEnemies: Enemy[] = []

        // 如果生成多个敌人，让它们从不同边生成
        if (spawnCount > 1) {
            const sides = [0, 1, 2, 3] // 上、右、下、左

            for (let i = 0; i < spawnCount; i++) {
                let side
                if (i < 4) {
                    // 前4个敌人从不同边生成
                    side = sides[i]
                } else {
                    // 超过4个敌人随机选择边
                    side = Math.floor(Math.random() * 4)
                }

                const enemy = spawnSingleEnemyFromSide(side)
                newEnemies.push(enemy)
            }
        } else {
            // 单个敌人随机生成
            newEnemies.push(spawnSingleEnemy())
        }

        setEnemies(prev => [...prev, ...newEnemies])
    }

    // 从指定边生成敌人
    const spawnSingleEnemyFromSide = (side: number) => {
        let x, y
        const { enemyHealth, enemySize } = getDifficultyParams()

        switch (side) {
            case 0: // 上
                x = Math.random() * CANVAS_WIDTH
                y = -enemySize
                break
            case 1: // 右
                x = CANVAS_WIDTH + enemySize
                y = Math.random() * CANVAS_HEIGHT
                break
            case 2: // 下
                x = Math.random() * CANVAS_WIDTH
                y = CANVAS_HEIGHT + enemySize
                break
            default: // 左
                x = -enemySize
                y = Math.random() * CANVAS_HEIGHT
                break
        }

        return {
            id: Date.now() + Math.random() + Math.random() * 1000, // 确保唯一ID
            x,
            y,
            health: enemyHealth
        }
    }

    // 武器基础定义
    const baseWeapons: Record<string, Omit<Weapon, 'ammo'>> = {
        pistol: {
            name: '手枪',
            damage: 10,
            fireRate: 300,
            bulletSpeed: 8,
            spread: 0,
            maxAmmo: 30,
            color: '#fbbf24'
        },
        shotgun: {
            name: '霰弹枪',
            damage: 15,
            fireRate: 800,
            bulletSpeed: 6,
            spread: 0.3,
            maxAmmo: 8,
            color: '#ff6b6b'
        },
        laser: {
            name: '激光枪',
            damage: 25,
            fireRate: 200,
            bulletSpeed: 12,
            spread: 0,
            maxAmmo: 20,
            color: '#4ecdc4'
        },
        explosive: {
            name: '爆炸枪',
            damage: 40,
            fireRate: 1000,
            bulletSpeed: 5,
            spread: 0,
            maxAmmo: 5,
            color: '#ff9f43'
        }
    }

    // 计算升级后的武器属性
    const getUpgradedWeapon = (weaponKey: string, level: number): Weapon => {
        const base = baseWeapons[weaponKey]
        if (!base) return getUpgradedWeapon('pistol', level)

        const damageMultiplier = 1 + (level - 1) * 0.3 // 每级增加30%伤害
        const fireRateMultiplier = Math.max(0.5, 1 - (level - 1) * 0.1) // 每级减少10%射速间隔
        const speedMultiplier = 1 + (level - 1) * 0.2 // 每级增加20%子弹速度
        const ammoMultiplier = 1 + (level - 1) * 0.2 // 每级增加20%弹药

        return {
            ...base,
            damage: Math.floor(base.damage * damageMultiplier),
            fireRate: Math.floor(base.fireRate * fireRateMultiplier),
            bulletSpeed: base.bulletSpeed * speedMultiplier,
            maxAmmo: Math.floor(base.maxAmmo * ammoMultiplier),
            ammo: Math.floor(base.maxAmmo * ammoMultiplier) // 切换武器时满弹药
        } as Weapon
    }

    // 发射子弹
    const fireBullet = (targetX: number, targetY: number) => {
        const currentTime = Date.now()
        if (currentTime - lastFireTime < currentWeapon.fireRate) return
        if (currentWeapon.ammo <= 0) return

        setLastFireTime(currentTime)

        const dx = targetX - player.x
        const dy = targetY - player.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx)

        const bulletsToAdd: Bullet[] = []

        if (currentWeapon.name === '霰弹枪') {
            // 霰弹枪发射多发子弹
            for (let i = 0; i < 5; i++) {
                const spreadAngle = angle + (Math.random() - 0.5) * currentWeapon.spread
                bulletsToAdd.push({
                    id: bulletIdRef.current++,
                    x: player.x,
                    y: player.y,
                    vx: Math.cos(spreadAngle) * currentWeapon.bulletSpeed,
                    vy: Math.sin(spreadAngle) * currentWeapon.bulletSpeed,
                    damage: currentWeapon.damage,
                    type: 'shotgun'
                })
            }
        } else {
            // 其他武器发射单发子弹
            bulletsToAdd.push({
                id: bulletIdRef.current++,
                x: player.x,
                y: player.y,
                vx: (dx / distance) * currentWeapon.bulletSpeed,
                vy: (dy / distance) * currentWeapon.bulletSpeed,
                damage: currentWeapon.damage,
                type: currentWeapon.name === '激光枪' ? 'laser' :
                    currentWeapon.name === '爆炸枪' ? 'explosive' : 'normal'
            })
        }

        setBullets(prev => [...prev, ...bulletsToAdd])
        setCurrentWeapon(prev => ({ ...prev, ammo: prev.ammo - 1 }))
    }

    // 生成道具
    const spawnPowerUp = () => {
        const types: PowerUp['type'][] = ['health', 'weapon', 'speed', 'shield']
        const type = types[Math.floor(Math.random() * types.length)]

        const powerUp: PowerUp = {
            id: Date.now() + Math.random(),
            x: Math.random() * (CANVAS_WIDTH - 30) + 15,
            y: Math.random() * (CANVAS_HEIGHT - 30) + 15,
            type,
            value: type === 'health' ? 20 :
                type === 'weapon' ? 1 :
                    type === 'speed' ? 1 : 50
        }

        setPowerUps(prev => [...prev, powerUp])
    }

    // 拾取道具
    const collectPowerUp = (powerUp: PowerUp) => {
        switch (powerUp.type) {
            case 'health':
                setPlayer(prev => ({
                    ...prev,
                    health: Math.min(prev.maxHealth, prev.health + powerUp.value)
                }))
                break
            case 'weapon':
                const weaponKeys = Object.keys(baseWeapons)
                const randomWeapon = weaponKeys[Math.floor(Math.random() * weaponKeys.length)]
                setCurrentWeapon(getUpgradedWeapon(randomWeapon, weaponLevel))
                break
            case 'speed':
                setPlayerSpeed(prev => Math.min(6, prev + powerUp.value))
                break
            case 'shield':
                setShield(prev => prev + powerUp.value)
                break
        }

        setPowerUps(prev => prev.filter(p => p.id !== powerUp.id))
    }

    // 游戏主循环
    const gameLoop = () => {
        if (gameOver) return

        // 更新游戏时间和等级
        const currentTime = Date.now()
        const elapsedTime = (currentTime - startTimeRef.current) / 1000
        setGameTime(elapsedTime)
        const newLevel = calculateLevel(elapsedTime)
        if (newLevel !== level) {
            setLevel(newLevel)
        }

        // 武器升级逻辑（每5级升级一次武器）
        const newWeaponLevel = Math.floor(newLevel / 5) + 1
        if (newWeaponLevel !== weaponLevel) {
            setWeaponLevel(newWeaponLevel)
            // 升级武器时保持当前武器类型，但更新属性
            const currentWeaponKey = Object.keys(baseWeapons).find(key =>
                baseWeapons[key].name === currentWeapon.name
            )
            if (currentWeaponKey) {
                setCurrentWeapon(getUpgradedWeapon(currentWeaponKey, newWeaponLevel))
            }
        }

        // 移动玩家
        setPlayer(prev => {
            let newX = prev.x
            let newY = prev.y

            if (keys.has('w') || keys.has('ArrowUp')) newY -= playerSpeed
            if (keys.has('s') || keys.has('ArrowDown')) newY += playerSpeed
            if (keys.has('a') || keys.has('ArrowLeft')) newX -= playerSpeed
            if (keys.has('d') || keys.has('ArrowRight')) newX += playerSpeed

            // 边界检查
            newX = Math.max(PLAYER_SIZE, Math.min(CANVAS_WIDTH - PLAYER_SIZE, newX))
            newY = Math.max(PLAYER_SIZE, Math.min(CANVAS_HEIGHT - PLAYER_SIZE, newY))

            return { ...prev, x: newX, y: newY }
        })

        // 检查道具拾取
        setPowerUps(prev => {
            const remainingPowerUps = prev.filter(powerUp => {
                const dx = player.x - powerUp.x
                const dy = player.y - powerUp.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < PLAYER_SIZE + 15) {
                    collectPowerUp(powerUp)
                    return false
                }
                return true
            })
            return remainingPowerUps
        })

        // 移动敌人
        setEnemies(prev => prev.map(enemy => {
            const dx = player.x - enemy.x
            const dy = player.y - enemy.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            const { enemySpeed } = getDifficultyParams()

            return {
                ...enemy,
                x: enemy.x + (dx / distance) * enemySpeed,
                y: enemy.y + (dy / distance) * enemySpeed
            }
        }))

        // 移动子弹
        setBullets(prev => {
            const newBullets = []
            const bulletsToRemove = []

            for (const bullet of prev) {
                const newX = bullet.x + bullet.vx
                const newY = bullet.y + bullet.vy

                // 检查子弹是否击中敌人
                let hitEnemy = null
                const { enemySize } = getDifficultyParams()
                for (const enemy of enemies) {
                    const dx = newX - enemy.x
                    const dy = newY - enemy.y
                    const distance = Math.sqrt(dx * dx + dy * dy)
                    if (distance < enemySize + BULLET_SIZE) {
                        hitEnemy = enemy
                        break
                    }
                }

                if (hitEnemy) {
                    // 更新敌人状态
                    setEnemies(prevEnemies =>
                        prevEnemies.map(e =>
                            e.id === hitEnemy.id
                                ? { ...e, health: e.health - bullet.damage }
                                : e
                        ).filter(e => e.health > 0)
                    )
                    setScore(prev => prev + bullet.damage)
                    bulletsToRemove.push(bullet.id)
                } else if (newX < 0 || newX > CANVAS_WIDTH || newY < 0 || newY > CANVAS_HEIGHT) {
                    // 检查子弹是否超出边界
                    bulletsToRemove.push(bullet.id)
                } else {
                    // 移动子弹
                    newBullets.push({
                        ...bullet,
                        x: newX,
                        y: newY
                    })
                }
            }

            return newBullets
        })

        // 检查玩家是否被敌人攻击
        setEnemies(prev => {
            const { enemySize } = getDifficultyParams()
            const attackingEnemies = prev.filter(enemy => {
                const dx = player.x - enemy.x
                const dy = player.y - enemy.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                return distance < PLAYER_SIZE + enemySize
            })

            if (attackingEnemies.length > 0) {
                if (shield > 0) {
                    setShield(prev => Math.max(0, prev - 1))
                } else {
                    setPlayer(prevPlayer => {
                        const newHealth = prevPlayer.health - 1
                        if (newHealth <= 0) {
                            setGameOver(true)
                        }
                        return { ...prevPlayer, health: newHealth }
                    })
                }
            }

            return prev
        })
    }

    // 提交分数到排行榜
    const submitScore = async () => {
        if (!playerName.trim()) {
            alert('请输入玩家名称')
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch('/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerName: playerName.trim(),
                    score: score,
                    gameType: 'survivor'
                }),
            })

            if (response.ok) {
                alert('分数提交成功！')
                setShowScoreSubmission(false)
                setPlayerName('')
            } else {
                const error = await response.json()
                alert(error.error || '提交失败，请重试')
            }
        } catch (error) {
            console.error('提交分数失败:', error)
            alert('提交失败，请重试')
        } finally {
            setIsSubmitting(false)
        }
    }

    // 切换武器
    const switchWeapon = (weaponKey: string) => {
        if (baseWeapons[weaponKey]) {
            const upgradedWeapon = getUpgradedWeapon(weaponKey, weaponLevel)
            setCurrentWeapon(upgradedWeapon)
        }
    }

    // 重新装弹
    const reloadWeapon = () => {
        const currentTime = Date.now()
        const reloadCooldown = 2000 // 2秒装弹冷却

        if (currentTime - lastReloadTime < reloadCooldown) {
            return false // 装弹冷却中
        }

        setLastReloadTime(currentTime)
        setCurrentWeapon(prev => ({ ...prev, ammo: prev.maxAmmo }))
        return true
    }

    // 开始游戏
    const startGame = () => {
        setPlayer({
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            health: 100,
            maxHealth: 100
        })
        setEnemies([])
        setBullets([])
        setPowerUps([])
        setScore(0)
        setGameOver(false)
        setGameStarted(true)
        setShowScoreSubmission(false)
        setPlayerName('')
        setGameTime(0)
        setLevel(1)
        setPlayerSpeed(3)
        setShield(0)
        setWeaponLevel(1)
        setCurrentWeapon(getUpgradedWeapon('pistol', 1))
        startTimeRef.current = Date.now()
    }

    // 键盘控制
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            setKeys(prev => new Set(prev).add(e.key))

            // 武器切换
            if (e.key === '1') switchWeapon('pistol')
            if (e.key === '2') switchWeapon('shotgun')
            if (e.key === '3') switchWeapon('laser')
            if (e.key === '4') switchWeapon('explosive')

            // 重新装弹
            if (e.key === 'r') {
                reloadWeapon()
            }
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

    // 鼠标点击发射子弹
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (!gameStarted || gameOver) return

            const canvas = canvasRef.current
            if (!canvas) return

            const rect = canvas.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            fireBullet(x, y)
        }

        window.addEventListener('click', handleClick)
        return () => window.removeEventListener('click', handleClick)
    }, [gameStarted, gameOver, player])

    // 游戏循环
    useEffect(() => {
        if (gameStarted && !gameOver) {
            gameLoopRef.current = setInterval(gameLoop, 16) // 60fps
        }
        return () => {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current)
            }
        }
    }, [gameStarted, gameOver, keys, player, enemies])

    // 生成敌人
    useEffect(() => {
        if (gameStarted && !gameOver) {
            const { spawnRate } = getDifficultyParams()
            const spawnInterval = setInterval(() => {
                spawnEnemy()
            }, spawnRate)

            return () => clearInterval(spawnInterval)
        }
    }, [gameStarted, gameOver, level])

    // 初始快速生成（游戏开始后立即生成一波敌人）
    useEffect(() => {
        if (gameStarted && !gameOver && enemies.length === 0) {
            const initialSpawn = setTimeout(() => {
                spawnEnemy()
            }, 1000) // 游戏开始1秒后生成第一波敌人

            return () => clearTimeout(initialSpawn)
        }
    }, [gameStarted, gameOver, enemies.length])

    // 生成道具
    useEffect(() => {
        if (gameStarted && !gameOver) {
            const powerUpInterval = setInterval(() => {
                if (Math.random() < 0.3) { // 30%概率生成道具
                    spawnPowerUp()
                }
            }, 10000) // 每10秒检查一次

            return () => clearInterval(powerUpInterval)
        }
    }, [gameStarted, gameOver])

    // 渲染游戏
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // 清空画布
        ctx.fillStyle = '#1a1a2e'
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

        // 绘制玩家
        ctx.fillStyle = '#4ade80'
        ctx.beginPath()
        ctx.arc(player.x, player.y, PLAYER_SIZE, 0, Math.PI * 2)
        ctx.fill()

        // 绘制敌人
        const { enemySize } = getDifficultyParams()
        enemies.forEach((enemy, index) => {
            // 根据敌人数量调整颜色
            const hue = (index * 60) % 360 // 不同敌人不同色调
            ctx.fillStyle = `hsl(${hue}, 70%, 50%)`
            ctx.beginPath()
            ctx.arc(enemy.x, enemy.y, enemySize, 0, Math.PI * 2)
            ctx.fill()

            // 添加敌人编号（当敌人较多时）
            if (enemies.length > 3) {
                ctx.fillStyle = '#ffffff'
                ctx.font = '12px Arial'
                ctx.textAlign = 'center'
                ctx.fillText((index + 1).toString(), enemy.x, enemy.y + 4)
                ctx.textAlign = 'left'
            }
        })

        // 绘制子弹
        bullets.forEach(bullet => {
            ctx.fillStyle = bullet.type === 'laser' ? '#4ecdc4' :
                bullet.type === 'explosive' ? '#ff9f43' :
                    bullet.type === 'shotgun' ? '#ff6b6b' : '#fbbf24'
            ctx.beginPath()
            ctx.arc(bullet.x, bullet.y, BULLET_SIZE, 0, Math.PI * 2)
            ctx.fill()

            // 激光子弹添加特效
            if (bullet.type === 'laser') {
                ctx.strokeStyle = '#4ecdc4'
                ctx.lineWidth = 2
                ctx.beginPath()
                ctx.arc(bullet.x, bullet.y, BULLET_SIZE + 3, 0, Math.PI * 2)
                ctx.stroke()
            }
        })

        // 绘制道具
        powerUps.forEach(powerUp => {
            const colors = {
                health: '#ff6b6b',
                weapon: '#4ecdc4',
                speed: '#feca57',
                shield: '#48dbfb'
            }

            ctx.fillStyle = colors[powerUp.type]
            ctx.beginPath()
            ctx.arc(powerUp.x, powerUp.y, 15, 0, Math.PI * 2)
            ctx.fill()

            // 道具图标
            ctx.fillStyle = '#ffffff'
            ctx.font = '12px Arial'
            ctx.textAlign = 'center'
            const icon = powerUp.type === 'health' ? '❤' :
                powerUp.type === 'weapon' ? '⚔' :
                    powerUp.type === 'speed' ? '⚡' : '🛡'
            ctx.fillText(icon, powerUp.x, powerUp.y + 4)
            ctx.textAlign = 'left'
        })

        // 绘制血条
        const barWidth = 200
        const barHeight = 20
        const barX = 10
        const barY = 10

        ctx.fillStyle = '#374151'
        ctx.fillRect(barX, barY, barWidth, barHeight)

        const healthWidth = (player.health / player.maxHealth) * barWidth
        ctx.fillStyle = '#10b981'
        ctx.fillRect(barX, barY, healthWidth, barHeight)

        // 绘制分数、等级和时间
        ctx.fillStyle = '#ffffff'
        ctx.font = '16px Arial'
        ctx.fillText(`分数: ${score}`, CANVAS_WIDTH - 150, 30)
        ctx.fillText(`等级: ${level}`, CANVAS_WIDTH - 150, 50)
        ctx.fillText(`时间: ${Math.floor(gameTime)}s`, CANVAS_WIDTH - 150, 70)
        ctx.fillText(`敌人: ${enemies.length}`, CANVAS_WIDTH - 150, 90)

        // 显示武器信息
        ctx.fillStyle = currentWeapon.color
        ctx.font = '14px Arial'
        ctx.fillText(`武器: ${currentWeapon.name} Lv.${weaponLevel}`, CANVAS_WIDTH - 150, 110)
        ctx.fillText(`弹药: ${currentWeapon.ammo}/${currentWeapon.maxAmmo}`, CANVAS_WIDTH - 150, 130)

        // 显示装弹冷却
        const currentTime = Date.now()
        const reloadCooldown = 2000
        const timeSinceLastReload = currentTime - lastReloadTime
        if (timeSinceLastReload < reloadCooldown) {
            const remainingTime = Math.ceil((reloadCooldown - timeSinceLastReload) / 1000)
            ctx.fillStyle = '#ff6b6b'
            ctx.fillText(`装弹冷却: ${remainingTime}s`, CANVAS_WIDTH - 150, 150)
        } else {
            ctx.fillStyle = '#4ade80'
            ctx.fillText(`装弹就绪`, CANVAS_WIDTH - 150, 150)
        }

        // 显示护盾
        if (shield > 0) {
            ctx.fillStyle = '#48dbfb'
            ctx.fillText(`护盾: ${shield}`, CANVAS_WIDTH - 150, 170)
        }

        // 显示下次生成数量
        const { spawnCount } = getDifficultyParams()
        ctx.fillStyle = '#ffeb3b'
        ctx.font = '12px Arial'
        ctx.fillText(`下次生成: ${spawnCount}个`, CANVAS_WIDTH - 150, 170)

    }, [player, enemies, bullets, score, level, gameTime, powerUps, currentWeapon, shield, playerSpeed, weaponLevel, lastReloadTime])

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-blue-400 mb-4">幸存者</h1>
                <p className="text-gray-400 mb-2">使用 WASD 移动，点击鼠标射击</p>
                <p className="text-gray-400 mb-2">1-4 切换武器，R 重新装弹（2秒冷却）</p>
                <p className="text-gray-400 mb-2">武器每5级自动升级，换武器满弹药</p>
                <p className="text-gray-400 mb-4">拾取道具：❤️生命 ⚔️武器 ⚡速度 🛡️护盾</p>
            </div>

            {!gameStarted ? (
                <button
                    onClick={startGame}
                    className="px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                    开始游戏
                </button>
            ) : (
                <div className="relative">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        className="border-2 border-gray-600 cursor-crosshair"
                    />

                    {gameOver && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-red-400 mb-4">游戏结束!</h2>
                                <p className="text-white mb-4">最终得分: {score}</p>

                                {!showScoreSubmission ? (
                                    <div className="space-y-4">
                                        <button
                                            onClick={() => setShowScoreSubmission(true)}
                                            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors mr-4"
                                        >
                                            🏆 提交分数
                                        </button>
                                        <button
                                            onClick={startGame}
                                            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            重新开始
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <input
                                                type="text"
                                                value={playerName}
                                                onChange={(e) => setPlayerName(e.target.value)}
                                                placeholder="请输入你的名字"
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-black"
                                                maxLength={20}
                                            />
                                        </div>
                                        <div className="space-x-4">
                                            <button
                                                onClick={submitScore}
                                                disabled={isSubmitting}
                                                className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                            >
                                                {isSubmitting ? '提交中...' : '提交分数'}
                                            </button>
                                            <button
                                                onClick={() => setShowScoreSubmission(false)}
                                                className="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
                                            >
                                                取消
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
} 