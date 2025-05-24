import React, { useState } from 'react';
import { setData, getData } from '../utils/storage';

const StorageTest: React.FC = () => {
  const [testData, setTestData] = useState<string>('');
  const [savedData, setSavedData] = useState<string | null>(null);

  // 测试数据
  const testObject = {
    receiptNumber: 'IOE1234567890',
    timestamp: new Date().toISOString()
  };

  const handleSave = () => {
    setData('testData', testObject);
    setTestData('Data saved!');
  };

  const handleLoad = () => {
    const data = getData<typeof testObject>('testData');
    setSavedData(data ? JSON.stringify(data, null, 2) : 'No data found');
  };

  return (
    <div style={{ padding: '10px' }}>
      <h2>Storage Test</h2>
      <button onClick={handleSave} style={{ marginRight: '10px' }}>
        Save Test Data
      </button>
      <button onClick={handleLoad}>Load Test Data</button>
      {testData && <p>{testData}</p>}
      {savedData && (
        <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
          {savedData}
        </pre>
      )}
    </div>
  );
};

export default StorageTest; 