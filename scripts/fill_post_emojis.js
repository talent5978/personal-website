// Run with: node scripts/fill_post_emojis.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rules = [
    { k: [/bug|错误|問題|问题|异常|报错/i], e: '🐞' },
    { k: [/修复|解决|优化|重构/i], e: '🛠️' },
    { k: [/发布|更新|上线|版本|release/i], e: '🚀' },
    { k: [/教程|指南|教学|笔记|总结|tips?/i], e: '📘' },
    { k: [/想法|随想|随笔|思考|idea/i], e: '💡' },
    { k: [/分享|经验|资源|工具|合集/i], e: '🔗' },
    { k: [/前端|React|Next|HTML|CSS|JS|TypeScript/i], e: '🧩' },
    { k: [/后端|API|Prisma|数据库|PostgreSQL|SQL/i], e: '🗄️' },
    { k: [/部署|Vercel|CI\/?CD|DevOps/i], e: '⚙️' },
    { k: [/游戏|Game|Snake|Survivor|关卡|得分/i], e: '🎮' },
    { k: [/AI|机器学习|大模型|GPT|LLM/i], e: '🤖' },
    { k: [/设计|UI|UX|界面|视觉/i], e: '🎨' },
    { k: [/生活|日常|心情|随记|碎碎念/i], e: '🌿' },
    { k: [/音乐|歌单|乐器|音频/i], e: '🎵' },
    { k: [/旅行|出行|路线|风景|地图/i], e: '🗺️' },
    { k: [/美食|菜谱|烹饪|吃|好吃/i], e: '🍜' },
    { k: [/学习|读书|考试|课程|刷题/i], e: '📚' },
    { k: [/工作|职场|面试|招聘|简历/i], e: '💼' },
    { k: [/代码|编程|开发|工程|重构/i], e: '🧠' },
];

function suggestEmoji(title = '', content = '') {
    const text = `${title}\n${content}`;
    for (const r of rules) {
        if (r.k.some((re) => re.test(text))) return r.e;
    }
    return '📝';
}

(async () => {
    try {
        const posts = await prisma.post.findMany({
            select: { id: true, title: true, content: true, emoji: true },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });

        const targets = posts.filter(p => !p.emoji);
        for (const p of targets) {
            const e = suggestEmoji(p.title, p.content);
            await prisma.post.update({ where: { id: p.id }, data: { emoji: e } });
            console.log(`Updated post #${p.id} -> ${e}`);
        }

        console.log(`Done. Updated ${targets.length} posts.`);
    } catch (e) {
        console.error('Failed to fill emojis:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
})();
