'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// 游戏常量
const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const CELL_SIZE = 25

// 俄罗斯方块形状定义
const TETRIS_SHAPES = [
    // I形状
    {
        shape: [
            [1, 1, 1, 1]
        ],
        color: '#00f5ff'
    },
    // O形状
    {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#ffff00'
    },
    // T形状
    {
        shape: [
            [0, 1, 0],
            [1, 1, 1]
        ],
        color: '#a000f0'
    },
    // S形状
    {
        shape: [
            [0, 1, 1],
            [1, 1, 0]
        ],
        color: '#00f000'
    },
    // Z形状
    {
        shape: [
            [1, 1, 0],
            [0, 1, 1]
        ],
        color: '#f00000'
    },
    // J形状
    {
        shape: [
            [1, 0, 0],
            [1, 1, 1]
        ],
        color: '#0000f0'
    },
    // L形状
    {
        shape: [
            [0, 0, 1],
            [1, 1, 1]
        ],
        color: '#ff7f00'
    }
]

interface Position {
    x: number
    y: number
}

interface TetrisPiece {
    shape: number[][]
    color: string
    position: Position
}

export default function TetrisGame() {
    // 游戏状态
    const [board, setBoard] = useState<(number | string)[][]>([])
    const [currentPiece, setCurrentPiece] = useState<TetrisPiece | null>(null)
    const [nextPiece, setNextPiece] = useState<TetrisPiece | null>(null)
    const [score, setScore] = useState(0)
    const [lines, setLines] = useState(0)
    const [level, setLevel] = useState(1)
    const [gameOver, setGameOver] = useState(false)
    const [gameStarted, setGameStarted] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [showScoreSubmission, setShowScoreSubmission] = useState(false)
    const [playerName, setPlayerName] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 得分动画相关状态
    const [scoreAnimations, setScoreAnimations] = useState<Array<{
        id: number
        points: number
        x: number
        y: number
        timestamp: number
    }>>([])

    // 触摸控制相关
    const [touchStart, setTouchStart] = useState<Position | null>(null)
    const [isMobile, setIsMobile] = useState(false)
    const [gameSize, setGameSize] = useState({ width: 250, height: 500 })

    const gameLoopRef = useRef<NodeJS.Timeout>()
    const dropTimeRef = useRef<number>(0)

    // 初始化游戏板
    const initializeBoard = useCallback(() => {
        const newBoard = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
        setBoard(newBoard)
    }, [])

    // 生成随机方块
    const generateRandomPiece = useCallback((): TetrisPiece => {
        const randomShape = TETRIS_SHAPES[Math.floor(Math.random() * TETRIS_SHAPES.length)]
        return {
            shape: randomShape.shape,
            color: randomShape.color,
            position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(randomShape.shape[0].length / 2), y: 0 }
        }
    }, [])

    // 检查位置是否有效
    const isValidPosition = useCallback((piece: TetrisPiece, newPosition: Position, newShape?: number[][]) => {
        const shape = newShape || piece.shape
        const { x, y } = newPosition

        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col
                    const newY = y + row

                    // 检查边界
                    if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
                        return false
                    }

                    // 检查是否与已放置的方块碰撞
                    if (newY >= 0 && board[newY][newX] !== 0) {
                        return false
                    }
                }
            }
        }
        return true
    }, [board])

    // 旋转方块
    const rotatePiece = useCallback((piece: TetrisPiece) => {
        const rotated = piece.shape[0].map((_, index) =>
            piece.shape.map(row => row[index]).reverse()
        )
        return { ...piece, shape: rotated }
    }, [])

    // 移动方块
    const movePiece = useCallback((direction: 'left' | 'right' | 'down') => {
        if (!currentPiece || gameOver || isPaused) return

        let newPosition = { ...currentPiece.position }
        switch (direction) {
            case 'left':
                newPosition.x -= 1
                break
            case 'right':
                newPosition.x += 1
                break
            case 'down':
                newPosition.y += 1
                break
        }

        if (isValidPosition(currentPiece, newPosition)) {
            setCurrentPiece({ ...currentPiece, position: newPosition })
        } else if (direction === 'down') {
            // 方块无法继续下降，放置到游戏板上
            placePiece()
        }
    }, [currentPiece, gameOver, isPaused, isValidPosition])

    // 放置方块到游戏板
    const placePiece = useCallback(() => {
        if (!currentPiece) return

        const newBoard = board.map(row => [...row])

        // 将当前方块放置到游戏板上
        for (let row = 0; row < currentPiece.shape.length; row++) {
            for (let col = 0; col < currentPiece.shape[row].length; col++) {
                if (currentPiece.shape[row][col]) {
                    const x = currentPiece.position.x + col
                    const y = currentPiece.position.y + row
                    if (y >= 0) {
                        newBoard[y][x] = currentPiece.color // 存储颜色信息
                    }
                }
            }
        }

        setBoard(newBoard)

        // 检查并清除完整的行
        clearLines(newBoard)

        // 生成新方块
        const newPiece = nextPiece ? {
            ...nextPiece,
            position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(nextPiece.shape[0].length / 2), y: 0 }
        } : generateRandomPiece()
        const newNextPiece = generateRandomPiece()
        setCurrentPiece(newPiece)
        setNextPiece(newNextPiece)

        // 检查游戏是否结束
        if (!isValidPosition(newPiece, newPiece.position)) {
            setGameOver(true)
        }
    }, [currentPiece, board, generateRandomPiece, isValidPosition])

    // 清除完整的行
    const clearLines = useCallback((gameBoard: (number | string)[][]) => {
        let linesCleared = 0
        const newBoard = gameBoard.filter(row => {
            const isFull = row.every(cell => cell !== 0)
            if (isFull) {
                linesCleared++
                return false
            }
            return true
        })

        // 在顶部添加新的空行
        while (newBoard.length < BOARD_HEIGHT) {
            newBoard.unshift(Array(BOARD_WIDTH).fill(0))
        }

        if (linesCleared > 0) {
            setBoard(newBoard)
            setLines(prev => prev + linesCleared)

            // 计算得分 - 同时消除多行获得更高分数
            let pointsEarned = 0
            switch (linesCleared) {
                case 1:
                    pointsEarned = 100 * level // 单行：100分 × 等级
                    break
                case 2:
                    pointsEarned = 300 * level // 双行：300分 × 等级 (比简单相加250分更高)
                    break
                case 3:
                    pointsEarned = 500 * level // 三行：500分 × 等级 (比简单相加400分更高)
                    break
                case 4:
                    pointsEarned = 800 * level // 四行：800分 × 等级 (比简单相加600分更高)
                    break
                default:
                    pointsEarned = linesCleared * 100 * level // 备用计算
            }

            setScore(prev => prev + pointsEarned)
            setLevel(prev => Math.floor((lines + linesCleared) / 10) + 1)

            // 添加得分动画
            const animationId = Date.now()
            setScoreAnimations(prev => [...prev, {
                id: animationId,
                points: pointsEarned,
                x: BOARD_WIDTH / 2,
                y: BOARD_HEIGHT / 2,
                timestamp: Date.now()
            }])

            // 3秒后移除动画
            setTimeout(() => {
                setScoreAnimations(prev => prev.filter(anim => anim.id !== animationId))
            }, 3000)
        }
    }, [lines, level])

    // 快速下降
    const dropPiece = useCallback(() => {
        if (!currentPiece || gameOver || isPaused) return

        let newPosition = { ...currentPiece.position }
        while (isValidPosition(currentPiece, { ...newPosition, y: newPosition.y + 1 })) {
            newPosition.y += 1
        }

        if (newPosition.y !== currentPiece.position.y) {
            setCurrentPiece({ ...currentPiece, position: newPosition })
            setScore(prev => prev + 1) // 快速下降奖励分数
        }
    }, [currentPiece, gameOver, isPaused, isValidPosition])

    // 开始游戏
    const startGame = useCallback(() => {
        initializeBoard()
        const firstPiece = generateRandomPiece()
        const secondPiece = generateRandomPiece()
        setCurrentPiece(firstPiece)
        setNextPiece(secondPiece)
        setScore(0)
        setLines(0)
        setLevel(1)
        setGameOver(false)
        setGameStarted(true)
        setIsPaused(false)
        setShowScoreSubmission(false)
        setPlayerName('')
        dropTimeRef.current = Date.now()
    }, [initializeBoard, generateRandomPiece])

    // 暂停/继续游戏
    const togglePause = useCallback(() => {
        if (gameStarted && !gameOver) {
            setIsPaused(prev => !prev)
        }
    }, [gameStarted, gameOver])

    // 提交分数
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
                    gameType: 'tetris'
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

    // 检测设备类型和计算游戏区域大小
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768 || 'ontouchstart' in window
            setIsMobile(mobile)

            // 计算游戏区域大小
            const maxWidth = Math.min(window.innerWidth - 40, 300)
            const maxHeight = Math.min(window.innerHeight - 200, 600)
            setGameSize({
                width: maxWidth,
                height: Math.min(maxHeight, maxWidth * 2)
            })
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // 触摸控制处理
    const handleTouchStart = (e: React.TouchEvent) => {
        if (!gameStarted || gameOver || isPaused) return
        e.preventDefault()
        const touch = e.touches[0]
        setTouchStart({ x: touch.clientX, y: touch.clientY })
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!gameStarted || gameOver || isPaused || !touchStart) return
        e.preventDefault()
        const touch = e.changedTouches[0]
        const deltaX = touch.clientX - touchStart.x
        const deltaY = touch.clientY - touchStart.y
        const minSwipeDistance = 30

        if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑动
                if (deltaX > 0) {
                    movePiece('right')
                } else {
                    movePiece('left')
                }
            } else {
                // 垂直滑动
                if (deltaY > 0) {
                    movePiece('down')
                } else {
                    // 向上滑动 - 旋转
                    if (currentPiece) {
                        const rotated = rotatePiece(currentPiece)
                        if (isValidPosition(rotated, rotated.position, rotated.shape)) {
                            setCurrentPiece(rotated)
                        }
                    }
                }
            }
        }

        setTouchStart(null)
    }

    // 键盘控制
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!gameStarted || gameOver || isPaused) return

            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                    movePiece('left')
                    break
                case 'ArrowRight':
                case 'd':
                    movePiece('right')
                    break
                case 'ArrowDown':
                case 's':
                    movePiece('down')
                    break
                case 'ArrowUp':
                case 'w':
                    if (currentPiece) {
                        const rotated = rotatePiece(currentPiece)
                        if (isValidPosition(rotated, rotated.position, rotated.shape)) {
                            setCurrentPiece(rotated)
                        }
                    }
                    break
                case ' ':
                    e.preventDefault()
                    dropPiece()
                    break
                case 'p':
                    togglePause()
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameStarted, gameOver, isPaused, movePiece, currentPiece, rotatePiece, isValidPosition, dropPiece, togglePause])

    // 游戏循环
    useEffect(() => {
        if (gameStarted && !gameOver && !isPaused) {
            const gameSpeed = Math.max(1000 - (level - 1) * 100, 100)

            const gameLoop = () => {
                const now = Date.now()
                if (now - dropTimeRef.current > gameSpeed) {
                    movePiece('down')
                    dropTimeRef.current = now
                }
            }

            gameLoopRef.current = setInterval(gameLoop, 50)
        }

        return () => {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current)
            }
        }
    }, [gameStarted, gameOver, isPaused, level, movePiece])

    // 渲染游戏板
    const renderBoard = () => {
        const cellSize = Math.min(gameSize.width / BOARD_WIDTH, gameSize.height / BOARD_HEIGHT)

        return (
            <div
                className="bg-gray-800 border-2 border-gray-600 relative"
                style={{
                    width: gameSize.width,
                    height: gameSize.height
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* 渲染已放置的方块 */}
                {board.map((row, y) =>
                    row.map((cell, x) => (
                        cell !== 0 && (
                            <div
                                key={`${y}-${x}`}
                                className="absolute border border-gray-300"
                                style={{
                                    width: cellSize,
                                    height: cellSize,
                                    left: x * cellSize,
                                    top: y * cellSize,
                                    backgroundColor: cell as string
                                }}
                            />
                        )
                    ))
                )}

                {/* 渲染当前下落的方块 */}
                {currentPiece && board.map((row, y) =>
                    row.map((cell, x) => {
                        const pieceX = x - currentPiece.position.x
                        const pieceY = y - currentPiece.position.y

                        if (
                            pieceX >= 0 && pieceX < currentPiece.shape[0].length &&
                            pieceY >= 0 && pieceY < currentPiece.shape.length &&
                            currentPiece.shape[pieceY][pieceX]
                        ) {
                            return (
                                <div
                                    key={`current-${y}-${x}`}
                                    className="absolute border border-gray-300"
                                    style={{
                                        width: cellSize,
                                        height: cellSize,
                                        left: x * cellSize,
                                        top: y * cellSize,
                                        backgroundColor: currentPiece.color
                                    }}
                                />
                            )
                        }
                        return null
                    })
                )}

                {/* 得分动画 */}
                {scoreAnimations.map(animation => {
                    const cellSize = Math.min(gameSize.width / BOARD_WIDTH, gameSize.height / BOARD_HEIGHT)
                    return (
                        <div
                            key={animation.id}
                            className="absolute pointer-events-none text-yellow-400 font-bold text-lg animate-pulse"
                            style={{
                                left: animation.x * cellSize,
                                top: animation.y * cellSize,
                                transform: 'translate(-50%, -50%)',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                zIndex: 10
                            }}
                        >
                            +{animation.points}
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-2 sm:p-4">
            <div className="text-center mb-4 sm:mb-8">
                <h1 className="text-2xl sm:text-4xl font-bold text-blue-400 mb-2 sm:mb-4">俄罗斯方块</h1>
                <p className="text-sm sm:text-base text-gray-400 mb-2 sm:mb-4">
                    {isMobile ? '滑动屏幕控制，向上滑动旋转' : '使用方向键控制，空格键快速下降，P键暂停'}
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base">
                    <div className="text-white">得分: {score}</div>
                    <div className="text-blue-300">等级: {level}</div>
                    <div className="text-green-300">行数: {lines}</div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                    单行: 100分 | 双行: 300分 | 三行: 500分 | 四行: 800分 (×等级)
                </div>
            </div>

            {!gameStarted ? (
                <button
                    onClick={startGame}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white text-lg sm:text-xl font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                    开始游戏
                </button>
            ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* 游戏区域 */}
                    <div className="relative">
                        {renderBoard()}

                        {/* 暂停遮罩 */}
                        {isPaused && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <h2 className="text-2xl font-bold mb-4">游戏暂停</h2>
                                    <p className="text-sm">按 P 键继续</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 右侧信息面板 */}
                    <div className="flex flex-col gap-4">
                        {/* 下一个方块预览 */}
                        {nextPiece && (
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <h3 className="text-white text-sm mb-2">下一个</h3>
                                <div className="flex justify-center">
                                    <div className="relative bg-gray-700 border border-gray-600" style={{
                                        width: nextPiece.shape[0].length * 15 + 2,
                                        height: nextPiece.shape.length * 15 + 2
                                    }}>
                                        {nextPiece.shape.map((row, y) =>
                                            row.map((cell, x) => {
                                                if (cell) {
                                                    return (
                                                        <div
                                                            key={`next-${y}-${x}`}
                                                            className="absolute border border-gray-300"
                                                            style={{
                                                                backgroundColor: nextPiece.color,
                                                                width: 13,
                                                                height: 13,
                                                                left: x * 15 + 1,
                                                                top: y * 15 + 1
                                                            }}
                                                        />
                                                    )
                                                }
                                                return null
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 控制按钮（手机端） */}
                        {isMobile && (
                            <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-2">
                                    <div></div>
                                    <button
                                        onClick={() => currentPiece && setCurrentPiece(rotatePiece(currentPiece))}
                                        className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center text-lg font-bold hover:bg-gray-600 transition-colors"
                                    >
                                        ↻
                                    </button>
                                    <div></div>

                                    <button
                                        onClick={() => movePiece('left')}
                                        className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center text-lg font-bold hover:bg-gray-600 transition-colors"
                                    >
                                        ←
                                    </button>
                                    <button
                                        onClick={dropPiece}
                                        className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center text-lg font-bold hover:bg-gray-600 transition-colors"
                                    >
                                        ↓
                                    </button>
                                    <button
                                        onClick={() => movePiece('right')}
                                        className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center text-lg font-bold hover:bg-gray-600 transition-colors"
                                    >
                                        →
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={togglePause}
                                        className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                                    >
                                        {isPaused ? '继续' : '暂停'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 游戏结束弹窗 */}
            {gameOver && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="text-center bg-gray-800 rounded-lg p-6 max-w-sm w-full">
                        <h2 className="text-2xl sm:text-3xl font-bold text-red-400 mb-4">游戏结束!</h2>
                        <p className="text-white mb-2">最终得分: {score}</p>
                        <p className="text-white mb-4">清除行数: {lines}</p>

                        {!showScoreSubmission ? (
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowScoreSubmission(true)}
                                    className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    🏆 提交分数
                                </button>
                                <button
                                    onClick={startGame}
                                    className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
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
                                        className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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
    )
}
