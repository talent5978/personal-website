'use client'

import React from 'react'

export default function About() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* 页面标题 */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        关于梦想家
                    </h1>
                    <p className="text-gray-300 text-xl max-w-3xl mx-auto">
                        深入了解我的技能、兴趣和成长历程
                    </p>
                </div>

                {/* 个人简介卡片 */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-2xl text-white mb-12">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-40 h-40 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-5xl font-bold overflow-hidden flex-shrink-0">
                            <img
                                src="/avatar.jpg"
                                alt="梦想家头像"
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (nextElement) {
                                        nextElement.style.display = 'flex';
                                    }
                                }}
                            />
                            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-4xl" style={{ display: 'none' }}>
                                梦
                            </div>
                        </div>

                        <div className="flex-1">
                            <h2 className="text-4xl font-bold mb-4">你好，我是 梦想家</h2>
                            <p className="text-xl opacity-90 mb-6">
                                全栈开发者 | 极限运动爱好者 | 乐器爱好者 | 摄影师
                            </p>

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-blue-200">🎯 我的标签</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            '🏃‍♂️ 运动达人', '💻 全栈开发', '🎵 乐器爱好者', '📷 摄影师',
                                            '🎮 游戏开发', '📚 终身学习', '🌍 探索者', '💡 创新者'
                                        ].map((tag, index) => (
                                            <span key={index} className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-green-200">🌟 我的理念</h3>
                                    <p className="text-sm opacity-90 leading-relaxed">
                                        相信技术改变世界，运动强健体魄，音乐治愈心灵。
                                        在代码的世界里创造价值，在运动的世界里挑战自我，
                                        在音乐的世界里寻找共鸣。
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <a href="https://www.xiaohongshu.com/user/profile/60c2f5420000000001002382?xsec_token=ABcIOnOiII5x4flIQclLvfQo01hE-o6JJrsS3VT6ieo7M%3D&xsec_source=pc_search" target="_blank" rel="noopener noreferrer" className="bg-white bg-opacity-20 px-6 py-3 rounded-lg hover:bg-opacity-30 transition-all flex items-center gap-2">
                                    <span className="text-xl">📱</span>
                                    <span>小红书 - 云彩收藏家</span>
                                </a>
                                <a href="https://www.douyin.com/user/MS4wLjABAAAAwmuEkqLL4u9UJvhNwwCDRxljoTyUpCQ6lmZTn7KpRWd_dcGvTbDJ83H2zU64UGMA?from_tab_name=main" target="_blank" rel="noopener noreferrer" className="bg-white bg-opacity-20 px-6 py-3 rounded-lg hover:bg-opacity-30 transition-all flex items-center gap-2">
                                    <span className="text-xl">🎵</span>
                                    <span>抖音 - 运动达人</span>
                                </a>
                                <a href="https://github.com/talent5978" target="_blank" rel="noopener noreferrer" className="bg-white bg-opacity-20 px-6 py-3 rounded-lg hover:bg-opacity-30 transition-all flex items-center gap-2">
                                    <span className="text-xl">💻</span>
                                    <span>GitHub - 代码仓库</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 运动技能展示 */}
                <div className="mb-12">
                    <div className="bg-black bg-opacity-30 backdrop-blur-sm p-6 rounded-xl border border-green-500">
                        <h3 className="text-2xl font-bold text-white mb-6">🏃‍♂️ 运动技能树</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-lg font-semibold text-green-300 mb-3">已掌握技能</h4>
                                <div className="space-y-3">
                                    {[
                                        { skill: '🎸 吉他指弹', level: 65 },
                                        { skill: '🎵 竹笛', level: 90 },
                                        { skill: '🏄‍♂️ 单板滑雪', level: 60 },
                                        { skill: '🏃‍♂️ 跑步', level: 80 },
                                        { skill: '🚴‍♂️ 骑行', level: 70 },
                                        { skill: '🏊‍♂️ 游泳', level: 70 },
                                        { skill: '🛹 滑板', level: 65 },
                                        { skill: '💪 健身', level: 80 }
                                    ].map((item, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between text-white mb-1">
                                                <span>{item.skill}</span>
                                                <span>{item.level}%</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                                                    style={{ width: `${item.level}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold text-orange-300 mb-3">学习中/想学的技能</h4>
                                <div className="space-y-3">
                                    {[
                                        { skill: '🎹 钢琴', level: 10 },
                                        { skill: '🤸‍♂️ 跑酷', level: 5 },
                                        { skill: '💃 街舞Breaking', level: 0 },
                                        { skill: '📈 理财投资', level: 20 },
                                        { skill: '🏔️ 重装徒步', level: 35 },
                                        { skill: '🏍️ 摩托车', level: 0 },
                                        { skill: '🛹 漂移板', level: 25 },
                                        { skill: '📷 摄影', level: 45 }
                                    ].map((item, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between text-white mb-1">
                                                <span>{item.skill}</span>
                                                <span>{item.level}%</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-1000"
                                                    style={{ width: `${item.level}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 兴趣标签云 */}
                <div className="mb-12">
                    <div className="bg-black bg-opacity-30 backdrop-blur-sm p-6 rounded-xl border border-purple-500">
                        <h3 className="text-2xl font-bold text-white mb-6">🏷️ 我的兴趣世界</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-lg font-semibold text-green-300 mb-3">🏃‍♂️ 运动类</h4>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        '🛹 滑板', '🏄‍♂️ 单板滑雪', '🏃‍♂️ 跑步', '🚴‍♂️ 骑行',
                                        '🏊‍♂️ 游泳', '🎿 轮滑', '🏓 台球', '💪 健身', '🏔️ 户外露营'
                                    ].map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm hover:scale-105 transition-transform cursor-pointer"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold text-blue-300 mb-3">🎵 音乐类</h4>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        '🎸 吉他指弹', '🎵 竹笛', '🎹 钢琴(学习中)', '🎤 音乐制作'
                                    ].map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm hover:scale-105 transition-transform cursor-pointer"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold text-purple-300 mb-3">💻 技术类</h4>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        '💻 全栈开发', '🤖 AI网页写作', '📱 移动开发', '🔧 电子DIY',
                                        '📚 技术学习', '📈 理财投资', '📷 摄影', '📖 读书'
                                    ].map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm hover:scale-105 transition-transform cursor-pointer"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 个人成就统计 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 rounded-lg text-white text-center">
                        <div className="text-2xl font-bold">16+</div>
                        <div className="text-sm opacity-90">运动项目</div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 rounded-lg text-white text-center">
                        <div className="text-2xl font-bold">2</div>
                        <div className="text-sm opacity-90">乐器掌握</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-lg text-white text-center">
                        <div className="text-2xl font-bold">3</div>
                        <div className="text-sm opacity-90">游戏开发</div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-lg text-white text-center">
                        <div className="text-2xl font-bold">∞</div>
                        <div className="text-sm opacity-90">学习热情</div>
                    </div>
                </div>

                {/* 个人座右铭 */}
                <div className="text-center">
                    <blockquote className="text-xl italic text-gray-300 max-w-2xl mx-auto mb-4">
                        "生命在于运动，代码改变世界，音乐治愈心灵"
                    </blockquote>
                    <cite className="text-gray-400">— 梦想家 (运动达人 & 全栈开发者)</cite>
                </div>
            </div>
        </div>
    )
}
