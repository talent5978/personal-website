'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Post {
  id: number
  title: string
  content: string
  author: string
  createdAt: string
  _count?: {
    comments: number
  }
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [loading, setLoading] = useState(true)

  // 获取帖子列表
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

  // 提交新帖子
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !author.trim()) {
      alert('请填写完整信息')
      return
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, author }),
      })

      if (response.ok) {
        setTitle('')
        setContent('')
        setAuthor('')
        setShowForm(false)
        fetchPosts() // 重新获取帖子列表
        alert('发帖成功！')
      } else {
        alert('发帖失败，请重试')
      }
    } catch (error) {
      console.error('发帖失败:', error)
      alert('发帖失败，请重试')
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">社区论坛</h1>
          <p className="text-gray-600">分享你的想法，与大家交流</p>
        </div>

        {/* 发帖按钮 */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {showForm ? '取消发帖' : '发布新帖子'}
          </button>
        </div>

        {/* 发帖表单 */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-4">发布新帖子</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  昵称
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入你的昵称"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入帖子标题"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  内容
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入帖子内容"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  发布帖子
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 帖子列表 */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">加载中...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">暂无帖子，快来发布第一个帖子吧！</div>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      <Link href={`/posts/${post.id}`} className="hover:text-blue-600 transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm">
                      作者: {post.author} | 发布时间: {formatDate(post.createdAt)}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {post._count?.comments || 0} 条评论
                  </div>
                </div>
                <p className="text-gray-700 line-clamp-3">
                  {post.content.length > 200 
                    ? post.content.substring(0, 200) + '...' 
                    : post.content
                  }
                </p>
                <div className="mt-4">
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    查看详情 →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 