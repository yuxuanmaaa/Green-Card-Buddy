
# GreenCard Buddy Chrome Extension

## 项目概述
**GreenCard Buddy** 是一个 Chrome 插件，帮助申请人实时跟踪绿卡申请流程（如 I-130、I-485、I-864 等），并提供智能提醒。

---

## 文件与文件夹结构
GreenCardBuddy/
├── public/
│   └── manifest.json              # Chrome 扩展配置文件
├── src/
│   ├── assets/                    # 图标、图片等静态资源
│   ├── components/               # 通用组件（如状态条、提示框）
│   ├── pages/                    # 各个页面（popup 页面、选项设置页面等）
│   ├── services/                 # 与 USCIS API/Firebase 的交互逻辑
│   ├── utils/                    # 工具函数（如日期处理、状态映射）
│   ├── hooks/                    # 自定义 React Hooks（如 useReminder）
│   ├── context/                  # React Context 状态管理（如 UserContext）
│   ├── App.tsx                   # 应用主组件
│   ├── index.tsx                 # 应用入口点
│   └── styles.css                # 样式表
├── .env                          # 环境变量配置（如 Firebase API 密钥）
├── firebase.json                 # Firebase 配置（如使用 Cloud Function）
├── package.json
└── README.md

---

## 每个部分的作用
### `manifest.json`
Chrome 插件的核心配置文件，定义插件权限、入口页面、背景脚本等。

### `public/`
用于存放插件图标、popup HTML 等静态资源。

### `src/components/`
封装复用组件，例如：
- `StatusTracker.tsx`：展示当前案件状态进度
- `ReminderCard.tsx`：展示提醒卡片组件

### `src/pages/`
插件中的界面页面，例如：
- `Popup.tsx`：点击插件图标后显示的主要 UI
- `Options.tsx`：设置提醒偏好

### `src/services/`
包含：
- `uscisService.ts`：通过 USCIS Case Status API 获取状态
- `storageService.ts`：封装 Firebase 或 localStorage 的读写

### `src/hooks/`
如 `useReminders.ts`，处理提醒逻辑和触发条件。

### `src/context/`
如 `UserContext.tsx`：管理用户基本信息和案件数据。

### `firebase.json`
定义 Firebase Functions、Firestore、Authentication 的使用规则。

---

## 状态存储位置
可根据实际情况二选一：

### 方案 A：使用 Firebase（推荐用于长期使用、跨设备同步）
- **Authentication**：用于用户登录（可使用 Google 登录）
- **Firestore**：存储用户提交的案件数据（表单日期、补件提醒等）
- **Cloud Functions**（可选）：定时检查 USCIS 状态并触发提醒通知

### 方案 B：使用 localStorage（适合 MVP 阶段）
- 每次用户在 popup 中填写信息后存入 `localStorage`
- 页面加载时从 `localStorage` 中拉取数据渲染 UI
- 无需服务器，部署简单

---

## 服务连接逻辑
```
用户交互（Popup 页面）
    ↓
更新 context 状态（React Context）
    ↓
调用 storageService（写入 Firebase 或 localStorage）
    ↓
调用 uscisService（请求 USCIS Status API）
    ↓
更新 UI 状态栏 + 提醒卡片
```

---

## 进度与提醒功能说明
- **进度追踪器**：
  - 支持用户自填案件编号，调用 USCIS API 获取状态
  - 显示状态流转如“已接受”→“打指纹”→“等待面试”等

- **智能提醒**：
  - 通过设定关键节点（如 I-485 提交日后 90 天、补件截止日）设置提醒
  - 提醒方式：在插件内弹出提醒卡，或使用 Chrome 通知 API

---

## 测试建议
- 使用 `react-testing-library` 做组件测试
- 对 USCIS API 结果进行 mock
- 插件行为测试用 Chrome 的 extension 测试工具或 Puppeteer

---

## 发布建议
- 使用 `npm run build` 打包 React 应用
- 打包后内容压缩至 zip
- 上传至 Chrome Web Store Developer Dashboard

---

##  待办清单
- [ ] 集成 USCIS Case Status API
- [ ] 实现提醒机制与通知权限
- [ ] 登录/同步功能（使用 Firebase）
- [ ] UI 设计优化（状态可视化）
- [ ] 国际化支持（中英双语）
