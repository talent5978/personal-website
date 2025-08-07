'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/components/LanguageProvider'

// 游戏配置
const GAME_CONFIG = {
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 800,
    PLAYER_SPEED: 1, // 提高玩家移动速度，便于躲避
    ENEMY_BASE_SPEED: 0.3, // 大幅降低敌人基础移动速度
    EXPERIENCE_RANGE: 50,
    LEVEL_UP_EXPERIENCE_BASE: 100,
    INVULNERABLE_TIME: 1000, // 无敌时间：1秒
    WEAPON_COOLDOWNS: {
        magic_missile: 600,
        fireball: 1000,
        lightning: 500,
        ice_shard: 800,
        holy_water: 1500,
        wind_blade: 400,
        poison_dart: 700,
        laser_beam: 300,
        meteor: 2500,
        chain_lightning: 1200
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
    invulnerableUntil: number // 无敌时间截止时间戳
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

interface DamageText {
    id: number
    x: number
    y: number
    damage: number
    opacity: number
    createdAt: number
}

interface Particle {
    id: number
    x: number
    y: number
    vx: number
    vy: number
    size: number
    color: string
    life: number
    maxLife: number
    type: 'hit' | 'death' | 'explosion'
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
    const [playerName, setPlayerName] = useState('')
    const [showSubmitForm, setShowSubmitForm] = useState(false)

    // 游戏对象
    const [player, setPlayer] = useState<Player>({
        x: GAME_CONFIG.CANVAS_WIDTH / 2,
        y: GAME_CONFIG.CANVAS_HEIGHT / 2,
        level: 1,
        experience: 0,
        experienceToNext: GAME_CONFIG.LEVEL_UP_EXPERIENCE_BASE,
        health: 100,
        maxHealth: 100,
        speed: GAME_CONFIG.PLAYER_SPEED,
        invulnerableUntil: 0
    })

    const [enemies, setEnemies] = useState<Enemy[]>([])
    const [projectiles, setProjectiles] = useState<Projectile[]>([])
    const [experienceGems, setExperienceGems] = useState<ExperienceGem[]>([])
    const [damageTexts, setDamageTexts] = useState<DamageText[]>([])
    const [particles, setParticles] = useState<Particle[]>([])
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
        },
        {
            id: 'wind_blade',
            name: '风刃',
            damage: 20,
            cooldown: GAME_CONFIG.WEAPON_COOLDOWNS.wind_blade,
            projectileSpeed: 10,
            range: 300,
            description: '快速的风属性攻击'
        },
        {
            id: 'poison_dart',
            name: '毒镖',
            damage: 25,
            cooldown: GAME_CONFIG.WEAPON_COOLDOWNS.poison_dart,
            projectileSpeed: 8,
            range: 320,
            description: '造成持续毒素伤害'
        },
        {
            id: 'laser_beam',
            name: '激光束',
            damage: 15,
            cooldown: GAME_CONFIG.WEAPON_COOLDOWNS.laser_beam,
            projectileSpeed: 15,
            range: 450,
            description: '高频率的能量攻击'
        },
        {
            id: 'meteor',
            name: '陨石术',
            damage: 120,
            cooldown: GAME_CONFIG.WEAPON_COOLDOWNS.meteor,
            projectileSpeed: 4,
            range: 180,
            description: '超高伤害的天降陨石'
        },
        {
            id: 'chain_lightning',
            name: '连锁闪电',
            damage: 50,
            cooldown: GAME_CONFIG.WEAPON_COOLDOWNS.chain_lightning,
            projectileSpeed: 20,
            range: 350,
            description: '可以跳跃到多个敌人'
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
        // 大幅降低敌人生成数量
        const enemiesPerWave = Math.max(1, Math.min(2 + Math.floor(timeElapsed / 60), 8))

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

            // 根据敌人类型调整速度
            let speedMultiplier = 1
            switch (type) {
                case 'zombie': speedMultiplier = 0.8; break  // 僵尸最慢
                case 'skeleton': speedMultiplier = 1.0; break // 骷髅正常速度
                case 'bat': speedMultiplier = 1.2; break     // 蝙蝠稍快
                case 'ghost': speedMultiplier = 0.9; break   // 幽灵稍慢
            }

            const enemy: Enemy = {
                id: Date.now() + Math.random(),
                x,
                y,
                type,
                health: baseHealth,
                maxHealth: baseHealth,
                speed: GAME_CONFIG.ENEMY_BASE_SPEED * speedMultiplier + Math.random() * 0.1, // 大幅降低速度
                damage: 8 + Math.floor(timeElapsed / 25) * 4, // 降低初期伤害
                experienceValue: 12 + Math.floor(timeElapsed / 20) * 3 // 增加经验值奖励
            }

            setEnemies(prev => [...prev, enemy])
        }
    }, [timeElapsed])

    // 发射投射物 - 重新设计的武器系统
    const fireWeapons = useCallback(() => {
        const currentTime = Date.now()

        weapons.forEach(weapon => {
            if (currentTime - weapon.lastFired >= weapon.cooldown && enemies.length > 0) {
                const newProjectiles: Projectile[] = []
                
                switch (weapon.id) {
                    case 'magic_missile': {
                        // 魔法导弹：追踪最近的敌人
                        const nearestEnemy = enemies.reduce((nearest, enemy) => {
                            const distance = Math.sqrt(
                                Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
                            )
                            const nearestDistance = Math.sqrt(
                                Math.pow(nearest.x - player.x, 2) + Math.pow(nearest.y - player.y, 2)
                            )
                            return distance < nearestDistance ? enemy : nearest
                        })
                        
                        const angle = Math.atan2(nearestEnemy.y - player.y, nearestEnemy.x - player.x)
                        newProjectiles.push({
                            id: Date.now() + Math.random(),
                            x: player.x,
                            y: player.y,
                            vx: Math.cos(angle) * weapon.projectileSpeed,
                            vy: Math.sin(angle) * weapon.projectileSpeed,
                            damage: weapon.damage,
                            weaponId: weapon.id,
                            size: 8,
                            color: '#9333ea'
                        })
                        break
                    }
                    
                    case 'fireball': {
                        // 火球术：范围爆炸攻击，向多个方向发射
                        for (let i = 0; i < 5; i++) {
                            const angle = (i - 2) * 0.4 + Math.random() * 0.2
                            newProjectiles.push({
                                id: Date.now() + i + Math.random(),
                                x: player.x,
                                y: player.y,
                                vx: Math.cos(angle) * (weapon.projectileSpeed * 0.8),
                                vy: Math.sin(angle) * (weapon.projectileSpeed * 0.8),
                                damage: weapon.damage * 0.7,
                                weaponId: weapon.id,
                                size: 12,
                                color: '#f97316'
                            })
                        }
                        break
                    }
                    
                    case 'lightning': {
                        // 闪电链：瞬间击中多个敌人
                        const nearbyEnemies = enemies.filter(enemy => {
                            const distance = Math.sqrt(
                                Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
                            )
                            return distance <= weapon.range
                        }).slice(0, 3) // 最多攻击3个敌人
                        
                        nearbyEnemies.forEach((enemy, index) => {
                            const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x)
                            newProjectiles.push({
                                id: Date.now() + index + Math.random(),
                                x: player.x,
                                y: player.y,
                                vx: Math.cos(angle) * (weapon.projectileSpeed * 2),
                                vy: Math.sin(angle) * (weapon.projectileSpeed * 2),
                                damage: weapon.damage,
                                weaponId: weapon.id,
                                size: 6,
                                color: '#eab308'
                            })
                        })
                        break
                    }
                    
                    case 'ice_shard': {
                        // 冰锥术：穿透攻击，减慢敌人速度
                        const nearestEnemy = enemies.reduce((nearest, enemy) => {
                            const distance = Math.sqrt(
                                Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
                            )
                            const nearestDistance = Math.sqrt(
                                Math.pow(nearest.x - player.x, 2) + Math.pow(nearest.y - player.y, 2)
                            )
                            return distance < nearestDistance ? enemy : nearest
                        })
                        
                        const angle = Math.atan2(nearestEnemy.y - player.y, nearestEnemy.x - player.x)
                        newProjectiles.push({
                            id: Date.now() + Math.random(),
                            x: player.x,
                            y: player.y,
                            vx: Math.cos(angle) * weapon.projectileSpeed,
                            vy: Math.sin(angle) * weapon.projectileSpeed,
                            damage: weapon.damage,
                            weaponId: weapon.id,
                            size: 10,
                            color: '#06b6d4'
                        })
                        break
                    }
                    
                    case 'holy_water': {
                        // 圣水：大范围AOE攻击
                        for (let i = 0; i < 8; i++) {
                            const angle = (i / 8) * Math.PI * 2
                            newProjectiles.push({
                                id: Date.now() + i + Math.random(),
                                x: player.x,
                                y: player.y,
                                vx: Math.cos(angle) * (weapon.projectileSpeed * 0.6),
                                vy: Math.sin(angle) * (weapon.projectileSpeed * 0.6),
                                damage: weapon.damage * 0.5,
                                weaponId: weapon.id,
                                size: 15,
                                color: '#10b981'
                            })
                        }
                        break
                    }
                    
                    case 'wind_blade': {
                        // 风刃：扇形范围攻击
                        for (let i = 0; i < 6; i++) {
                            const angle = (i - 2.5) * 0.3 + Math.random() * 0.1
                            newProjectiles.push({
                                id: Date.now() + i + Math.random(),
                                x: player.x,
                                y: player.y,
                                vx: Math.cos(angle) * weapon.projectileSpeed,
                                vy: Math.sin(angle) * weapon.projectileSpeed,
                                damage: weapon.damage * 0.8,
                                weaponId: weapon.id,
                                size: 7,
                                color: '#22d3ee'
                            })
                        }
                        break
                    }
                    
                    case 'poison_dart': {
                        // 毒镖：持续伤害，向随机方向发射
                        for (let i = 0; i < 3; i++) {
                            const angle = Math.random() * Math.PI * 2
                            newProjectiles.push({
                                id: Date.now() + i + Math.random(),
                                x: player.x,
                                y: player.y,
                                vx: Math.cos(angle) * weapon.projectileSpeed,
                                vy: Math.sin(angle) * weapon.projectileSpeed,
                                damage: weapon.damage * 0.6,
                                weaponId: weapon.id,
                                size: 5,
                                color: '#84cc16'
                            })
                        }
                        break
                    }
                    
                    case 'laser_beam': {
                        // 激光束：直线穿透攻击
                        const nearestEnemy = enemies.reduce((nearest, enemy) => {
                            const distance = Math.sqrt(
                                Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
                            )
                            const nearestDistance = Math.sqrt(
                                Math.pow(nearest.x - player.x, 2) + Math.pow(nearest.y - player.y, 2)
                            )
                            return distance < nearestDistance ? enemy : nearest
                        })
                        
                        const angle = Math.atan2(nearestEnemy.y - player.y, nearestEnemy.x - player.x)
                        newProjectiles.push({
                            id: Date.now() + Math.random(),
                            x: player.x,
                            y: player.y,
                            vx: Math.cos(angle) * (weapon.projectileSpeed * 1.5),
                            vy: Math.sin(angle) * (weapon.projectileSpeed * 1.5),
                            damage: weapon.damage,
                            weaponId: weapon.id,
                            size: 4,
                            color: '#f43f5e'
                        })
                        break
                    }
                    
                    case 'meteor': {
                        // 陨石：大范围爆炸攻击
                        for (let i = 0; i < 12; i++) {
                            const angle = (i / 12) * Math.PI * 2
                            newProjectiles.push({
                                id: Date.now() + i + Math.random(),
                                x: player.x,
                                y: player.y,
                                vx: Math.cos(angle) * (weapon.projectileSpeed * 0.5),
                                vy: Math.sin(angle) * (weapon.projectileSpeed * 0.5),
                                damage: weapon.damage * 0.4,
                                weaponId: weapon.id,
                                size: 18,
                                color: '#f59e0b'
                            })
                        }
                        break
                    }
                    
                    case 'chain_lightning': {
                        // 连锁闪电：在敌人之间跳跃
                        const nearbyEnemies = enemies.filter(enemy => {
                            const distance = Math.sqrt(
                                Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
                            )
                            return distance <= weapon.range
                        }).slice(0, 5) // 最多攻击5个敌人
                        
                        nearbyEnemies.forEach((enemy, index) => {
                            const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x)
                            newProjectiles.push({
                                id: Date.now() + index + Math.random(),
                                x: player.x,
                                y: player.y,
                                vx: Math.cos(angle) * (weapon.projectileSpeed * 1.8),
                                vy: Math.sin(angle) * (weapon.projectileSpeed * 1.8),
                                damage: weapon.damage * 0.8,
                                weaponId: weapon.id,
                                size: 8,
                                color: '#a855f7'
                            })
                        })
                        break
                    }
                }

                if (newProjectiles.length > 0) {
                    setProjectiles(prev => [...prev, ...newProjectiles])
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
        const currentTime = Date.now()
        const isInvulnerable = currentTime < player.invulnerableUntil

        // 无敌时闪烁效果
        if (!isInvulnerable || Math.floor(currentTime / 100) % 2 === 0) {
            ctx.fillStyle = isInvulnerable ? '#60a5fa' : '#3b82f6' // 无敌时颜色稍浅
            ctx.beginPath()
            ctx.arc(newPlayerX, newPlayerY, 20, 0, Math.PI * 2)
            ctx.fill()

            // 无敌时添加光环效果
            if (isInvulnerable) {
                ctx.strokeStyle = '#93c5fd'
                ctx.lineWidth = 3
                ctx.beginPath()
                ctx.arc(newPlayerX, newPlayerY, 25, 0, Math.PI * 2)
                ctx.stroke()
            }
        }

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

        // 绘制投射物 - 重新设计的视觉效果
        projectiles.forEach(projectile => {
            switch (projectile.weaponId) {
                case 'magic_missile': {
                    // 魔法导弹：紫色追踪弹
                    ctx.fillStyle = projectile.color
                    ctx.beginPath()
                    ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2)
                    ctx.fill()
                    
                    // 追踪尾迹效果
                    ctx.strokeStyle = projectile.color
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    ctx.moveTo(projectile.x - projectile.vx * 2, projectile.y - projectile.vy * 2)
                    ctx.lineTo(projectile.x, projectile.y)
                    ctx.stroke()
                    break
                }
                
                case 'fireball': {
                    // 火球术：火焰效果
                    const gradient = ctx.createRadialGradient(
                        projectile.x, projectile.y, 0,
                        projectile.x, projectile.y, projectile.size
                    )
                    gradient.addColorStop(0, '#ffffff')
                    gradient.addColorStop(0.3, projectile.color)
                    gradient.addColorStop(1, '#ff0000')
                    
                    ctx.fillStyle = gradient
                    ctx.beginPath()
                    ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2)
                    ctx.fill()
                    
                    // 火焰粒子效果
                    for (let i = 0; i < 3; i++) {
                        const angle = Math.random() * Math.PI * 2
                        const distance = Math.random() * projectile.size
                        ctx.fillStyle = '#ffaa00'
                        ctx.beginPath()
                        ctx.arc(
                            projectile.x + Math.cos(angle) * distance,
                            projectile.y + Math.sin(angle) * distance,
                            2,
                            0, Math.PI * 2
                        )
                        ctx.fill()
                    }
                    break
                }
                
                case 'lightning': {
                    // 闪电链：闪电效果
                    ctx.strokeStyle = projectile.color
                    ctx.lineWidth = 3
                    ctx.shadowColor = projectile.color
                    ctx.shadowBlur = 15
                    
                    // 绘制闪电形状
                    ctx.beginPath()
                    ctx.moveTo(projectile.x - projectile.vx * 3, projectile.y - projectile.vy * 3)
                    ctx.lineTo(projectile.x, projectile.y)
                    ctx.stroke()
                    
                    ctx.shadowBlur = 0
                    break
                }
                
                case 'ice_shard': {
                    // 冰锥术：冰晶效果
                    ctx.fillStyle = projectile.color
                    ctx.beginPath()
                    ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2)
                    ctx.fill()
                    
                    // 冰晶边缘
                    ctx.strokeStyle = '#ffffff'
                    ctx.lineWidth = 1
                    ctx.beginPath()
                    ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2)
                    ctx.stroke()
                    break
                }
                
                case 'holy_water': {
                    // 圣水：神圣光环效果
                    const gradient = ctx.createRadialGradient(
                        projectile.x, projectile.y, 0,
                        projectile.x, projectile.y, projectile.size
                    )
                    gradient.addColorStop(0, '#ffffff')
                    gradient.addColorStop(0.5, projectile.color)
                    gradient.addColorStop(1, '#10b981')
                    
                    ctx.fillStyle = gradient
                    ctx.beginPath()
                    ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2)
                    ctx.fill()
                    
                    // 神圣光环
                    ctx.strokeStyle = '#ffffff'
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    ctx.arc(projectile.x, projectile.y, projectile.size + 3, 0, Math.PI * 2)
                    ctx.stroke()
                    break
                }
                
                case 'wind_blade': {
                    // 风刃：风刃效果
                    ctx.strokeStyle = projectile.color
                    ctx.lineWidth = 4
                    ctx.lineCap = 'round'
                    
                    // 绘制风刃形状
                    const angle = Math.atan2(projectile.vy, projectile.vx)
                    const length = projectile.size * 2
                    
                    ctx.beginPath()
                    ctx.moveTo(
                        projectile.x - Math.cos(angle) * length,
                        projectile.y - Math.sin(angle) * length
                    )
                    ctx.lineTo(
                        projectile.x + Math.cos(angle) * length,
                        projectile.y + Math.sin(angle) * length
                    )
                    ctx.stroke()
                    break
                }
                
                case 'poison_dart': {
                    // 毒镖：毒雾效果
                    ctx.fillStyle = projectile.color
                    ctx.beginPath()
                    ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2)
                    ctx.fill()
                    
                    // 毒雾粒子
                    for (let i = 0; i < 2; i++) {
                        ctx.fillStyle = '#00ff00'
                        ctx.beginPath()
                        ctx.arc(
                            projectile.x + (Math.random() - 0.5) * 10,
                            projectile.y + (Math.random() - 0.5) * 10,
                            1,
                            0, Math.PI * 2
                        )
                        ctx.fill()
                    }
                    break
                }
                
                case 'laser_beam': {
                    // 激光束：激光效果
                    ctx.strokeStyle = projectile.color
                    ctx.lineWidth = 2
                    ctx.shadowColor = projectile.color
                    ctx.shadowBlur = 20
                    
                    const angle = Math.atan2(projectile.vy, projectile.vx)
                    const length = 50
                    
                    ctx.beginPath()
                    ctx.moveTo(
                        projectile.x - Math.cos(angle) * length,
                        projectile.y - Math.sin(angle) * length
                    )
                    ctx.lineTo(
                        projectile.x + Math.cos(angle) * length,
                        projectile.y + Math.sin(angle) * length
                    )
                    ctx.stroke()
                    
                    ctx.shadowBlur = 0
                    break
                }
                
                case 'meteor': {
                    // 陨石：陨石效果
                    const gradient = ctx.createRadialGradient(
                        projectile.x, projectile.y, 0,
                        projectile.x, projectile.y, projectile.size
                    )
                    gradient.addColorStop(0, '#ffffff')
                    gradient.addColorStop(0.2, '#ffaa00')
                    gradient.addColorStop(0.6, projectile.color)
                    gradient.addColorStop(1, '#8b0000')
                    
                    ctx.fillStyle = gradient
                    ctx.beginPath()
                    ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2)
                    ctx.fill()
                    
                    // 陨石尾迹
                    ctx.strokeStyle = '#ffaa00'
                    ctx.lineWidth = 3
                    ctx.beginPath()
                    ctx.moveTo(projectile.x - projectile.vx * 4, projectile.y - projectile.vy * 4)
                    ctx.lineTo(projectile.x, projectile.y)
                    ctx.stroke()
                    break
                }
                
                case 'chain_lightning': {
                    // 连锁闪电：连锁效果
                    ctx.strokeStyle = projectile.color
                    ctx.lineWidth = 2
                    ctx.shadowColor = projectile.color
                    ctx.shadowBlur = 10
                    
                    // 绘制连锁闪电
                    ctx.beginPath()
                    ctx.moveTo(projectile.x - projectile.vx * 2, projectile.y - projectile.vy * 2)
                    ctx.lineTo(projectile.x, projectile.y)
                    ctx.stroke()
                    
                    // 闪电分支
                    const angle = Math.atan2(projectile.vy, projectile.vx)
                    const branchLength = 15
                    for (let i = 0; i < 2; i++) {
                        const branchAngle = angle + (i - 0.5) * 0.5
                        ctx.beginPath()
                        ctx.moveTo(projectile.x, projectile.y)
                        ctx.lineTo(
                            projectile.x + Math.cos(branchAngle) * branchLength,
                            projectile.y + Math.sin(branchAngle) * branchLength
                        )
                        ctx.stroke()
                    }
                    
                    ctx.shadowBlur = 0
                    break
                }
                
                default: {
                    // 默认投射物效果
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
                }
            }
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

        // 碰撞检测：投射物与敌人 - 重新设计的武器效果
        projectiles.forEach(projectile => {
            const hitEnemies: Enemy[] = []
            
            enemies.forEach(enemy => {
                const distance = Math.sqrt(
                    Math.pow(projectile.x - enemy.x, 2) + Math.pow(projectile.y - enemy.y, 2)
                )

                if (distance < projectile.size + 15) {
                    hitEnemies.push(enemy)
                }
            })

            if (hitEnemies.length > 0) {
                // 根据武器类型处理不同的碰撞效果
                switch (projectile.weaponId) {
                    case 'magic_missile': {
                        // 魔法导弹：单目标高伤害
                        const enemy = hitEnemies[0]
                        createHitParticles(enemy, projectile, 8)
                        setEnemies(prev => prev.map(e =>
                            e.id === enemy.id ? { ...e, health: e.health - projectile.damage } : e
                        ))
                        setProjectiles(prev => prev.filter(p => p.id !== projectile.id))
                        break
                    }
                    
                    case 'fireball': {
                        // 火球术：范围爆炸伤害
                        hitEnemies.forEach(enemy => {
                            createHitParticles(enemy, projectile, 12)
                            setEnemies(prev => prev.map(e =>
                                e.id === enemy.id ? { ...e, health: e.health - projectile.damage } : e
                            ))
                        })
                        // 创建爆炸效果
                        createExplosionEffect(projectile.x, projectile.y, projectile.color)
                        setProjectiles(prev => prev.filter(p => p.id !== projectile.id))
                        break
                    }
                    
                    case 'lightning': {
                        // 闪电链：瞬间伤害，不穿透
                        hitEnemies.forEach(enemy => {
                            createHitParticles(enemy, projectile, 6)
                            setEnemies(prev => prev.map(e =>
                                e.id === enemy.id ? { ...e, health: e.health - projectile.damage } : e
                            ))
                        })
                        setProjectiles(prev => prev.filter(p => p.id !== projectile.id))
                        break
                    }
                    
                    case 'ice_shard': {
                        // 冰锥术：穿透攻击，减慢敌人速度
                        hitEnemies.forEach(enemy => {
                            createHitParticles(enemy, projectile, 10)
                            setEnemies(prev => prev.map(e =>
                                e.id === enemy.id ? { 
                                    ...e, 
                                    health: e.health - projectile.damage,
                                    speed: e.speed * 0.7 // 减慢速度
                                } : e
                            ))
                        })
                        // 冰锥可以穿透，不立即移除
                        break
                    }
                    
                    case 'holy_water': {
                        // 圣水：大范围AOE，对不死生物额外伤害
                        hitEnemies.forEach(enemy => {
                            const extraDamage = enemy.type === 'zombie' || enemy.type === 'skeleton' ? projectile.damage * 0.5 : 0
                            createHitParticles(enemy, projectile, 15)
                            setEnemies(prev => prev.map(e =>
                                e.id === enemy.id ? { 
                                    ...e, 
                                    health: e.health - projectile.damage - extraDamage 
                                } : e
                            ))
                        })
                        createExplosionEffect(projectile.x, projectile.y, projectile.color)
                        setProjectiles(prev => prev.filter(p => p.id !== projectile.id))
                        break
                    }
                    
                    case 'wind_blade': {
                        // 风刃：扇形范围伤害
                        hitEnemies.forEach(enemy => {
                            createHitParticles(enemy, projectile, 8)
                            setEnemies(prev => prev.map(e =>
                                e.id === enemy.id ? { ...e, health: e.health - projectile.damage } : e
                            ))
                        })
                        setProjectiles(prev => prev.filter(p => p.id !== projectile.id))
                        break
                    }
                    
                    case 'poison_dart': {
                        // 毒镖：持续伤害效果
                        hitEnemies.forEach(enemy => {
                            createHitParticles(enemy, projectile, 5)
                            setEnemies(prev => prev.map(e =>
                                e.id === enemy.id ? { 
                                    ...e, 
                                    health: e.health - projectile.damage,
                                    // 添加持续伤害效果
                                    damage: e.damage + 2 // 增加敌人伤害作为持续效果
                                } : e
                            ))
                        })
                        setProjectiles(prev => prev.filter(p => p.id !== projectile.id))
                        break
                    }
                    
                    case 'laser_beam': {
                        // 激光束：穿透攻击，直线伤害
                        hitEnemies.forEach(enemy => {
                            createHitParticles(enemy, projectile, 4)
                            setEnemies(prev => prev.map(e =>
                                e.id === enemy.id ? { ...e, health: e.health - projectile.damage } : e
                            ))
                        })
                        // 激光可以穿透，不立即移除
                        break
                    }
                    
                    case 'meteor': {
                        // 陨石：大范围爆炸，高伤害
                        hitEnemies.forEach(enemy => {
                            createHitParticles(enemy, projectile, 20)
                            setEnemies(prev => prev.map(e =>
                                e.id === enemy.id ? { ...e, health: e.health - projectile.damage } : e
                            ))
                        })
                        createExplosionEffect(projectile.x, projectile.y, projectile.color)
                        setProjectiles(prev => prev.filter(p => p.id !== projectile.id))
                        break
                    }
                    
                    case 'chain_lightning': {
                        // 连锁闪电：在敌人之间跳跃
                        hitEnemies.forEach(enemy => {
                            createHitParticles(enemy, projectile, 8)
                            setEnemies(prev => prev.map(e =>
                                e.id === enemy.id ? { ...e, health: e.health - projectile.damage } : e
                            ))
                        })
                        setProjectiles(prev => prev.filter(p => p.id !== projectile.id))
                        break
                    }
                }
            }
        })

        // 辅助函数：创建打击粒子效果
        const createHitParticles = (enemy: Enemy, projectile: Projectile, count: number) => {
            const newParticles: Particle[] = []
            for (let i = 0; i < count; i++) {
                newParticles.push({
                    id: Date.now() + Math.random(),
                    x: enemy.x + (Math.random() - 0.5) * 20,
                    y: enemy.y + (Math.random() - 0.5) * 20,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    size: Math.random() * 4 + 2,
                    color: projectile.color,
                    life: 0,
                    maxLife: 30 + Math.random() * 20,
                    type: 'hit'
                })
            }
            setParticles(prev => [...prev, ...newParticles])
        }

        // 辅助函数：创建爆炸效果
        const createExplosionEffect = (x: number, y: number, color: string) => {
            const explosionParticles: Particle[] = []
            for (let i = 0; i < 15; i++) {
                const angle = (i / 15) * Math.PI * 2
                explosionParticles.push({
                    id: Date.now() + Math.random(),
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * (3 + Math.random() * 4),
                    vy: Math.sin(angle) * (3 + Math.random() * 4),
                    size: Math.random() * 8 + 4,
                    color: color,
                    life: 0,
                    maxLife: 50 + Math.random() * 30,
                    type: 'explosion'
                })
            }
            setParticles(prev => [...prev, ...explosionParticles])
        }

        // 移除死亡敌人并生成经验宝石
        setEnemies(prev => {
            const aliveenemies = prev.filter(enemy => {
                if (enemy.health <= 0) {
                    // 生成死亡粒子效果
                    const deathParticles: Particle[] = []
                    for (let i = 0; i < 12; i++) {
                        const angle = (i / 12) * Math.PI * 2
                        deathParticles.push({
                            id: Date.now() + Math.random(),
                            x: enemy.x,
                            y: enemy.y,
                            vx: Math.cos(angle) * (2 + Math.random() * 3),
                            vy: Math.sin(angle) * (2 + Math.random() * 3),
                            size: Math.random() * 6 + 3,
                            color: enemy.type === 'zombie' ? '#ef4444' :
                                enemy.type === 'skeleton' ? '#f3f4f6' :
                                    enemy.type === 'bat' ? '#7c3aed' : '#6b7280',
                            life: 0,
                            maxLife: 40 + Math.random() * 30,
                            type: 'death'
                        })
                    }
                    setParticles(prev => [...prev, ...deathParticles])

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
        if (currentTime >= player.invulnerableUntil) { // 只有非无敌状态才能受伤
            enemies.forEach(enemy => {
                const distance = Math.sqrt(
                    Math.pow(enemy.x - newPlayerX, 2) + Math.pow(enemy.y - newPlayerY, 2)
                )

                if (distance < 35) {
                    setPlayer(prev => {
                        const newHealth = prev.health - enemy.damage
                        if (newHealth <= 0) {
                            setGameState('gameOver')
                            return { ...prev, health: 0 }
                        }
                        // 显示伤害数字
                        setDamageTexts(prevTexts => [...prevTexts, {
                            id: Date.now() + Math.random(),
                            x: newPlayerX + (Math.random() - 0.5) * 40,
                            y: newPlayerY - 20,
                            damage: enemy.damage,
                            opacity: 1,
                            createdAt: currentTime
                        }])

                        // 受伤后获得无敌时间
                        return {
                            ...prev,
                            health: newHealth,
                            invulnerableUntil: currentTime + GAME_CONFIG.INVULNERABLE_TIME
                        }
                    })
                }
            })
        }

        // 更新和绘制粒子效果
        setParticles(prev => prev.map(particle => {
            particle.life++
            particle.x += particle.vx
            particle.y += particle.vy
            particle.vx *= 0.98 // 阻力
            particle.vy *= 0.98

            const alpha = 1 - (particle.life / particle.maxLife)

            if (alpha > 0) {
                ctx.save()
                ctx.globalAlpha = alpha
                ctx.fillStyle = particle.color
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2)
                ctx.fill()
                ctx.restore()
            }

            return particle
        }).filter(particle => particle.life < particle.maxLife))

        // 更新和绘制伤害数字
        setDamageTexts(prev => prev.map(text => {
            const age = currentTime - text.createdAt
            const newY = text.y - age * 0.05 // 向上漂浮
            const newOpacity = Math.max(0, 1 - age / 1500) // 1.5秒后消失

            // 绘制伤害数字
            if (newOpacity > 0) {
                ctx.fillStyle = `rgba(255, 100, 100, ${newOpacity})`
                ctx.font = 'bold 16px Arial'
                ctx.textAlign = 'center'
                ctx.fillText(`-${text.damage}`, text.x, newY)
            }

            return { ...text, y: newY, opacity: newOpacity }
        }).filter(text => text.opacity > 0))

        gameLoopRef.current = requestAnimationFrame(gameLoop)
    }, [gameState, player, enemies, projectiles, experienceGems, damageTexts, particles, fireWeapons])

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

    // 提交分数
    const submitScore = async () => {
        if (!playerName.trim()) {
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
                    playerName: playerName,
                    score: score,
                    gameType: 'vampire_survivor'
                }),
            })

            if (response.ok) {
                alert('分数提交成功！')
                setShowSubmitForm(false)
                setPlayerName('')
            } else {
                alert('分数提交失败，请重试')
            }
        } catch (error) {
            console.error('提交分数失败:', error)
            alert('分数提交失败，请重试')
        }
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
            speed: GAME_CONFIG.PLAYER_SPEED,
            invulnerableUntil: 0
        })
        setEnemies([])
        setProjectiles([])
        setExperienceGems([])
        setDamageTexts([])
        setParticles([])
        setShowSubmitForm(false)
        setPlayerName('')
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
            }, 5000) // 大幅降低生成频率到5秒，让游戏更轻松

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
                            在这个类似吸血鬼幸存者的游戏中生存下去！<br />
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
                    <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md">
                        <h2 className="text-3xl font-bold mb-4 text-red-400">游戏结束</h2>
                        <div className="mb-6 space-y-2">
                            <p className="text-xl">最终得分: <span className="text-yellow-400 font-bold">{score}</span></p>
                            <p className="text-lg">生存时间: <span className="text-blue-400 font-bold">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</span></p>
                            <p className="text-lg">等级: <span className="text-purple-400 font-bold">{player.level}</span></p>
                        </div>

                        {!showSubmitForm ? (
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowSubmitForm(true)}
                                    className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-bold w-full"
                                >
                                    📊 提交分数
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        onClick={startGame}
                                        className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-bold flex-1"
                                    >
                                        重新开始
                                    </button>
                                    <button
                                        onClick={() => setGameState('menu')}
                                        className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg font-bold flex-1"
                                    >
                                        返回菜单
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="输入你的名字"
                                    className="w-full px-4 py-3 border border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white placeholder-gray-400"
                                    maxLength={20}
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={submitScore}
                                        className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-bold flex-1"
                                    >
                                        提交
                                    </button>
                                    <button
                                        onClick={() => setShowSubmitForm(false)}
                                        className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg font-bold flex-1"
                                    >
                                        取消
                                    </button>
                                </div>
                                <div className="flex gap-3 mt-2">
                                    <button
                                        onClick={startGame}
                                        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-bold text-sm flex-1"
                                    >
                                        重新开始
                                    </button>
                                    <button
                                        onClick={() => setGameState('menu')}
                                        className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-bold text-sm flex-1"
                                    >
                                        返回菜单
                                    </button>
                                </div>
                            </div>
                        )}
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