'use client'

import React from 'react'

async function api<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
}

export default function BottlesPage() {
    const [throwAuthor, setThrowAuthor] = React.useState('')
    const [throwContent, setThrowContent] = React.useState('')
    const [fished, setFished] = React.useState<any>(null)
    const [replyAuthor, setReplyAuthor] = React.useState('')
    const [replyContent, setReplyContent] = React.useState('')
    const [loading, setLoading] = React.useState(false)

    const handleThrow = async () => {
        if (!throwAuthor.trim() || !throwContent.trim()) {
            alert('请填写作者与内容');
            return;
        }
        setLoading(true)
        try {
            await api('/api/bottles', { method: 'POST', body: JSON.stringify({ author: throwAuthor.trim(), content: throwContent.trim() }) })
            setThrowContent('')
            alert('已扔出一个漂流瓶！')
        } catch (e: any) {
            alert(e.message || '扔瓶子失败')
        } finally {
            setLoading(false)
        }
    }

    const handleFish = async () => {
        setLoading(true)
        try {
            const data = await api<any>('/api/bottles')
            setFished(data)
            setReplyAuthor('')
            setReplyContent('')
        } catch (e: any) {
            alert(e.message || '捞瓶子失败')
        } finally {
            setLoading(false)
        }
    }

    const handleReply = async () => {
        if (!fished?.id) return
        if (!replyAuthor.trim() || !replyContent.trim()) {
            alert('请填写回复作者与内容');
            return;
        }
        setLoading(true)
        try {
            const data = await api<any>('/api/bottles', { method: 'PUT', body: JSON.stringify({ bottleId: fished.id, author: replyAuthor.trim(), content: replyContent.trim() }) })
            setFished(data)
            setReplyAuthor('')
            setReplyContent('')
            alert('回复已写入，并把瓶子重新扔回海里！')
        } catch (e: any) {
            alert(e.message || '回复失败')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 py-8">
            <div className="max-w-4xl mx-auto px-4 space-y-8">
                <div className="text-center mb-2">
                    <h1 className="text-4xl font-bold text-white">🥤 漂流瓶</h1>
                    <p className="text-indigo-200 mt-2">扔一个瓶子，或者捞起一只别人的瓶子，写下你的续言</p>
                </div>

                {/* 扔瓶子 */}
                <div className="bg-black bg-opacity-30 border border-cyan-500 rounded-xl p-6">
                    <h2 className="text-cyan-200 font-semibold mb-3">扔一个瓶子</h2>
                    <div className="grid gap-3">
                        <input value={throwAuthor} onChange={e => setThrowAuthor(e.target.value)} placeholder="你的名字" className="px-3 py-2 rounded bg-black bg-opacity-40 border border-cyan-600 text-white" maxLength={50} />
                        <textarea value={throwContent} onChange={e => setThrowContent(e.target.value)} placeholder="写下一个问题或一段话..." className="px-3 py-2 rounded bg-black bg-opacity-40 border border-cyan-600 text-white" rows={4} maxLength={2000} />
                        <button onClick={handleThrow} disabled={loading} className="self-start px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50">{loading ? '提交中...' : '扔进海里'}</button>
                    </div>
                </div>

                {/* 捞瓶子 */}
                <div className="bg-black bg-opacity-30 border border-indigo-500 rounded-xl p-6">
                    <h2 className="text-indigo-200 font-semibold mb-3">捞一只瓶子</h2>
                    <button onClick={handleFish} disabled={loading} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50">{loading ? '捞取中...' : '开始捞'}</button>

                    {fished && (
                        <div className="mt-4 space-y-3">
                            <div className="text-indigo-100 text-sm">编号 #{fished.id}</div>
                            <div className="bg-white bg-opacity-5 border border-indigo-400 rounded p-3 space-y-2">
                                {fished.messages?.map((m: any, idx: number) => (
                                    <div key={m.id || idx} className="text-white">
                                        <div className="text-xs text-indigo-300">{m.author} · {new Date(m.createdAt).toLocaleString()}</div>
                                        <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid gap-2">
                                <input value={replyAuthor} onChange={e => setReplyAuthor(e.target.value)} placeholder="你的名字" className="px-3 py-2 rounded bg-black bg-opacity-40 border border-indigo-600 text-white" maxLength={50} />
                                <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="写下你的回复..." className="px-3 py-2 rounded bg-black bg-opacity-40 border border-indigo-600 text-white" rows={3} maxLength={2000} />
                                <button onClick={handleReply} disabled={loading} className="self-start px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50">{loading ? '提交中...' : '回复并重新扔回海里'}</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
