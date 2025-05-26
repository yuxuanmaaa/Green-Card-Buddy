import React, { useState, useEffect } from 'react';
import { getSettings, updateSetting } from '../utils/settingsUtils';
import { AppSettings } from '../types/settings';

const SettingsTest: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    loadSettings();
    
    // 监听设置变化
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes['appSettings']) {
        loadSettings();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const loadSettings = async () => {
    const currentSettings = await getSettings();
    setSettings(currentSettings);
  };

  const toggleNotifications = async () => {
    if (!settings) return;
    const newValue = !settings.notificationsEnabled;
    await updateSetting('notificationsEnabled', newValue);
    setSettings({ ...settings, notificationsEnabled: newValue });
  };

  const toggleDebugMode = async () => {
    if (!settings) return;
    const newValue = !settings.debugMode;
    await updateSetting('debugMode', newValue);
    setSettings({ ...settings, debugMode: newValue });
  };

  if (!settings) {
    return <div>Loading settings...</div>;
  }

  return (
    <div style={{
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: settings.debugMode ? '#fff3cd' : '#f0f8ff',
      borderRadius: '0.375rem',
      border: `1px solid ${settings.debugMode ? '#ffeaa7' : '#bee3f8'}`
    }}>
      <h3 style={{ 
        margin: '0 0 0.5rem 0', 
        color: settings.debugMode ? '#856404' : '#2b6cb0',
        display: 'flex',
        alignItems: 'center'
      }}>
        {settings.debugMode ? '🐛' : '⚙️'} Settings Test
        {settings.debugMode && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>(Debug Mode)</span>}
      </h3>
      <div style={{ fontSize: '0.875rem' }}>
        <p>Notifications: {settings.notificationsEnabled ? '✅ Enabled' : '❌ Disabled'}</p>
        <p>Reminder Days: {settings.reminderDaysBefore} days</p>
        <p>Browser Notifications: {settings.showBrowserNotifications ? '✅' : '❌'}</p>
        <p>In-App Reminders: {settings.showInAppReminders ? '✅' : '❌'}</p>
        <p>Debug Mode: {settings.debugMode ? '✅ Active' : '❌ Inactive'}</p>
        {settings.debugMode && settings.mockCaseStatus && (
          <p style={{ color: '#856404', fontWeight: 'bold' }}>
            Mock Status: {settings.mockCaseStatus}
          </p>
        )}
        
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={toggleNotifications}
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
          >
            Toggle Notifications
          </button>
          
          <button
            onClick={toggleDebugMode}
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: settings.debugMode ? '#e53e3e' : '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
          >
            {settings.debugMode ? 'Disable Debug' : 'Enable Debug'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTest; 