# 🎵 Musicist — 发现你的音乐世界

一个现代化的在线音乐播放器，支持多音源搜索、每日 Bing 壁纸、弹幕互动、AI 推荐等功能。

> **在线地址：** https://zhuyao-opendeveloper.github.io/musicist/

---

## ✨ 功能

- 🎶 **多音源搜索** — 内置多个音乐源，支持在线检索
- 🔥 **热门推荐** — 发现当下热门的音乐曲目
- ❤️ **收藏管理** — 收藏你喜欢的歌曲
- 🖼️ **每日 Bing 壁纸** — 背景每日自动更新
- 🎯 **弹幕互动** — 边听歌边发弹幕
- 🤖 **AI 推荐** — 智能推荐你可能喜欢的音乐
- 🔧 **管理后台** — 自定义音源、管理歌曲和弹幕
- 🌙 **深色主题** — 沉浸式的深色界面设计

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| **Vue 3** + Composition API | 前端框架 |
| **Vite 6** | 构建工具 |
| **Vue Router 4** | 前端路由 |
| **Tailwind CSS 3** | 样式框架 |
| **lucide-vue-next** | 图标库 |
| **pnpm** | 包管理 |

## 🚀 本地运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器（含 API 代理）
pnpm dev

# 构建生产版本
pnpm build

# 预览构建产物
pnpm preview
```

开发服务器默认运行在 `http://localhost:5173`，Vite 已配置 `/api-proxy/deezer` 代理绕过音乐 API 的 CORS 限制。

## 📦 部署

项目使用 **GitHub Actions** 自动构建并部署到 GitHub Pages。推送 `main` 分支后，工作流会自动：

1. 安装依赖
2. 执行 `vite build`
3. 将 `dist/` 目录部署到 Pages

> **路由说明：** 项目部署在子路径 `/musicist/` 下，Vite 配置 `base: '/musicist/'`，Vue Router 使用 `createWebHistory('/musicist/')`。

## 📁 项目结构

```
musicist/
├── .github/workflows/    # GitHub Actions 部署工作流
├── public/               # 静态资源
├── src/
│   ├── components/       # 组件（播放器、弹幕、歌单卡片等）
│   ├── composables/      # 组合式 API（音乐、弹幕、AI 等）
│   ├── router/           # 路由配置
│   ├── views/            # 页面（Home、Admin）
│   ├── App.vue           # 根组件
│   ├── main.js           # 入口文件
│   └── style.css         # 全局样式（Tailwind + 自定义）
├── index.html            # 入口 HTML
├── vite.config.js        # Vite 配置
├── tailwind.config.js    # Tailwind 配置
└── pnpm-lock.yaml        # pnpm 锁文件
```

## 📄 许可证

MIT