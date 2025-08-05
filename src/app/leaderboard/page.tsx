'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/components/LanguageProvider'

interface Score {
    id: number
    playerName: string
    score: number
    gameType: string
    createdAt: string
}

export default function Leaderboard() {
    const { t } = useLanguage()
    const [scores, setScores] = useState<Score[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedGame, setSelectedGame] = useState<'all' | 'snake' | 'survivor'>('all')

    useEffect(() => {
        fetchScores()
    }, [])

    const fetchScores = async () => {
        try {
            const response = await fetch('/api/scores')
            if (response.ok) {
                const data = await response.json()
                setScores(data)
            }
        } catch (error) {
            console.error('获取排行榜失败:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredScores = scores.filter(score => {
        if (selectedGame === 'all') return true
        return score.gameType === selectedGame
    })

    const getGameIcon = (gameType: string) => {
        switch (gameType) {
            case 'snake':
                return '🐍'
            case 'survivor':
                return '⚔️'
            default:
                return '🎮'
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center">
                        <div className="text-white text-xl">{t.common.loading}</div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {t.leaderboard.title}
                    </h1>
                </div>

                <div className="flex justify-center space-x-4 mb-6">
                    <button
                        onClick={() => setSelectedGame('all')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            selectedGame === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {t.leaderboard.allGames}
                    </button>
                    <button
                        onClick={() => setSelectedGame('snake')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            selectedGame === 'snake'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {t.leaderboard.snake}
                    </button>
                    <button
                        onClick={() => setSelectedGame('survivor')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            selectedGame === 'survivor'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {t.leaderboard.survivor}
                    </button>
                </div>

                <div className="bg-black bg-opacity-30 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-blue-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-white">
                            <thead>
                                <tr className="border-b border-blue-600">
                                    <th className="text-left py-3 px-4">{t.leaderboard.rank}</th>
                                    <th className="text-left py-3 px-4">{t.leaderboard.player}</th>
                                    <th className="text-left py-3 px-4">{t.leaderboard.score}</th>
                                    <th className="text-left py-3 px-4">{t.leaderboard.gameType}</th>
                                    <th className="text-left py-3 px-4">{t.leaderboard.date}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredScores.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-400">
                                            暂无数据
                                        </td>
                                    </tr>
                                ) : (
                                    filteredScores.map((score, index) => (
                                        <tr key={score.id} className="border-b border-blue-800 hover:bg-blue-900 hover:bg-opacity-30 transition-colors">
                                            <td className="py-3 px-4">
                                                <span className={`inline-block w-8 h-8 rounded-full text-center leading-8 font-bold ${
                                                    index === 0 ? 'bg-yellow-500 text-black' :
                                                    index === 1 ? 'bg-gray-400 text-black' :
                                                    index === 2 ? 'bg-orange-600 text-white' :
                                                    'bg-blue-600 text-white'
                                                }`}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-semibold">{score.playerName}</td>
                                            <td className="py-3 px-4 text-yellow-400 font-bold">{score.score}</td>
                                            <td className="py-3 px-4">
                                                <span className="text-2xl">{getGameIcon(score.gameType)}</span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-300">{formatDate(score.createdAt)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
} 