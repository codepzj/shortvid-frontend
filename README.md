# ShortVid Frontend

基于 Vite + React + TypeScript 的前端项目。

## 路径别名配置

项目已配置路径别名 `@` 指向 `src` 目录，方便模块导入：

```typescript
// 直接使用 @ 别名导入
import { auth } from "@/third_party/firebase";
import { UserProfile } from "@/components/UserProfile";

// 等同于
import { auth } from "./src/third_party/firebase";
import { UserProfile } from "./src/components/UserProfile";
```

## Firebase 配置

1. 项目已集成 Firebase Auth
2. 在 `src/third_party/firebase.ts` 中配置 Firebase 项目信息
3. 支持 Google 登录

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
src/
├── third_party/     # 第三方服务配置
│   └── firebase.ts  # Firebase 配置
├── components/      # React 组件
├── hooks/          # 自定义 Hooks
├── utils/          # 工具函数
└── types/          # TypeScript 类型定义
```