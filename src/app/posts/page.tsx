'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'

interface Post {
    id: number
    title: string
    content: string
    author: string
    createdAt: string
    _count: {
        comments: number
    }
}

export default function Posts() {
    const { t } = useLanguage()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const postsPerPage = 5

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/posts')
            if (response.ok) {
                const data = await response.json()
                setPosts(data)
            }
        } catch (error) {
            console.error('获取帖子失败:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
    const startIndex = (currentPage - 1) * postsPerPage
    const endIndex = startIndex + postsPerPage
    const currentPosts = filteredPosts.slice(startIndex, endIndex)

    const formatTimeAgo = (dateString: string) => {
        const now = new Date()
        const date = new Date(dateString)
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return t.common.timeAgo.justNow
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}${t.common.timeAgo.minutesAgo}`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}${t.common.timeAgo.hoursAgo}`
        return `${Math.floor(diffInSeconds / 86400)}${t.common.timeAgo.daysAgo}`
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-gray-900 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center">
                        <div className="text-white text-xl">{t.common.loading}</div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        {t.forum.title}
                    </h1>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <Link
                        href="/posts/new"
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                    >
                        ✏️ {t.forum.newPost}
                    </Link>

                    <div className="text-white">
                        {searchTerm ? (
                            <span>找到 {filteredPosts.length} 个相关帖子</span>
                        ) : (
                            <span>共 {posts.length} 个帖子</span>
                        )}
                    </div>
                </div>

                {/* 搜索框 */}
                <div className="mb-6">
                    <div className="relative max-w-md mx-auto">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 pl-12 border border-orange-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black bg-opacity-50 text-white placeholder-gray-400"
                            placeholder={t.forum.searchPlaceholder}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">🔍</span>
                        </div>
                    </div>
                </div>

                {/* 帖子列表 */}
                <div className="space-y-4 mb-8">
                    {currentPosts.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-xl mb-4">
                                {searchTerm ? t.forum.noPosts : '暂无帖子'}
                            </div>
                            {!searchTerm && (
                                <Link
                                    href="/posts/new"
                                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                                >
                                    ✏️ {t.forum.newPost}
                                </Link>
                            )}
                        </div>
                    ) : (
                        currentPosts.map(post => (
                            <div
                                key={post.id}
                                className="bg-black bg-opacity-30 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-orange-500 hover:border-orange-400 transition-all transform hover:scale-105"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-white hover:text-orange-300 transition-colors">
                                        <Link href={`/posts/${post.id}`}>
                                            {post.title}
                                        </Link>
                                    </h3>
                                    <div className="text-sm text-gray-400">
                                        {formatTimeAgo(post.createdAt)}
                                    </div>
                                </div>
                                
                                <p className="text-gray-300 mb-4 line-clamp-3">
                                    {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                                </p>
                                
                                <div className="flex justify-between items-center text-sm text-gray-400">
                                    <span>{t.forum.post.author}: {post.author}</span>
                                    <span>💬 {post._count.comments} {t.forum.post.comments}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 分页控制 */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-8">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700 transition-colors"
                        >
                            {t.forum.pagination.previous}
                        </button>
                        
                        <span className="text-orange-200 px-4">
                            {t.forum.pagination.page} {currentPage} {t.forum.pagination.of} {totalPages} {t.forum.pagination.page}
                        </span>
                        
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700 transition-colors"
                        >
                            {t.forum.pagination.next}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
} 