'use client'

import Link from 'next/link'
import { useLanguage } from './LanguageProvider'

export default function Navigation() {
  const { language, changeLanguage, t } = useLanguage()
  
  return (
    <nav className="bg-gray-900 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link href="/" className="hover:text-blue-200 transition-colors">
            {language === 'zh' ? '我的网站' : 'My Website'}
          </Link>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="space-x-4">
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
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => changeLanguage('zh')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                language === 'zh'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                language === 'en'
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