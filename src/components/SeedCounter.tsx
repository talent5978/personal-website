'use client';

import React from 'react';
import { useGarden } from './GardenContext';

interface SeedCounterProps {
    className?: string;
}

export default function SeedCounter({ className = '' }: SeedCounterProps) {
    const { gardenData, isLoading } = useGarden();

    if (isLoading) {
        return (
            <div className={`flex items-center space-x-2 ${className}`}>
                <span className="text-yellow-500">🌱</span>
                <span className="text-sm text-gray-600">加载中...</span>
            </div>
        );
    }

    const seeds = gardenData?.userSeeds || 0;

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <span className="text-yellow-500 text-lg">🌱</span>
            <span className="text-sm font-medium text-gray-700">
                种子: {seeds}
            </span>
            {seeds > 0 && (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    可以种植
                </span>
            )}
        </div>
    );
}
