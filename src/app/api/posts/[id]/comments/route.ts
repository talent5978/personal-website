import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/posts/[id]/comments - 创建新留言
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id)

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: '无效的帖子ID' },
        { status: 400 }
      )
    }

    // 检查帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json(
        { error: '帖子不存在' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { content, author } = body

    // 验证输入
    if (!content || !author) {
      return NextResponse.json(
        { error: '请填写完整信息' },
        { status: 400 }
      )
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: '留言内容不能超过1000个字符' },
        { status: 400 }
      )
    }

    if (author.length > 50) {
      return NextResponse.json(
        { error: '昵称不能超过50个字符' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        author: author.trim(),
        postId: postId
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('创建留言失败:', error)
    return NextResponse.json(
      { error: '创建留言失败' },
      { status: 500 }
    )
  }
} 