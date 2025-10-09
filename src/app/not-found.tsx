import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: '页面未找到 - 梦想家的个人网站',
    description: '抱歉，您访问的页面不存在。返回梦想家的个人网站首页，探索更多精彩内容。',
    robots: {
        index: false,
        follow: true,
    },
}

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
            <div className="text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        404
                    </h1>
                    <h2 className="text-3xl font-bold text-white mb-4">页面未找到</h2>
                    <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
                        抱歉，您访问的页面不存在。可能是链接错误或页面已被移动。
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/"
                        className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
                    >
                        🏠 返回首页
                    </Link>

                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                        <Link
                            href="/about"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            👤 关于我
                        </Link>
                        <Link
                            href="/game"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            🐍 贪吃蛇
                        </Link>
                        <Link
                            href="/tetris"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            🧩 俄罗斯方块
                        </Link>
                        <Link
                            href="/posts"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            💬 论坛
                        </Link>
                        <Link
                            href="/bottles"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            🥤 漂流瓶
                        </Link>
                    </div>
                </div>

                <div className="mt-12 text-gray-400 text-sm">
                    <p>梦想家的个人网站 - 全栈开发者 | 运动达人 | 乐器爱好者 | 摄影师</p>
                </div>
            </div>
        </div>
    )
}
