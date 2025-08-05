# 🎮 游戏开发工作室 - 全栈游戏网站

一个现代化的全栈游戏网站，包含幸存者游戏、贪吃蛇游戏和排行榜功能，使用 Next.js 14 + TypeScript 构建。

## ✨ 功能特性

### 🎯 游戏系统
- **🐍 贪吃蛇游戏** - 经典游戏新体验
  - 多种游戏模式（经典、障碍、速度）
  - 特殊食物与道具系统
  - 完美适配移动设备
  
- **⚔️ 幸存者游戏 2.0** - 升级版生存挑战
  - 经验升级系统与武器解锁
  - 6种独特武器，各具特色
  - 智能瞄准与粒子特效
  - 实时小地图与暂停功能
  - 波次系统与Boss战
  - 对象池优化，60FPS流畅体验

### 🏆 社区功能
- **排行榜系统** - 全球玩家竞技
- **社区论坛** - 交流讨论平台
- **成绩分享** - 社交媒体集成

### 🚀 技术亮点
- **高性能** - 对象池、优化渲染循环、代码分割
- **响应式设计** - 适配所有设备
- **PWA支持** - 离线可用、原生体验
- **SEO优化** - 完整的元数据和结构化数据
- **现代化UI** - Glass morphism、渐变效果、动画

## 🛠️ 技术栈

### 前端
- **Next.js 14** - React全栈框架
- **React 18** - 用户界面库
- **TypeScript** - 类型安全
- **Tailwind CSS** - 实用优先的CSS框架

### 后端
- **Next.js API Routes** - 服务端API
- **Prisma ORM** - 数据库操作
- **PostgreSQL** - 生产数据库
- **SQLite** - 开发数据库

### 开发工具
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Webpack Bundle Analyzer** - 包大小分析
- **TypeScript** - 类型检查

### 部署
- **Vercel** - 生产部署
- **Docker** - 容器化支持

## 📁 项目结构

```
personal-website/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scores/         # 排行榜 API
│   │   │   └── posts/          # 论坛 API
│   │   ├── game/               # 贪吃蛇游戏
│   │   ├── survivor/           # 幸存者游戏
│   │   ├── leaderboard/        # 排行榜页面
│   │   ├── posts/              # 论坛页面
│   │   ├── globals.css         # 全局样式
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx            # 首页
│   │   ├── sitemap.ts          # SEO站点地图
│   │   ├── robots.ts           # 搜索引擎爬虫配置
│   │   └── manifest.ts         # PWA配置
│   ├── components/             # 可复用组件
│   ├── hooks/                  # 自定义React Hooks
│   ├── utils/                  # 工具函数
│   └── types/                  # TypeScript类型定义
├── prisma/
│   ├── schema.prisma          # 数据库模型
│   └── seed.ts                # 数据库种子
├── public/                    # 静态资源
├── next.config.ts            # Next.js配置
├── tailwind.config.js        # Tailwind配置
├── tsconfig.json            # TypeScript配置
└── package.json             # 项目依赖
```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd personal-website
```

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

创建 `.env.local` 文件：

```env
# 数据库
DATABASE_URL="postgresql://username:password@localhost:5432/mydb"
# 或者使用 SQLite 进行开发
# DATABASE_URL="file:./dev.db"

# 网站配置
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# 可选：分析工具
ANALYZE=false
```

### 4. 初始化数据库

```bash
# 生成 Prisma 客户端
npm run db:generate

# 推送数据库架构
npm run db:push

# 可选：填充示例数据
npm run db:seed
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看网站。

## 📝 可用脚本

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build           # 构建生产版本
npm run start           # 启动生产服务器
npm run preview         # 构建并预览

# 代码质量
npm run lint            # 检查代码规范
npm run lint:fix        # 自动修复代码问题
npm run type-check      # TypeScript类型检查

# 数据库
npm run db:generate     # 生成Prisma客户端
npm run db:push         # 推送数据库架构
npm run db:studio       # 打开数据库管理界面
npm run db:seed         # 填充示例数据

# 分析和测试
npm run build:analyze   # 构建并分析包大小
npm run test            # 运行测试
npm run test:watch      # 监听模式运行测试
npm run clean           # 清理构建文件
```

## 🎮 游戏说明

### 贪吃蛇游戏
- **控制方式**: 方向键或WASD移动
- **游戏模式**:
  - 经典模式：传统贪吃蛇玩法
  - 障碍模式：增加障碍物挑战
  - 速度模式：逐渐加速的挑战
- **特殊道具**:
  - 🍎 普通食物：增加长度和分数
  - ⚡ 速度道具：临时加速
  - 🛡️ 护盾道具：短暂无敌
  - 💎 双倍道具：双倍分数

### 幸存者游戏
- **控制方式**: WASD或方向键移动，ESC/空格暂停，M键切换小地图
- **武器系统**:
  - 🞭 鞭子：近距离扇形攻击
  - 🔮 魔法杖：智能追踪弹
  - 🔥 火球术：大范围爆炸攻击
  - ⚡ 闪电链：高穿透攻击
  - ❄️ 冰锥：高伤害直线攻击
  - 💜 激光炮：超高穿透伤害
- **升级系统**:
  - 击杀敌人获得经验值
  - 等级提升增加生命值上限
  - 等级3/5/7/10解锁新武器
  - 每30秒武器有机会升级
- **敌人类型**:
  - 👹 普通敌人：基础血量和速度
  - 💨 快速敌人：高速低血量
  - 🛡️ 坦克敌人：高血量低速度
  - 👑 Boss敌人：超高血量和奖励

## 🔧 性能优化

### 前端优化
- **代码分割**: 自动分割vendor和common代码
- **图片优化**: WebP/AVIF格式，响应式图片
- **CSS优化**: 自动压缩和优化
- **字体优化**: 预加载关键字体
- **缓存策略**: 静态资源长期缓存

### 游戏性能
- **对象池**: 减少垃圾回收开销
- **帧率控制**: 稳定60FPS渲染
- **碰撞检测优化**: 空间分割算法
- **粒子系统**: 高效的视觉效果

### SEO优化
- **结构化数据**: 丰富的元数据
- **站点地图**: 自动生成XML sitemap
- **语义化HTML**: 良好的可访问性
- **Open Graph**: 社交媒体分享优化

## 🚀 部署指南

### Vercel部署（推荐）

1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 配置环境变量
4. 自动部署完成

### Docker部署

```bash
# 构建镜像
docker build -t personal-website .

# 运行容器
docker run -p 3000:3000 personal-website
```

### 手动部署

```bash
# 构建项目
npm run build

# 启动生产服务器
npm run start
```

## 📊 监控和分析

- **性能监控**: Web Vitals指标
- **错误追踪**: 生产环境错误监控
- **用户分析**: 游戏数据统计
- **SEO监控**: 搜索引擎表现

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Prisma](https://prisma.io/) - 数据库ORM
- [Vercel](https://vercel.com/) - 部署平台

## 📞 联系方式

- 网站: [your-website.com](https://your-website.com)
- 邮箱: your-email@example.com
- GitHub: [@your-username](https://github.com/your-username)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
