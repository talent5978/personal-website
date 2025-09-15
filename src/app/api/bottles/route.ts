import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const db: any = prisma

async function rewardSeed(tempUserId?: string, amount: number = 1) {
    if (!tempUserId) return
    try {
        let user = await prisma.tempUser.findUnique({ where: { id: tempUserId } })
        if (!user) {
            await prisma.tempUser.create({ data: { id: tempUserId, seeds: Math.max(0, amount), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } })
        } else {
            await prisma.tempUser.update({ where: { id: tempUserId }, data: { seeds: { increment: amount }, lastActivity: new Date() } })
        }
    } catch (e) {
        console.error('种子奖励失败:', e)
    }
}

// 扔瓶子：POST /api/bottles  body: { author, content, tempUserId }
export async function POST(request: NextRequest) {
    try {
        const { author, content, tempUserId } = await request.json()
        if (!author || !content) {
            return NextResponse.json({ error: '请填写作者与内容' }, { status: 400 })
        }

        const bottle = await db.bottle.create({
            data: {
                messages: {
                    create: {
                        author: String(author).trim().slice(0, 50),
                        content: String(content).trim().slice(0, 2000)
                    }
                }
            },
            include: { messages: { orderBy: { createdAt: 'asc' } } }
        })

        // 扔瓶子奖励 1 颗种子
        await rewardSeed(tempUserId, 1)

        return NextResponse.json(bottle, { status: 201 })
    } catch (e) {
        console.error('扔瓶子失败:', e)
        return NextResponse.json({ error: '扔瓶子失败' }, { status: 500 })
    }
}

// 捞瓶子：GET /api/bottles -> 随机返回一个活跃瓶子及其消息
export async function GET() {
    try {
        const count = await db.bottle.count({ where: { isActive: true } })
        if (count === 0) return NextResponse.json(null)

        const skip = Math.floor(Math.random() * count)
        const bottle = await db.bottle.findFirst({
            where: { isActive: true },
            skip,
            orderBy: { id: 'asc' },
            include: { messages: { orderBy: { createdAt: 'asc' } } }
        })

        return NextResponse.json(bottle)
    } catch (e) {
        console.error('捞瓶子失败:', e)
        return NextResponse.json({ error: '捞瓶子失败' }, { status: 500 })
    }
}

// 回复瓶子：PUT /api/bottles  body: { bottleId, author, content, tempUserId }
export async function PUT(request: NextRequest) {
    try {
        const { bottleId, author, content, tempUserId } = await request.json()
        const id = Number(bottleId)
        if (!id || !author || !content) {
            return NextResponse.json({ error: '缺少参数' }, { status: 400 })
        }

        const bottle = await db.bottle.update({
            where: { id },
            data: {
                lastTouchedAt: new Date(),
                messages: {
                    create: {
                        author: String(author).trim().slice(0, 50),
                        content: String(content).trim().slice(0, 2000)
                    }
                }
            },
            include: { messages: { orderBy: { createdAt: 'asc' } } }
        })

        // 回复奖励 1 颗种子
        await rewardSeed(tempUserId, 1)

        return NextResponse.json(bottle)
    } catch (e) {
        console.error('回复瓶子失败:', e)
        return NextResponse.json({ error: '回复瓶子失败' }, { status: 500 })
    }
}
