'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Post {
  id: number
  title: string
  content: string
  author: string
  createdAt: string
  updatedAt: string
}

interface Comment {
  id: number
  content: string
  author: string
  createdAt: string
}

export default function PostDetail() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentContent, setCommentContent] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')
  const [loading, setLoading] = useState(true)

  // 获取帖子详情
  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
        setComments(data.comments)
      } else {
        alert('帖子不存在')
        router.push('/posts')
      }
    } catch (error) {
      console.error('获取帖子失败:', error)
      alert('获取帖子失败')
      router.push('/posts')
    } finally {
      setLoading(false)
    }
  }

  // 提交留言
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentContent.trim() || !commentAuthor.trim()) {
      alert('请填写完整信息')
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: commentContent, author: commentAuthor }),
      })

      if (response.ok) {
        setCommentContent('')
        setCommentAuthor('')
        fetchPost() // 重新获取帖子和评论
        alert('留言成功！')
      } else {
        alert('留言失败，请重试')
      }
    } catch (error) {
      console.error('留言失败:', error)
      alert('留言失败，请重试')
    }
  }

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-8">
            <div className="text-gray-500">加载中...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-8">
            <div className="text-gray-500">帖子不存在</div>
            <Link href="/posts" className="text-blue-500 hover:text-blue-600 mt-4 inline-block">
              返回帖子列表
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link
            href="/posts"
            className="text-blue-400 hover:text-blue-200 flex items-center text-lg font-bold"
          >
            ← 返回帖子列表
          </Link>
        </div>

        {/* 帖子内容 */}
        <div className="bg-black bg-opacity-80 border border-blue-500 p-8 rounded-2xl shadow-2xl mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
          <div className="text-blue-200 text-sm mb-4">
            作者: {post.author} | 发布时间: {formatDate(post.createdAt)}
            {post.updatedAt !== post.createdAt && (
              <span> | 更新时间: {formatDate(post.updatedAt)}</span>
            )}
          </div>
          <div className="text-blue-100 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </div>
        </div>

        {/* 留言区域 */}
        <div className="bg-black bg-opacity-70 border border-blue-500 p-8 rounded-2xl shadow-2xl mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            留言 <span className="text-blue-300">({comments.length})</span>
          </h2>

          {/* 留言表单 */}
          <form onSubmit={handleSubmitComment} className="mb-8 p-6 bg-black bg-opacity-40 rounded-xl border border-blue-400">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="w-full px-4 py-3 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black bg-opacity-50 text-white placeholder-gray-400"
                placeholder="请输入你的昵称"
                required
              />
            </div>
            <div className="mb-4">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black bg-opacity-50 text-white placeholder-gray-400"
                placeholder="请输入你的留言"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              发表留言
            </button>
          </form>

          {/* 留言列表 */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-blue-200">
                暂无留言，快来发表第一条留言吧！
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-blue-800 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-blue-100">{comment.author}</div>
                    <div className="text-sm text-blue-300">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                  <div className="text-blue-200 whitespace-pre-wrap">
                    {comment.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 