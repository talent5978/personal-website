'use client';

import React, { useState } from 'react';
import { useGarden } from './GardenContext';
import { PLANT_TYPES, PLANT_STYLES } from '@/lib/garden';

interface PlantingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PlantingModal({ isOpen, onClose }: PlantingModalProps) {
    const { gardenData, plantNewTree } = useGarden();
    const [selectedPlantType, setSelectedPlantType] = useState<string>('');
    const [plantName, setPlantName] = useState<string>('');
    const [ownerName, setOwnerName] = useState<string>('');
    const [isPlanting, setIsPlanting] = useState(false);

    const userSeeds = gardenData?.userSeeds || 0;

    const handlePlant = async () => {
        if (!selectedPlantType || !plantName.trim() || !ownerName.trim()) {
            alert('请填写完整信息');
            return;
        }

        const requiredSeeds = PLANT_TYPES[selectedPlantType]?.seeds || 0;
        if (userSeeds < requiredSeeds) {
            alert(`种子不足，需要 ${requiredSeeds} 颗种子`);
            return;
        }

        setIsPlanting(true);
        try {
            const success = await plantNewTree(selectedPlantType, plantName.trim(), ownerName.trim());
            if (success) {
                alert('种植成功！');
                onClose();
                // 重置表单
                setSelectedPlantType('');
                setPlantName('');
                setOwnerName('');
            }
        } catch (error) {
            console.error('种植失败:', error);
        } finally {
            setIsPlanting(false);
        }
    };

    const handleClose = () => {
        if (!isPlanting) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">种植植物</h2>
                    <button
                        onClick={handleClose}
                        disabled={isPlanting}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    {/* 种子数量显示 */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                            <span className="text-yellow-500">🌱</span>
                            <span className="text-sm font-medium">当前种子: {userSeeds}</span>
                        </div>
                    </div>

                    {/* 选中植物预览 */}
                    {selectedPlantType && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                                <span className={`${PLANT_STYLES[selectedPlantType]?.size || 'text-lg'} ${PLANT_STYLES[selectedPlantType]?.color || 'text-green-500'}`}>
                                    {PLANT_STYLES[selectedPlantType]?.emoji || '🌱'}
                                </span>
                                <div>
                                    <div className="font-medium text-sm text-green-800">
                                        选中: {PLANT_TYPES[selectedPlantType]?.name}
                                    </div>
                                    <div className="text-xs text-green-600">
                                        消耗 {PLANT_TYPES[selectedPlantType]?.seeds} 颗种子
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 植物类型选择 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            选择植物类型
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(PLANT_TYPES).map(([type, info]) => {
                                const plantStyle = PLANT_STYLES[type] || PLANT_STYLES.small_tree;
                                return (
                                    <button
                                        key={type}
                                        onClick={() => setSelectedPlantType(type)}
                                        disabled={userSeeds < info.seeds}
                                        className={`p-3 border rounded-lg text-left transition-colors ${selectedPlantType === type
                                            ? 'border-green-500 bg-green-50'
                                            : userSeeds >= info.seeds
                                                ? 'border-gray-300 hover:border-gray-400'
                                                : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className={`${plantStyle.size} ${plantStyle.color}`}>
                                                {plantStyle.emoji}
                                            </span>
                                            <div className="font-medium text-sm">{info.name}</div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            需要 {info.seeds} 颗种子
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 植物名称 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            植物名称
                        </label>
                        <input
                            type="text"
                            value={plantName}
                            onChange={(e) => setPlantName(e.target.value)}
                            placeholder="给你的植物起个名字"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                            maxLength={20}
                        />
                    </div>

                    {/* 种植者姓名 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            你的名字
                        </label>
                        <input
                            type="text"
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            placeholder="输入你的名字"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                            maxLength={20}
                        />
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            onClick={handleClose}
                            disabled={isPlanting}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            取消
                        </button>
                        <button
                            onClick={handlePlant}
                            disabled={isPlanting || !selectedPlantType || !plantName.trim() || !ownerName.trim()}
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPlanting ? '种植中...' : '种植'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
