import React from 'react';

// 状态与步骤映射
const STATUS_STEPS = [
  'Case Was Received',
  'Fingerprint Fee Was Received',
  'Biometrics Appointment Was Scheduled',
  'Interview Was Scheduled',
  'Case Was Approved'
];

interface StatusTrackerProps {
  status: string;
}

const StatusTracker: React.FC<StatusTrackerProps> = ({ status }) => {
  const currentStep = STATUS_STEPS.findIndex(s => s === status);

  return (
    <div style={{ margin: '1rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {STATUS_STEPS.map((label, idx) => {
          const isActive = idx <= currentStep && currentStep !== -1;
          return (
            <div key={label} style={{ textAlign: 'center', flex: 1 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: isActive ? '#4299e1' : '#e2e8f0',
                  color: isActive ? 'white' : '#a0aec0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                {idx + 1}
              </div>
              <div style={{ fontSize: 10, marginTop: 4, color: isActive ? '#2d3748' : '#a0aec0' }}>
                {label.replace('Was ', '')}
              </div>
            </div>
          );
        })}
      </div>
      {/* 进度条线 */}
      <div style={{
        height: 4,
        background: '#e2e8f0',
        borderRadius: 2,
        margin: '8px 0',
        position: 'relative'
      }}>
        <div style={{
          height: 4,
          background: '#4299e1',
          borderRadius: 2,
          width: `${((currentStep + 1) / STATUS_STEPS.length) * 100}%`,
          transition: 'width 0.3s'
        }} />
      </div>
    </div>
  );
};

export default StatusTracker; 