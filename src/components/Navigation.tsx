'use client'

import Link from 'next/link'
import { useLanguage } from './LanguageProvider'

export default function Navigation() {
  const { language, changeLanguage, t } = useLanguage()

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex flex-wrap gap-3 justify-between items-center">
        <div className="text-xl font-bold">
          <Link href="/" className="hover:text-blue-200 transition-colors">
            {language === 'zh' ? '我的网站' : 'My Website'}
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link href="/" className="hover:text-blue-200 transition-colors">
              {t.nav.home}
            </Link>
            <Link href="/game" className="hover:text-blue-200 transition-colors">
              {t.nav.snake}
            </Link>
            <Link href="/survivor" className="hover:text-blue-200 transition-colors">
              {t.nav.survivor}
            </Link>
            <Link href="/leaderboard" className="hover:text-blue-200 transition-colors">
              {t.nav.leaderboard}
            </Link>
            <Link href="/posts" className="hover:text-blue-200 transition-colors">
              {t.nav.forum}
            </Link>
            <Link href="/bottles" className="hover:text-blue-200 transition-colors">
              🥤 漂流瓶
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => changeLanguage('zh')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${language === 'zh'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              中文
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${language === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              English
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
} 