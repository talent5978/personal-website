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

// POST /api/posts - 创建新帖子
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, author } = body

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

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        author: author.trim()
      }
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('创建帖子失败:', error)
    return NextResponse.json(
      { error: '创建帖子失败' },
      { status: 500 }
    )
  }
} 