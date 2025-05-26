import React from 'react';

// 婚姻绿卡申请的主要状态步骤（基于实际USCIS流程）
const STATUS_STEPS = [
  'Case Was Received',
  'Biometrics Appointment Was Scheduled',
  'Employment Authorization Document Was Approved',
  'Interview Was Scheduled',
  'Case Was Approved',
  'New Card Is Being Produced',
  'Card Was Delivered'
];

// 状态的简短显示名称
const STATUS_DISPLAY_NAMES = [
  'Case Received',
  'Biometrics Scheduled',
  'Work Authorization Approved',
  'Interview Scheduled',
  'Case Approved',
  'Card Being Produced',
  'Card Delivered'
];

interface StatusTrackerProps {
  status: string;
}

const StatusTracker: React.FC<StatusTrackerProps> = ({ status }) => {
  const currentStep = STATUS_STEPS.findIndex(s => s === status);

  return (
    <div style={{ margin: '1rem 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {STATUS_STEPS.map((label, idx) => {
          const isActive = idx <= currentStep && currentStep !== -1;
          const isCurrent = idx === currentStep;
          return (
            <div key={label} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              backgroundColor: isCurrent ? '#ebf8ff' : 'transparent',
              border: isCurrent ? '1px solid #4299e1' : '1px solid transparent'
            }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isActive ? '#4299e1' : '#e2e8f0',
                  color: isActive ? 'white' : '#a0aec0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                  flexShrink: 0
                }}
              >
                {isActive ? '✓' : idx + 1}
              </div>
              <div style={{ 
                flex: 1,
                fontSize: '0.875rem',
                color: isActive ? '#2d3748' : '#718096',
                fontWeight: isCurrent ? 600 : 400
              }}>
                {STATUS_DISPLAY_NAMES[idx]}
              </div>
              {isCurrent && (
                <div style={{
                  fontSize: '0.75rem',
                  color: '#4299e1',
                  fontWeight: 600
                }}>
                  Current
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTracker; 