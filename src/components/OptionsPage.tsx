import React, { useState, useEffect } from 'react';
import { AppSettings, MOCK_CASE_STATUSES, DEFAULT_SETTINGS } from '../types/settings';
import { getSettings, saveSettings, resetSettings } from '../utils/settingsUtils';
import { realUscisService } from '../services/realUscisService';
import { apiTest } from '../services/apiTest';

interface TestLog {
  date: string;
  connectionTest: boolean;
  queryResults: {
    success: number;
    error: number;
    total: number;
    responseCodes: {
      '200': number;
      '400': number;
      '401': number;
      '404': number;
      '503': number;
    };
  };
  timestamp: string;
}

const OptionsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<string>('');
  const [testRunResult, setTestRunResult] = useState<string>('');
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    hasFiveDays: boolean;
    hasSuccessAndErrors: boolean;
    totalDays: number;
    lastTestDate: string | null;
  } | null>(null);
  const [testLogs, setTestLogs] = useState<TestLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings?.useRealApi) {
      loadTestStatus();
      loadTestLogs();
    }
  }, [settings?.useRealApi]);

  const loadSettings = async () => {
    try {
      console.log('Loading settings...');
      const currentSettings = await getSettings();
      console.log('Settings loaded:', currentSettings);
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      // 如果加载失败，使用默认设置
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const loadTestStatus = async () => {
    try {
      const requirements = await apiTest.checkProductionRequirements();
      setTestStatus(requirements);
    } catch (error) {
      console.error('Error loading test status:', error);
    }
  };

  const loadTestLogs = async () => {
    try {
      console.log('Starting to load test logs...');
      const logs = await chrome.storage.local.get('apiTestLogs');
      console.log('Raw logs from storage:', logs);
      
      if (!logs) {
        console.log('No logs object found in storage');
        setTestLogs([]);
        return;
      }
      
      if (!logs.apiTestLogs) {
        console.log('No apiTestLogs found in storage');
        setTestLogs([]);
        return;
      }

      if (!Array.isArray(logs.apiTestLogs)) {
        console.log('apiTestLogs is not an array:', logs.apiTestLogs);
        setTestLogs([]);
        return;
      }

      console.log('Parsed test logs array:', logs.apiTestLogs);

      // 确保日志数据是数组且每个元素都有正确的结构
      const validLogs = logs.apiTestLogs.filter((log: any) => {
        const isValid = log && 
               typeof log === 'object' && 
               typeof log.date === 'string' &&
               typeof log.connectionTest === 'boolean' &&
               log.queryResults &&
               typeof log.queryResults === 'object' &&
               typeof log.queryResults.total === 'number' &&
               typeof log.queryResults.success === 'number' &&
               typeof log.queryResults.error === 'number' &&
               log.queryResults.responseCodes &&
               typeof log.queryResults.responseCodes === 'object';
        
        if (!isValid) {
          console.log('Invalid log entry:', log);
        }
        return isValid;
      });

      console.log('Valid logs after filtering:', validLogs);
      setTestLogs(validLogs);
    } catch (error) {
      console.error('Error loading test logs:', error);
      setTestLogs([]);
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

  const handleRunTest = async () => {
    try {
      setIsRunningTest(true);
      setTestRunResult('');
      const result = await apiTest.runDailyTest();
      setTestRunResult(result ? '✅ Test completed successfully' : '❌ Test failed');
      await loadTestStatus();
      await loadTestLogs();
    } catch (error) {
      console.error('Error running test:', error);
      setTestRunResult('❌ Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsRunningTest(false);
    }
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (!settings) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        color: '#4a5568',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <h2>Loading Settings...</h2>
        <p>Please wait while we load your settings.</p>
      </div>
    );
  }

  try {
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

        {/* API Test Status Section */}
        {settings?.useRealApi && (
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
              🧪 API Test Status
            </h2>

            <div style={{ marginBottom: '15px' }}>
              <button
                onClick={handleRunTest}
                disabled={isRunningTest}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isRunningTest ? '#a0aec0' : '#4299e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isRunningTest ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  marginRight: '10px'
                }}
              >
                {isRunningTest ? 'Testing...' : 'Run Test Now'}
              </button>
              {testRunResult && (
                <span style={{ 
                  fontSize: '0.875rem',
                  color: testRunResult.startsWith('✅') ? '#38a169' : '#e53e3e',
                  marginRight: '10px'
                }}>
                  {testRunResult}
                </span>
              )}
              <span style={{ 
                fontSize: '0.875rem',
                color: '#718096'
              }}>
                (Tests also run automatically daily)
              </span>
            </div>

            {testStatus && (
              <div style={{
                padding: '15px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ 
                  fontSize: '1rem',
                  marginBottom: '10px',
                  color: '#2d3748'
                }}>
                  Production Requirements Status
                </h3>
                
                <ul style={{ 
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  <li style={{ 
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{ 
                      color: testStatus.hasFiveDays ? '#38a169' : '#e53e3e',
                      marginRight: '8px'
                    }}>
                      {testStatus.hasFiveDays ? '✅' : '❌'}
                    </span>
                    {testStatus.totalDays} days of testing (need 5+ days)
                  </li>
                  <li style={{ 
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{ 
                      color: testStatus.hasSuccessAndErrors ? '#38a169' : '#e53e3e',
                      marginRight: '8px'
                    }}>
                      {testStatus.hasSuccessAndErrors ? '✅' : '❌'}
                    </span>
                    Success and error responses tested
                  </li>
                  <li style={{ 
                    fontSize: '0.875rem',
                    color: '#718096'
                  }}>
                    Last test date: {testStatus.lastTestDate || 'Never'}
                  </li>
                </ul>

                {testStatus.hasFiveDays && testStatus.hasSuccessAndErrors && (
                  <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: '#c6f6d5',
                    border: '1px solid #9ae6b4',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}>
                    <strong>🎉 Ready for Production!</strong>
                    <p style={{ margin: '5px 0 0 0' }}>
                      You have met all requirements for production access. 
                      Contact USCIS Torch API Developer Support at{' '}
                      <a href="mailto:developersupport@uscis.dhs.gov" style={{ color: '#2f855a' }}>
                        developersupport@uscis.dhs.gov
                      </a>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Test Logs Section */}
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={() => setShowLogs(!showLogs)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4a5568',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                {showLogs ? 'Hide Test Logs' : 'Show Test Logs'}
              </button>

              {showLogs && (
                <div style={{
                  marginTop: '15px',
                  padding: '15px',
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  <h3 style={{ 
                    fontSize: '1rem',
                    marginBottom: '10px',
                    color: '#2d3748'
                  }}>
                    Test Logs
                  </h3>

                  {testLogs.length === 0 ? (
                    <p style={{ color: '#718096' }}>No test logs available</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {testLogs.map((log, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '10px',
                            backgroundColor: '#f7fafc',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            marginBottom: '5px'
                          }}>
                            <strong>Date: {log.date}</strong>
                            <span style={{ color: '#718096', fontSize: '0.875rem' }}>
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          <div style={{ marginBottom: '5px' }}>
                            <span style={{ 
                              color: log.connectionTest ? '#38a169' : '#e53e3e',
                              marginRight: '8px'
                            }}>
                              {log.connectionTest ? '✅' : '❌'}
                            </span>
                            Connection Test
                          </div>

                          <div style={{ fontSize: '0.875rem' }}>
                            <div>Total Queries: {log.queryResults.total}</div>
                            <div>Successful: {log.queryResults.success}</div>
                            <div>Errors: {log.queryResults.error}</div>
                            
                            <div style={{ marginTop: '5px' }}>
                              <strong>Response Codes:</strong>
                              <ul style={{ 
                                listStyle: 'none', 
                                padding: 0,
                                margin: '5px 0 0 0'
                              }}>
                                {Object.entries(log.queryResults.responseCodes).map(([code, count]) => (
                                  <li key={code}>
                                    {code}: {count}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

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
  } catch (error) {
    console.error('Error rendering OptionsPage:', error);
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        color: '#4a5568',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <h2>Error Loading Settings</h2>
        <p>An error occurred while loading your settings. Please try again later.</p>
      </div>
    );
  }
};

export default OptionsPage; 