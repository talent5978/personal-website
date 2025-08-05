'use client'

import { useState, useEffect, useCallback } from 'react'

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

export default function Game() {
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
        if (Math.random() < 0.15) { // 15% 概率生成特殊食物
            const excludePositions = [...gameState.snake, ...gameState.obstacles, gameState.food]
            const specialFood = generateRandomPosition(excludePositions)
            const types: ('speed' | 'double' | 'shield')[] = ['speed', 'double', 'shield']
            const specialFoodType = types[Math.floor(Math.random() * types.length)]

            setGameState(prev => ({
                ...prev,
                specialFood,
                specialFoodType
            }))
        }
    }, [gameState.snake, gameState.obstacles, gameState.food, generateRandomPosition])

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
            switch (e.key) {
                case 'ArrowUp':
                    handleDirection('UP')
                    break
                case 'ArrowDown':
                    handleDirection('DOWN')
                    break
                case 'ArrowLeft':
                    handleDirection('LEFT')
                    break
                case 'ArrowRight':
                    handleDirection('RIGHT')
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
        setGameState({
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
        generateFood()
    }

    // 开始游戏
    const startGame = () => {
        setGameState(prev => ({ ...prev, gameStarted: true }))
        generateFood()
        generateObstacles()
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
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-green-900 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        🐍 贪吃蛇游戏
                    </h1>

                    {/* 游戏模式选择 */}
                    {!gameState.gameStarted && !gameState.gameOver && (
                        <div className="mb-6">
                            <h3 className="text-white text-lg mb-4">选择游戏模式</h3>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => changeGameMode('classic')}
                                    className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${gameState.gameMode === 'classic'
                                            ? 'bg-green-600 text-white shadow-lg'
                                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                        }`}
                                >
                                    🎮 经典模式
                                </button>
                                <button
                                    onClick={() => changeGameMode('obstacle')}
                                    className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${gameState.gameMode === 'obstacle'
                                            ? 'bg-red-600 text-white shadow-lg'
                                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                        }`}
                                >
                                    ⚠️ 障碍模式
                                </button>
                                <button
                                    onClick={() => changeGameMode('speed')}
                                    className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${gameState.gameMode === 'speed'
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                        }`}
                                >
                                    ⚡ 极速模式
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 游戏状态显示 */}
                    {gameState.gameStarted && !gameState.gameOver && (
                        <div className="bg-black bg-opacity-50 rounded-lg p-4 mb-4 inline-block">
                            <div className="text-white text-sm space-x-6">
                                <span>🎯 分数: <span className="text-yellow-400 font-bold">{gameState.score}</span></span>
                                <span>📏 长度: <span className="text-green-400 font-bold">{gameState.snake.length}</span></span>
                                <span>🏆 等级: <span className="text-blue-400 font-bold">{gameState.level}</span></span>
                                <span>⚡ 速度: <span className="text-purple-400 font-bold">{Math.round(1000 / gameState.speed)}</span></span>
                                {gameState.powerUpActive && (
                                    <span className="text-orange-400 font-bold">
                                        {gameState.specialFoodType === 'speed' && '🚀 加速'}
                                        {gameState.specialFoodType === 'double' && '💰 双倍'}
                                        {gameState.specialFoodType === 'shield' && '🛡️ 护盾'}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center mb-8">
                    <div
                        className="bg-black bg-opacity-30 border-2 border-green-500 relative rounded-lg shadow-2xl"
                        style={{ width: gridSize * cellSize, height: gridSize * cellSize }}
                    >
                        {/* 蛇身 */}
                        {gameState.snake.map((segment, index) => (
                            <div
                                key={index}
                                className={`absolute rounded-sm ${index === 0
                                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg'
                                        : 'bg-gradient-to-r from-green-500 to-green-600'
                                    }`}
                                style={{
                                    left: segment.x * cellSize,
                                    top: segment.y * cellSize,
                                    width: cellSize,
                                    height: cellSize,
                                }}
                            />
                        ))}

                        {/* 食物 */}
                        <div
                            className="absolute bg-gradient-to-r from-red-400 to-pink-500 rounded-full shadow-lg animate-pulse"
                            style={{
                                left: gameState.food.x * cellSize,
                                top: gameState.food.y * cellSize,
                                width: cellSize,
                                height: cellSize,
                            }}
                        />

                        {/* 特殊食物 */}
                        {gameState.specialFood && (
                            <div
                                className={`absolute rounded-full shadow-lg animate-bounce ${gameState.specialFoodType === 'speed' ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                                        gameState.specialFoodType === 'double' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                            'bg-gradient-to-r from-purple-400 to-pink-500'
                                    }`}
                                style={{
                                    left: gameState.specialFood.x * cellSize,
                                    top: gameState.specialFood.y * cellSize,
                                    width: cellSize,
                                    height: cellSize,
                                }}
                            />
                        )}

                        {/* 障碍物 */}
                        {gameState.obstacles.map((obstacle, index) => (
                            <div
                                key={index}
                                className="absolute bg-gradient-to-r from-gray-600 to-gray-800 rounded-sm shadow-lg"
                                style={{
                                    left: obstacle.x * cellSize,
                                    top: obstacle.y * cellSize,
                                    width: cellSize,
                                    height: cellSize,
                                }}
                            />
                        ))}
                    </div>
                </div>
                {/* 移动端方向按钮 */}
                <div className="flex flex-col items-center mt-4 space-y-2 sm:hidden">
                    <button
                        className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-2xl active:from-green-600 active:to-emerald-700 shadow-lg transform active:scale-95"
                        onClick={() => handleDirection('UP')}
                    >↑</button>
                    <div className="flex space-x-8">
                        <button
                            className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-2xl active:from-green-600 active:to-emerald-700 shadow-lg transform active:scale-95"
                            onClick={() => handleDirection('LEFT')}
                        >←</button>
                        <button
                            className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-2xl active:from-green-600 active:to-emerald-700 shadow-lg transform active:scale-95"
                            onClick={() => handleDirection('RIGHT')}
                        >→</button>
                    </div>
                    <button
                        className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-2xl active:from-green-600 active:to-emerald-700 shadow-lg transform active:scale-95"
                        onClick={() => handleDirection('DOWN')}
                    >↓</button>
                </div>

                <div className="text-center">
                    {!gameState.gameStarted && !gameState.gameOver && (
                        <button
                            onClick={startGame}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                        >
                            🎮 开始游戏
                        </button>
                    )}

                    {gameState.gameOver && (
                        <div className="bg-black bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-md mx-auto border border-green-500">
                            <h2 className="text-3xl font-bold text-white mb-6">🏁 游戏结束</h2>
                            <div className="space-y-3 mb-6">
                                <p className="text-green-300 text-lg">🎯 最终分数: <span className="text-yellow-400 font-bold">{gameState.score}</span></p>
                                <p className="text-green-300 text-lg">📏 蛇的长度: <span className="text-green-400 font-bold">{gameState.snake.length}</span></p>
                                <p className="text-green-300 text-lg">🏆 达到等级: <span className="text-blue-400 font-bold">{gameState.level}</span></p>
                            </div>

                            <button
                                onClick={resetGame}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                            >
                                🔄 重新开始
                            </button>
                        </div>
                    )}

                    {gameState.showSubmitForm && (
                        <div className="mt-4 p-6 bg-black bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md mx-auto border border-green-500">
                            <h3 className="text-xl font-bold text-white mb-4">📊 提交你的分数</h3>
                            <input
                                type="text"
                                placeholder="输入你的名字"
                                value={gameState.playerName}
                                onChange={(e) => setGameState(prev => ({ ...prev, playerName: e.target.value }))}
                                className="w-full px-4 py-3 border border-green-400 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 bg-black bg-opacity-50 text-white placeholder-gray-400"
                            />
                            <button
                                onClick={submitScore}
                                disabled={!gameState.playerName.trim()}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                提交分数
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-8 bg-black bg-opacity-50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-green-500">
                    <h3 className="text-2xl font-bold text-white mb-6">📖 游戏说明</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-semibold text-green-300 mb-3 text-lg">🎮 控制方式</h4>
                            <ul className="text-gray-300 space-y-2">
                                <li>• <span className="text-yellow-400">方向键</span> 或 <span className="text-yellow-400">移动端按钮</span>：控制蛇的移动</li>
                                <li>• <span className="text-green-400">吃到食物</span>：增加分数和蛇的长度</li>
                                <li>• <span className="text-red-400">避免碰撞</span>：不要撞到墙壁、障碍物或自己的身体</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-green-300 mb-3 text-lg">🎯 游戏模式</h4>
                            <ul className="text-gray-300 space-y-2">
                                <li>• <span className="text-green-400">经典模式</span>：传统贪吃蛇玩法</li>
                                <li>• <span className="text-red-400">障碍模式</span>：地图中有固定障碍物</li>
                                <li>• <span className="text-blue-400">极速模式</span>：更快的移动速度</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-green-300 mb-3 text-lg">⚡ 特殊食物</h4>
                            <ul className="text-gray-300 space-y-2">
                                <li>• <span className="text-blue-400">蓝色食物</span>：临时加速效果</li>
                                <li>• <span className="text-yellow-400">黄色食物</span>：双倍分数效果</li>
                                <li>• <span className="text-purple-400">紫色食物</span>：护盾保护效果</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-green-300 mb-3 text-lg">🏆 升级系统</h4>
                            <ul className="text-gray-300 space-y-2">
                                <li>• <span className="text-blue-400">等级提升</span>：每50分升一级</li>
                                <li>• <span className="text-purple-400">速度增加</span>：等级越高移动越快</li>
                                <li>• <span className="text-yellow-400">难度递增</span>：障碍模式障碍物增多</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 