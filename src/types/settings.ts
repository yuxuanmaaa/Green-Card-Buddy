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
}

export const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  reminderDaysBefore: 3,
  showBrowserNotifications: true,
  showInAppReminders: true,
  debugMode: false,
  mockCaseStatus: undefined
};

export const MOCK_CASE_STATUSES = [
  'Case Was Received',
  'Case Was Approved',
  'Biometrics Appointment Was Scheduled',
  'Interview Was Scheduled',
  'Request for Additional Evidence Was Sent',
  'Case Is Ready to Be Scheduled for An Interview',
  'New Card Is Being Produced'
]; 