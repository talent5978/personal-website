import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: '我的个人网站 - 全栈游戏开发',
    description: '包含幸存者游戏、贪吃蛇游戏和排行榜的现代化个人网站，使用 Next.js + TypeScript 构建',
    keywords: '游戏开发, Next.js, TypeScript, 幸存者游戏, 贪吃蛇, 排行榜',
    authors: [{ name: '个人网站' }],
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
}

function Navigation() {
    return (
        <nav className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg sticky top-0 z-50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                            <span className="text-xl font-bold">🎮</span>
                        </div>
                        <div className="hidden md:block">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                游戏开发工作室
                            </h1>
                            <p className="text-xs text-blue-200">全栈游戏开发</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link 
                            href="/" 
                            className="relative px-3 py-2 text-white hover:text-blue-200 transition-colors group"
                        >
                            <span className="relative z-10">🏠 首页</span>
                            <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all"></div>
                        </Link>
                        <Link 
                            href="/game" 
                            className="relative px-3 py-2 text-white hover:text-blue-200 transition-colors group"
                        >
                            <span className="relative z-10">🐍 贪吃蛇</span>
                            <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all"></div>
                        </Link>
                        <Link 
                            href="/survivor" 
                            className="relative px-3 py-2 text-white hover:text-blue-200 transition-colors group"
                        >
                            <span className="relative z-10">⚔️ 幸存者</span>
                            <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all"></div>
                        </Link>
                        <Link 
                            href="/leaderboard" 
                            className="relative px-3 py-2 text-white hover:text-blue-200 transition-colors group"
                        >
                            <span className="relative z-10">🏆 排行榜</span>
                            <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all"></div>
                        </Link>
                        <Link 
                            href="/posts" 
                            className="relative px-3 py-2 text-white hover:text-blue-200 transition-colors group"
                        >
                            <span className="relative z-10">💬 论坛</span>
                            <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all"></div>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button className="text-white hover:text-blue-200 p-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden pb-4">
                    <div className="space-y-2">
                        <Link href="/" className="block px-3 py-2 text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
                            🏠 首页
                        </Link>
                        <Link href="/game" className="block px-3 py-2 text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
                            🐍 贪吃蛇
                        </Link>
                        <Link href="/survivor" className="block px-3 py-2 text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
                            ⚔️ 幸存者
                        </Link>
                        <Link href="/leaderboard" className="block px-3 py-2 text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
                            🏆 排行榜
                        </Link>
                        <Link href="/posts" className="block px-3 py-2 text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
                            💬 论坛
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}

function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                            游戏开发工作室
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            专注于创造有趣的游戏体验，使用现代化的技术栈构建高质量的Web游戏。
                        </p>
                    </div>
                    <div>
                        <h4 className="text-md font-semibold mb-4 text-blue-400">游戏</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/game" className="text-gray-400 hover:text-white transition-colors">🐍 贪吃蛇游戏</Link></li>
                            <li><Link href="/survivor" className="text-gray-400 hover:text-white transition-colors">⚔️ 幸存者游戏</Link></li>
                            <li><Link href="/leaderboard" className="text-gray-400 hover:text-white transition-colors">🏆 排行榜</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-md font-semibold mb-4 text-purple-400">社区</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/posts" className="text-gray-400 hover:text-white transition-colors">💬 论坛讨论</Link></li>
                            <li><Link href="/leaderboard" className="text-gray-400 hover:text-white transition-colors">📊 成绩榜单</Link></li>
                            <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">📖 游戏攻略</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-md font-semibold mb-4 text-pink-400">技术栈</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>• Next.js 14 + React 18</li>
                            <li>• TypeScript + Tailwind CSS</li>
                            <li>• Prisma + PostgreSQL</li>
                            <li>• Vercel 部署</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        © 2024 游戏开发工作室. 使用 Next.js 构建，部署在 Vercel
                    </p>
                </div>
            </div>
        </footer>
    )
}

function LoadingSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">加载中...</p>
            </div>
        </div>
    )
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh" className="scroll-smooth">
            <head>
                <link rel="icon" href="/favicon.ico" />
                <meta name="theme-color" content="#3b82f6" />
                <meta property="og:title" content="我的个人网站 - 全栈游戏开发" />
                <meta property="og:description" content="包含幸存者游戏、贪吃蛇游戏和排行榜的现代化个人网站" />
                <meta property="og:type" content="website" />
            </head>
            <body className={`${inter.className} antialiased bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen`}>
                <div className="flex flex-col min-h-screen">
                    <Navigation />
                    <main className="flex-grow">
                        <Suspense fallback={<LoadingSpinner />}>
                            {children}
                        </Suspense>
                    </main>
                    <Footer />
                </div>

                {/* 背景装饰 */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
                </div>
            </body>
        </html>
    )
}
