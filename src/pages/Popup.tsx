import React, { useState, useEffect } from 'react';
import { fetchStatus, CaseStatus } from '../services/uscisService';
import { setData, getData } from '../utils/storage';
import StatusTracker from '../components/StatusTracker';

const STORAGE_KEY = 'userData';

type UserData = {
  receiptNumber: string;
};

const Popup: React.FC = () => {
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [caseStatus, setCaseStatus] = useState<CaseStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 页面加载时自动读取编号并查询
  useEffect(() => {
    const saved = getData<UserData>(STORAGE_KEY);
    if (saved?.receiptNumber) {
      setReceiptNumber(saved.receiptNumber);
      handleFetchStatus(saved.receiptNumber);
    }
  }, []);

  // 查询状态并保存编号
  const handleFetchStatus = async (number: string) => {
    setIsLoading(true);
    setError(null);
    setCaseStatus(null);
    try {
      const status = await fetchStatus(number);
      setCaseStatus(status);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch case status');
    } finally {
      setIsLoading(false);
    }
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setData<UserData>(STORAGE_KEY, { receiptNumber });
    handleFetchStatus(receiptNumber);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReceiptNumber(e.target.value);
  };

  return (
    <div style={{ 
      width: '300px', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '1.5rem', 
        marginBottom: '1rem',
        color: '#2c3e50'
      }}>
        GreenCard Buddy
      </h1>

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
    </div>
  );
};

export default Popup; 