'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'
import { GardenProvider } from '@/components/GardenContext'
import Garden from '@/components/Garden'
import React from 'react'

export default function Home() {
  const { t } = useLanguage()

  return (
    <GardenProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* 个人座右铭 */}
          <div className="text-center mb-8">
            <blockquote className="text-xl italic text-gray-300 max-w-2xl mx-auto">
              "生命在于运动，代码改变世界，音乐治愈心灵"
            </blockquote>
            <cite className="text-gray-400">— Lenovo (运动达人 & 全栈开发者)</cite>
          </div>

          {/* 个人简介卡片 */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-2xl text-white mb-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl font-bold overflow-hidden">
                <img 
                  src="/avatar.jpg" 
                  alt="Lenovo头像" 
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl" style={{display: 'none'}}>
                  L
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">你好，我是 Lenovo</h2>
                <p className="text-lg opacity-90 mb-4">
                  全栈开发者 | 极限运动爱好者 | 音乐人 | 摄影师
                </p>
                <div className="flex gap-4">
                  <a href="https://www.xiaohongshu.com/user/profile/talentdamn" target="_blank" rel="noopener noreferrer" className="bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all">
                    📱 小红书
                  </a>
                  <a href="https://www.douyin.com/user/39662914638" target="_blank" rel="noopener noreferrer" className="bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all">
                    🎵 抖音
                  </a>
                  <a href="https://github.com/talent5978" target="_blank" rel="noopener noreferrer" className="bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all">
                    💻 GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 个人成就统计 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 rounded-lg text-white text-center">
              <div className="text-2xl font-bold">16+</div>
              <div className="text-sm opacity-90">运动项目</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 rounded-lg text-white text-center">
              <div className="text-2xl font-bold">2</div>
              <div className="text-sm opacity-90">乐器掌握</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-lg text-white text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm opacity-90">游戏开发</div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-lg text-white text-center">
              <div className="text-2xl font-bold">∞</div>
              <div className="text-sm opacity-90">学习热情</div>
            </div>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {t.home.title}
            </h1>
            <p className="text-gray-300 mb-8 text-xl max-w-3xl mx-auto">
              {t.home.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
              <h3 className="text-2xl font-bold mb-4">{t.home.features.snake.title}</h3>
              <p className="text-blue-100 mb-4">{t.home.features.snake.description}</p>
              <Link
                href="/game"
                className="inline-block bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105"
              >
                🎮 开始游戏
              </Link>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 rounded-lg text-white">
              <h3 className="text-2xl font-bold mb-4">🧩 俄罗斯方块</h3>
              <p className="text-blue-100 mb-4">经典益智游戏，挑战你的反应速度和策略思维</p>
              <Link
                href="/tetris"
                className="inline-block bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105"
              >
                🧩 开始游戏
              </Link>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-lg text-white">
              <h3 className="text-2xl font-bold mb-4">{t.home.features.survivor.title}</h3>
              <p className="text-red-100 mb-4">{t.home.features.survivor.description}</p>
              <Link
                href="/survivor"
                className="inline-block bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105"
              >
                ⚔️ 开始游戏
              </Link>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-lg text-white">
              <h3 className="text-2xl font-bold mb-4">{t.home.features.leaderboard.title}</h3>
              <p className="text-green-100 mb-4">{t.home.features.leaderboard.description}</p>
              <Link
                href="/leaderboard"
                className="inline-block bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105"
              >
                🏆 查看排行榜
              </Link>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-lg text-white">
              <h3 className="text-2xl font-bold mb-4">{t.home.features.forum.title}</h3>
              <p className="text-orange-100 mb-4">{t.home.features.forum.description}</p>
              <Link
                href="/posts"
                className="inline-block bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105"
              >
                💬 进入论坛
              </Link>
            </div>

            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 rounded-lg text-white">
              <h3 className="text-2xl font-bold mb-4">漂流瓶</h3>
              <p className="text-teal-100 mb-4">扔瓶子写心事，捞瓶子看故事，并可继续续写</p>
              <Link
                href="/bottles"
                className="inline-block bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105"
              >
                🥤 进入漂流瓶
              </Link>
            </div>
          </div>

          {/* 运动技能展示 */}
          <div className="mt-12">
            <div className="bg-black bg-opacity-30 backdrop-blur-sm p-6 rounded-xl border border-green-500">
              <h3 className="text-2xl font-bold text-white mb-6">🏃‍♂️ 运动技能树</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-green-300 mb-3">已掌握技能</h4>
                  <div className="space-y-3">
                    {[
                      { skill: '🎸 吉他指弹', level: 70 },
                      { skill: '🎵 长笛演奏', level: 90 },
                      { skill: '🏄‍♂️ 单板滑雪', level: 75 },
                      { skill: '🏃‍♂️ 跑步', level: 80 },
                      { skill: '🚴‍♂️ 公路骑行', level: 60 },
                      { skill: '🏊‍♂️ 游泳', level: 70 },
                      { skill: '🛹 滑板', level: 65 },
                      { skill: '📷 摄影', level: 75 }
                    ].map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-white mb-1">
                          <span>{item.skill}</span>
                          <span>{item.level}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${item.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-orange-300 mb-3">学习中/想学的技能</h4>
                  <div className="space-y-3">
                    {[
                      { skill: '🎹 钢琴', level: 10 },
                      { skill: '🤸‍♂️ 跑酷', level: 5 },
                      { skill: '💃 街舞Breaking', level: 0 },
                      { skill: '📈 理财投资', level: 20 },
                      { skill: '🏔️ 重装徒步', level: 15 },
                      { skill: '🏍️ 摩托车', level: 0 },
                      { skill: '🛹 漂移板', level: 25 },
                      { skill: '💪 健身', level: 30 }
                    ].map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-white mb-1">
                          <span>{item.skill}</span>
                          <span>{item.level}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${item.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 社区花园区域 */}
          <div className="mt-12">
            <Garden className="max-w-4xl mx-auto" />
          </div>

          {/* 兴趣标签云 */}
          <div className="mt-12">
            <div className="bg-black bg-opacity-30 backdrop-blur-sm p-6 rounded-xl border border-purple-500">
              <h3 className="text-2xl font-bold text-white mb-6">🏷️ 我的兴趣世界</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-green-300 mb-3">🏃‍♂️ 运动类</h4>
                  <div className="flex flex-wrap gap-3">
                    {[
                      '🛹 滑板', '🏄‍♂️ 单板滑雪', '🏃‍♂️ 跑步', '🚴‍♂️ 公路骑行', 
                      '🏊‍♂️ 游泳', '🎿 轮滑', '🏓 台球', '💪 健身', '🏔️ 户外露营'
                    ].map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm hover:scale-105 transition-transform cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-blue-300 mb-3">🎵 音乐类</h4>
                  <div className="flex flex-wrap gap-3">
                    {[
                      '🎸 吉他指弹', '🎵 长笛', '🎹 钢琴(学习中)', '🎤 音乐制作'
                    ].map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm hover:scale-105 transition-transform cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-purple-300 mb-3">💻 技术类</h4>
                  <div className="flex flex-wrap gap-3">
                    {[
                      '💻 全栈开发', '🤖 AI网页写作', '📱 移动开发', '🔧 电子DIY', 
                      '📚 技术学习', '📈 理财投资', '📷 摄影', '📖 读书'
                    ].map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm hover:scale-105 transition-transform cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 帖子 Emoji 墙 */}
          <EmojiWall />

          {/* 社交媒体链接卡片 */}
          <div className="mt-12">
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-6 rounded-xl text-white">
              <h3 className="text-xl font-bold mb-4">📱 关注我的动态</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <a href="https://www.xiaohongshu.com/user/profile/talentdamn" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white bg-opacity-20 p-4 rounded-lg hover:bg-opacity-30 transition-all">
                  <span className="text-2xl">📱</span>
                  <div>
                    <div className="font-semibold">小红书</div>
                    <div className="text-sm opacity-90">@talentdamn</div>
                  </div>
                </a>
                <a href="https://www.douyin.com/user/39662914638" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white bg-opacity-20 p-4 rounded-lg hover:bg-opacity-30 transition-all">
                  <span className="text-2xl">🎵</span>
                  <div>
                    <div className="font-semibold">抖音</div>
                    <div className="text-sm opacity-90">39662914638</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* 技术栈区域 - 移到最下方 */}
          <div className="mt-12 text-center">
            <div className="bg-black bg-opacity-30 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-blue-500">
              <h2 className="text-3xl font-bold text-white mb-6">🚀 技术栈</h2>
              <div className="grid md:grid-cols-3 gap-6 text-white">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-3 text-blue-300">前端</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>Next.js 14</li>
                    <li>React 18</li>
                    <li>TypeScript</li>
                    <li>Tailwind CSS</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-3 text-green-300">后端</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>Next.js API Routes</li>
                    <li>Prisma ORM</li>
                    <li>PostgreSQL</li>
                    <li>RESTful API</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-3 text-purple-300">部署</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>Vercel</li>
                    <li>GitHub</li>
                    <li>Neon Database</li>
                    <li>CI/CD</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GardenProvider>
  )
}

function EmojiWall() {
  const [posts, setPosts] = React.useState<Array<{ id: number; emoji: string | null; title: string }>>([])
  const [loading, setLoading] = React.useState(true)
  const [showIndex, setShowIndex] = React.useState<number | null>(null)

  // 画布尺寸（与花园类似）
  const canvasWidth = 500
  const canvasHeight = 300
  const isSmall = typeof window !== 'undefined' && window.innerWidth < 640
  const w = isSmall ? 320 : canvasWidth
  const h = isSmall ? 220 : canvasHeight

  React.useEffect(() => {
    let cancelled = false
    fetch('/api/posts')
      .then(res => res.json())
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : []
        setPosts(list.map((p: any) => ({ id: p.id, emoji: p.emoji ?? '📝', title: p.title || '帖子' })))
      })
      .catch(() => { })
      .finally(() => setLoading(false))
    return () => { cancelled = true }
  }, [])

  // 为每个帖子生成一次随机坐标（须在 early return 之前声明，避免条件调用 Hook）
  const positioned = React.useMemo(() => {
    return posts.map((p) => ({
      ...p,
      x: Math.floor(Math.random() * (canvasWidth - 80)) + 40,
      y: Math.floor(Math.random() * (canvasHeight - 80)) + 40,
    }))
  }, [posts])

  if (loading) return null
  if (!posts.length) return null

  return (
    <div className="mt-12">
      <h2 className="text-center text-white text-2xl font-bold mb-4">🧱 帖子 Emoji 墙</h2>
      <div className="bg-black bg-opacity-30 backdrop-blur-sm p-4 rounded-xl border border-purple-500">
        <div className="relative rounded-lg bg-white bg-opacity-5 border border-purple-400" style={{ height: h, minWidth: w, overflow: 'hidden' }}>
          {positioned.map((p, idx) => (
            <div key={p.id} className="relative">
              <a
                href={`/posts/${p.id}`}
                className="absolute text-2xl hover:scale-125 transition-transform"
                style={{ left: p.x, top: p.y, zIndex: 10 }}
                onMouseEnter={() => setShowIndex(idx)}
                onMouseLeave={() => setShowIndex((cur) => (cur === idx ? null : cur))}
                title={p.title}
              >
                {p.emoji || '📝'}
              </a>
              {showIndex === idx && (
                <div
                  className="absolute bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-20"
                  style={{ left: (p.x as number) + 20, top: (p.y as number) - 28, minWidth: 140 }}
                >
                  <div className="font-medium truncate" title={p.title}>{p.title}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}