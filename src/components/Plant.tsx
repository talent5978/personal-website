'use client';

import React, { useState } from 'react';
import { Plant, PLANT_STYLES, formatTime } from '@/lib/garden';

interface PlantComponentProps {
    plant: Plant;
    onClick?: (plant: Plant) => void;
}

export default function PlantComponent({ plant, onClick }: PlantComponentProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const plantStyle = PLANT_STYLES[plant.plantType] || PLANT_STYLES.small_tree;

    const handleClick = () => {
        if (onClick) {
            onClick(plant);
        }
    };

    const handleMouseEnter = () => {
        setShowTooltip(true);
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    return (
        <>
            <div
                className={`absolute cursor-pointer transition-transform hover:scale-110 ${plantStyle.size} ${plantStyle.color}`}
                style={{
                    left: `${plant.positionX}px`,
                    top: `${plant.positionY}px`,
                    zIndex: 10
                }}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {plantStyle.emoji}
            </div>

            {showTooltip && (
                <div
                    className="absolute bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-20"
                    style={{
                        left: `${plant.positionX + 20}px`,
                        top: `${plant.positionY - 30}px`,
                        minWidth: '120px'
                    }}
                >
                    <div className="font-medium">{plant.plantName}</div>
                    <div className="text-gray-300">种植者: {plant.ownerName}</div>
                    <div className="text-gray-300">{formatTime(plant.plantedAt)}</div>
                </div>
            )}
        </>
    );
}
