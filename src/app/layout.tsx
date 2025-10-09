import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/components/LanguageProvider'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://talentdamn.vercel.app'),
  title: '梦想家的个人网站 - 运动达人 & 全栈开发者',
  description: '梦想家的个人网站 - 全栈开发者、极限运动爱好者、乐器爱好者、摄影师。包含游戏开发、社区论坛、技能展示等丰富内容。',
  keywords: [
    '梦想家',
    '全栈开发',
    '运动达人',
    '乐器爱好者',
    '摄影师',
    '游戏开发',
    'Next.js',
    'React',
    'TypeScript',
    '个人网站',
    '程序员',
    '开发者',
    '滑板',
    '滑雪',
    '吉他',
    '竹笛',
    '健身',
    '跑步',
    '骑行',
    '游泳',
    '摄影',
    '贪吃蛇',
    '俄罗斯方块',
    '社区论坛',
    '漂流瓶'
  ],
  authors: [{ name: '梦想家', url: 'https://github.com/talent5978' }],
  creator: '梦想家',
  publisher: '梦想家',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://talentdamn.vercel.app',
    title: '梦想家的个人网站 - 运动达人 & 全栈开发者',
    description: '全栈开发者、极限运动爱好者、乐器爱好者、摄影师。包含游戏开发、社区论坛、技能展示等丰富内容。',
    siteName: '梦想家的个人网站',
    images: [
      {
        url: '/avatar.jpg',
        width: 1200,
        height: 630,
        alt: '梦想家头像',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '梦想家的个人网站 - 运动达人 & 全栈开发者',
    description: '全栈开发者、极限运动爱好者、乐器爱好者、摄影师。包含游戏开发、社区论坛、技能展示等丰富内容。',
    images: ['/avatar.jpg'],
  },
  alternates: {
    canonical: 'https://talentdamn.vercel.app',
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <Navigation />
          <main>
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  )
}
