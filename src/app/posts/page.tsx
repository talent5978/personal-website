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
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [postsPerPage] = useState(5)

  // 获取帖子列表
  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
        setFilteredPosts(data)
      }
    } catch (error) {
      console.error('获取帖子失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 搜索功能
  useEffect(() => {
    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredPosts(filtered)
    setCurrentPage(1)
  }, [searchTerm, posts])

  // 分页功能
  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost)
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">💬 社区论坛</h1>
          <p className="text-blue-200">分享你的想法，与大家交流</p>
        </div>

        {/* 搜索框 */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black bg-opacity-50 text-white placeholder-gray-400"
              placeholder="搜索帖子标题、内容或作者..."
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>
        </div>

        {/* 发帖按钮 */}
        <div className="mb-6 text-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white ${showForm ? 'opacity-80' : ''}`}
          >
            {showForm ? '取消发帖' : '发布新帖子'}
          </button>
        </div>

        {/* 发帖表单 */}
        {showForm && (
          <div className="bg-black bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl mb-8 border border-blue-500">
            <h2 className="text-2xl font-bold text-white mb-6">📝 发布新帖子</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-3 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black bg-opacity-50 text-white placeholder-gray-400 mb-4"
                  placeholder="请输入你的昵称"
                  required
                />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black bg-opacity-50 text-white placeholder-gray-400 mb-4"
                  placeholder="请输入帖子标题"
                  required
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black bg-opacity-50 text-white placeholder-gray-400"
                  placeholder="请输入帖子内容"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  发布帖子
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 统计信息 */}
        <div className="mb-6 text-center">
          <p className="text-blue-200">
            共找到 {filteredPosts.length} 个帖子
            {searchTerm && ` (搜索: "${searchTerm}")`}
          </p>
        </div>

        {/* 帖子列表 */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-blue-200">加载中...</div>
            </div>
          ) : currentPosts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-blue-200">
                {searchTerm ? '没有找到匹配的帖子' : '暂无帖子，快来发布第一个帖子吧！'}
              </div>
            </div>
          ) : (
            currentPosts.map((post) => (
              <div key={post.id} className="bg-black bg-opacity-70 border border-blue-500 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      <Link href={`/posts/${post.id}`} className="hover:text-blue-400 transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-blue-200 text-sm">
                      作者: {post.author} | 发布时间: {formatDate(post.createdAt)}
                    </p>
                  </div>
                  <div className="text-sm text-blue-300">
                    {post._count?.comments || 0} 条评论
                  </div>
                </div>
                <p className="text-blue-100 line-clamp-3">
                  {post.content.length > 200
                    ? post.content.substring(0, 200) + '...'
                    : post.content
                  }
                </p>
                <div className="mt-4">
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-blue-400 hover:text-blue-200 text-sm font-medium"
                  >
                    查看详情 →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 分页控件 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              上一页
            </button>

            <span className="text-blue-200 px-4">
              第 {currentPage} 页，共 {totalPages} 页
            </span>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 