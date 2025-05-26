export interface AppSettings {
  // 提醒设置
  notificationsEnabled: boolean;
  reminderDaysBefore: number;
  
  // 通知偏好
  showBrowserNotifications: boolean;
  showInAppReminders: boolean;
  
  // 调试模式
  debugMode: boolean;
  mockCaseStatus?: string;
  
  // USCIS API 配置
  useRealApi: boolean;
  uscisClientId: string;
  uscisClientSecret: string;
  uscisSandboxMode: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  reminderDaysBefore: 3,
  showBrowserNotifications: true,
  showInAppReminders: true,
  debugMode: false,
  mockCaseStatus: undefined,
  useRealApi: false,
  uscisClientId: '',
  uscisClientSecret: '',
  uscisSandboxMode: true
};

export const MOCK_CASE_STATUSES = [
  'Case Was Received',
  'Biometrics Appointment Was Scheduled',
  'Employment Authorization Document Was Approved',
  'Request for Additional Evidence Was Sent',
  'Case Is Ready to Be Scheduled for An Interview',
  'Interview Was Scheduled',
  'Case Was Approved',
  'New Card Is Being Produced',
  'Card Was Delivered',
  'Case Was Denied'
]; 