import { NextRequest, NextResponse } from 'next/server'

// 临时内存存储，用于演示
// 在生产环境中应该使用真实的数据库
const posts = [1, 2, 3] // 存在的帖子ID

let comments: Array<{
  id: number
  postId: number
  content: string
  author: string
  createdAt: Date
}> = [
  {
    id: 1,
    postId: 1,
    content: "感谢管理员的介绍！",
    author: "新手玩家",
    createdAt: new Date('2024-01-01T10:00:00')
  },
  {
    id: 2,
    postId: 1,
    content: "期待更多精彩内容！",
    author: "游戏爱好者",
    createdAt: new Date('2024-01-01T11:00:00')
  },
  {
    id: 3,
    postId: 2,
    content: "这些技巧很实用，谢谢分享！",
    author: "菜鸟玩家",
    createdAt: new Date('2024-01-02T09:00:00')
  },
  {
    id: 4,
    postId: 2,
    content: "我试了一下，确实有效果！",
    author: "进阶玩家",
    createdAt: new Date('2024-01-02T15:00:00')
  },
  {
    id: 5,
    postId: 3,
    content: "贪吃蛇确实需要策略，不能只想着快",
    author: "策略大师",
    createdAt: new Date('2024-01-03T08:00:00')
  }
]

let nextId = 6

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
    if (!posts.includes(postId)) {
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

    if (typeof content !== 'string' || typeof author !== 'string') {
      return NextResponse.json(
        { error: '输入格式不正确' },
        { status: 400 }
      )
    }

    if (content.trim().length === 0 || author.trim().length === 0) {
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

    // 创建新留言
    const comment = {
      id: nextId++,
      postId: postId,
      content: content.trim(),
      author: author.trim(),
      createdAt: new Date()
    }

    // 添加到内存存储
    comments.push(comment)

    // 保持只有最新的1000条留言
    if (comments.length > 1000) {
      comments = comments
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 1000)
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('创建留言失败:', error)
    return NextResponse.json(
      { error: '创建留言失败' },
      { status: 500 }
    )
  }
} 