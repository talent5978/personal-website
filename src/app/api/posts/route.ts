import { NextRequest, NextResponse } from 'next/server'

// 临时内存存储，用于演示
// 在生产环境中应该使用真实的数据库
let posts: Array<{
  id: number
  title: string
  content: string
  author: string
  createdAt: Date
  updatedAt: Date
  _count: {
    comments: number
  }
}> = [
  {
    id: 1,
    title: "欢迎来到游戏论坛！",
    content: "这里是游戏讨论的地方，大家可以分享游戏心得、攻略技巧，或者讨论游戏相关的话题。期待大家的参与！",
    author: "管理员",
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    _count: { comments: 5 }
  },
  {
    id: 2,
    title: "幸存者游戏攻略分享",
    content: "经过多次游戏，我发现了一些实用的技巧：1. 优先升级魔法杖和火球术 2. 保持移动，不要停留在一个地方 3. 利用小地图观察敌人分布",
    author: "游戏高手",
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    _count: { comments: 12 }
  },
  {
    id: 3,
    title: "贪吃蛇游戏高分技巧",
    content: "想要在贪吃蛇游戏中获得高分吗？试试这些技巧：沿着边缘移动、规划路线、不要贪心吃特殊食物。",
    author: "蛇王",
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    _count: { comments: 8 }
  }
]

let nextId = 4

// GET /api/posts - 获取帖子列表
export async function GET() {
  try {
    // 按创建时间降序排序
    const sortedPosts = posts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return NextResponse.json(sortedPosts)
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

    if (typeof title !== 'string' || typeof content !== 'string' || typeof author !== 'string') {
      return NextResponse.json(
        { error: '输入格式不正确' },
        { status: 400 }
      )
    }

    if (title.trim().length === 0 || content.trim().length === 0 || author.trim().length === 0) {
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

    // 创建新帖子
    const post = {
      id: nextId++,
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { comments: 0 }
    }

    // 添加到内存存储
    posts.push(post)

    // 保持只有最新的500条帖子
    if (posts.length > 500) {
      posts = posts
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 500)
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('创建帖子失败:', error)
    return NextResponse.json(
      { error: '创建帖子失败' },
      { status: 500 }
    )
  }
} 