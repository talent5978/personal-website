import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            欢迎来到我的个人网站
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            这里是一个包含小游戏和排行榜的全栈项目
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">关于我</h2>
            <p className="text-gray-700 mb-4">
              我是一名全栈开发者，热爱编程和技术。
            </p>
            <p className="text-gray-700 mb-4">
              这个网站使用 Next.js + TypeScript + Tailwind CSS 构建，
              后端使用 SQLite 数据库存储游戏分数。
            </p>
            <p className="text-gray-700">
              欢迎体验我的小游戏，挑战排行榜！
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-green-600 mb-4">技术栈</h2>
            <ul className="text-gray-700 space-y-2">
              <li>• 前端：Next.js + React + TypeScript</li>
              <li>• 样式：Tailwind CSS</li>
              <li>• 后端：Next.js API Routes</li>
              <li>• 数据库：SQLite + Prisma ORM</li>
              <li>• 部署：Vercel</li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
            <h3 className="text-2xl font-bold mb-4">🎮 小游戏</h3>
            <p className="mb-4">
              体验经典的贪吃蛇游戏，挑战你的反应速度和策略！
            </p>
            <a
              href="/game"
              className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              开始游戏
            </a>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-lg text-white">
            <h3 className="text-2xl font-bold mb-4">🏆 排行榜</h3>
            <p className="mb-4">
              查看所有玩家的最高分数，看看你能排第几名！
            </p>
            <a
              href="/leaderboard"
              className="inline-block bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              查看排行榜
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
