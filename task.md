
# GreenCard Buddy MVP 构建任务计划

以下是构建 Chrome 插件 GreenCard Buddy 的最小可行版本（MVP）任务分解。每个任务都极小、聚焦、可测试，适合交给工程 LLM 串行执行。

---

## 初始化与基础结构

### 1. 初始化项目结构  
目标：创建基础目录 + React 插件骨架（含 manifest）  
输入：无  
输出：一个能在 Chrome 加载的空壳插件  
内容：
- 初始化 `npm` 项目
- 添加 React + TypeScript 支持
- 创建 `manifest.json`（最低运行版本）
- 实现 popup 页面展示“Hello GreenCard Buddy”

---

### 2. 设置 localStorage 抽象层  
目标：实现一个封装对 localStorage 的简单读写函数  
输入：键名与数据对象  
输出：写入并读取数据成功  
示例：
```ts
setData('userData', { receiptNumber: 'IOE1234567890' });
getData('userData'); // 应返回上面对象
```

---

### 3. 构建 Popup UI（静态）  
目标：构建 popup 的初始 UI（静态版本）  
内容：案件编号输入框、状态显示区域、保存按钮  
测试方法：是否能看到基本页面结构，无功能

---

## 核心数据交互

### 4. USCIS Case Status API 查询封装  
目标：封装一个 `fetchStatus(receiptNumber)` 函数（mock 版本）  
说明：暂用 mock 返回 `{"status": "Case Was Received", "date": "2023-10-10"}`  
测试方法：调用后返回模拟状态对象

---

### 5. 保存案件编号 + 查询状态  
目标：在 popup 中填入编号 -> 按钮触发保存 -> 立即查询状态 -> 渲染 UI  
流程：输入 -> 保存到 localStorage -> 调用 API -> 显示状态  
测试：刷新 popup 后状态仍在、状态正确渲染

---

### 6. 状态条组件（StatusTracker）  
目标：创建一个可复用组件展示案件状态进度  
数据格式：传入状态，如 `"Case Was Received"`，映射为 step 1/5  
测试方法：输入不同状态，渲染正确进度条

---

## 智能提醒模块

### 7. 提醒信息结构设计 + 保存逻辑  
目标：在 localStorage 中记录 key 时间节点  
数据结构：
```ts
{
  biometrics: "2024-05-30",
  interview: "2024-07-15"
}
```
测试方法：是否正确写入并读取 key 时间

---

### 8. Chrome 通知 API 封装  
目标：封装 `sendReminder(title, message)`，可手动调用  
测试方法：手动触发后系统弹出通知（需给权限）

---

### 9. 提醒触发调度器（local 模拟）  
目标：每次 popup 打开时，检查是否有即将到来的提醒  
条件：当前日期 + 提醒时间在 3 天内  
输出：展示通知或提示卡片

---

## 设置与测试支持

### 10. 设置选项页（Options Page）  
目标：实现 options.html 页面用于设置提醒偏好  
功能：设置是否启用提醒、提前几天提醒  
测试：更改选项可保存并刷新后保留

---

### 11. mock 状态切换调试模式  
目标：添加调试入口切换 USCIS 状态（用于 UI 测试）  
方式：在 options 页提供 select，切换后状态组件更新

---

### 12. 用户状态持久化 Context  
目标：实现 React Context 管理案件信息与状态  
说明：封装成 `UserProvider`，供页面组件共享数据  
测试：状态跨组件同步更新

---

### 13. MVP 打包发布版本  
目标：使用 `npm run build` 打包插件，并生成 zip 可上传  
测试方法：在 Chrome 中加载打包 zip，功能正常运行

---

## 后续待办（非 MVP 阶段）

- 登录功能（集成 Firebase Authentication）
- 使用 Firestore 存储数据，实现跨设备同步
- 实现定时轮询状态更新（需后台脚本支持）
- 国际化支持（中英双语切换）
- 同步支持多个案件编号管理
