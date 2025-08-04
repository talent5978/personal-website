'use client'

import { useState, useEffect } from 'react'

interface Score {
    id: number
    playerName: string
    score: number
    gameType: string
    createdAt: string
}

export default function Leaderboard() {
    const [scores, setScores] = useState<Score[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')
    const [selectedGame, setSelectedGame] = useState<string>('all')

    useEffect(() => {
        fetchScores()
    }, [])

    const fetchScores = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/scores')

            if (response.ok) {
                const data = await response.json()
                setScores(data)
            } else {
                setError('获取排行榜失败')
            }
        } catch (error) {
            console.error('获取排行榜失败:', error)
            setError('获取排行榜失败')
        } finally {
            setLoading(false)
        }
    }

    const filteredScores = scores.filter(score => {
        if (selectedGame === 'all') return true
        return score.gameType === selectedGame
    })

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('zh-CN')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800 mb-4">排行榜</div>
                        <div className="text-gray-600">加载中...</div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800 mb-4">排行榜</div>
                        <div className="text-red-600 mb-4">{error}</div>
                        <button
                            onClick={fetchScores}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            重试
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">🏆 排行榜</h1>
                    <p className="text-gray-600 mb-6">看看谁是最强玩家！</p>

                    <div className="flex justify-center space-x-4 mb-6">
                        <button
                            onClick={() => setSelectedGame('all')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${selectedGame === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            全部游戏
                        </button>
                        <button
                            onClick={() => setSelectedGame('snake')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${selectedGame === 'snake'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            🐍 贪吃蛇
                        </button>
                        <button
                            onClick={() => setSelectedGame('survivor')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${selectedGame === 'survivor'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            ⚔️ 幸存者
                        </button>
                    </div>
                </div>

                {filteredScores.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-2xl text-gray-500 mb-4">暂无记录</div>
                        <p className="text-gray-600 mb-6">还没有人提交分数，快去玩游戏吧！</p>
                        <a
                            href="/game"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            开始游戏
                        </a>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                            <h2 className="text-2xl font-bold">最高分排行榜</h2>
                            <p className="text-blue-100">共 {filteredScores.length} 条记录</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            排名
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            玩家
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            分数
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            游戏类型
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            提交时间
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredScores.map((score, index) => (
                                        <tr key={score.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {index === 0 && (
                                                        <span className="text-2xl mr-2">🥇</span>
                                                    )}
                                                    {index === 1 && (
                                                        <span className="text-2xl mr-2">🥈</span>
                                                    )}
                                                    {index === 2 && (
                                                        <span className="text-2xl mr-2">🥉</span>
                                                    )}
                                                    <span className={`font-semibold ${index === 0 ? 'text-yellow-600' :
                                                        index === 1 ? 'text-gray-500' :
                                                            index === 2 ? 'text-orange-600' : 'text-gray-900'
                                                        }`}>
                                                        #{index + 1}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {score.playerName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-blue-600">
                                                    {score.score}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {score.gameType === 'snake' ? '🐍 贪吃蛇' : '⚔️ 幸存者'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(score.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <button
                        onClick={fetchScores}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors mr-4"
                    >
                        刷新排行榜
                    </button>
                    <a
                        href="/game"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        开始新游戏
                    </a>
                </div>
            </div>
        </div>
    )
} 