import React, { useEffect, useState } from 'react';
import { Reminder } from '../types/reminder';
import { getReminders } from '../utils/reminderUtils';
import { sendReminder } from '../services/notificationService';

const ReminderList: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const loadReminders = async () => {
      try {
        const allReminders = await getReminders();
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // 过滤出所有未来的提醒
        const futureReminders = Object.values(allReminders)
          .filter(Boolean)
          .filter(reminder => new Date(reminder.date) >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        console.log('Found future reminders:', futureReminders);
        setReminders(futureReminders);
        
        // 只对3天内的提醒发送通知
        const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const upcomingReminders = futureReminders.filter(
          reminder => new Date(reminder.date) <= threeDaysLater
        );

        for (const reminder of upcomingReminders) {
          console.log('Sending notification for:', reminder);
          await sendReminder(reminder.title, reminder.message);
        }
      } catch (error) {
        console.error('Error loading reminders:', error);
      }
    };

    loadReminders();
  }, []);

  if (reminders.length === 0) {
    return null;
  }

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
        {reminders.map((reminder, index) => (
          <div
            key={index}
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
              {new Date(reminder.date).toLocaleDateString()}
            </div>
            <div style={{ color: '#718096', fontSize: '0.75rem' }}>
              {reminder.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReminderList; 