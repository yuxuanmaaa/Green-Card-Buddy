# 婚姻绿卡状态更新

## 概述
基于对实际婚姻绿卡申请流程的研究，我们更新了状态跟踪系统，使其更准确地反映USCIS的实际处理步骤。

## 更新的状态步骤

### StatusTracker 显示的主要步骤（7个步骤）：
1. **Case Was Received** (案件已接收) - 显示为 "Case Received"
2. **Biometrics Appointment Was Scheduled** (生物识别预约已安排) - 显示为 "Biometrics Scheduled"
3. **Employment Authorization Document Was Approved** (工作许可已批准) - 显示为 "Work Authorization Approved"
4. **Interview Was Scheduled** (面试已安排) - 显示为 "Interview Scheduled"
5. **Case Was Approved** (案件已批准) - 显示为 "Case Approved"
6. **New Card Is Being Produced** (新卡制作中) - 显示为 "Card Being Produced"
7. **Card Was Delivered** (卡片已送达) - 显示为 "Card Delivered"

### Mock状态选择器包含的所有状态（10个状态）：
1. Case Was Received
2. Biometrics Appointment Was Scheduled
3. Employment Authorization Document Was Approved
4. Request for Additional Evidence Was Sent
5. Case Is Ready to Be Scheduled for An Interview
6. Interview Was Scheduled
7. Case Was Approved
8. New Card Is Being Produced
9. Card Was Delivered
10. Case Was Denied

## UI设计改进

### 竖向布局设计
- **布局方向**: 从水平改为垂直排列，更适合移动端和长状态名称
- **视觉指示器**: 
  - 已完成步骤显示 ✓ 符号
  - 未完成步骤显示数字
  - 当前步骤有蓝色背景高亮和"Current"标签
- **更好的可读性**: 每个状态都有足够的空间显示完整描述
- **响应式设计**: 适合Chrome扩展的popup窗口尺寸

### 视觉特性
- **圆形指示器**: 32x32px，已完成为蓝色，未完成为灰色
- **状态高亮**: 当前状态有浅蓝色背景和边框
- **清晰的层次**: 使用不同的字体粗细和颜色来区分状态

## 基于实际婚姻绿卡流程的时间线

### 对于美国境内申请人（与美国公民结婚）：
- **2-4周**: Case Was Received
- **5-8周**: Biometrics Appointment Was Scheduled
- **5.5-7.5个月**: Employment Authorization Document Was Approved (如果申请了I-765)
- **4-10个月**: Interview Was Scheduled
- **面试后1-2个月**: Case Was Approved
- **批准后几周**: New Card Is Being Produced
- **制作后2-3周**: Card Was Delivered

### 常见的额外状态：
- **Request for Additional Evidence Was Sent**: 当USCIS需要更多文件时
- **Case Is Ready to Be Scheduled for An Interview**: 在正式安排面试前的状态
- **Case Was Denied**: 如果申请被拒绝

## 技术实现

### 文件更改：
1. **src/components/StatusTracker.tsx**: 
   - 更新了STATUS_STEPS和STATUS_DISPLAY_NAMES
   - 改为竖向布局设计
   - 添加了当前状态高亮
   - 使用✓符号表示已完成步骤
2. **src/types/settings.ts**: 更新了MOCK_CASE_STATUSES数组
3. **src/services/uscisService.ts**: 更新了默认模拟状态列表

### 改进：
- 使用更准确的婚姻绿卡申请状态
- 竖向布局提供更好的可读性
- 清晰的视觉指示器和状态高亮
- 保持与实际USCIS流程的一致性
- 在调试模式中提供更多状态选项用于测试

## 数据来源
基于以下权威来源的研究：
- CitizenPath Form I-485 Processing Time Guide
- VisaNation Marriage-Based Green Card Timeline
- GreenCardHero Timeline Documentation
- USCIS官方处理时间数据

这些更新确保了GreenCard Buddy扩展能够准确反映真实的婚姻绿卡申请流程和时间点，同时提供更好的用户体验。 