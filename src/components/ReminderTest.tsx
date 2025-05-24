import React, { useState, useEffect } from 'react';
import { ReminderDates, getReminderDates, updateReminderDate } from '../utils/reminders';

const ReminderTest: React.FC = () => {
  const [reminders, setReminders] = useState<ReminderDates>({});
  const [selectedType, setSelectedType] = useState<keyof ReminderDates>('biometrics');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // 加载已保存的提醒
  useEffect(() => {
    const savedReminders = getReminderDates();
    setReminders(savedReminders);
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value as keyof ReminderDates);
  };

  const handleSave = () => {
    if (selectedDate) {
      updateReminderDate(selectedType, selectedDate);
      setReminders(getReminderDates());
      setSelectedDate('');
    }
  };

  return (
    <div style={{ padding: '1rem', backgroundColor: '#f7fafc', borderRadius: '0.375rem' }}>
      <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Reminder Settings</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <select
          value={selectedType}
          onChange={handleTypeChange}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '0.5rem',
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem'
          }}
        >
          <option value="biometrics">Biometrics Appointment</option>
          <option value="interview">Interview</option>
          <option value="rfe">RFE Deadline</option>
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem'
          }}
        />
      </div>

      <button
        onClick={handleSave}
        style={{
          width: '100%',
          padding: '0.5rem',
          backgroundColor: '#4299e1',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer'
        }}
      >
        Save Reminder
      </button>

      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Saved Reminders:</h3>
        {Object.entries(reminders).length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Object.entries(reminders).map(([type, date]) => (
              <li
                key={type}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#edf2f7',
                  marginBottom: '0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem'
                }}
              >
                {type}: {date}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#718096', fontSize: '0.875rem' }}>No reminders set</p>
        )}
      </div>
    </div>
  );
};

export default ReminderTest; 