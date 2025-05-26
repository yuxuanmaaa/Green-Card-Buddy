# 真实USCIS API集成指南

## 概述
GreenCard Buddy现在支持调用真实的USCIS Case Status API，而不仅仅是模拟数据。这个功能使用官方的USCIS开发者API来获取真实的案件状态信息。

## 🔧 设置步骤

### 1. 获取USCIS API凭据

1. **访问USCIS开发者门户**
   - 前往 [developer.uscis.gov](https://developer.uscis.gov)
   - 点击 "Sign Up" 创建开发者账户

2. **创建开发者应用**
   - 登录后，点击右上角的 "Apps"
   - 点击 "Add App"
   - 填写应用信息：
     - **App Name**: 任意名称（如 "GreenCard Buddy"）
     - **Description**: 描述你的应用功能
       ```
       GreenCard Buddy is a Chrome browser extension that helps immigration applicants track their green card application status and manage important appointment reminders. The application uses the USCIS Case Status API to retrieve real-time case status information for users who input their receipt numbers. Key features include: automated case status checking, visual progress tracking through the immigration process, appointment reminder notifications, and secure local storage of user preferences. This tool is designed to provide a user-friendly interface for monitoring immigration case progress and ensuring applicants never miss critical deadlines or appointments.
       ```
     - **Select API Products**: 选择 "Case Status API - Sandbox"

3. **获取凭据**
   - 创建应用后，点击应用名称
   - 滚动到 "Credentials" 部分
   - 点击眼睛图标查看你的 Client ID 和 Client Secret

   **⚠️ 重要提醒**：
   - 新创建的应用可能需要1-3个工作日的审核时间
   - 如果应用未立即显示在列表中，这是正常的审核流程
   - 检查注册邮箱是否收到USCIS的确认或审核邮件
   - 如果超过3个工作日仍未显示，请联系 [email protected]

### 2. 在扩展中配置API

1. **打开选项页面**
   - 右键点击扩展图标 → "Options"
   - 或者在扩展管理页面点击 "Details" → "Extension options"

2. **配置API设置**
   - 勾选 "Use Real USCIS API"
   - 输入你的 Client ID 和 Client Secret
   - 保持 "Use Sandbox Mode" 勾选（推荐用于测试）
   - 点击 "Test API Connection" 验证配置

3. **保存设置**
   - 点击 "Save Settings"

## 🚀 使用方法

### 启用真实API
- 在选项页面勾选 "Use Real USCIS API"
- 确保已正确配置API凭据
- 调试模式关闭时会自动使用真实API

### API模式说明
- **Sandbox模式**: 使用测试环境，返回模拟数据但通过真实API调用
- **Production模式**: 使用生产环境（需要通过USCIS的demo审核）

### 收据号格式
- 必须是标准格式：3个字母 + 10个数字（如：EAC1234567890）
- 真实API会严格验证格式

## 🔍 API功能特性

### 支持的功能
- ✅ OAuth 2.0认证
- ✅ 自动token刷新（30分钟过期）
- ✅ 错误处理和重试
- ✅ 连接测试功能
- ✅ Sandbox和Production环境支持

### API响应信息
真实API返回的信息包括：
- 案件状态（英文和西班牙文）
- 案件描述
- 表格类型（如I-130, I-485等）
- 提交日期和修改日期
- 收据号

### 状态映射
API返回的状态会自动映射到我们的进度跟踪器：
- "Case Was Received" → 第1步
- "Biometrics Appointment Was Scheduled" → 第2步
- "Employment Authorization Document Was Approved" → 第3步
- 等等...

## 🛠️ 技术实现

### 文件结构
```
src/services/
├── uscisService.ts          # 主服务（智能路由）
├── realUscisService.ts      # 真实API实现
└── reminderNotificationService.ts

src/types/
└── settings.ts              # 包含API配置类型

src/components/
└── OptionsPage.tsx          # API配置界面
```

### API调用流程
1. **认证**: 使用Client Credentials获取Access Token
2. **调用**: 使用Bearer Token调用Case Status API
3. **解析**: 转换API响应为标准格式
4. **缓存**: Token自动缓存和刷新

### 错误处理
- **401 Unauthorized**: Token过期，自动重新认证
- **404 Not Found**: 案件未找到
- **其他错误**: 显示详细错误信息

## 🔒 安全考虑

### 凭据存储
- Client ID和Secret存储在Chrome扩展的本地存储中
- 仅在本地设备上存储，不会发送到第三方服务器

### 权限要求
- 扩展需要访问 `api-int.uscis.gov` 和 `api.uscis.gov` 的权限
- 这些权限在manifest.json中声明

### 最佳实践
- 使用Sandbox模式进行测试
- 不要在公共场所或共享设备上输入API凭据
- 定期检查USCIS开发者门户的安全建议

## 🐛 调试和故障排除

### 常见问题

**Q: API连接测试失败**
A: 检查以下项目：
- Client ID和Secret是否正确
- 是否选择了正确的API产品（Case Status API - Sandbox）
- 网络连接是否正常

**Q: 收据号无效**
A: 确保格式正确：
- 3个大写字母 + 10个数字
- 例如：EAC1234567890, MSC9876543210

**Q: Token过期错误**
A: 系统会自动处理token刷新，如果仍有问题：
- 重新测试API连接
- 检查Client Secret是否正确

### 调试模式
- 启用调试模式会强制使用模拟数据
- 即使配置了真实API，调试模式下也不会调用真实API
- 用于测试UI功能而不消耗API配额

### 日志查看
- 打开浏览器开发者工具（F12）
- 查看Console标签页的日志信息
- API调用和错误都会记录在控制台

## 📊 API限制和配额

### USCIS API限制
- 每个token有效期：30分钟
- 具体的速率限制请查看USCIS开发者文档
- Sandbox环境可能有不同的限制

### ⏰ Sandbox API运营时间
**重要**：USCIS Case Status API Sandbox有运营时间限制：
- **运营时间**：周一至周五，上午7:00 - 晚上8:00 (美国东部时间 EST)
- **周末和节假日**：服务不可用
- **超出运营时间**：会返回503错误

### 时区转换参考
- **太平洋时间 (PST)**：上午4:00 - 下午5:00
- **中部时间 (CST)**：上午6:00 - 下午7:00
- **中国时间 (CST)**：晚上8:00 - 次日上午9:00
- **欧洲中部时间 (CET)**：下午1:00 - 次日凌晨2:00

### 生产环境访问
- 需要通过USCIS的demo审核
- 联系 [email protected] 安排demo
- 通过后可获得生产环境访问权限

## 🔄 从模拟数据迁移

### 现有用户
- 现有的模拟数据功能保持不变
- 可以随时在真实API和模拟数据之间切换
- 调试模式仍然可用于测试

### 数据兼容性
- 真实API返回的状态与现有的状态跟踪器兼容
- 提醒功能继续正常工作
- 所有现有功能保持不变

这个集成为GreenCard Buddy带来了真实的数据源，使其成为一个更强大和实用的绿卡申请跟踪工具！ 