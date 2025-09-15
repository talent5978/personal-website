import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/posts - 获取帖子列表
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            comments: true
          }
        }
      }
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    return NextResponse.json(
      { error: '获取帖子列表失败' },
      { status: 500 }
    )
  }
}

function normalizeEmoji(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const trimmed = input.trim()
  if (!trimmed) return null
  // 粗略校验：长度不超过4个 code units
  if (trimmed.length > 4) return null
  return trimmed
}

// POST /api/posts - 创建新帖子
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, author, tempUserId, emoji } = body

    // 验证输入
    if (!title || !content || !author) {
      return NextResponse.json(
        { error: '请填写完整信息' },
        { status: 400 }
      )
    }

    if (title.length > 100) {
      return NextResponse.json(
        { error: '标题不能超过100个字符' },
        { status: 400 }
      )
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: '内容不能超过5000个字符' },
        { status: 400 }
      )
    }

    if (author.length > 50) {
      return NextResponse.json(
        { error: '昵称不能超过50个字符' },
        { status: 400 }
      )
    }

    const finalEmoji = normalizeEmoji(emoji) ?? '📝'

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
        emoji: finalEmoji
      }
    })

    // 如果有临时用户ID，给予种子奖励（发帖 +5）
    if (tempUserId) {
      try {
        // 获取或创建临时用户
        let tempUser = await prisma.tempUser.findUnique({
          where: { id: tempUserId }
        });

        if (!tempUser) {
          tempUser = await prisma.tempUser.create({
            data: {
              id: tempUserId,
              seeds: 5,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
          });
        } else {
          // 更新种子数量和最后活动时间
          await prisma.tempUser.update({
            where: { id: tempUserId },
            data: {
              seeds: { increment: 5 },
              lastActivity: new Date()
            }
          });
        }
      } catch (seedError) {
        console.error('给予种子奖励失败:', seedError);
        // 不影响帖子创建，继续执行
      }
    }

    return NextResponse.json({
      ...post,
      seedEarned: !!tempUserId
    }, { status: 201 })
  } catch (error: any) {
    console.error('创建帖子失败:', error)
    // 在开发环境下返回更详细的错误信息，便于定位
    const dev = process.env.NODE_ENV !== 'production'
    return NextResponse.json(
      { error: dev ? `创建帖子失败: ${error?.message || 'Unknown error'}` : '创建帖子失败' },
      { status: 500 }
    )
  }
} 