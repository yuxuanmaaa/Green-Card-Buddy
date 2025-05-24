/**
 * 提醒时间节点类型
 */
export interface ReminderDates {
  biometrics?: string;  // 打指纹日期
  interview?: string;   // 面试日期
  rfe?: string;        // 补件截止日期
  [key: string]: string | undefined;  // 允许添加其他类型的提醒
}

const REMINDER_STORAGE_KEY = 'reminderDates';

/**
 * 保存提醒日期
 * @param dates 提醒日期对象
 */
export const saveReminderDates = (dates: ReminderDates): void => {
  try {
    const serializedData = JSON.stringify(dates);
    localStorage.setItem(REMINDER_STORAGE_KEY, serializedData);
  } catch (error) {
    console.error('Error saving reminder dates:', error);
  }
};

/**
 * 获取提醒日期
 * @returns 提醒日期对象，如果不存在则返回空对象
 */
export const getReminderDates = (): ReminderDates => {
  try {
    const serializedData = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (serializedData === null) {
      return {};
    }
    return JSON.parse(serializedData) as ReminderDates;
  } catch (error) {
    console.error('Error reading reminder dates:', error);
    return {};
  }
};

/**
 * 更新单个提醒日期
 * @param type 提醒类型
 * @param date 日期字符串 (YYYY-MM-DD)
 */
export const updateReminderDate = (type: keyof ReminderDates, date: string): void => {
  const currentDates = getReminderDates();
  saveReminderDates({
    ...currentDates,
    [type]: date
  });
}; 