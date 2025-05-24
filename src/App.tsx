import React from 'react';
import StorageTest from './components/StorageTest';

const App: React.FC = () => {
  return (
    <div style={{ width: '300px', padding: '20px' }}>
      <h1>GreenCard Buddy</h1>
      <p>Welcome to GreenCard Buddy!</p>
      <StorageTest />
    </div>
  );
};

export default App; 