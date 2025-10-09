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
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {t.home.title}
            </h1>
            <p className="text-gray-300 mb-8 text-xl max-w-3xl mx-auto">
              {t.home.description}
            </p>
            <p className="text-gray-700 mb-4">
              {t.home.techStack}
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