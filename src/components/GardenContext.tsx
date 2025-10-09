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
    const [lastFetchTime, setLastFetchTime] = useState<number>(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    // 初始化临时用户ID
    useEffect(() => {
        const userId = getOrCreateTempUserId();
        setTempUserId(userId);
    }, []);

    // 获取花园数据
    const refreshGarden = async (force = false) => {
        if (!tempUserId) return;

        // 检查是否需要刷新（5秒内的请求直接返回缓存数据）
        const now = Date.now();
        if (!force && now - lastFetchTime < 5000 && gardenData) {
            return;
        }

        // 防止重复请求
        if (isRefreshing) return;

        try {
            setIsRefreshing(true);
            if (!gardenData || force) {
                setIsLoading(true);
            }
            setError(null);

            const data = await fetchGardenData(tempUserId);
            setGardenData(data);
            setLastFetchTime(now);
            setRetryCount(0); // 重置重试计数
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '获取花园数据失败';
            setError(errorMessage);

            // 自动重试机制（最多重试3次）
            if (retryCount < 3) {
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    refreshGarden(force);
                }, Math.pow(2, retryCount) * 1000); // 指数退避：1s, 2s, 4s
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
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

    // 定期刷新花园数据（每2分钟，减少频率）
    useEffect(() => {
        if (!tempUserId) return;

        const interval = setInterval(() => {
            // 静默刷新，不显示加载状态
            refreshGardenSilently();
        }, 120000); // 2分钟

        return () => clearInterval(interval);
    }, [tempUserId]);

    // 静默刷新花园数据
    const refreshGardenSilently = async () => {
        if (!tempUserId || isRefreshing) return;

        try {
            setIsRefreshing(true);
            const data = await fetchGardenData(tempUserId);
            setGardenData(data);
            setLastFetchTime(Date.now());
        } catch (err) {
            // 静默失败，不显示错误
            console.warn('静默刷新花园数据失败:', err);
        } finally {
            setIsRefreshing(false);
        }
    };

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
