import React, { useState, useEffect } from 'react';
import { AppSettings, MOCK_CASE_STATUSES } from '../types/settings';
import { getSettings, saveSettings, resetSettings } from '../utils/settingsUtils';

const OptionsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      await saveSettings(settings);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      try {
        await resetSettings();
        await loadSettings();
        setSaveMessage('Settings reset to default');
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (error) {
        console.error('Error resetting settings:', error);
      }
    }
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (!settings) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          color: '#2c3e50',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          GreenCard Buddy Settings
        </h1>

        {/* 提醒设置 */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            color: '#2d3748',
            fontSize: '1.25rem',
            marginBottom: '15px',
            borderBottom: '2px solid #e2e8f0',
            paddingBottom: '5px'
          }}>
            Reminder Settings
          </h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex',
              alignItems: 'center',
              fontSize: '1rem',
              color: '#4a5568'
            }}>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => updateSetting('notificationsEnabled', e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              Enable reminders
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block',
              fontSize: '1rem',
              color: '#4a5568',
              marginBottom: '5px'
            }}>
              Remind me how many days before:
            </label>
            <select
              value={settings.reminderDaysBefore}
              onChange={(e) => updateSetting('reminderDaysBefore', parseInt(e.target.value))}
              style={{
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value={1}>1 day</option>
              <option value={2}>2 days</option>
              <option value={3}>3 days</option>
              <option value={5}>5 days</option>
              <option value={7}>1 week</option>
            </select>
          </div>
        </section>

        {/* 通知偏好 */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            color: '#2d3748',
            fontSize: '1.25rem',
            marginBottom: '15px',
            borderBottom: '2px solid #e2e8f0',
            paddingBottom: '5px'
          }}>
            Notification Preferences
          </h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex',
              alignItems: 'center',
              fontSize: '1rem',
              color: '#4a5568'
            }}>
              <input
                type="checkbox"
                checked={settings.showBrowserNotifications}
                onChange={(e) => updateSetting('showBrowserNotifications', e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              Show browser notifications
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex',
              alignItems: 'center',
              fontSize: '1rem',
              color: '#4a5568'
            }}>
              <input
                type="checkbox"
                checked={settings.showInAppReminders}
                onChange={(e) => updateSetting('showInAppReminders', e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              Show in-app reminder cards
            </label>
          </div>
        </section>

        {/* 调试模式 */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            color: '#2d3748',
            fontSize: '1.25rem',
            marginBottom: '15px',
            borderBottom: '2px solid #e2e8f0',
            paddingBottom: '5px'
          }}>
            Debug Mode
          </h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex',
              alignItems: 'center',
              fontSize: '1rem',
              color: '#4a5568'
            }}>
              <input
                type="checkbox"
                checked={settings.debugMode}
                onChange={(e) => updateSetting('debugMode', e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              Enable debug mode
            </label>
          </div>

          {settings.debugMode && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: '1rem',
                  color: '#4a5568',
                  marginBottom: '5px'
                }}>
                  Mock case status:
                </label>
                <select
                  value={settings.mockCaseStatus || ''}
                  onChange={(e) => updateSetting('mockCaseStatus', e.target.value || undefined)}
                  style={{
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    width: '100%'
                  }}
                >
                  <option value="">Use real API</option>
                  {MOCK_CASE_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* 调试信息显示 */}
              <div style={{
                padding: '10px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}>
                <strong>🐛 Debug Mode Active</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  <li>Receipt number validation is relaxed</li>
                  <li>Mock status: {settings.mockCaseStatus || 'Random based on receipt number'}</li>
                  <li>Check browser console for debug logs</li>
                </ul>
              </div>
            </>
          )}
        </section>

        {/* 保存消息 */}
        {saveMessage && (
          <div style={{
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: saveMessage.includes('Error') ? '#fed7d7' : '#c6f6d5',
            color: saveMessage.includes('Error') ? '#c53030' : '#2f855a',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            {saveMessage}
          </div>
        )}

        {/* 按钮 */}
        <div style={{ 
          display: 'flex',
          gap: '10px',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '10px 20px',
              backgroundColor: isSaving ? '#a0aec0' : '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: '10px 20px',
              backgroundColor: '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptionsPage; 