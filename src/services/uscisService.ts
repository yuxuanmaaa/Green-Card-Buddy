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
  // 模拟 API 延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  // 验证案件编号格式
  if (!receiptNumber.match(/^[A-Z]{3}\d{10}$/)) {
    throw new Error('Invalid receipt number format');
  }

  // 模拟数据
  return {
    status: "Biometrics Appointment Was Scheduled",
    date: new Date().toISOString().split('T')[0]
  };
}; 