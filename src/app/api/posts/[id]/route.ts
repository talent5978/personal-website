import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/posts/[id] - 获取帖子详情
export async function GET(
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

    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json(
        { error: '帖子不存在' },
        { status: 404 }
      )
    }

    const comments = await prisma.comment.findMany({
      where: { postId: postId },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({
      post,
      comments
    })
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    return NextResponse.json(
      { error: '获取帖子详情失败' },
      { status: 500 }
    )
  }
} 