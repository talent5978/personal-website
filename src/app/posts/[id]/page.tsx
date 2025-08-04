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
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link
            href="/posts"
            className="text-blue-500 hover:text-blue-600 flex items-center"
          >
            ← 返回帖子列表
          </Link>
        </div>

        {/* 帖子内容 */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{post.title}</h1>
          <div className="text-gray-600 text-sm mb-4">
            作者: {post.author} | 发布时间: {formatDate(post.createdAt)}
            {post.updatedAt !== post.createdAt && (
              <span> | 更新时间: {formatDate(post.updatedAt)}</span>
            )}
          </div>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </div>
        </div>

        {/* 留言区域 */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            留言 ({comments.length})
          </h2>

          {/* 留言表单 */}
          <form onSubmit={handleSubmitComment} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  昵称
                </label>
                <input
                  type="text"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入你的昵称"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                留言内容
              </label>
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入你的留言"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              发表留言
            </button>
          </form>

          {/* 留言列表 */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                暂无留言，快来发表第一条留言吧！
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-800">{comment.author}</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap">
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