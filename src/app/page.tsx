import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative z-10">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text mb-6">
              欢迎来到游戏世界
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              体验精心打造的Web游戏，挑战你的技巧，与全球玩家一较高下
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/survivor"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <span className="mr-2">⚔️</span>
                开始幸存者挑战
              </Link>
              <Link
                href="/game"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <span className="mr-2">🐍</span>
                经典贪吃蛇游戏
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white bg-opacity-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              为什么选择我们的游戏？
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              使用最新技术栈打造，提供流畅的游戏体验和丰富的功能
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">高性能</h3>
              <p className="text-gray-600 leading-relaxed">
                使用对象池和优化算法，确保游戏在任何设备上都能流畅运行，60FPS稳定帧率。
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">丰富玩法</h3>
              <p className="text-gray-600 leading-relaxed">
                多种游戏模式，升级系统，武器解锁，成就系统，让每次游戏都有新的体验。
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">竞技排行</h3>
              <p className="text-gray-600 leading-relaxed">
                全球排行榜系统，与世界各地的玩家竞争，展示你的游戏技巧和成就。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Games Showcase */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              精彩游戏等你体验
            </h2>
            <p className="text-xl text-gray-600">
              每个游戏都经过精心设计，带来独特的游戏体验
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Survivor Game */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-center mb-6">
                  <span className="text-4xl mr-4">⚔️</span>
                  <div>
                    <h3 className="text-3xl font-bold">幸存者游戏 2.0</h3>
                    <p className="text-purple-100">升级版生存挑战</p>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-yellow-300 mr-3">✨</span>
                    经验升级系统与武器解锁
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-300 mr-3">⚡</span>
                    6种独特武器，各具特色
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-300 mr-3">🎯</span>
                    智能瞄准与粒子特效
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-300 mr-3">🗺️</span>
                    实时小地图与暂停功能
                  </li>
                </ul>
                <Link
                  href="/survivor"
                  className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  立即体验
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-center mb-6">
                  <span className="text-4xl mr-4">🐍</span>
                  <div>
                    <h3 className="text-3xl font-bold">贪吃蛇游戏</h3>
                    <p className="text-blue-100">经典游戏新体验</p>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-yellow-300 mr-3">🎮</span>
                    多种游戏模式选择
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-300 mr-3">🍎</span>
                    特殊食物与道具系统
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-300 mr-3">🚧</span>
                    障碍模式增加挑战
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-300 mr-3">📱</span>
                    完美适配移动设备
                  </li>
                </ul>
                <Link
                  href="/game"
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  开始游戏
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              现代化技术栈
            </h2>
            <p className="text-xl text-gray-600">
              使用业界领先的技术构建，确保最佳性能和用户体验
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="text-4xl mb-4">⚛️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">React 18</h3>
              <p className="text-gray-600 text-sm">最新的React版本，提供并发特性和更好的性能</p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🔷</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">TypeScript</h3>
              <p className="text-gray-600 text-sm">类型安全的JavaScript，减少错误，提高开发效率</p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Tailwind CSS</h3>
              <p className="text-gray-600 text-sm">实用优先的CSS框架，快速构建美观的界面</p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🗄️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Prisma</h3>
              <p className="text-gray-600 text-sm">现代化的数据库ORM，类型安全的数据库操作</p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white text-center">
            <h2 className="text-4xl font-bold mb-6">加入我们的社区</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              与全球玩家交流游戏心得，分享高分记录，参与讨论，获取最新游戏资讯
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/leaderboard"
                className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                <span className="mr-2">🏆</span>
                查看排行榜
              </Link>
              <Link
                href="/posts"
                className="inline-flex items-center px-8 py-4 bg-purple-700 text-white font-semibold rounded-xl hover:bg-purple-800 transition-colors"
              >
                <span className="mr-2">💬</span>
                加入论坛
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white bg-opacity-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">2</div>
              <div className="text-gray-600">精彩游戏</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">60</div>
              <div className="text-gray-600">FPS 流畅体验</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-600 mb-2">100%</div>
              <div className="text-gray-600">响应式设计</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600">在线可用</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
