import { getReminders } from '../utils/reminderUtils';
import { getSettings } from '../utils/settingsUtils';
import { sendReminder } from './notificationService';

/**
 * 检查并发送即将到来的提醒通知
 * 这个函数独立于UI显示，只负责发送浏览器通知
 */
export const checkAndSendNotifications = async (): Promise<void> => {
  try {
    const settings = await getSettings();
    
    // 如果通知被禁用，直接返回
    if (!settings.notificationsEnabled || !settings.showBrowserNotifications) {
      console.log('Browser notifications disabled, skipping notification check');
      return;
    }

    const allReminders = await getReminders();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // 过滤出所有未来的提醒
    const futureReminders = Object.values(allReminders)
      .filter(Boolean)
      .filter(reminder => new Date(reminder.date) >= now);

    // 只对符合设置天数的提醒发送通知
    const reminderDays = settings.reminderDaysBefore;
    const reminderDate = new Date(now.getTime() + reminderDays * 24 * 60 * 60 * 1000);
    
    const upcomingReminders = futureReminders.filter(
      reminder => new Date(reminder.date) <= reminderDate
    );

    console.log(`Found ${upcomingReminders.length} upcoming reminders for notification`);

    for (const reminder of upcomingReminders) {
      console.log('Sending notification for:', reminder);
      await sendReminder(reminder.title, reminder.message);
    }
  } catch (error) {
    console.error('Error checking and sending notifications:', error);
  }
}; 