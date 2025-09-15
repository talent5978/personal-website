// 花园相关工具函数

export interface Plant {
    id: number;
    tempUserId: string;
    plantType: string;
    plantName: string | null;
    ownerName: string;
    positionX: number;
    positionY: number;
    score: number;
    plantedAt: string;
}

export interface GardenData {
    plants: Plant[];
    userSeeds: number;
    totalPlants: number;
}

export interface PlantType {
    seeds: number;
    name: string;
}

export const PLANT_TYPES: Record<string, PlantType> = {
    small_tree: { seeds: 1, name: '小树苗' },
    medium_tree: { seeds: 3, name: '中型树' },
    large_tree: { seeds: 5, name: '大树' },
    rare_tree: { seeds: 10, name: '稀有树' },
    flower: { seeds: 2, name: '花朵' },
    bush: { seeds: 4, name: '灌木' },
    palm_tree: { seeds: 8, name: '棕榈树' },
    cherry_blossom: { seeds: 15, name: '樱花树' },
    rainbow_flower: { seeds: 20, name: '彩虹花' }
};

// 生成临时用户ID
export function generateTempUserId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `temp_${timestamp}_${random}`;
}

// 获取或创建临时用户ID
export function getOrCreateTempUserId(): string {
    if (typeof window === 'undefined') return '';

    let tempUserId = localStorage.getItem('tempUserId');

    if (!tempUserId) {
        tempUserId = generateTempUserId();
        localStorage.setItem('tempUserId', tempUserId);
    }

    return tempUserId;
}

// 获取花园数据
export async function fetchGardenData(tempUserId?: string): Promise<GardenData> {
    const url = tempUserId
        ? `/api/garden?tempUserId=${encodeURIComponent(tempUserId)}`
        : '/api/garden';

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('获取花园数据失败');
    }

    return response.json();
}

// 种植植物
export async function plantTree(
    tempUserId: string,
    plantType: string,
    plantName: string,
    ownerName: string,
    positionX?: number,
    positionY?: number
): Promise<{ success: boolean; plant?: Plant; remainingSeeds?: number; error?: string }> {
    const response = await fetch('/api/garden/plant', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tempUserId,
            plantType,
            plantName,
            ownerName,
            positionX,
            positionY
        })
    });

    const data = await response.json();

    if (!response.ok) {
        return { success: false, error: data.error };
    }

    return { success: true, plant: data.plant, remainingSeeds: data.remainingSeeds };
}

// 获得种子
export async function earnSeed(tempUserId: string, source: string): Promise<{ success: boolean; seeds?: number; error?: string }> {
    const response = await fetch('/api/garden', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tempUserId,
            source,
            amount: 1
        })
    });

    const data = await response.json();

    if (!response.ok) {
        return { success: false, error: data.error };
    }

    return { success: true, seeds: data.seeds };
}

// 获取植物类型信息
export async function getPlantTypes(): Promise<Record<string, PlantType>> {
    const response = await fetch('/api/garden/plant');
    if (!response.ok) {
        throw new Error('获取植物类型失败');
    }

    const data = await response.json();
    return data.plantTypes;
}

// 植物样式映射
export const PLANT_STYLES: Record<string, { emoji: string; size: string; color: string }> = {
    small_tree: { emoji: '🌱', size: 'text-lg', color: 'text-green-500' },
    medium_tree: { emoji: '🌳', size: 'text-xl', color: 'text-green-600' },
    large_tree: { emoji: '🌲', size: 'text-2xl', color: 'text-green-700' },
    rare_tree: { emoji: '🌟', size: 'text-2xl', color: 'text-yellow-500' },
    flower: { emoji: '🌺', size: 'text-lg', color: 'text-red-500' },
    bush: { emoji: '🌿', size: 'text-xl', color: 'text-green-500' },
    palm_tree: { emoji: '🌴', size: 'text-2xl', color: 'text-yellow-600' },
    cherry_blossom: { emoji: '🌸', size: 'text-2xl', color: 'text-pink-400' },
    rainbow_flower: { emoji: '🌈', size: 'text-3xl', color: 'text-purple-500' }
};

// 格式化时间
export function formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
}
