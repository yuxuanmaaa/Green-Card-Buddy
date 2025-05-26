import { getReminders } from '../utils/reminderUtils';
import { getSettings } from '../utils/settingsUtils';
import { sendReminder } from './notificationService';



/**
 * 检查并发送即将到来的提醒通知
 * 新逻辑：设置N天表示在预约当天及前N天都会提醒
 * 每次打开扩展程序都会检查并发送符合条件的通知
 */
export const checkAndSendNotifications = async (): Promise<void> => {
  try {
    console.log('🔔 开始检查通知...');
    
    const settings = await getSettings();
    
    // 如果通知被禁用，直接返回
    if (!settings.notificationsEnabled || !settings.showBrowserNotifications) {
      console.log('❌ 浏览器通知已禁用，跳过通知检查');
      return;
    }

    const allReminders = await getReminders();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    console.log('📅 当前日期:', now.toISOString().split('T')[0]);
    console.log('⚙️ 提醒设置:', `${settings.reminderDaysBefore} 天前开始提醒`);

    // 过滤出所有未来的提醒（包括今天）
    const futureReminders = Object.entries(allReminders)
      .filter(([_, reminder]) => reminder && new Date(reminder.date) >= now);

    console.log(`📋 找到 ${futureReminders.length} 个未来的提醒`);

    // 新逻辑：检查每个提醒是否在提醒范围内
    const reminderDays = settings.reminderDaysBefore;
    
    for (const [reminderKey, reminder] of futureReminders) {
      if (!reminder) continue;
      
      const appointmentDate = new Date(reminder.date);
      appointmentDate.setHours(0, 0, 0, 0);
      
      // 计算距离预约日期的天数
      const daysUntilAppointment = Math.ceil((appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // 新逻辑：如果距离预约日期 <= 设置的天数，则发送提醒
      // 例如：设置1天，则在预约当天(0天)和前1天都提醒
      const shouldNotify = daysUntilAppointment >= 0 && daysUntilAppointment <= reminderDays;
      
      console.log(`📝 检查提醒 ${reminderKey}:`, {
        title: reminder.title,
        appointmentDate: appointmentDate.toISOString().split('T')[0],
        daysUntilAppointment,
        shouldNotify,
        reminderDays
      });
      
      if (shouldNotify) {
        console.log(`🚀 发送通知: ${reminder.title}`);
        const success = await sendReminder(reminder.title, reminder.message);
        
        if (success) {
          console.log(`✅ 通知发送成功: ${reminderKey}`);
        } else {
          console.log(`❌ 通知发送失败: ${reminderKey}`);
        }
      }
    }
    
    console.log('🔔 通知检查完成');
  } catch (error) {
    console.error('❌ 检查和发送通知时出错:', error);
  }
}; 