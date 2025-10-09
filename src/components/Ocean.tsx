'use client';

import React, { useState, useEffect, useRef } from 'react';

interface BottleMessage {
    id: number;
    author: string;
    content: string;
    createdAt: string;
}

interface Bottle {
    id: number;
    x: number;
    y: number;
    messages: BottleMessage[];
    createdAt: string;
    color: string;
    animationDelay: number;
}

interface OceanProps {
    className?: string;
}

export default function Ocean({ className = '' }: OceanProps) {
    const [bottles, setBottles] = useState<Bottle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBottle, setSelectedBottle] = useState<Bottle | null>(null);
    const [showBottleModal, setShowBottleModal] = useState(false);
    const [showThrowModal, setShowThrowModal] = useState(false);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [throwAuthor, setThrowAuthor] = useState('');
    const [throwContent, setThrowContent] = useState('');
    const [replyAuthor, setReplyAuthor] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const oceanRef = useRef<HTMLDivElement>(null);

    // 加载漂流瓶数据
    useEffect(() => {
        const loadBottles = async () => {
            try {
                // 获取多个漂流瓶
                const bottlePromises = Array.from({ length: 5 }, () => fetch('/api/bottles'));
                const responses = await Promise.all(bottlePromises);
                const bottlesData = await Promise.all(responses.map(res => res.json()));

                const validBottles = bottlesData.filter(bottle => bottle && bottle.id);
                const bottlesWithPositions = validBottles.map((bottle: any, index: number) => ({
                    ...bottle,
                    x: Math.random() * 80 + 10, // 10-90% 的随机位置
                    y: Math.random() * 60 + 20, // 20-80% 的随机位置
                    color: ['blue', 'green', 'purple', 'pink', 'amber'][index % 5], // 不同颜色的玻璃瓶
                    animationDelay: Math.random() * 3, // 0-3秒的随机延迟
                }));
                setBottles(bottlesWithPositions);
            } catch (error) {
                console.error('加载漂流瓶失败:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadBottles();
    }, []);

    // 处理瓶子点击
    const handleBottleClick = (bottle: Bottle) => {
        setSelectedBottle(bottle);
        setShowBottleModal(true);
    };

    // 关闭瓶子弹窗
    const closeBottleModal = () => {
        setShowBottleModal(false);
        setSelectedBottle(null);
    };

    // 扔漂流瓶
    const handleThrowBottle = async () => {
        if (!throwAuthor.trim() || !throwContent.trim()) {
            alert('请填写作者和内容');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/bottles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    author: throwAuthor.trim(),
                    content: throwContent.trim(),
                }),
            });

            if (response.ok) {
                alert('漂流瓶已扔出！');
                setThrowAuthor('');
                setThrowContent('');
                setShowThrowModal(false);
                // 重新加载漂流瓶
                window.location.reload();
            } else {
                alert('扔漂流瓶失败，请重试');
            }
        } catch (error) {
            console.error('扔漂流瓶失败:', error);
            alert('扔漂流瓶失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 回复漂流瓶
    const handleReplyBottle = async () => {
        if (!replyAuthor.trim() || !replyContent.trim() || !selectedBottle) {
            alert('请填写作者和内容');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/bottles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bottleId: selectedBottle.id,
                    author: replyAuthor.trim(),
                    content: replyContent.trim(),
                }),
            });

            if (response.ok) {
                alert('回复已发送！');
                setReplyAuthor('');
                setReplyContent('');
                setShowReplyModal(false);
                // 重新加载漂流瓶
                window.location.reload();
            } else {
                alert('回复失败，请重试');
            }
        } catch (error) {
            console.error('回复失败:', error);
            alert('回复失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className={`bg-gradient-to-b from-blue-400 to-blue-600 rounded-xl p-6 ${className}`}>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center text-white">
                        <div className="text-4xl mb-2 animate-pulse">🌊</div>
                        <div>海洋加载中...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-gradient-to-b from-blue-400 to-blue-600 rounded-xl p-6 ${className}`}>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">🌊 漂流瓶海洋</h2>
                <p className="text-blue-100 mb-4">点击漂流瓶查看消息，也可以扔出你的漂流瓶</p>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => setShowThrowModal(true)}
                        className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all text-sm font-medium shadow-lg hover:shadow-xl"
                    >
                        🥤 扔漂流瓶
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all text-sm"
                    >
                        🔄 刷新海洋
                    </button>
                </div>
            </div>

            {/* 海洋区域 */}
            <div
                ref={oceanRef}
                className="relative bg-gradient-to-b from-blue-300 to-blue-500 rounded-lg h-80 overflow-hidden border-2 border-blue-200"
                style={{ minHeight: '320px' }}
            >
                {/* 海浪动画背景 */}
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
                    <div className="absolute top-4 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-200 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-8 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-100 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-12 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-50 to-transparent animate-pulse" style={{ animationDelay: '3s' }}></div>
                </div>

                {/* 海鸟装饰 */}
                <div className="absolute top-4 right-8 text-white opacity-60 animate-bounce" style={{ animationDelay: '2s' }}>
                    🕊️
                </div>
                <div className="absolute top-8 right-16 text-white opacity-40 animate-bounce" style={{ animationDelay: '4s' }}>
                    🕊️
                </div>

                {/* 漂流瓶 */}
                {bottles.map((bottle) => (
                    <div
                        key={bottle.id}
                        className="absolute cursor-pointer transform hover:scale-110 transition-all duration-300"
                        style={{
                            left: `${bottle.x}%`,
                            top: `${bottle.y}%`,
                            animation: `float ${3 + bottle.animationDelay}s ease-in-out infinite`,
                            animationDelay: `${bottle.animationDelay}s`,
                        }}
                        onClick={() => handleBottleClick(bottle)}
                        title="点击查看漂流瓶"
                    >
                        <div className="relative" style={{ transform: `rotate(${Math.random() * 20 - 10}deg)` }}>
                            {/* 玻璃瓶 - 只显示上半部分，像在水面漂浮 */}
                            <div className="w-6 h-16 relative">
                                {/* 水下部分 - 瓶身下半部分 */}
                                <div className={`absolute bottom-0 left-0 w-full h-8 rounded-full border border-white border-opacity-30 shadow-lg backdrop-blur-sm ${bottle.color === 'blue' ? 'bg-gradient-to-b from-blue-200 via-blue-300 to-blue-400' :
                                    bottle.color === 'green' ? 'bg-gradient-to-b from-green-200 via-green-300 to-green-400' :
                                        bottle.color === 'purple' ? 'bg-gradient-to-b from-purple-200 via-purple-300 to-purple-400' :
                                            bottle.color === 'pink' ? 'bg-gradient-to-b from-pink-200 via-pink-300 to-pink-400' :
                                                'bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400'
                                    }`}>
                                    {/* 水下玻璃反光效果 */}
                                    <div className="absolute top-1 left-1 w-2 h-4 bg-white bg-opacity-20 rounded-full blur-sm"></div>
                                </div>

                                {/* 水面线 - 波浪效果 */}
                                <div className="absolute top-8 left-0 w-full h-1 overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60">
                                        <div className="absolute top-0 left-0 w-full h-0.5 bg-white rounded-full animate-pulse"></div>
                                        <div className="absolute top-0.5 left-1 w-4 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                                        <div className="absolute top-0 left-3 w-2 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                                    </div>
                                </div>

                                {/* 水上部分 - 瓶身上半部分 */}
                                <div className={`absolute top-0 left-0 w-full h-8 rounded-full border border-white border-opacity-50 shadow-lg backdrop-blur-sm ${bottle.color === 'blue' ? 'bg-gradient-to-b from-blue-100 via-transparent to-blue-200' :
                                    bottle.color === 'green' ? 'bg-gradient-to-b from-green-100 via-transparent to-green-200' :
                                        bottle.color === 'purple' ? 'bg-gradient-to-b from-purple-100 via-transparent to-purple-200' :
                                            bottle.color === 'pink' ? 'bg-gradient-to-b from-pink-100 via-transparent to-pink-200' :
                                                'bg-gradient-to-b from-amber-100 via-transparent to-amber-200'
                                    }`}>
                                    {/* 水上玻璃反光效果 */}
                                    <div className="absolute top-1 left-1 w-2 h-4 bg-white bg-opacity-30 rounded-full blur-sm"></div>
                                    <div className="absolute top-2 left-2 w-1 h-3 bg-white bg-opacity-50 rounded-full"></div>
                                </div>

                                {/* 瓶口 */}
                                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-3 bg-gradient-to-b from-amber-200 to-amber-300 rounded-full border border-amber-400 shadow-md">
                                    <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-amber-100 rounded-full"></div>
                                </div>

                                {/* 瓶塞 */}
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full border border-amber-700 shadow-lg">
                                    <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-0.5 bg-amber-200 rounded-full"></div>
                                </div>

                                {/* 瓶内纸条 - 只在水上部分可见 */}
                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-6 bg-yellow-50 border border-yellow-200 rounded-sm shadow-inner">
                                    <div className="absolute top-0.5 left-0.5 w-2 h-0.5 bg-yellow-300 rounded-sm"></div>
                                    <div className="absolute top-1 left-0.5 w-1.5 h-0.5 bg-yellow-300 rounded-sm"></div>
                                    <div className="absolute top-1.5 left-0.5 w-2 h-0.5 bg-yellow-300 rounded-sm"></div>
                                </div>

                                {/* 水波纹效果 */}
                                <div className="absolute top-7 left-1/2 transform -translate-x-1/2 w-8 h-2 opacity-40">
                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-white rounded-full animate-pulse"></div>
                                    <div className="absolute top-1 left-1 w-6 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* 如果没有漂流瓶 */}
                {bottles.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="text-4xl mb-2">🌊</div>
                            <div className="text-lg">海洋很平静，还没有漂流瓶</div>
                            <div className="text-sm opacity-80 mt-2">
                                <a href="/bottles" className="underline hover:no-underline">
                                    去扔一个漂流瓶吧
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 漂流瓶详情弹窗 */}
            {showBottleModal && selectedBottle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">🥤 漂流瓶</h3>
                            <button
                                onClick={closeBottleModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="text-sm text-blue-600 mb-2">
                                    漂流瓶 #{selectedBottle.id} - {selectedBottle.messages.length} 条消息
                                </div>
                                <div className="space-y-3">
                                    {selectedBottle.messages.map((message, index) => (
                                        <div key={message.id} className="border-l-2 border-blue-300 pl-3">
                                            <div className="text-sm font-medium text-blue-800 mb-1">
                                                {message.author}
                                            </div>
                                            <div className="text-gray-800 leading-relaxed">
                                                {message.content}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {new Date(message.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="text-sm text-gray-500">
                                漂流时间：{new Date(selectedBottle.createdAt).toLocaleString()}
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={closeBottleModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    关闭
                                </button>
                                <button
                                    onClick={() => {
                                        setShowBottleModal(false);
                                        setShowReplyModal(true);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600"
                                >
                                    💬 回复
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 扔漂流瓶弹窗 */}
            {showThrowModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                🥤 扔漂流瓶
                            </h3>
                            <button
                                onClick={() => setShowThrowModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl hover:scale-110 transition-transform"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    你的名字
                                </label>
                                <input
                                    type="text"
                                    value={throwAuthor}
                                    onChange={(e) => setThrowAuthor(e.target.value)}
                                    placeholder="输入你的名字"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    漂流瓶内容
                                </label>
                                <textarea
                                    value={throwContent}
                                    onChange={(e) => setThrowContent(e.target.value)}
                                    placeholder="写下你想说的话..."
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => setShowThrowModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleThrowBottle}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
                            >
                                {isSubmitting ? '扔出中...' : '🥤 扔出漂流瓶'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 回复漂流瓶弹窗 */}
            {showReplyModal && selectedBottle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                💬 回复漂流瓶
                            </h3>
                            <button
                                onClick={() => setShowReplyModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl hover:scale-110 transition-transform"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="text-sm text-blue-600 mb-1">回复漂流瓶 #{selectedBottle.id}</div>
                                <div className="text-xs text-gray-500">
                                    已有 {selectedBottle.messages.length} 条消息
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    你的名字
                                </label>
                                <input
                                    type="text"
                                    value={replyAuthor}
                                    onChange={(e) => setReplyAuthor(e.target.value)}
                                    placeholder="输入你的名字"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    回复内容
                                </label>
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="写下你的回复..."
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => setShowReplyModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleReplyBottle}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
                            >
                                {isSubmitting ? '发送中...' : '💬 发送回复'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    25% { transform: translateY(-10px) rotate(1deg); }
                    50% { transform: translateY(-5px) rotate(0deg); }
                    75% { transform: translateY(-15px) rotate(-1deg); }
                }
            `}</style>
        </div>
    );
}
