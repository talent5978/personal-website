'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'

export default function Home() {
  const { t } = useLanguage()

  return (
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
        </div>

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
  )
}
