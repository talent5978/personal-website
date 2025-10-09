'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'

interface DrawingData {
    x: number
    y: number
    color: string
    size: number
    type: 'draw' | 'erase'
}

interface DrawingWallProps {
    className?: string
}

export default function DrawingWall({ className = '' }: DrawingWallProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [currentColor, setCurrentColor] = useState('#000000')
    const [brushSize, setBrushSize] = useState(5)
    const [isErasing, setIsErasing] = useState(false)
    const [onlineUsers, setOnlineUsers] = useState(1)
    const [drawingHistory, setDrawingHistory] = useState<DrawingData[]>([])
    const [isMobile, setIsMobile] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // 检查是否为移动设备
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // 获取画布和上下文
    const getCanvasContext = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return null
        return canvas.getContext('2d')
    }, [])

    // 重新绘制画布
    const redrawCanvas = useCallback(() => {
        const ctx = getCanvasContext()
        if (!ctx) return

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        drawingHistory.forEach((drawing) => {
            ctx.globalCompositeOperation = drawing.type === 'erase' ? 'destination-out' : 'source-over'
            ctx.strokeStyle = drawing.color
            ctx.lineWidth = drawing.size
            ctx.beginPath()
            ctx.moveTo(drawing.x, drawing.y)
            ctx.lineTo(drawing.x, drawing.y)
            ctx.stroke()
        })
    }, [drawingHistory, getCanvasContext])

    // 设置画布大小 - 增大画布尺寸
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const resizeCanvas = () => {
            const container = canvas.parentElement
            if (!container) return

            // 增大画布尺寸
            const maxWidth = Math.min(window.innerWidth - 100, 800) // 最大800px
            const maxHeight = Math.min(window.innerHeight - 200, 600) // 最大600px
            const size = Math.min(maxWidth, maxHeight)

            // 移动端使用更大的尺寸
            const finalSize = isMobile ? Math.min(size, 400) : Math.min(size, 600)

            canvas.width = finalSize
            canvas.height = finalSize

            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.lineCap = 'round'
                ctx.lineJoin = 'round'
                // 重新绘制历史记录
                redrawCanvas()
            }
        }

        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)
        return () => window.removeEventListener('resize', resizeCanvas)
    }, [isMobile, redrawCanvas])

    // 加载涂鸦数据
    const loadDrawings = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/drawing')
            const result = await response.json()

            if (result.success) {
                const drawings = result.data.map((d: any) => ({
                    x: d.x,
                    y: d.y,
                    color: d.color,
                    size: d.size,
                    type: d.type
                }))
                setDrawingHistory(drawings)
            }
        } catch (error) {
            console.error('加载涂鸦数据失败:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // 保存涂鸦数据
    const saveDrawing = useCallback(async (drawing: DrawingData) => {
        try {
            await fetch('/api/drawing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(drawing),
            })
        } catch (error) {
            console.error('保存涂鸦数据失败:', error)
        }
    }, [])

    // 清空涂鸦数据
    const clearAllDrawings = useCallback(async () => {
        try {
            const response = await fetch('/api/drawing', {
                method: 'DELETE',
            })
            const result = await response.json()

            if (result.success) {
                setDrawingHistory([])
                const ctx = getCanvasContext()
                if (ctx) {
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
                }
            }
        } catch (error) {
            console.error('清空涂鸦数据失败:', error)
        }
    }, [getCanvasContext])

    // 初始加载涂鸦数据
    useEffect(() => {
        loadDrawings()
    }, [loadDrawings])

    // 当涂鸦历史数据更新时，重新绘制画布
    useEffect(() => {
        if (drawingHistory.length > 0) {
            // 延迟一点时间确保画布已经初始化
            setTimeout(() => {
                redrawCanvas()
            }, 100)
        }
    }, [drawingHistory, redrawCanvas])

    // 开始绘画
    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault()
        setIsDrawing(true)

        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

        const x = clientX - rect.left
        const y = clientY - rect.top

        const ctx = getCanvasContext()
        if (!ctx) return

        ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over'
        ctx.strokeStyle = isErasing ? '#ffffff' : currentColor
        ctx.lineWidth = brushSize
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x, y)
        ctx.stroke()

        // 添加到历史记录
        const newDrawing: DrawingData = {
            x,
            y,
            color: isErasing ? '#ffffff' : currentColor,
            size: brushSize,
            type: isErasing ? 'erase' : 'draw'
        }
        setDrawingHistory(prev => [...prev, newDrawing])
        saveDrawing(newDrawing)
    }, [currentColor, brushSize, isErasing, getCanvasContext, saveDrawing])

    // 绘画中
    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return
        e.preventDefault()

        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

        const x = clientX - rect.left
        const y = clientY - rect.top

        const ctx = getCanvasContext()
        if (!ctx) return

        ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over'
        ctx.strokeStyle = isErasing ? '#ffffff' : currentColor
        ctx.lineWidth = brushSize
        ctx.lineTo(x, y)
        ctx.stroke()

        // 添加到历史记录
        const newDrawing: DrawingData = {
            x,
            y,
            color: isErasing ? '#ffffff' : currentColor,
            size: brushSize,
            type: isErasing ? 'erase' : 'draw'
        }
        setDrawingHistory(prev => [...prev, newDrawing])
        saveDrawing(newDrawing)
    }, [isDrawing, currentColor, brushSize, isErasing, getCanvasContext, saveDrawing])

    // 停止绘画
    const stopDrawing = useCallback(() => {
        setIsDrawing(false)
    }, [])

    // 清空画布
    const clearCanvas = useCallback(() => {
        const confirmed = window.confirm(
            '⚠️ 警告：此操作将清空所有人的涂鸦！\n\n' +
            '所有用户的作品都将被永久删除，无法恢复！\n\n' +
            '确定要继续吗？'
        )

        if (confirmed) {
            clearAllDrawings()
        }
    }, [clearAllDrawings])

    // 颜色选择
    const colors = [
        '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
        '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'
    ]

    return (
        <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
            {/* 标题和在线用户 */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">🎨 公共涂鸦墙</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{onlineUsers} 人在线</span>
                </div>
            </div>

            {/* 工具栏 */}
            <div className="flex flex-wrap gap-2 mb-4">
                {/* 颜色选择 */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">颜色:</span>
                    <div className="flex gap-1">
                        {colors.map((color) => (
                            <button
                                key={color}
                                className={`w-6 h-6 rounded border-2 ${currentColor === color ? 'border-gray-800' : 'border-gray-300'
                                    }`}
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                    setCurrentColor(color)
                                    setIsErasing(false)
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* 笔刷大小 */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">大小:</span>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-20"
                    />
                    <span className="text-sm text-gray-600">{brushSize}px</span>
                </div>

                {/* 工具按钮 */}
                <div className="flex gap-2">
                    <button
                        className={`px-3 py-1 rounded text-sm ${!isErasing
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                            }`}
                        onClick={() => setIsErasing(false)}
                    >
                        🖌️ 画笔
                    </button>
                    <button
                        className={`px-3 py-1 rounded text-sm ${isErasing
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                            }`}
                        onClick={() => setIsErasing(true)}
                    >
                        🧽 橡皮擦
                    </button>
                    <button
                        className="px-3 py-1 rounded text-sm bg-red-500 hover:bg-red-600 text-white font-semibold"
                        onClick={clearCanvas}
                        title="⚠️ 警告：会清空所有人的涂鸦！"
                    >
                        🗑️ 清空所有
                    </button>
                </div>
            </div>

            {/* 画布容器 */}
            <div className="flex justify-center">
                <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden shadow-2xl">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                            <div className="text-gray-600">加载涂鸦中...</div>
                        </div>
                    )}
                    <canvas
                        ref={canvasRef}
                        className="cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        style={{ touchAction: 'none' }}
                    />
                </div>
            </div>

            {/* 使用说明 */}
            <div className="mt-4 text-center text-sm text-gray-600">
                <p>💡 提示：在画布上绘画，所有用户都能看到你的作品！</p>
                {isMobile && (
                    <p className="mt-1">📱 移动端：用手指在画布上绘画</p>
                )}
            </div>
        </div>
    )
}