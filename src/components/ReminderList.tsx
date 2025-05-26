import React, { useEffect, useState } from 'react';
import { Reminder } from '../types/reminder';
import { getReminders, getDaysRemaining, shouldShowReminder } from '../utils/reminderUtils';
import { getSettings } from '../utils/settingsUtils';

const ReminderList: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const loadReminders = async () => {
    try {
      const settings = await getSettings();
      
      // 如果应用内提醒被禁用，不显示任何内容
      if (!settings.showInAppReminders) {
        setReminders([]);
        return;
      }

      const allReminders = await getReminders();
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // 过滤出所有未来的提醒
      const futureReminders = Object.values(allReminders)
        .filter(Boolean)
        .filter(reminder => new Date(reminder.date) >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      console.log('Found future reminders for display:', futureReminders);
      setReminders(futureReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  useEffect(() => {
    loadReminders();

    // 监听存储变化以实时更新提醒列表
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes['reminderData'] || changes['appSettings']) {
        loadReminders();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  if (reminders.length === 0) {
    return null;
  }

  // 格式化日期显示，直接使用用户设置的日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}/${year}`;
  };

  return (
    <div style={{ 
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: '#f7fafc',
      borderRadius: '0.375rem',
      border: '1px solid #e2e8f0'
    }}>
      <h2 style={{ 
        fontSize: '1rem',
        marginBottom: '0.5rem',
        color: '#2d3748'
      }}>
        Upcoming Reminders
      </h2>
      <div>
        {reminders.map((reminder, index) => {
          const daysRemaining = getDaysRemaining(reminder.date);
          
          return (
            <ReminderCard 
              key={index}
              reminder={reminder}
              daysRemaining={daysRemaining}
              formatDate={formatDate}
            />
          );
        })}
      </div>
    </div>
  );
};

// 分离出提醒卡片组件
const ReminderCard: React.FC<{
  reminder: Reminder;
  daysRemaining: number;
  formatDate: (dateString: string) => string;
}> = ({ reminder, daysRemaining, formatDate }) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const checkShouldShow = async () => {
      const show = await shouldShowReminder(daysRemaining);
      setShouldShow(show);
    };
    checkShouldShow();
  }, [daysRemaining]);

  return (
    <div
      style={{
        padding: '0.5rem',
        backgroundColor: '#edf2f7',
        marginBottom: '0.5rem',
        borderRadius: '0.25rem',
        fontSize: '0.875rem'
      }}
    >
      <div style={{ fontWeight: '500', color: '#2d3748' }}>
        {reminder.title}
      </div>
      <div style={{ color: '#4a5568' }}>
        {formatDate(reminder.date)}
        {shouldShow && (
          <span style={{ 
            marginLeft: '0.5rem',
            color: daysRemaining === 0 ? '#e53e3e' : '#2f855a',
            fontWeight: '500'
          }}>
            ({daysRemaining === 0 ? 'Today' : `${daysRemaining} days remaining`})
          </span>
        )}
      </div>
      {reminder.message && (
        <div style={{ color: '#718096', fontSize: '0.75rem' }}>
          {reminder.message}
        </div>
      )}
    </div>
  );
};

export default ReminderList; 