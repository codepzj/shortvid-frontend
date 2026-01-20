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
├── api/             # API 接口定义
│   └── user.ts      # 用户相关API
├── services/        # API 服务层
│   └── api.ts       # API 接口封装（已迁移到api目录）
├── third_party/     # 第三方服务配置
│   └── firebase.ts  # Firebase 配置
├── utils/           # 工具函数
│   └── http.ts      # HTTP 请求工具（适配后端响应格式）
├── components/      # React 组件
├── hooks/           # 自定义 Hooks
└── types/           # TypeScript 类型定义
```

## API 架构

项目采用分层架构设计：

1. **HTTP层** (`utils/http.ts`) - 基础HTTP请求工具，适配后端响应格式
2. **API层** (`api/*.ts`) - 业务API接口定义和类型
3. **服务层** (`services/*.ts`) - API服务封装和业务逻辑

### API 使用示例

```typescript
// 导入用户API
import { userApi, userUtils } from '@/api/user';

// Firebase登录
const handleLogin = async (idToken: string) => {
  try {
    const response = await userApi.loginWithFirebase(idToken);
    console.log('登录成功:', response.data);
  } catch (error) {
    console.error('登录失败:', userUtils.handleError(error));
  }
};

// 获取用户信息
const fetchUser = async (userId: number) => {
  try {
    const response = await userApi.getUser(userId);
    const userInfo = response.data;
    console.log('用户信息:', userUtils.formatUser(userInfo));
  } catch (error) {
    console.error('获取用户信息失败:', userUtils.handleError(error));
  }
};
```