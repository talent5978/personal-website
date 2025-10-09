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
          {/* 关于我 - 完整介绍 */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-2xl text-white">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl font-bold overflow-hidden flex-shrink-0">
                  <img
                    src="/avatar.jpg"
                    alt="梦想家头像"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-3xl" style={{ display: 'none' }}>
                    梦
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-4xl font-bold mb-4">你好，我是 梦想家</h2>
                  <p className="text-xl opacity-90 mb-6">
                    全栈开发者 | 极限运动爱好者 | 乐器爱好者 | 摄影师
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-blue-200">🎯 我的标签</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          '🏃‍♂️ 运动达人', '💻 全栈开发', '🎵 乐器爱好者', '📷 摄影师',
                          '🎮 游戏开发', '📚 终身学习', '🌍 探索者', '💡 创新者'
                        ].map((tag, index) => (
                          <span key={index} className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-green-200">🌟 我的理念</h3>
                      <p className="text-sm opacity-90 leading-relaxed">
                        相信技术改变世界，运动强健体魄，音乐治愈心灵。
                        在代码的世界里创造价值，在运动的世界里挑战自我，
                        在音乐的世界里寻找共鸣。
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <a href="https://www.xiaohongshu.com/user/profile/60c2f5420000000001002382?xsec_token=ABcIOnOiII5x4flIQclLvfQo01hE-o6JJrsS3VT6ieo7M%3D&xsec_source=pc_search" target="_blank" rel="noopener noreferrer" className="bg-white bg-opacity-20 px-6 py-3 rounded-lg hover:bg-opacity-30 transition-all flex items-center gap-2">
                      <span className="text-xl">📱</span>
                      <span>小红书 - 云彩收藏家</span>
                    </a>
                    <a href="https://www.douyin.com/user/MS4wLjABAAAAwmuEkqLL4u9UJvhNwwCDRxljoTyUpCQ6lmZTn7KpRWd_dcGvTbDJ83H2zU64UGMA?from_tab_name=main" target="_blank" rel="noopener noreferrer" className="bg-white bg-opacity-20 px-6 py-3 rounded-lg hover:bg-opacity-30 transition-all flex items-center gap-2">
                      <span className="text-xl">🎵</span>
                      <span>抖音 - 运动达人</span>
                    </a>
                    <a href="https://github.com/talent5978" target="_blank" rel="noopener noreferrer" className="bg-white bg-opacity-20 px-6 py-3 rounded-lg hover:bg-opacity-30 transition-all flex items-center gap-2">
                      <span className="text-xl">💻</span>
                      <span>GitHub - 代码仓库</span>
                    </a>
                    <a href="/about" className="bg-white bg-opacity-20 px-6 py-3 rounded-lg hover:bg-opacity-30 transition-all flex items-center gap-2">
                      <span className="text-xl">👤</span>
                      <span>了解更多关于我</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 个人座右铭 */}
          <div className="text-center mb-8">
            <blockquote className="text-xl italic text-gray-300 max-w-2xl mx-auto">
              "生命在于运动，代码改变世界，音乐治愈心灵"
            </blockquote>
            <cite className="text-gray-400">— 梦想家 (运动达人 & 全栈开发者)</cite>
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


          {/* 社区花园区域 */}
          <div className="mt-12">
            <Garden className="max-w-4xl mx-auto" />
          </div>


          {/* 帖子 Emoji 墙 */}
          <EmojiWall />

          {/* 社交媒体链接卡片 */}
          <div className="mt-12">
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-6 rounded-xl text-white">
              <h3 className="text-xl font-bold mb-4">📱 关注我的动态</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <a href="https://www.xiaohongshu.com/user/profile/60c2f5420000000001002382?xsec_token=ABcIOnOiII5x4flIQclLvfQo01hE-o6JJrsS3VT6ieo7M%3D&xsec_source=pc_search" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white bg-opacity-20 p-4 rounded-lg hover:bg-opacity-30 transition-all">
                  <span className="text-2xl">📱</span>
                  <div>
                    <div className="font-semibold">小红书</div>
                    <div className="text-sm opacity-90">云彩收藏家</div>
                  </div>
                </a>
                <a href="https://www.douyin.com/user/MS4wLjABAAAAwmuEkqLL4u9UJvhNwwCDRxljoTyUpCQ6lmZTn7KpRWd_dcGvTbDJ83H2zU64UGMA?from_tab_name=main" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white bg-opacity-20 p-4 rounded-lg hover:bg-opacity-30 transition-all">
                  <span className="text-2xl">🎵</span>
                  <div>
                    <div className="font-semibold">抖音</div>
                    <div className="text-sm opacity-90">运动达人</div>
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