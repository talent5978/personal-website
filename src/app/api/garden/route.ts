import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 获取花园状态和植物列表
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tempUserId = searchParams.get('tempUserId');

        // 获取所有植物（永久保留）
        const plants = await prisma.plant.findMany({
            orderBy: {
                plantedAt: 'desc'
            }
        });

        let userSeeds = 0;
        if (tempUserId) {
            // 获取或创建临时用户
            let tempUser = await prisma.tempUser.findUnique({
                where: { id: tempUserId }
            });

            if (!tempUser) {
                tempUser = await prisma.tempUser.create({
                    data: {
                        id: tempUserId,
                        seeds: 0,
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期
                    }
                });
            } else {
                // 更新最后活动时间
                await prisma.tempUser.update({
                    where: { id: tempUserId },
                    data: { lastActivity: new Date() }
                });
            }

            userSeeds = tempUser.seeds;
        }

        return NextResponse.json({
            plants,
            userSeeds,
            totalPlants: plants.length
        });
    } catch (error) {
        console.error('获取花园状态失败:', error);
        return NextResponse.json(
            { error: '获取花园状态失败' },
            { status: 500 }
        );
    }
}

// 获得种子
export async function POST(request: NextRequest) {
    try {
        const { tempUserId, source, amount = 1 } = await request.json();

        if (!tempUserId) {
            return NextResponse.json(
                { error: '缺少临时用户ID' },
                { status: 400 }
            );
        }

        // 获取或创建临时用户
        let tempUser = await prisma.tempUser.findUnique({
            where: { id: tempUserId }
        });

        if (!tempUser) {
            tempUser = await prisma.tempUser.create({
                data: {
                    id: tempUserId,
                    seeds: amount,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
            });
        } else {
            // 更新种子数量和最后活动时间
            const newSeeds = Math.max(0, tempUser.seeds + amount); // 确保种子数量不会低于0
            tempUser = await prisma.tempUser.update({
                where: { id: tempUserId },
                data: {
                    seeds: newSeeds,
                    lastActivity: new Date()
                }
            });
        }

        return NextResponse.json({
            success: true,
            seeds: tempUser.seeds,
            earned: amount,
            source
        });
    } catch (error) {
        console.error('获得种子失败:', error);
        return NextResponse.json(
            { error: '获得种子失败' },
            { status: 500 }
        );
    }
}
