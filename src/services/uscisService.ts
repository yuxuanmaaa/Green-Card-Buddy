import { getSettings } from '../utils/settingsUtils';
import { realUscisService } from './realUscisService';

/**
 * USCIS 案件状态接口
 */
export interface CaseStatus {
  status: string;
  date: string;
}

/**
 * 模拟 USCIS API 调用，返回案件状态
 * @param receiptNumber 案件编号
 * @returns Promise<CaseStatus>
 */
export const fetchStatus = async (receiptNumber: string): Promise<CaseStatus> => {
  // 获取设置以检查调试模式和API配置
  const settings = await getSettings();
  
  // 模拟 API 延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  // 如果启用了真实API且不在调试模式下
  if (settings.useRealApi && !settings.debugMode) {
    try {
      // 配置真实API服务
      realUscisService.configure({
        clientId: settings.uscisClientId,
        clientSecret: settings.uscisClientSecret,
        sandboxMode: settings.uscisSandboxMode
      });

      // 调用真实API
      console.log('Using real USCIS API for receipt number:', receiptNumber);
      return await realUscisService.fetchCaseStatus(receiptNumber);
    } catch (error) {
      console.error('Real USCIS API failed, falling back to mock:', error);
      // 如果真实API失败，抛出错误而不是回退到模拟数据
      throw new Error(`USCIS API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 验证案件编号格式（在调试模式下可以放宽）
  if (!settings.debugMode && !receiptNumber.match(/^[A-Z]{3}\d{10}$/)) {
    throw new Error('Invalid receipt number format');
  }

  // 如果启用了调试模式且设置了模拟状态，返回模拟状态
  if (settings.debugMode && settings.mockCaseStatus) {
    console.log('Debug mode: Using mock status:', settings.mockCaseStatus);
    return {
      status: settings.mockCaseStatus,
      date: new Date().toISOString().split('T')[0]
    };
  }

  // 默认模拟数据（或真实API调用）- 基于婚姻绿卡申请流程
  console.log('Using mock USCIS data for receipt number:', receiptNumber);
  const mockStatuses = [
    "Case Was Received",
    "Biometrics Appointment Was Scheduled",
    "Employment Authorization Document Was Approved",
    "Interview Was Scheduled",
    "Case Was Approved",
    "New Card Is Being Produced",
    "Card Was Delivered"
  ];

  // 根据案件编号生成一致的状态（这样同一个编号总是返回相同状态）
  const statusIndex = receiptNumber.length % mockStatuses.length;
  
  return {
    status: mockStatuses[statusIndex],
    date: new Date().toISOString().split('T')[0]
  };
}; 