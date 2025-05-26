import React, { useState, useEffect } from 'react';
import { AppSettings, MOCK_CASE_STATUSES } from '../types/settings';
import { getSettings, saveSettings, resetSettings } from '../utils/settingsUtils';
import { realUscisService } from '../services/realUscisService';

const OptionsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<string>('');

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

  const handleTestApi = async () => {
    if (!settings) return;
    
    setIsTestingApi(true);
    setApiTestResult('');
    
    try {
      // 配置API服务
      realUscisService.configure({
        clientId: settings.uscisClientId,
        clientSecret: settings.uscisClientSecret,
        sandboxMode: settings.uscisSandboxMode
      });
      
      // 测试连接
      const result = await realUscisService.testConnection();
      setApiTestResult(result.success ? `✅ ${result.message}` : `❌ ${result.message}`);
    } catch (error) {
      setApiTestResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestingApi(false);
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
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '2rem',
        marginBottom: '2rem',
        color: '#2d3748'
      }}>
        GreenCard Buddy Settings
      </h1>

      {/* USCIS API 配置部分 */}
      <section style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ 
          fontSize: '1.25rem',
          marginBottom: '1rem',
          color: '#2d3748'
        }}>
          🔗 USCIS API Configuration
        </h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            fontSize: '1rem',
            color: '#4a5568',
            marginBottom: '10px'
          }}>
            <input
              type="checkbox"
              checked={settings.useRealApi}
              onChange={(e) => updateSetting('useRealApi', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Use Real USCIS API (instead of mock data)
          </label>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#718096',
            marginLeft: '24px'
          }}>
            Enable this to use the official USCIS Case Status API. Requires API credentials from{' '}
            <a href="https://developer.uscis.gov" target="_blank" rel="noopener noreferrer" 
               style={{ color: '#4299e1', textDecoration: 'underline' }}>
              developer.uscis.gov
            </a>
          </p>
        </div>

        {settings.useRealApi && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block',
                fontSize: '1rem',
                color: '#4a5568',
                marginBottom: '5px'
              }}>
                Client ID:
              </label>
              <input
                type="text"
                value={settings.uscisClientId}
                onChange={(e) => updateSetting('uscisClientId', e.target.value)}
                placeholder="Enter your USCIS API Client ID"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block',
                fontSize: '1rem',
                color: '#4a5568',
                marginBottom: '5px'
              }}>
                Client Secret:
              </label>
              <input
                type="password"
                value={settings.uscisClientSecret}
                onChange={(e) => updateSetting('uscisClientSecret', e.target.value)}
                placeholder="Enter your USCIS API Client Secret"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
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
                  checked={settings.uscisSandboxMode}
                  onChange={(e) => updateSetting('uscisSandboxMode', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                Use Sandbox Mode (recommended for testing)
              </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <button
                onClick={handleTestApi}
                disabled={isTestingApi || !settings.uscisClientId || !settings.uscisClientSecret}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isTestingApi ? '#a0aec0' : '#4299e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isTestingApi ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  marginRight: '10px'
                }}
              >
                {isTestingApi ? 'Testing...' : 'Test API Connection'}
              </button>
              {apiTestResult && (
                <span style={{ 
                  fontSize: '0.875rem',
                  color: apiTestResult.startsWith('✅') ? '#38a169' : '#e53e3e'
                }}>
                  {apiTestResult}
                </span>
              )}
            </div>

            <div style={{
              padding: '10px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}>
              <strong>📋 How to get API credentials:</strong>
              <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>Visit <a href="https://developer.uscis.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#4299e1' }}>developer.uscis.gov</a></li>
                <li>Sign up for a developer account</li>
                <li>Create a new app and request access to "Case Status API - Sandbox"</li>
                <li>Copy your Client ID and Client Secret here</li>
              </ol>
            </div>
          </>
        )}
      </section>

      {/* 提醒设置部分 */}
      <section style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ 
          fontSize: '1.25rem',
          marginBottom: '1rem',
          color: '#2d3748'
        }}>
          🔔 Reminder Settings
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
              style={{ marginRight: '8px' }}
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
            Remind me this many days before appointment:
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
            {[0, 1, 2, 3, 4, 5, 6, 7].map(days => (
              <option key={days} value={days}>
                {days === 0 ? 'On appointment day only' : `${days} day${days > 1 ? 's' : ''}`}
              </option>
            ))}
          </select>
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
              checked={settings.showBrowserNotifications}
              onChange={(e) => updateSetting('showBrowserNotifications', e.target.checked)}
              style={{ marginRight: '8px' }}
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
              style={{ marginRight: '8px' }}
            />
            Show in-app reminder cards
          </label>
        </div>
      </section>

      {/* 调试模式部分 */}
      <section style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: settings.debugMode ? '#fff3cd' : '#f7fafc',
        borderRadius: '8px',
        border: `1px solid ${settings.debugMode ? '#ffeaa7' : '#e2e8f0'}`
      }}>
        <h2 style={{ 
          fontSize: '1.25rem',
          marginBottom: '1rem',
          color: '#2d3748'
        }}>
          🐛 Debug Mode
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
              style={{ marginRight: '8px' }}
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
                <option value="">Use default mock data</option>
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
                <li>Real API calls are disabled (uses mock data)</li>
                <li>Mock status: {settings.mockCaseStatus || 'Random based on receipt number'}</li>
                <li>Check browser console for debug logs</li>
              </ul>
            </div>
          </>
        )}
      </section>

      {/* 保存和重置按钮 */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: '12px 24px',
            backgroundColor: isSaving ? '#a0aec0' : '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>

        <button
          onClick={handleReset}
          style={{
            padding: '12px 24px',
            backgroundColor: '#e53e3e',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          Reset to Default
        </button>
      </div>

      {/* 保存消息 */}
      {saveMessage && (
        <div style={{
          padding: '12px',
          backgroundColor: saveMessage.includes('Error') ? '#fed7d7' : '#c6f6d5',
          color: saveMessage.includes('Error') ? '#c53030' : '#2f855a',
          borderRadius: '6px',
          fontSize: '0.875rem'
        }}>
          {saveMessage}
        </div>
      )}
    </div>
  );
};

export default OptionsPage; 