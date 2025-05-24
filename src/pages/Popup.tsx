import React, { useState } from 'react';

const Popup: React.FC = () => {
  const [receiptNumber, setReceiptNumber] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 使用 alert 来测试，因为 console.log 在 popup 中可能不可见
    alert(`Receipt Number: ${receiptNumber}`);
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
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          Save & Check Status
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
        <p style={{ 
          color: '#718096',
          fontSize: '0.875rem'
        }}>
          No case status available
        </p>
      </div>
    </div>
  );
};

export default Popup; 