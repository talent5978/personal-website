'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/components/LanguageProvider'

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION = { x: 1, y: 0 }

// 触摸控制相关
interface TouchPosition {
    x: number
    y: number
}

export default function SnakeGame() {
    const { t } = useLanguage()
    const [snake, setSnake] = useState(INITIAL_SNAKE)
    const [direction, setDirection] = useState(INITIAL_DIRECTION)
    const [food, setFood] = useState({ x: 15, y: 15 })
    const [gameOver, setGameOver] = useState(false)
    const [score, setScore] = useState(0)
    const [gameStarted, setGameStarted] = useState(false)
    const [showScoreSubmission, setShowScoreSubmission] = useState(false)
    const [playerName, setPlayerName] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [gameTime, setGameTime] = useState(0)
    const [level, setLevel] = useState(1)
    const gameLoopRef = useRef<NodeJS.Timeout>()
    const startTimeRef = useRef<number>(0)

    // 触摸控制相关状态
    const [touchStart, setTouchStart] = useState<TouchPosition | null>(null)
    const [touchEnd, setTouchEnd] = useState<TouchPosition | null>(null)
    const [isMobile, setIsMobile] = useState(false)
    const [gameSize, setGameSize] = useState(400)

    // 计算难度等级
    const calculateLevel = (time: number) => {
        return Math.floor(time / 10) + 1 // 每10秒增加一级
    }

    // 获取当前难度参数
    const getDifficultyParams = () => {
        const baseSpeed = 120 // 基础速度更快（毫秒）
        const speedDecrease = (level - 1) * 15 // 每级减少15ms
        const gameSpeed = Math.max(baseSpeed - speedDecrease, 30) // 最快30ms

        return { gameSpeed }
    }

    // 生成随机食物位置
    const generateFood = () => {
        const x = Math.floor(Math.random() * GRID_SIZE)
        const y = Math.floor(Math.random() * GRID_SIZE)
        setFood({ x, y })
    }

    // 检查碰撞
    const checkCollision = (head: { x: number; y: number }) => {
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            return true
        }
        // 检查自身碰撞
        return snake.some(segment => segment.x === head.x && segment.y === head.y)
    }

    // 游戏主循环
    const gameLoop = useCallback(() => {
        if (gameOver) return

        // 更新游戏时间和等级
        const currentTime = Date.now()
        const elapsedTime = (currentTime - startTimeRef.current) / 1000
        setGameTime(elapsedTime)
        const newLevel = calculateLevel(elapsedTime)
        if (newLevel !== level) {
            setLevel(newLevel)
        }

        setSnake(prevSnake => {
            const newSnake = [...prevSnake]
            const head = { ...newSnake[0] }

            // 移动蛇头
            head.x += direction.x
            head.y += direction.y

            // 检查碰撞
            if (checkCollision(head)) {
                setGameOver(true)
                return prevSnake
            }

            newSnake.unshift(head)

            // 检查是否吃到食物
            if (head.x === food.x && head.y === food.y) {
                setScore(prev => prev + 10)
                generateFood()
            } else {
                newSnake.pop()
            }

            return newSnake
        })
    }, [gameOver, direction, food, level, snake])

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
                    gameType: 'snake'
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

    // 开始游戏
    const startGame = () => {
        setSnake(INITIAL_SNAKE)
        setDirection(INITIAL_DIRECTION)
        setFood({ x: 15, y: 15 })
        setGameOver(false)
        setScore(0)
        setGameStarted(true)
        setShowScoreSubmission(false)
        setPlayerName('')
        setGameTime(0)
        setLevel(1)
        startTimeRef.current = Date.now()
    }

    // 检测设备类型和计算游戏区域大小
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768 || 'ontouchstart' in window
            setIsMobile(mobile)

            // 计算游戏区域大小
            const maxSize = Math.min(window.innerWidth - 40, window.innerHeight - 200)
            const size = Math.min(maxSize, 400)
            setGameSize(size)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // 触摸控制处理
    const handleTouchStart = (e: React.TouchEvent) => {
        if (!gameStarted) return
        e.preventDefault()
        const touch = e.touches[0]
        setTouchStart({ x: touch.clientX, y: touch.clientY })
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!gameStarted) return
        e.preventDefault()
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!gameStarted || !touchStart) return
        e.preventDefault()
        const touch = e.changedTouches[0]
        setTouchEnd({ x: touch.clientX, y: touch.clientY })

        // 计算滑动方向和距离
        const deltaX = touch.clientX - touchStart.x
        const deltaY = touch.clientY - touchStart.y
        const minSwipeDistance = 50 // 最小滑动距离

        if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑动
                if (deltaX > 0 && direction.x === 0) {
                    setDirection({ x: 1, y: 0 }) // 右
                } else if (deltaX < 0 && direction.x === 0) {
                    setDirection({ x: -1, y: 0 }) // 左
                }
            } else {
                // 垂直滑动
                if (deltaY > 0 && direction.y === 0) {
                    setDirection({ x: 0, y: 1 }) // 下
                } else if (deltaY < 0 && direction.y === 0) {
                    setDirection({ x: 0, y: -1 }) // 上
                }
            }
        }

        setTouchStart(null)
        setTouchEnd(null)
    }

    // 方向按钮控制
    const handleDirectionClick = (newDirection: { x: number; y: number }) => {
        if (!gameStarted) return
        // 防止反向移动
        if (direction.x === -newDirection.x && direction.y === -newDirection.y) return
        setDirection(newDirection)
    }

    // 键盘控制
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!gameStarted) return

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                    if (direction.y === 0) setDirection({ x: 0, y: -1 })
                    break
                case 'ArrowDown':
                case 's':
                    if (direction.y === 0) setDirection({ x: 0, y: 1 })
                    break
                case 'ArrowLeft':
                case 'a':
                    if (direction.x === 0) setDirection({ x: -1, y: 0 })
                    break
                case 'ArrowRight':
                case 'd':
                    if (direction.x === 0) setDirection({ x: 1, y: 0 })
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [direction, gameStarted])

    // 游戏循环
    useEffect(() => {
        if (gameStarted && !gameOver) {
            const { gameSpeed } = getDifficultyParams()
            gameLoopRef.current = setInterval(gameLoop, gameSpeed)
        }
        return () => {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current)
            }
        }
    }, [gameStarted, gameOver, direction, food, level, gameLoop])

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-2 sm:p-4">
            <div className="text-center mb-4 sm:mb-8">
                <h1 className="text-2xl sm:text-4xl font-bold text-green-400 mb-2 sm:mb-4">贪吃蛇</h1>
                <p className="text-sm sm:text-base text-gray-400 mb-2 sm:mb-4">
                    {isMobile ? '滑动屏幕或使用方向按钮控制' : '使用 WASD 或方向键控制蛇的移动'}
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base">
                    <div className="text-white">得分: {score}</div>
                    <div className="text-green-300">等级: {level}</div>
                    <div className="text-blue-300">时间: {Math.floor(gameTime)}s</div>
                </div>
            </div>

            {!gameStarted ? (
                <button
                    onClick={startGame}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white text-lg sm:text-xl font-bold rounded-lg hover:bg-green-700 transition-colors"
                >
                    开始游戏
                </button>
            ) : (
                <div className="flex flex-col items-center">
                    {/* 游戏区域 */}
                    <div className="relative mb-4">
                        <div
                            className="bg-gray-800 border-2 border-gray-600 touch-none"
                            style={{
                                width: gameSize,
                                height: gameSize
                            }}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            {/* 绘制蛇 */}
                            {snake.map((segment, index) => {
                                const cellSize = gameSize / GRID_SIZE
                                return (
                                    <div
                                        key={index}
                                        className={`absolute ${index === 0 ? 'bg-green-400' : 'bg-green-600'}`}
                                        style={{
                                            width: cellSize - 2,
                                            height: cellSize - 2,
                                            left: segment.x * cellSize + 1,
                                            top: segment.y * cellSize + 1
                                        }}
                                    />
                                )
                            })}

                            {/* 绘制食物 */}
                            {(() => {
                                const cellSize = gameSize / GRID_SIZE
                                return (
                                    <div
                                        className="absolute bg-red-500 rounded-full"
                                        style={{
                                            width: cellSize - 2,
                                            height: cellSize - 2,
                                            left: food.x * cellSize + 1,
                                            top: food.y * cellSize + 1
                                        }}
                                    />
                                )
                            })()}
                        </div>
                    </div>

                    {/* 手机端方向控制按钮 */}
                    {isMobile && (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <div></div>
                            <button
                                onClick={() => handleDirectionClick({ x: 0, y: -1 })}
                                className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center text-xl font-bold hover:bg-gray-600 transition-colors"
                            >
                                ↑
                            </button>
                            <div></div>

                            <button
                                onClick={() => handleDirectionClick({ x: -1, y: 0 })}
                                className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center text-xl font-bold hover:bg-gray-600 transition-colors"
                            >
                                ←
                            </button>
                            <div className="w-12 h-12 flex items-center justify-center">
                                <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                            </div>
                            <button
                                onClick={() => handleDirectionClick({ x: 1, y: 0 })}
                                className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center text-xl font-bold hover:bg-gray-600 transition-colors"
                            >
                                →
                            </button>

                            <div></div>
                            <button
                                onClick={() => handleDirectionClick({ x: 0, y: 1 })}
                                className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center text-xl font-bold hover:bg-gray-600 transition-colors"
                            >
                                ↓
                            </button>
                            <div></div>
                        </div>
                    )}

                    {gameOver && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="text-center bg-gray-800 rounded-lg p-6 max-w-sm w-full">
                                <h2 className="text-2xl sm:text-3xl font-bold text-red-400 mb-4">游戏结束!</h2>
                                <p className="text-white mb-4">最终得分: {score}</p>

                                {!showScoreSubmission ? (
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setShowScoreSubmission(true)}
                                            className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            🏆 提交分数
                                        </button>
                                        <button
                                            onClick={startGame}
                                            className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
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
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                                                maxLength={20}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <button
                                                onClick={submitScore}
                                                disabled={isSubmitting}
                                                className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                            >
                                                {isSubmitting ? '提交中...' : '提交分数'}
                                            </button>
                                            <button
                                                onClick={() => setShowScoreSubmission(false)}
                                                className="w-full px-4 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
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