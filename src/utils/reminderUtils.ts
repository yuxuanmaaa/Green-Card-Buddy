import { Reminder, ReminderData } from '../types/reminder';

const STORAGE_KEY = 'reminderData';

// 保存提醒数据
export const saveReminder = async (type: keyof ReminderData, reminder: Reminder): Promise<void> => {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const reminders: ReminderData = data[STORAGE_KEY] || {};
  
  // 直接保存用户设置的日期，不做任何转换
  reminders[type] = reminder;
  
  await chrome.storage.local.set({ [STORAGE_KEY]: reminders });
};

// 获取所有提醒数据
export const getReminders = async (): Promise<ReminderData> => {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return data[STORAGE_KEY] || {};
};

// 检查是否有即将到来的提醒（3天内）
export const checkUpcomingReminders = async (): Promise<Reminder[]> => {
  const reminders = await getReminders();
  const upcoming: Reminder[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  console.log('Checking reminders between:', now.toISOString(), 'and', threeDaysLater.toISOString());

  Object.values(reminders).forEach(reminder => {
    if (reminder) {
      const reminderDate = new Date(reminder.date);
      reminderDate.setHours(0, 0, 0, 0);
      
      console.log('Checking reminder:', {
        date: reminderDate.toISOString(),
        title: reminder.title,
        isUpcoming: reminderDate >= now && reminderDate <= threeDaysLater
      });

      if (reminderDate >= now && reminderDate <= threeDaysLater) {
        upcoming.push(reminder);
      }
    }
  });

  console.log('Found upcoming reminders:', upcoming);
  return upcoming;
};

// 计算距离提醒日期的天数
export const getDaysRemaining = (reminderDate: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const date = new Date(reminderDate);
  date.setHours(0, 0, 0, 0);
  
  const diffTime = date.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}; 