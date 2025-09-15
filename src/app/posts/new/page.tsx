'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'
import { getOrCreateTempUserId } from '@/lib/garden'
import SeedEarnedAnimation from '@/components/SeedEarnedAnimation'

export default function NewPost() {
    const { t } = useLanguage()
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [author, setAuthor] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSeedAnimation, setShowSeedAnimation] = useState(false)
    const [emoji, setEmoji] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim() || !content.trim() || !author.trim()) {
            alert('请填写完整信息')
            return
        }

        if (title.length > 100) {
            alert('标题不能超过100个字符')
            return
        }

        if (content.length > 5000) {
            alert('内容不能超过5000个字符')
            return
        }

        if (author.length > 50) {
            alert('昵称不能超过50个字符')
            return
        }

        setIsSubmitting(true)

        try {
            const tempUserId = getOrCreateTempUserId();
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    author: author.trim(),
                    tempUserId: tempUserId,
                    emoji: emoji.trim()
                }),
            })

            if (response.ok) {
                const newPost = await response.json()
                if (newPost.seedEarned) {
                    setShowSeedAnimation(true)
                    setTimeout(() => {
                        alert('帖子发布成功！')
                        router.push(`/posts/${newPost.id}`)
                    }, 2500)
                } else {
                    alert('帖子发布成功！')
                    router.push(`/posts/${newPost.id}`)
                }
            } else {
                let serverMsg = '发布失败，请重试'
                try {
                    const error = await response.json()
                    serverMsg = error?.error || serverMsg
                } catch (e) {
                    try {
                        const text = await response.text()
                        if (text) serverMsg = text
                    } catch { }
                }
                console.error('发布帖子失败(服务端返回):', serverMsg)
                alert(serverMsg)
            }
        } catch (error) {
            console.error('发布帖子失败:', error)
            alert('发布失败，请重试')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        ✏️ 发布新帖子
                    </h1>
                    <p className="text-gray-300 text-lg">
                        分享你的想法，与社区互动
                    </p>
                </div>

                <div className="bg-black bg-opacity-30 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-orange-500">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 标题输入 */}
                        <div>
                            <label htmlFor="title" className="block text-white text-lg font-semibold mb-2">
                                标题 <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 border border-orange-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black bg-opacity-50 text-white placeholder-gray-400"
                                placeholder="请输入帖子标题..."
                                maxLength={100}
                                required
                            />
                            <div className="text-right text-gray-400 text-sm mt-1">
                                {title.length}/100
                            </div>
                        </div>

                        {/* 作者输入 */}
                        <div>
                            <label htmlFor="author" className="block text-white text-lg font-semibold mb-2">
                                昵称 <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                id="author"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                className="w-full px-4 py-3 border border-orange-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black bg-opacity-50 text-white placeholder-gray-400"
                                placeholder="请输入你的昵称..."
                                maxLength={50}
                                required
                            />
                            <div className="text-right text-gray-400 text-sm mt-1">
                                {author.length}/50
                            </div>
                        </div>

                        {/* 内容输入 */}
                        <div>
                            <label htmlFor="content" className="block text-white text-lg font-semibold mb-2">
                                内容 <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={12}
                                className="w-full px-4 py-3 border border-orange-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black bg-opacity-50 text-white placeholder-gray-400 resize-none"
                                placeholder="请输入帖子内容..."
                                maxLength={5000}
                                required
                            />
                            <div className="text-right text-gray-400 text-sm mt-1">
                                {content.length}/5000
                            </div>
                        </div>

                        {/* Emoji 选择 */}
                        <div>
                            <label htmlFor="emoji" className="block text-white text-lg font-semibold mb-2">
                                帖子 Emoji（可选）
                            </label>
                            <input
                                type="text"
                                id="emoji"
                                value={emoji}
                                onChange={(e) => setEmoji(e.target.value)}
                                className="w-full max-w-xs px-4 py-3 border border-orange-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black bg-opacity-50 text-white placeholder-gray-400"
                                placeholder="例如：🌸 🎮 🧠"
                                maxLength={4}
                            />
                            <div className="text-gray-400 text-sm mt-1">选择一个代表帖子的表情，留空则默认 📝</div>
                        </div>

                        {/* 按钮组 */}
                        <div className="flex justify-between items-center pt-6">
                            <Link
                                href="/posts"
                                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                            >
                                ← 返回列表
                            </Link>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? '发布中...' : '🚀 发布帖子'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* 发布须知 */}
                <div className="mt-8 bg-blue-900 bg-opacity-30 border border-blue-500 p-6 rounded-xl">
                    <h3 className="text-blue-300 text-lg font-semibold mb-3">📝 发布须知</h3>
                    <ul className="text-gray-300 space-y-2 text-sm">
                        <li>• 请确保内容健康向上，不包含违法违规信息</li>
                        <li>• 标题应简洁明了，准确概括帖子内容</li>
                        <li>• 内容应详细描述你的想法或问题</li>
                        <li>• 发布后可以随时编辑或删除你的帖子</li>
                        <li>• 社区成员可以对你的帖子进行评论和互动</li>
                        <li className="text-green-300">🌱 发布帖子可以获得5颗种子，用于在社区花园种植植物！</li>
                    </ul>
                </div>
            </div>

            {/* 种子获得动画 */}
            <SeedEarnedAnimation
                show={showSeedAnimation}
                onComplete={() => setShowSeedAnimation(false)}
                amount={5}
            />
        </div>
    )
}