import React, { useState, useEffect } from 'react';
import { fetchStatus, CaseStatus } from '../services/uscisService';
import { setData, getData } from '../utils/storage';
import StatusTracker from '../components/StatusTracker';
import ReminderTest from '../components/ReminderTest';
import ReminderList from '../components/ReminderList';
import SettingsTest from '../components/SettingsTest';
import { checkAndSendNotifications } from '../services/reminderNotificationService';

const STORAGE_KEY = 'userData';

type UserData = {
  receiptNumber: string;
};

const Popup: React.FC = () => {
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [caseStatus, setCaseStatus] = useState<CaseStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadUserData();
    // 独立检查并发送通知（不依赖于UI显示）
    checkAndSendNotifications();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getData<UserData>(STORAGE_KEY);
      if (userData?.receiptNumber) {
        setReceiptNumber(userData.receiptNumber);
        // 自动查询状态
        await handleStatusCheck(userData.receiptNumber);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReceiptNumber(e.target.value);
    setError('');
  };

  const handleStatusCheck = async (number?: string) => {
    const numberToCheck = number || receiptNumber;
    if (!numberToCheck.trim()) {
      setError('Please enter a receipt number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const status = await fetchStatus(numberToCheck);
      setCaseStatus(status);
    } catch (error) {
      setError('Failed to fetch case status. Please try again.');
      console.error('Error fetching status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 保存用户数据
    await setData(STORAGE_KEY, { receiptNumber });
    
    // 查询状态
    await handleStatusCheck();
  };

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div style={{ 
      width: '300px', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          margin: 0,
          color: '#2c3e50'
        }}>
          GreenCard Buddy
        </h1>
        <button
          onClick={openOptionsPage}
          style={{
            padding: '4px 8px',
            backgroundColor: '#e2e8f0',
            color: '#4a5568',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.75rem'
          }}
          title="Open Settings"
        >
          ⚙️ Settings
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label 
            htmlFor="receiptNumber"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#4a5568',
              fontSize: '0.875rem'
            }}
          >
            Receipt Number
          </label>
          <input
            id="receiptNumber"
            type="text"
            value={receiptNumber}
            onChange={handleInputChange}
            placeholder="Enter your receipt number"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: isLoading ? '#a0aec0' : '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          {isLoading ? 'Loading...' : 'Save & Check Status'}
        </button>
      </form>

      <div style={{ 
        marginTop: '1.5rem',
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
          Current Status
        </h2>
        {error ? (
          <p style={{ color: '#e53e3e', fontSize: '0.875rem' }}>
            {error}
          </p>
        ) : caseStatus ? (
          <>
            <StatusTracker status={caseStatus.status} />
            <div>
              <p style={{ 
                color: '#2d3748',
                fontSize: '0.875rem',
                marginBottom: '0.25rem'
              }}>
                {caseStatus.status}
              </p>
              <p style={{ 
                color: '#718096',
                fontSize: '0.75rem'
              }}>
                Updated: {caseStatus.date}
              </p>
            </div>
          </>
        ) : (
          <p style={{ 
            color: '#718096',
            fontSize: '0.875rem'
          }}>
            No case status available
          </p>
        )}
      </div>

      <SettingsTest />

      <div style={{ marginTop: '1.5rem' }}>
        <ReminderTest />
      </div>

      <ReminderList />
    </div>
  );
};

export default Popup; 