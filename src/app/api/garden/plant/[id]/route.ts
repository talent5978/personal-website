import { NextRequest, NextResponse } from 'next/server';

// 禁用删除植物：所有植物永久保留
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return NextResponse.json(
        { error: '不允许删除植物（永久保留）' },
        { status: 403 }
    );
}
