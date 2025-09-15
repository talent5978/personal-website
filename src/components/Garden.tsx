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
                        <div className="text-4xl mb-2">🌱</div>
                        <div className="text-gray-600">花园加载中...</div>
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
                    <div className="text-red-600">加载花园失败: {error}</div>
                </div>
            </div>
        );
    }

    const plants = gardenData?.plants || [];
    const userSeeds = gardenData?.userSeeds || 0;

    return (
        <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
            {/* 花园头部 */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-bold text-green-800">社区花园</h3>
                    <p className="text-sm text-green-600">
                        共有 {plants.length} 棵植物
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <SeedCounter />
                    <button
                        onClick={handlePlantingClick}
                        disabled={userSeeds === 0}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {userSeeds > 0 ? '种植植物' : '需要种子'}
                    </button>
                    {/* 测试按钮 */}
                    <button
                        onClick={() => setShowTestPanel(!showTestPanel)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        title="测试功能"
                    >
                        🧪
                    </button>
                </div>
            </div>

            {/* 测试面板 */}
            {showTestPanel && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-bold text-red-800 mb-2">🧪 测试功能</h4>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleTestEarnSeed}
                            className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                        >
                            +1 种子
                        </button>
                        <button
                            onClick={handleTestDeleteSeed}
                            disabled={userSeeds === 0}
                            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 disabled:opacity-50"
                        >
                            -1 种子
                        </button>
                        <span className="text-xs text-red-600 self-center">
                            当前种子: {userSeeds}
                        </span>
                    </div>
                </div>
            )}

            {/* 花园区域 */}
            <div className="relative bg-white border border-green-300 rounded-lg" style={{ height: typeof window !== 'undefined' && window.innerWidth < 640 ? 280 : 400, minWidth: typeof window !== 'undefined' && window.innerWidth < 640 ? 320 : 500, overflow: 'hidden' }}>
                {plants.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                            <div className="text-4xl mb-2">🌱</div>
                            <div>花园还是空的，快来种下第一棵植物吧！</div>
                            <div className="text-sm mt-1">
                                发帖或评论可以获得种子
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

            {/* 植物信息弹窗 */}
            {selectedPlant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">植物信息</h3>
                            <button
                                onClick={() => setSelectedPlant(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">
                                    {selectedPlant.plantType === 'small_tree' && '🌱'}
                                    {selectedPlant.plantType === 'medium_tree' && '🌳'}
                                    {selectedPlant.plantType === 'large_tree' && '🌲'}
                                    {selectedPlant.plantType === 'rare_tree' && '🌸'}
                                </span>
                                <div>
                                    <div className="font-medium">{selectedPlant.plantName}</div>
                                    <div className="text-sm text-gray-500">
                                        种植者: {selectedPlant.ownerName}
                                    </div>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                种植时间: {new Date(selectedPlant.plantedAt).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">
                                消耗种子: {selectedPlant.score} 颗
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
