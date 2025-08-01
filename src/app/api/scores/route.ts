import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/scores - 获取排行榜
export async function GET() {
    try {
        const scores = await prisma.score.findMany({
            orderBy: {
                score: 'desc'
            },
            take: 100 // 限制返回前100名
        })

        return NextResponse.json(scores)
    } catch (error) {
        console.error('获取排行榜失败:', error)
        return NextResponse.json(
            { error: '获取排行榜失败' },
            { status: 500 }
        )
    }
}

// POST /api/scores - 提交分数
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { playerName, score } = body

        // 验证输入
        if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
            return NextResponse.json(
                { error: '玩家名称不能为空' },
                { status: 400 }
            )
        }

        if (!score || typeof score !== 'number' || score < 0) {
            return NextResponse.json(
                { error: '分数必须是非负数' },
                { status: 400 }
            )
        }

        // 保存分数到数据库
        const newScore = await prisma.score.create({
            data: {
                playerName: playerName.trim(),
                score: score
            }
        })

        return NextResponse.json(newScore, { status: 201 })
    } catch (error) {
        console.error('提交分数失败:', error)
        return NextResponse.json(
            { error: '提交分数失败' },
            { status: 500 }
        )
    }
} 