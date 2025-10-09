'use client';

import React, { useState } from 'react';
import { useGarden } from './GardenContext';
import PlantComponent from './Plant';
import PlantingModal from './PlantingModal';
import SeedCounter from './SeedCounter';

interface GardenProps {
    className?: string;
}

export default function Garden({ className = '' }: GardenProps) {
    const { gardenData, isLoading, error, earnNewSeed, tempUserId, refreshGarden } = useGarden();
    const [showPlantingModal, setShowPlantingModal] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState<any>(null);
    const [showTestPanel, setShowTestPanel] = useState(false);

    const handlePlantClick = (plant: any) => {
        setSelectedPlant(plant);
    };

    const handlePlantingClick = () => {
        setShowPlantingModal(true);
    };

    // 测试功能：获得种子
    const handleTestEarnSeed = async () => {
        await earnNewSeed('test');
    };

    // 测试功能：删除种子
    const handleTestDeleteSeed = async () => {
        if (gardenData && gardenData.userSeeds > 0) {
            // 直接通过API减少种子数量
            const response = await fetch('/api/garden', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tempUserId: tempUserId,
                    source: 'test_delete',
                    amount: -1 // 负数表示减少
                })
            });

            if (response.ok) {
                // 刷新花园数据
                await refreshGarden();
            }
        }
    };

    if (isLoading) {
        return (
            <div className={`bg-green-50 border border-green-200 rounded-lg p-6 ${className}`}>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-4xl mb-2 animate-pulse">🌱</div>
                        <div className="text-gray-600">花园加载中...</div>
                        <div className="text-sm text-gray-500 mt-2">首次加载可能需要几秒钟</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
                <div className="text-center">
                    <div className="text-4xl mb-2">❌</div>
                    <div className="text-red-600 mb-4">加载花园失败: {error}</div>
                    <button
                        onClick={() => refreshGarden()}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        重试
                    </button>
                </div>
            </div>
        );
    }

    const plants = gardenData?.plants || [];
    const userSeeds = gardenData?.userSeeds || 0;

    return (
        <div className={`bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-xl p-6 shadow-lg ${className}`}>
            {/* 花园头部 */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                        🌱 社区花园
                    </h3>
                    <p className="text-sm text-green-600 bg-white bg-opacity-50 px-3 py-1 rounded-full inline-block">
                        🌿 共有 {plants.length} 棵植物
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <SeedCounter />
                    <button
                        onClick={handlePlantingClick}
                        disabled={userSeeds === 0}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                        {userSeeds > 0 ? '🌱 种植植物' : '🌰 需要种子'}
                    </button>
                    <button
                        onClick={() => refreshGarden()}
                        className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        title="刷新花园数据"
                    >
                        🔄
                    </button>
                    {/* 测试按钮 */}
                    <button
                        onClick={() => setShowTestPanel(!showTestPanel)}
                        className="px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 text-xs font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                        title="测试功能"
                    >
                        🧪
                    </button>
                </div>
            </div>

            {/* 测试面板 */}
            {showTestPanel && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-md">
                    <h4 className="text-sm font-bold text-red-800 mb-3 flex items-center">
                        🧪 测试功能
                    </h4>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleTestEarnSeed}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-medium hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                            🌱 +1 种子
                        </button>
                        <button
                            onClick={handleTestDeleteSeed}
                            disabled={userSeeds === 0}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg text-xs font-medium hover:from-red-600 hover:to-pink-600 disabled:opacity-50 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                            🌰 -1 种子
                        </button>
                        <span className="text-xs text-red-600 self-center bg-white bg-opacity-50 px-3 py-2 rounded-lg">
                            💎 当前种子: {userSeeds}
                        </span>
                    </div>
                </div>
            )}

            {/* 花园区域 */}
            <div className="relative bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 border-2 border-green-300 rounded-2xl shadow-inner overflow-hidden" style={{ height: typeof window !== 'undefined' && window.innerWidth < 640 ? 320 : 440, minWidth: typeof window !== 'undefined' && window.innerWidth < 640 ? 340 : 520 }}>
                {/* 花园背景装饰 - 动态云朵 */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-2 left-4 w-12 h-6 bg-white rounded-full animate-pulse" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute top-6 right-6 w-8 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
                    <div className="absolute bottom-8 left-6 w-10 h-5 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
                    <div className="absolute bottom-4 right-2 w-6 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}></div>
                </div>

                {/* 花园背景装饰 - 浮动叶子 */}
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-4 left-4 w-8 h-8 bg-green-300 rounded-full animate-bounce" style={{ animationDuration: '2s' }}></div>
                    <div className="absolute top-8 right-8 w-6 h-6 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '2.5s' }}></div>
                    <div className="absolute bottom-6 left-8 w-4 h-4 bg-teal-300 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '3s' }}></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.2s' }}></div>
                    <div className="absolute top-12 left-12 w-5 h-5 bg-lime-300 rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }}></div>
                    <div className="absolute bottom-12 right-12 w-7 h-7 bg-green-200 rounded-full animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '3.2s' }}></div>
                </div>

                {/* 花园背景装饰 - 蝴蝶飞舞 */}
                <div className="absolute inset-0 opacity-60">
                    <div className="absolute top-6 left-8 text-2xl flutter-animation">🦋</div>
                    <div className="absolute top-12 right-12 text-xl flutter-animation" style={{ animationDelay: '1s' }}>🦋</div>
                    <div className="absolute bottom-8 left-12 text-lg flutter-animation" style={{ animationDelay: '2s' }}>🦋</div>
                    <div className="absolute bottom-12 right-6 text-xl flutter-animation" style={{ animationDelay: '1.5s' }}>🦋</div>
                </div>

                {/* 花园背景装饰 - 蜜蜂采蜜 */}
                <div className="absolute inset-0 opacity-50">
                    <div className="absolute top-10 left-6 text-lg buzz-animation">🐝</div>
                    <div className="absolute top-16 right-10 text-sm buzz-animation" style={{ animationDelay: '1s' }}>🐝</div>
                    <div className="absolute bottom-10 left-10 text-base buzz-animation" style={{ animationDelay: '2s' }}>🐝</div>
                </div>

                {/* 花园背景装饰 - 阳光照射 */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-2 right-2 text-3xl animate-spin" style={{ animationDuration: '8s' }}>☀️</div>
                    <div className="absolute top-4 right-4 text-2xl sparkle-animation">✨</div>
                    <div className="absolute top-6 right-6 text-xl sparkle-animation" style={{ animationDelay: '1s' }}>✨</div>
                    <div className="absolute top-8 right-8 text-lg sparkle-animation" style={{ animationDelay: '2s' }}>✨</div>
                </div>

                {/* 花园背景装饰 - 彩虹 */}
                <div className="absolute top-0 left-0 w-full h-2 rainbow-animation opacity-30"></div>

                {/* 花园背景装饰 - 浮动花瓣 */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-4 left-6 text-lg float-animation">🌸</div>
                    <div className="absolute top-8 right-8 text-base float-animation" style={{ animationDelay: '1s' }}>🌺</div>
                    <div className="absolute bottom-6 left-10 text-sm float-animation" style={{ animationDelay: '2s' }}>🌼</div>
                    <div className="absolute bottom-8 right-4 text-lg float-animation" style={{ animationDelay: '1.5s' }}>🌻</div>
                </div>

                {/* 花园背景装饰 - 小鸟 */}
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-3 left-12 text-lg flutter-animation">🐦</div>
                    <div className="absolute top-14 right-14 text-base flutter-animation" style={{ animationDelay: '2s' }}>🐦</div>
                    <div className="absolute bottom-4 left-16 text-sm flutter-animation" style={{ animationDelay: '1s' }}>🐦</div>
                </div>

                {plants.length === 0 ? (
                    <div className="flex items-center justify-center h-full relative z-10">
                        <div className="text-center text-gray-600 bg-white bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
                            <div className="text-6xl mb-4 animate-bounce">🌱</div>
                            <div className="text-xl font-semibold mb-2">花园还是空的</div>
                            <div className="text-lg mb-3">快来种下第一棵植物吧！</div>
                            <div className="text-sm text-gray-500 bg-green-100 px-4 py-2 rounded-full inline-block">
                                💡 发帖或评论可以获得种子
                            </div>
                        </div>
                    </div>
                ) : (
                    plants.map((plant) => (
                        <PlantComponent
                            key={plant.id}
                            plant={plant}
                            onClick={handlePlantClick}
                        />
                    ))
                )}
            </div>

            {/* 自定义CSS动画 */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    25% { transform: translateY(-10px) rotate(2deg); }
                    50% { transform: translateY(-5px) rotate(0deg); }
                    75% { transform: translateY(-15px) rotate(-2deg); }
                }
                
                @keyframes flutter {
                    0%, 100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
                    25% { transform: translateX(5px) translateY(-8px) rotate(5deg); }
                    50% { transform: translateX(-3px) translateY(-12px) rotate(-3deg); }
                    75% { transform: translateX(8px) translateY(-6px) rotate(3deg); }
                }
                
                @keyframes buzz {
                    0%, 100% { transform: translateX(0px) translateY(0px); }
                    25% { transform: translateX(2px) translateY(-1px); }
                    50% { transform: translateX(-1px) translateY(-2px); }
                    75% { transform: translateX(1px) translateY(-1px); }
                }
                
                @keyframes sparkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                
                @keyframes rainbow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                .float-animation {
                    animation: float 4s ease-in-out infinite;
                }
                
                .flutter-animation {
                    animation: flutter 6s ease-in-out infinite;
                }
                
                .buzz-animation {
                    animation: buzz 1.5s ease-in-out infinite;
                }
                
                .sparkle-animation {
                    animation: sparkle 2s ease-in-out infinite;
                }
                
                .rainbow-animation {
                    background: linear-gradient(-45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff);
                    background-size: 400% 400%;
                    animation: rainbow 3s ease infinite;
                }
            `}</style>

            {/* 植物信息弹窗 */}
            {selectedPlant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
                    <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-green-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                🌿 植物信息
                            </h3>
                            <button
                                onClick={() => setSelectedPlant(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl hover:scale-110 transition-transform"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4 bg-white bg-opacity-60 p-4 rounded-xl">
                                <span className="text-4xl">
                                    {selectedPlant.plantType === 'small_tree' && '🌱'}
                                    {selectedPlant.plantType === 'medium_tree' && '🌳'}
                                    {selectedPlant.plantType === 'large_tree' && '🌲'}
                                    {selectedPlant.plantType === 'rare_tree' && '🌸'}
                                </span>
                                <div>
                                    <div className="font-bold text-lg text-gray-800">{selectedPlant.plantName}</div>
                                    <div className="text-sm text-gray-600 bg-green-100 px-3 py-1 rounded-full inline-block">
                                        👤 种植者: {selectedPlant.ownerName}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="text-xs text-blue-600 font-medium">⏰ 种植时间</div>
                                    <div className="text-sm text-blue-800">{new Date(selectedPlant.plantedAt).toLocaleString()}</div>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded-lg">
                                    <div className="text-xs text-yellow-600 font-medium">🌰 消耗种子</div>
                                    <div className="text-sm text-yellow-800">{selectedPlant.score} 颗</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 种植弹窗 */}
            <PlantingModal
                isOpen={showPlantingModal}
                onClose={() => setShowPlantingModal(false)}
            />
        </div>
    );
}

