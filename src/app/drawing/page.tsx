'use client'

import React from 'react'
import DrawingWall from '@/components/DrawingWall'

export default function DrawingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* 页面标题 */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                        🎨 公共涂鸦墙
                    </h1>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        在这里与全世界的朋友一起创作！你的每一笔都会被保存，让创意永远流传。
                    </p>
                </div>

                {/* 涂鸦墙组件 */}
                <DrawingWall className="max-w-4xl mx-auto" />

                {/* 使用说明 */}
                <div className="mt-12 max-w-4xl mx-auto">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-xl text-white">
                        <h3 className="text-xl font-bold mb-4">🎯 使用说明</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2">🖌️ 绘画工具</h4>
                                <ul className="text-sm space-y-1">
                                    <li>• 选择颜色和笔刷大小</li>
                                    <li>• 使用画笔进行绘画</li>
                                    <li>• 使用橡皮擦清除内容</li>
                                    <li>• 支持鼠标和触摸操作</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">💡 功能特色</h4>
                                <ul className="text-sm space-y-1">
                                    <li>• 实时保存你的作品</li>
                                    <li>• 所有用户共享画布</li>
                                    <li>• 移动端完美适配</li>
                                    <li>• 支持清空重新开始</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 创作理念 */}
                <div className="mt-8 max-w-4xl mx-auto">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 rounded-xl text-white">
                        <h3 className="text-xl font-bold mb-4">🌟 创作理念</h3>
                        <p className="text-sm leading-relaxed">
                            这是一个没有界限的创作空间，每个人都可以在这里留下自己的印记。
                            无论是简单的涂鸦还是复杂的艺术作品，每一笔都承载着创作者的想象和情感。
                            让我们一起在这个数字画布上创造属于我们的故事！
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
