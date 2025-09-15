'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Plant, GardenData, getOrCreateTempUserId, fetchGardenData, plantTree, earnSeed } from '@/lib/garden';

interface GardenContextType {
    gardenData: GardenData | null;
    tempUserId: string;
    isLoading: boolean;
    error: string | null;
    refreshGarden: () => Promise<void>;
    plantNewTree: (plantType: string, plantName: string, ownerName: string) => Promise<boolean>;
    earnNewSeed: (source: string) => Promise<boolean>;
}

const GardenContext = createContext<GardenContextType | undefined>(undefined);

export function GardenProvider({ children }: { children: ReactNode }) {
    const [gardenData, setGardenData] = useState<GardenData | null>(null);
    const [tempUserId, setTempUserId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 初始化临时用户ID
    useEffect(() => {
        const userId = getOrCreateTempUserId();
        setTempUserId(userId);
    }, []);

    // 获取花园数据
    const refreshGarden = async () => {
        if (!tempUserId) return;

        try {
            setIsLoading(true);
            setError(null);
            const data = await fetchGardenData(tempUserId);
            setGardenData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : '获取花园数据失败');
        } finally {
            setIsLoading(false);
        }
    };

    // 种植新树
    const plantNewTree = async (plantType: string, plantName: string, ownerName: string): Promise<boolean> => {
        if (!tempUserId) return false;

        try {
            const result = await plantTree(tempUserId, plantType, plantName, ownerName);
            if (result.success) {
                // 刷新花园数据
                await refreshGarden();
                return true;
            } else {
                setError(result.error || '种植失败');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '种植失败');
            return false;
        }
    };

    // 获得新种子
    const earnNewSeed = async (source: string): Promise<boolean> => {
        if (!tempUserId) return false;

        try {
            const result = await earnSeed(tempUserId, source);
            if (result.success) {
                // 刷新花园数据
                await refreshGarden();
                return true;
            } else {
                setError(result.error || '获得种子失败');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '获得种子失败');
            return false;
        }
    };

    // 当临时用户ID设置后，获取花园数据
    useEffect(() => {
        if (tempUserId) {
            refreshGarden();
        }
    }, [tempUserId]);

    // 定期刷新花园数据（每30秒）
    useEffect(() => {
        if (!tempUserId) return;

        const interval = setInterval(() => {
            refreshGarden();
        }, 30000);

        return () => clearInterval(interval);
    }, [tempUserId]);

    const value: GardenContextType = {
        gardenData,
        tempUserId,
        isLoading,
        error,
        refreshGarden,
        plantNewTree,
        earnNewSeed
    };

    return (
        <GardenContext.Provider value={value}>
            {children}
        </GardenContext.Provider>
    );
}

export function useGarden() {
    const context = useContext(GardenContext);
    if (context === undefined) {
        throw new Error('useGarden must be used within a GardenProvider');
    }
    return context;
}
