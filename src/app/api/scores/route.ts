import { NextRequest, NextResponse } from 'next/server'

// 临时内存存储，用于演示
// 在生产环境中应该使用真实的数据库
let scores: Array<{
    id: number
    playerName: string
    score: number
    gameType: string
    createdAt: Date
}> = [
    { id: 1, playerName: "游戏高手", score: 1500, gameType: "survivor", createdAt: new Date() },
    { id: 2, playerName: "蛇王", score: 850, gameType: "snake", createdAt: new Date() },
    { id: 3, playerName: "生存专家", score: 1200, gameType: "survivor", createdAt: new Date() },
    { id: 4, playerName: "速度之王", score: 650, gameType: "snake", createdAt: new Date() },
    { id: 5, playerName: "传奇玩家", score: 2000, gameType: "survivor", createdAt: new Date() },
]

let nextId = 6

// GET /api/scores - 获取排行榜
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const gameType = searchParams.get('gameType')
        
        let filteredScores = scores
        
        if (gameType) {
            filteredScores = scores.filter(score => score.gameType === gameType)
        }
        
        // 按分数降序排序，取前100名
        const sortedScores = filteredScores
            .sort((a, b) => b.score - a.score)
            .slice(0, 100)

        return NextResponse.json(sortedScores)
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
        const { playerName, score, gameType = 'snake' } = body

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

        // 验证游戏类型
        if (!['snake', 'survivor'].includes(gameType)) {
            return NextResponse.json(
                { error: '无效的游戏类型' },
                { status: 400 }
            )
        }

        // 创建新分数记录
        const newScore = {
            id: nextId++,
            playerName: playerName.trim(),
            score: score,
            gameType: gameType,
            createdAt: new Date()
        }

        // 添加到内存存储
        scores.push(newScore)

        // 保持只有最新的1000条记录
        if (scores.length > 1000) {
            scores = scores
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, 1000)
        }

        return NextResponse.json(newScore, { status: 201 })
    } catch (error) {
        console.error('提交分数失败:', error)
        return NextResponse.json(
            { error: '提交分数失败' },
            { status: 500 }
        )
    }
} 