'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/components/LanguageProvider'

interface Position {
    x: number
    y: number
}

interface GameState {
    snake: Position[]
    food: Position
    direction: string
    gameOver: boolean
    score: number
    gameStarted: boolean
    playerName: string
    showSubmitForm: boolean
    level: number
    speed: number
    specialFood: Position | null
    specialFoodType: 'speed' | 'double' | 'shield' | null
    powerUpActive: boolean
    powerUpTimer: number
    obstacles: Position[]
    gameMode: 'classic' | 'obstacle' | 'speed'
}

export default function SnakeGame() {
    const { t } = useLanguage()
    const [gameState, setGameState] = useState<GameState>({
        snake: [{ x: 10, y: 10 }],
        food: { x: 15, y: 15 },
        direction: 'RIGHT',
        gameOver: false,
        score: 0,
        gameStarted: false,
        playerName: '',
        showSubmitForm: false,
        level: 1,
        speed: 150,
        specialFood: null,
        specialFoodType: null,
        powerUpActive: false,
        powerUpTimer: 0,
        obstacles: [],
        gameMode: 'classic'
    })

    const gridSize = 20
    const cellSize = 20
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // 生成随机位置（避免与蛇身和障碍物重叠）
    const generateRandomPosition = useCallback((excludePositions: Position[] = []) => {
        let newPos: Position
        do {
            newPos = {
                x: Math.floor(Math.random() * gridSize),
                y: Math.floor(Math.random() * gridSize)
            }
        } while (excludePositions.some(pos => pos.x === newPos.x && pos.y === newPos.y))
        return newPos
    }, [])

    // 生成食物
    const generateFood = useCallback(() => {
        const excludePositions = [...gameState.snake, ...gameState.obstacles]
        const newFood = generateRandomPosition(excludePositions)
        setGameState(prev => ({ ...prev, food: newFood }))
    }, [gameState.snake, gameState.obstacles, generateRandomPosition])

    // 生成特殊食物
    const generateSpecialFood = useCallback(() => {
        if (Math.random() < 0.4) { // 增加到40% 概率生成特殊食物
            const excludePositions = [...gameState.snake, ...gameState.obstacles]
            if (gameState.food) {
                excludePositions.push(gameState.food)
            }
            const specialFood = generateRandomPosition(excludePositions)
            const types: ('speed' | 'double' | 'shield')[] = ['speed', 'double', 'shield']
            const specialFoodType = types[Math.floor(Math.random() * types.length)]

            setGameState(prev => ({
                ...prev,
                specialFood,
                specialFoodType
            }))
        }
    }, [gameState.snake, gameState.obstacles, generateRandomPosition])

    // 生成障碍物（障碍模式）
    const generateObstacles = useCallback(() => {
        if (gameState.gameMode === 'obstacle') {
            const newObstacles: Position[] = []
            const obstacleCount = Math.min(gameState.level + 2, 8)

            for (let i = 0; i < obstacleCount; i++) {
                const excludePositions = [...gameState.snake, gameState.food, ...newObstacles]
                const obstacle = generateRandomPosition(excludePositions)
                newObstacles.push(obstacle)
            }

            setGameState(prev => ({ ...prev, obstacles: newObstacles }))
        }
    }, [gameState.gameMode, gameState.level, gameState.snake, gameState.food, generateRandomPosition])

    // 检查碰撞
    const checkCollision = useCallback((head: Position) => {
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
            return true
        }
        // 检查自身碰撞（如果有护盾则忽略）
        if (!gameState.powerUpActive || gameState.specialFoodType !== 'shield') {
            if (gameState.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                return true
            }
        }
        // 检查障碍物碰撞
        if (gameState.gameMode === 'obstacle') {
            if (gameState.obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
                return true
            }
        }
        return false
    }, [gameState.snake, gameState.obstacles, gameState.gameMode, gameState.powerUpActive, gameState.specialFoodType])

    // 移动蛇
    const moveSnake = useCallback(() => {
        if (gameState.gameOver || !gameState.gameStarted) return

        const newSnake = [...gameState.snake]
        const head = { ...newSnake[0] }

        switch (gameState.direction) {
            case 'UP':
                head.y -= 1
                break
            case 'DOWN':
                head.y += 1
                break
            case 'LEFT':
                head.x -= 1
                break
            case 'RIGHT':
                head.x += 1
                break
        }

        if (checkCollision(head)) {
            setGameState(prev => ({ ...prev, gameOver: true, showSubmitForm: true }))
            return
        }

        newSnake.unshift(head)

        // 检查是否吃到食物
        let newScore = gameState.score
        let newLevel = gameState.level
        let newSpeed = gameState.speed
        let powerUpActive = gameState.powerUpActive
        let powerUpTimer = gameState.powerUpTimer
        let specialFood = gameState.specialFood
        let specialFoodType = gameState.specialFoodType

        if (head.x === gameState.food.x && head.y === gameState.food.y) {
            // 普通食物
            const baseScore = gameState.specialFoodType === 'double' ? 20 : 10
            newScore += baseScore
            generateFood()
            generateSpecialFood()

            // 升级检查
            if (newScore >= gameState.level * 50) {
                newLevel = gameState.level + 1
                newSpeed = Math.max(50, gameState.speed - 10)
            }
        } else if (gameState.specialFood && head.x === gameState.specialFood.x && head.y === gameState.specialFood.y) {
            // 特殊食物
            newScore += 30
            powerUpActive = true
            powerUpTimer = 50 // 50帧的持续时间

            switch (gameState.specialFoodType) {
                case 'speed':
                    newSpeed = Math.max(30, gameState.speed - 20)
                    break
                case 'double':
                    // 双倍分数效果在吃到食物时已经计算
                    break
                case 'shield':
                    // 护盾效果在碰撞检测中处理
                    break
            }

            specialFood = null
            specialFoodType = null
        } else {
            newSnake.pop()
        }

        // 更新能量道具计时器
        if (powerUpActive) {
            powerUpTimer--
            if (powerUpTimer <= 0) {
                powerUpActive = false
                powerUpTimer = 0
                specialFoodType = null
                newSpeed = Math.max(50, 150 - (newLevel - 1) * 10)
            }
        }

        setGameState(prev => ({
            ...prev,
            snake: newSnake,
            score: newScore,
            level: newLevel,
            speed: newSpeed,
            powerUpActive,
            powerUpTimer,
            specialFood,
            specialFoodType
        }))
    }, [gameState, checkCollision, generateFood, generateSpecialFood])

    // 键盘和按钮方向控制
    const handleDirection = (dir: string) => {
        if (!gameState.gameStarted) return
        if (dir === 'UP' && gameState.direction !== 'DOWN') {
            setGameState(prev => ({ ...prev, direction: 'UP' }))
        }
        if (dir === 'DOWN' && gameState.direction !== 'UP') {
            setGameState(prev => ({ ...prev, direction: 'DOWN' }))
        }
        if (dir === 'LEFT' && gameState.direction !== 'RIGHT') {
            setGameState(prev => ({ ...prev, direction: 'LEFT' }))
        }
        if (dir === 'RIGHT' && gameState.direction !== 'LEFT') {
            setGameState(prev => ({ ...prev, direction: 'RIGHT' }))
        }
    }

    // 键盘控制
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!gameState.gameStarted) return
            switch (e.key.toLowerCase()) {
                case 'arrowup':
                case 'w':
                    handleDirection('UP')
                    break
                case 'arrowdown':
                case 's':
                    handleDirection('DOWN')
                    break
                case 'arrowleft':
                case 'a':
                    handleDirection('LEFT')
                    break
                case 'arrowright':
                case 'd':
                    handleDirection('RIGHT')
                    break
                case ' ':
                    e.preventDefault()
                    // 暂停/继续游戏功能可以在这里添加
                    break
            }
        }
        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [gameState.gameStarted, gameState.direction])

    // 游戏循环
    useEffect(() => {
        if (!gameState.gameStarted || gameState.gameOver) return

        const gameLoop = setInterval(moveSnake, gameState.speed)
        return () => clearInterval(gameLoop)
    }, [moveSnake, gameState.gameStarted, gameState.gameOver, gameState.speed])

    // Canvas渲染
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // 清空画布
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // 绘制网格
        ctx.strokeStyle = '#333333'
        ctx.lineWidth = 1
        for (let i = 0; i <= gridSize; i++) {
            // 垂直线
            ctx.beginPath()
            ctx.moveTo(i * cellSize, 0)
            ctx.lineTo(i * cellSize, canvas.height)
            ctx.stroke()
            
            // 水平线
            ctx.beginPath()
            ctx.moveTo(0, i * cellSize)
            ctx.lineTo(canvas.width, i * cellSize)
            ctx.stroke()
        }

        // 绘制蛇
        gameState.snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头
                ctx.fillStyle = gameState.powerUpActive && gameState.specialFoodType === 'shield' 
                    ? '#00ffff' : '#00ff00'
            } else {
                // 蛇身
                ctx.fillStyle = '#008800'
            }
            
            ctx.fillRect(
                segment.x * cellSize + 1,
                segment.y * cellSize + 1,
                cellSize - 2,
                cellSize - 2
            )
            
            // 蛇头添加眼睛
            if (index === 0) {
                ctx.fillStyle = '#ffffff'
                const eyeSize = 3
                const eyeOffset = 5
                
                switch (gameState.direction) {
                    case 'RIGHT':
                        ctx.fillRect(segment.x * cellSize + cellSize - eyeOffset, segment.y * cellSize + 4, eyeSize, eyeSize)
                        ctx.fillRect(segment.x * cellSize + cellSize - eyeOffset, segment.y * cellSize + cellSize - 7, eyeSize, eyeSize)
                        break
                    case 'LEFT':
                        ctx.fillRect(segment.x * cellSize + 2, segment.y * cellSize + 4, eyeSize, eyeSize)
                        ctx.fillRect(segment.x * cellSize + 2, segment.y * cellSize + cellSize - 7, eyeSize, eyeSize)
                        break
                    case 'UP':
                        ctx.fillRect(segment.x * cellSize + 4, segment.y * cellSize + 2, eyeSize, eyeSize)
                        ctx.fillRect(segment.x * cellSize + cellSize - 7, segment.y * cellSize + 2, eyeSize, eyeSize)
                        break
                    case 'DOWN':
                        ctx.fillRect(segment.x * cellSize + 4, segment.y * cellSize + cellSize - eyeOffset, eyeSize, eyeSize)
                        ctx.fillRect(segment.x * cellSize + cellSize - 7, segment.y * cellSize + cellSize - eyeOffset, eyeSize, eyeSize)
                        break
                }
            }
        })

        // 绘制普通食物
        ctx.fillStyle = '#ff0000'
        ctx.fillRect(
            gameState.food.x * cellSize + 2,
            gameState.food.y * cellSize + 2,
            cellSize - 4,
            cellSize - 4
        )

        // 绘制特殊食物
        if (gameState.specialFood) {
            let foodColor = '#ffaa00'
            let foodSymbol = '🍊'
            
            switch (gameState.specialFoodType) {
                case 'speed':
                    foodColor = '#ffaa00'
                    foodSymbol = '🍊'
                    break
                case 'double':
                    foodColor = '#ffff00'
                    foodSymbol = '⭐'
                    break
                case 'shield':
                    foodColor = '#0088ff'
                    foodSymbol = '🛡️'
                    break
            }
            
            ctx.fillStyle = foodColor
            ctx.fillRect(
                gameState.specialFood.x * cellSize + 1,
                gameState.specialFood.y * cellSize + 1,
                cellSize - 2,
                cellSize - 2
            )
            
            // 添加特殊食物符号
            ctx.font = `${cellSize - 4}px Arial`
            ctx.textAlign = 'center'
            ctx.fillStyle = '#000000'
            ctx.fillText(
                foodSymbol,
                gameState.specialFood.x * cellSize + cellSize / 2,
                gameState.specialFood.y * cellSize + cellSize / 2 + 3
            )
        }

        // 绘制障碍物
        if (gameState.gameMode === 'obstacle') {
            ctx.fillStyle = '#666666'
            gameState.obstacles.forEach(obstacle => {
                ctx.fillRect(
                    obstacle.x * cellSize + 1,
                    obstacle.y * cellSize + 1,
                    cellSize - 2,
                    cellSize - 2
                )
            })
        }

        // 绘制能量道具状态指示器
        if (gameState.powerUpActive) {
            const progressWidth = (gameState.powerUpTimer / 50) * 100
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)'
            ctx.fillRect(10, 10, progressWidth, 5)
            
            ctx.fillStyle = '#00ffff'
            ctx.font = '12px Arial'
            ctx.textAlign = 'left'
            let powerUpText = ''
            switch (gameState.specialFoodType) {
                case 'speed': powerUpText = '⚡ 加速中'; break
                case 'double': powerUpText = '💰 双倍分数'; break
                case 'shield': powerUpText = '🛡️ 护盾激活'; break
            }
            ctx.fillText(powerUpText, 10, 30)
        }

    }, [gameState])

    // 提交分数
    const submitScore = async () => {
        if (!gameState.playerName.trim()) return

        try {
            const response = await fetch('/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerName: gameState.playerName.trim(),
                    score: gameState.score,
                    gameType: 'snake'
                }),
            })

            if (response.ok) {
                alert('分数提交成功！')
                setGameState(prev => ({ ...prev, showSubmitForm: false }))
                resetGame()
            } else {
                alert('提交失败，请重试')
            }
        } catch (error) {
            console.error('提交分数失败:', error)
            alert('提交失败，请重试')
        }
    }

    // 重置游戏
    const resetGame = () => {
        const initialSnake = [{ x: 10, y: 10 }]
        setGameState({
            snake: initialSnake,
            food: { x: 15, y: 15 },
            direction: 'RIGHT',
            gameOver: false,
            score: 0,
            gameStarted: false,
            playerName: '',
            showSubmitForm: false,
            level: 1,
            speed: 150,
            specialFood: null,
            specialFoodType: null,
            powerUpActive: false,
            powerUpTimer: 0,
            obstacles: [],
            gameMode: 'classic'
        })
        
        // 确保食物不与初始蛇位置重叠
        setTimeout(() => {
            generateFood()
        }, 0)
    }

    // 开始游戏
    const startGame = () => {
        setGameState(prev => ({ ...prev, gameStarted: true }))
        generateFood()
        generateObstacles()
        // 游戏开始时立即生成一个特殊食物
        setTimeout(() => {
            generateSpecialFood()
        }, 500) // 0.5秒后生成第一个特殊食物
    }

    // 切换游戏模式
    const changeGameMode = (mode: 'classic' | 'obstacle' | 'speed') => {
        setGameState(prev => ({
            ...prev,
            gameMode: mode,
            obstacles: mode === 'obstacle' ? [] : prev.obstacles,
            speed: mode === 'speed' ? 100 : 150
        }))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                        {t.snake.title}
                    </h1>
                    <p className="text-gray-300 mb-6 text-lg">
                        {t.snake.description}
                    </p>

                    {/* 游戏状态显示 */}
                    {gameState.gameStarted && !gameState.gameOver && (
                        <div className="bg-black bg-opacity-50 rounded-lg p-4 mb-4 inline-block">
                            <div className="text-white text-sm">
                                <span className="mr-4">🎯 {t.snake.stats.score}: {gameState.score}</span>
                                <span className="mr-4">📏 {t.snake.stats.length}: {gameState.snake.length}</span>
                                <span className="mr-4">📈 {t.snake.stats.level}: {gameState.level}</span>
                                <span className="mr-4">⚡ {t.snake.stats.speed}: {gameState.speed}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center mb-6">
                    <div className="bg-black bg-opacity-30 p-6 rounded-xl shadow-2xl border border-green-500">
                        <canvas
                            ref={canvasRef}
                            width={gridSize * cellSize}
                            height={gridSize * cellSize}
                            className="border border-green-400 rounded-lg shadow-lg"
                        />
                    </div>
                </div>

                <div className="text-center">
                    {!gameState.gameStarted && !gameState.gameOver && (
                        <div className="space-y-4">
                            <button
                                onClick={startGame}
                                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-12 py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                            >
                                🎮 {t.snake.gameOver.restart}
                            </button>
                            
                            {/* 游戏模式选择 */}
                            <div className="flex justify-center space-x-4 mt-4">
                                <button
                                    onClick={() => changeGameMode('classic')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        gameState.gameMode === 'classic'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {t.snake.gameModes.classic}
                                </button>
                                <button
                                    onClick={() => changeGameMode('obstacle')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        gameState.gameMode === 'obstacle'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {t.snake.gameModes.obstacle}
                                </button>
                                <button
                                    onClick={() => changeGameMode('speed')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        gameState.gameMode === 'speed'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {t.snake.gameModes.speed}
                                </button>
                            </div>
                        </div>
                    )}

                    {gameState.gameOver && gameState.showSubmitForm && (
                        <div className="bg-black bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-md mx-auto border border-green-500">
                            <h2 className="text-3xl font-bold text-white mb-6">{t.snake.gameOver.title}</h2>
                            <div className="space-y-3 mb-6">
                                <p className="text-green-300 text-lg">{t.snake.gameOver.finalScore}: <span className="text-yellow-400 font-bold">{gameState.score}</span></p>
                                <p className="text-green-300 text-lg">{t.snake.stats.length}: <span className="text-cyan-400 font-bold">{gameState.snake.length}</span></p>
                            </div>

                            <input
                                type="text"
                                value={gameState.playerName}
                                onChange={(e) => setGameState(prev => ({ ...prev, playerName: e.target.value }))}
                                placeholder={t.snake.gameOver.enterName}
                                className="w-full px-4 py-3 border border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-black bg-opacity-50 text-white placeholder-gray-400"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={submitScore}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105"
                                >
                                    {t.common.submit}
                                </button>
                                <button
                                    onClick={() => setGameState(prev => ({ ...prev, showSubmitForm: false }))}
                                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105"
                                >
                                    {t.common.cancel}
                                </button>
                            </div>
                        </div>
                    )}

                    {gameState.gameOver && !gameState.showSubmitForm && (
                        <div className="bg-black bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-md mx-auto border border-green-500">
                            <h2 className="text-3xl font-bold text-white mb-6">{t.snake.gameOver.title}</h2>
                            <div className="space-y-3 mb-6">
                                <p className="text-green-300 text-lg">{t.snake.gameOver.finalScore}: <span className="text-yellow-400 font-bold">{gameState.score}</span></p>
                                <p className="text-green-300 text-lg">{t.snake.stats.length}: <span className="text-cyan-400 font-bold">{gameState.snake.length}</span></p>
                            </div>

                            <button
                                onClick={() => setGameState(prev => ({ ...prev, showSubmitForm: true }))}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 mr-3"
                            >
                                📊 {t.snake.gameOver.submitScore}
                            </button>
                            <button
                                onClick={startGame}
                                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 mt-4"
                            >
                                🔄 {t.snake.gameOver.restart}
                            </button>
                        </div>
                    )}
                </div>

                {/* 移动端控制按钮 */}
                <div className="md:hidden mt-6">
                    <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                        <div></div>
                        <button
                            onClick={() => handleDirection('UP')}
                            className="bg-green-600 text-white p-4 rounded-lg text-xl font-bold hover:bg-green-700 transition-colors"
                        >
                            ↑
                        </button>
                        <div></div>
                        <button
                            onClick={() => handleDirection('LEFT')}
                            className="bg-green-600 text-white p-4 rounded-lg text-xl font-bold hover:bg-green-700 transition-colors"
                        >
                            ←
                        </button>
                        <button
                            onClick={() => handleDirection('DOWN')}
                            className="bg-green-600 text-white p-4 rounded-lg text-xl font-bold hover:bg-green-700 transition-colors"
                        >
                            ↓
                        </button>
                        <button
                            onClick={() => handleDirection('RIGHT')}
                            className="bg-green-600 text-white p-4 rounded-lg text-xl font-bold hover:bg-green-700 transition-colors"
                        >
                            →
                        </button>
                    </div>
                </div>

                <div className="mt-8 bg-black bg-opacity-50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-green-500">
                    <h3 className="text-2xl font-bold text-white mb-6">{t.snake.instructions.title}</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-semibold text-green-300 mb-3 text-lg">{t.snake.instructions.controls}</h4>
                            <ul className="text-gray-300 space-y-2">
                                <li>• <span className="text-yellow-400">WASD</span> 或 <span className="text-yellow-400">方向键</span>：{t.snake.controls}</li>
                                <li>• <span className="text-green-400">空格键</span>：暂停游戏</li>
                                <li>• <span className="text-red-400">避免撞墙</span>：不要撞到墙壁或自己的身体</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-green-300 mb-3 text-lg">{t.snake.instructions.modes}</h4>
                            <ul className="text-gray-300 space-y-2">
                                <li>• <span className="text-blue-400">{t.snake.gameModes.classic}</span>：经典模式，无特殊规则</li>
                                <li>• <span className="text-red-400">{t.snake.gameModes.obstacle}</span>：障碍模式，有固定障碍物</li>
                                <li>• <span className="text-purple-400">{t.snake.gameModes.speed}</span>：极速模式，速度会逐渐增加</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-green-300 mb-3 text-lg">{t.snake.instructions.specialFood}</h4>
                            <ul className="text-gray-300 space-y-2">
                                <li>• <span className="text-orange-400">🍊 橙色食物</span>：{t.snake.specialFood.speed}</li>
                                <li>• <span className="text-yellow-400">⭐ 金色食物</span>：{t.snake.specialFood.double}</li>
                                <li>• <span className="text-blue-400">🛡️ 蓝色食物</span>：{t.snake.specialFood.shield}</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-green-300 mb-3 text-lg">{t.snake.instructions.difficulty}</h4>
                            <ul className="text-gray-300 space-y-2">
                                <li>• 每吃5个食物，等级提升</li>
                                <li>• 等级越高，蛇移动速度越快</li>
                                <li>• 特殊食物出现概率随等级增加</li>
                                <li>• 障碍模式中障碍物会逐渐增多</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 