import { NextRequest, NextResponse } from 'next/server'

// 临时内存存储，用于演示
// 在生产环境中应该使用真实的数据库
const posts = [
  {
    id: 1,
    title: "欢迎来到游戏论坛！",
    content: "这里是游戏讨论的地方，大家可以分享游戏心得、攻略技巧，或者讨论游戏相关的话题。期待大家的参与！",
    author: "管理员",
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 2,
    title: "幸存者游戏攻略分享",
    content: "经过多次游戏，我发现了一些实用的技巧：1. 优先升级魔法杖和火球术 2. 保持移动，不要停留在一个地方 3. 利用小地图观察敌人分布",
    author: "游戏高手",
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 3,
    title: "贪吃蛇游戏高分技巧",
    content: "想要在贪吃蛇游戏中获得高分吗？试试这些技巧：沿着边缘移动、规划路线、不要贪心吃特殊食物。",
    author: "蛇王",
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
]

const comments = [
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

    const post = posts.find(p => p.id === postId)

    if (!post) {
      return NextResponse.json(
        { error: '帖子不存在' },
        { status: 404 }
      )
    }

    const postComments = comments
      .filter(c => c.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    return NextResponse.json({
      post,
      comments: postComments
    })
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    return NextResponse.json(
      { error: '获取帖子详情失败' },
      { status: 500 }
    )
  }
} 