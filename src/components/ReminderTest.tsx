import React, { useState } from 'react';
import { saveReminder } from '../utils/reminderUtils';
import { Reminder } from '../types/reminder';

const ReminderTest: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'biometrics' | 'interview' | 'rfe'>('biometrics');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value as 'biometrics' | 'interview' | 'rfe');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSave = async () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    // 创建本地时区的日期，避免时区转换问题
    const [year, month, day] = selectedDate.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 12, 0, 0, 0); // 设置为中午12点

    const reminder: Reminder = {
      date: localDate.toISOString(),
      title: `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Appointment`,
      message: message || `Your ${selectedType} appointment is scheduled for ${selectedDate}`
    };

    await saveReminder(selectedType, reminder);
    alert('Reminder saved successfully!');
    
    // 清空表单
    setSelectedDate('');
    setMessage('');
  };

  return (
    <div style={{ 
      padding: '1rem',
      backgroundColor: '#f7fafc',
      borderRadius: '0.375rem',
      border: '1px solid #e2e8f0'
    }}>
      <h2 style={{ 
        fontSize: '1rem',
        marginBottom: '1rem',
        color: '#2d3748'
      }}>
        Set Reminder
      </h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <select
          value={selectedType}
          onChange={handleTypeChange}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '0.5rem',
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
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
            marginBottom: '0.5rem',
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}
        />

        <input
          type="text"
          value={message}
          onChange={handleMessageChange}
          placeholder="Optional: Enter custom reminder message"
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '0.5rem',
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}
        />
      </div>

      <button
        onClick={handleSave}
        style={{
          width: '100%',
          padding: '0.5rem',
          backgroundColor: '#48bb78',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}
      >
        Save Reminder
      </button>
    </div>
  );
};

export default ReminderTest; 