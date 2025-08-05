# 🚀 部署指南

本文档提供了详细的部署指南，帮助你成功部署游戏网站到各种平台。

## 📋 部署前检查清单

在部署之前，请确保完成以下检查：

### ✅ 代码检查
- [ ] 所有TypeScript错误已修复
- [ ] ESLint检查通过
- [ ] 本地构建成功 (`npm run build`)
- [ ] 开发服务器正常运行 (`npm run dev`)

### ✅ 环境配置
- [ ] 环境变量已配置
- [ ] 数据库连接正常（如果使用）
- [ ] API路由测试通过

## 🌐 Vercel 部署（推荐）

Vercel是部署Next.js应用的最佳选择，提供零配置部署。

### 步骤1：准备代码
```bash
# 确保代码已提交到Git
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 步骤2：连接Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 使用GitHub账号登录
3. 点击 "New Project"
4. 选择你的仓库
5. 点击 "Import"

### 步骤3：配置环境变量（如果需要）
在Vercel项目设置中添加环境变量：
```
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
DATABASE_URL=your-database-url (如果使用数据库)
```

### 步骤4：部署
Vercel会自动检测Next.js项目并开始部署。通常几分钟内就能完成。

## 🐳 Docker 部署

使用Docker可以确保部署环境的一致性。

### Dockerfile
创建 `Dockerfile`：
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 构建和运行
```bash
# 构建镜像
docker build -t personal-website .

# 运行容器
docker run -p 3000:3000 personal-website
```

## 🔧 Netlify 部署

Netlify也是一个不错的选择，特别适合静态网站。

### 步骤1：配置构建设置
创建 `netlify.toml`：
```toml
[build]
  publish = ".next"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 步骤2：部署
1. 访问 [netlify.com](https://netlify.com)
2. 连接GitHub仓库
3. 配置构建设置
4. 部署

## 🏗️ 手动部署到VPS

如果你有自己的服务器，可以手动部署。

### 步骤1：服务器准备
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2（进程管理器）
sudo npm install -g pm2
```

### 步骤2：部署代码
```bash
# 克隆代码
git clone <your-repo-url>
cd personal-website

# 安装依赖
npm install

# 构建项目
npm run build

# 使用PM2启动
pm2 start npm --name "personal-website" -- start
pm2 save
pm2 startup
```

### 步骤3：配置Nginx（可选）
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🌍 环境变量配置

根据部署平台配置相应的环境变量：

### 开发环境 (.env.local)
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### 生产环境
```env
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NODE_ENV=production
# 如果使用数据库
DATABASE_URL=your-production-database-url
```

## 🐛 常见部署问题

### 问题1：构建失败
**错误**: TypeScript编译错误
**解决**: 
```bash
# 检查类型错误
npm run type-check

# 修复后重新构建
npm run build
```

### 问题2：API路由不工作
**错误**: 404 或 500 错误
**解决**: 
- 检查API路由文件命名是否正确
- 确保导出了正确的HTTP方法函数
- 检查环境变量配置

### 问题3：静态资源加载失败
**错误**: 图片或CSS不显示
**解决**: 
- 确保静态资源在 `public` 目录下
- 检查路径是否正确（使用绝对路径）
- 配置正确的 `assetPrefix`（如果需要）

### 问题4：内存不足
**错误**: JavaScript heap out of memory
**解决**: 
```bash
# 增加Node.js内存限制
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

## 📊 性能优化建议

### 1. 启用压缩
确保服务器启用了gzip压缩：
```javascript
// next.config.ts
compress: true
```

### 2. 配置缓存
设置适当的缓存头：
```javascript
// next.config.ts
async headers() {
  return [
    {
      source: '/(.*\\.(js|css|woff|woff2|eot|ttf|otf|png|jpg|jpeg|gif|webp|avif|svg|ico))',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
}
```

### 3. 图片优化
使用Next.js的Image组件：
```jsx
import Image from 'next/image'

<Image
  src="/hero-image.jpg"
  alt="Hero"
  width={800}
  height={600}
  priority
/>
```

## 🔍 监控和维护

### 部署后检查
- [ ] 网站可以正常访问
- [ ] 所有页面都能正确加载
- [ ] API接口工作正常
- [ ] 游戏功能正常
- [ ] 移动端显示正常

### 监控工具
- **Vercel Analytics**: 自动性能监控
- **Google Analytics**: 用户行为分析
- **Sentry**: 错误追踪
- **Uptime Robot**: 网站可用性监控

## 📞 获取帮助

如果遇到部署问题：

1. 检查构建日志中的错误信息
2. 查看浏览器控制台的错误
3. 参考Next.js官方文档
4. 在GitHub Issues中搜索类似问题

---

🎉 恭喜！你的游戏网站现在应该已经成功部署了！