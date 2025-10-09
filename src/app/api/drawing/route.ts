import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 获取涂鸦数据
export async function GET() {
    try {
        const drawings = await prisma.drawing.findMany({
            orderBy: { createdAt: 'asc' }
        })

        return NextResponse.json({ success: true, data: drawings })
    } catch (error) {
        console.error('获取涂鸦数据失败:', error)
        return NextResponse.json(
            { success: false, error: '获取涂鸦数据失败' },
            { status: 500 }
        )
    }
}

// 保存涂鸦数据
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { x, y, color, size, type } = body

        if (!x || !y || !color || !size || !type) {
            return NextResponse.json(
                { success: false, error: '缺少必要参数' },
                { status: 400 }
            )
        }

        const drawing = await prisma.drawing.create({
            data: {
                x,
                y,
                color,
                size,
                type,
                ip: request.ip || 'unknown'
            }
        })

        return NextResponse.json({ success: true, data: drawing })
    } catch (error) {
        console.error('保存涂鸦数据失败:', error)
        return NextResponse.json(
            { success: false, error: '保存涂鸦数据失败' },
            { status: 500 }
        )
    }
}

// 清空涂鸦数据
export async function DELETE() {
    try {
        await prisma.drawing.deleteMany()

        return NextResponse.json({ success: true, message: '涂鸦数据已清空' })
    } catch (error) {
        console.error('清空涂鸦数据失败:', error)
        return NextResponse.json(
            { success: false, error: '清空涂鸦数据失败' },
            { status: 500 }
        )
    }
}
