'use client'

import { useState, useEffect, useCallback } from 'react'

interface Position {
    x: number
    y: number
}

export default function Game() {
    const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
    const [food, setFood] = useState<Position>({ x: 15, y: 15 })
    const [direction, setDirection] = useState<string>('RIGHT')
    const [gameOver, setGameOver] = useState<boolean>(false)
    const [score, setScore] = useState<number>(0)
    const [gameStarted, setGameStarted] = useState<boolean>(false)
    const [playerName, setPlayerName] = useState<string>('')
    const [showSubmitForm, setShowSubmitForm] = useState<boolean>(false)

    const gridSize = 20
    const cellSize = 20

    // 生成随机食物位置
    const generateFood = useCallback(() => {
        const newFood = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        }
        setFood(newFood)
    }, [])

    // 检查碰撞
    const checkCollision = useCallback((head: Position) => {
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
            return true
        }
        // 检查自身碰撞
        return snake.some(segment => segment.x === head.x && segment.y === head.y)
    }, [snake])

    // 移动蛇
    const moveSnake = useCallback(() => {
        if (gameOver || !gameStarted) return

        const newSnake = [...snake]
        const head = { ...newSnake[0] }

        switch (direction) {
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
            setGameOver(true)
            setShowSubmitForm(true)
            return
        }

        newSnake.unshift(head)

        // 检查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
            setScore(score + 10)
            generateFood()
        } else {
            newSnake.pop()
        }

        setSnake(newSnake)
    }, [snake, direction, food, gameOver, gameStarted, score, checkCollision, generateFood])

    // 键盘和按钮方向控制
    const handleDirection = (dir: string) => {
        if (!gameStarted) return
        if (dir === 'UP' && direction !== 'DOWN') setDirection('UP')
        if (dir === 'DOWN' && direction !== 'UP') setDirection('DOWN')
        if (dir === 'LEFT' && direction !== 'RIGHT') setDirection('LEFT')
        if (dir === 'RIGHT' && direction !== 'LEFT') setDirection('RIGHT')
    }

    // 键盘控制
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!gameStarted) return
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
    }, [direction, gameStarted])

    // 游戏循环
    useEffect(() => {
        if (!gameStarted || gameOver) return

        const gameLoop = setInterval(moveSnake, 150)
        return () => clearInterval(gameLoop)
    }, [moveSnake, gameStarted, gameOver])

    // 提交分数
    const submitScore = async () => {
        if (!playerName.trim()) return

        try {
            const response = await fetch('/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerName: playerName.trim(),
                    score: score
                }),
            })

            if (response.ok) {
                alert('分数提交成功！')
                setShowSubmitForm(false)
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
        setSnake([{ x: 10, y: 10 }])
        setFood({ x: 15, y: 15 })
        setDirection('RIGHT')
        setGameOver(false)
        setScore(0)
        setGameStarted(false)
        setPlayerName('')
        setShowSubmitForm(false)
        generateFood()
    }

    // 开始游戏
    const startGame = () => {
        setGameStarted(true)
        generateFood()
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">贪吃蛇游戏</h1>
                    <div className="flex justify-center items-center space-x-8 mb-4">
                        <div className="text-xl">
                            <span className="font-semibold">分数: </span>
                            <span className="text-blue-600">{score}</span>
                        </div>
                        <div className="text-xl">
                            <span className="font-semibold">长度: </span>
                            <span className="text-green-600">{snake.length}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center mb-8">
                    <div
                        className="bg-white border-2 border-gray-300 relative"
                        style={{ width: gridSize * cellSize, height: gridSize * cellSize }}
                    >
                        {/* 蛇身 */}
                        {snake.map((segment, index) => (
                            <div
                                key={index}
                                className={`absolute ${index === 0 ? 'bg-green-600' : 'bg-green-400'}`}
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
                            className="absolute bg-red-500 rounded-full"
                            style={{
                                left: food.x * cellSize,
                                top: food.y * cellSize,
                                width: cellSize,
                                height: cellSize,
                            }}
                        />
                    </div>
                </div>
                {/* 移动端方向按钮 */}
                <div className="flex flex-col items-center mt-4 space-y-2 sm:hidden">
                    <button
                        className="w-16 h-16 bg-blue-500 text-white rounded-full text-2xl active:bg-blue-700"
                        onClick={() => handleDirection('UP')}
                    >↑</button>
                    <div className="flex space-x-8">
                        <button
                            className="w-16 h-16 bg-blue-500 text-white rounded-full text-2xl active:bg-blue-700"
                            onClick={() => handleDirection('LEFT')}
                        >←</button>
                        <button
                            className="w-16 h-16 bg-blue-500 text-white rounded-full text-2xl active:bg-blue-700"
                            onClick={() => handleDirection('RIGHT')}
                        >→</button>
                    </div>
                    <button
                        className="w-16 h-16 bg-blue-500 text-white rounded-full text-2xl active:bg-blue-700"
                        onClick={() => handleDirection('DOWN')}
                    >↓</button>
                </div>

                <div className="text-center">
                    {!gameStarted && !gameOver && (
                        <button
                            onClick={startGame}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors"
                        >
                            开始游戏
                        </button>
                    )}

                    {gameOver && (
                        <div className="space-y-4">
                            <div className="text-2xl font-bold text-red-600">
                                游戏结束！最终分数: {score}
                            </div>
                            <button
                                onClick={resetGame}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors mr-4"
                            >
                                重新开始
                            </button>
                        </div>
                    )}

                    {showSubmitForm && (
                        <div className="mt-4 p-4 bg-white rounded-lg shadow-lg max-w-md mx-auto">
                            <h3 className="text-lg font-semibold mb-4">提交你的分数</h3>
                            <input
                                type="text"
                                placeholder="输入你的名字"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={submitScore}
                                disabled={!playerName.trim()}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                提交分数
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center text-gray-600">
                    <h3 className="text-lg font-semibold mb-2">游戏说明</h3>
                    <p>使用方向键控制蛇的移动方向</p>
                    <p>吃到红色食物可以增加分数和蛇的长度</p>
                    <p>避免撞到墙壁或自己的身体</p>
                </div>
            </div>
        </div>
    )
} 