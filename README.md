# 个人网站 - 全栈小项目

一个包含贪吃蛇小游戏和排行榜功能的个人网站，使用 Next.js 全栈开发。

## 功能特性

- 🏠 **个人首页** - 展示个人信息和技术栈
- 🎮 **贪吃蛇游戏** - 经典小游戏，支持键盘控制
- 🏆 **排行榜系统** - 记录玩家分数，展示排名
- 📱 **响应式设计** - 适配各种设备屏幕
- 🎨 **现代UI** - 使用 Tailwind CSS 构建美观界面

## 技术栈

- **前端**: Next.js 14 + React 18 + TypeScript
- **样式**: Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite + Prisma ORM
- **部署**: Vercel

## 项目结构

```
personal-website/
├── src/
│   ├── app/
│   │   ├── api/scores/     # 排行榜 API
│   │   ├── game/           # 游戏页面
│   │   ├── leaderboard/    # 排行榜页面
│   │   ├── globals.css     # 全局样式
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 首页
├── prisma/
│   └── schema.prisma       # 数据库模型
├── package.json
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看网站。

## 游戏说明

- 使用方向键控制蛇的移动
- 吃到红色食物增加分数和长度
- 避免撞墙或撞到自己
- 游戏结束后可以提交分数到排行榜

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量（如需要）
4. 部署完成

## 开发说明

- 数据库使用 SQLite，适合小项目
- API 路由在 `src/app/api/` 目录下
- 游戏逻辑使用 React Hooks 实现
- 响应式设计适配移动端

## 许可证

MIT License
