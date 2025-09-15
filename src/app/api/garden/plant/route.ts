import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 植物类型和所需种子数量
const PLANT_TYPES = {
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

// 种植植物
export async function POST(request: NextRequest) {
    try {
        const {
            tempUserId,
            plantType,
            plantName,
            ownerName,
            positionX,
            positionY
        } = await request.json();

        // 验证必需参数
        if (!tempUserId || !plantType || !ownerName) {
            return NextResponse.json(
                { error: '缺少必需参数' },
                { status: 400 }
            );
        }

        // 验证植物类型
        if (!PLANT_TYPES[plantType as keyof typeof PLANT_TYPES]) {
            return NextResponse.json(
                { error: '无效的植物类型' },
                { status: 400 }
            );
        }

        const requiredSeeds = PLANT_TYPES[plantType as keyof typeof PLANT_TYPES].seeds;

        // 获取临时用户信息
        const tempUser = await prisma.tempUser.findUnique({
            where: { id: tempUserId }
        });

        if (!tempUser) {
            return NextResponse.json(
                { error: '用户不存在' },
                { status: 404 }
            );
        }

        // 检查种子数量
        if (tempUser.seeds < requiredSeeds) {
            return NextResponse.json(
                { error: `种子不足，需要 ${requiredSeeds} 颗种子` },
                { status: 400 }
            );
        }

        // 生成随机位置（如果未提供）
        const finalPositionX = positionX ?? Math.floor(Math.random() * 400) + 50;
        const finalPositionY = positionY ?? Math.floor(Math.random() * 300) + 50;

        // 创建植物（永久保存）
        const plant = await prisma.plant.create({
            data: {
                tempUserId,
                plantType,
                plantName: plantName || PLANT_TYPES[plantType as keyof typeof PLANT_TYPES].name,
                ownerName,
                positionX: finalPositionX,
                positionY: finalPositionY,
                score: requiredSeeds
            }
        });

        // 扣除种子
        await prisma.tempUser.update({
            where: { id: tempUserId },
            data: {
                seeds: { decrement: requiredSeeds },
                lastActivity: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            plant,
            remainingSeeds: tempUser.seeds - requiredSeeds
        });
    } catch (error) {
        console.error('种植植物失败:', error);
        return NextResponse.json(
            { error: '种植植物失败' },
            { status: 500 }
        );
    }
}

// 获取植物类型信息
export async function GET() {
    return NextResponse.json({
        plantTypes: PLANT_TYPES
    });
}
