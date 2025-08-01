import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '我的个人网站',
  description: '包含小游戏和排行榜的个人网站',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">我的个人网站</h1>
            <div className="space-x-4">
              <Link href="/" className="hover:text-blue-200">首页</Link>
              <Link href="/game" className="hover:text-blue-200">小游戏</Link>
              <Link href="/leaderboard" className="hover:text-blue-200">排行榜</Link>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
