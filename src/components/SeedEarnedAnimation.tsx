'use client';

import React, { useState, useEffect } from 'react';

interface SeedEarnedAnimationProps {
    show: boolean;
    onComplete: () => void;
    amount?: number;
}

export default function SeedEarnedAnimation({ show, onComplete, amount = 1 }: SeedEarnedAnimationProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onComplete, 300); // 等待动画完成
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [show, onComplete]);

    if (!show && !isVisible) return null;

    return (
        <div className={`fixed inset-0 flex items-center justify-center z-50 pointer-events-none transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg transform animate-bounce">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl">🌱</span>
                    <span className="text-lg font-bold">
                        获得 {amount} 颗种子！
                    </span>
                </div>
            </div>
        </div>
    );
}
