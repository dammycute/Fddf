import React from 'react';

interface StatBarProps {
  value: number; // 0-100
  label?: string;
  size?: 'sm' | 'md';
}

export const StatBar: React.FC<StatBarProps> = ({ value, label, size = 'md' }) => {
  const height = size === 'sm' ? '4px' : '8px';

  let color = '#ef4444'; // red
  if (value >= 60) color = '#22c55e'; // green
  else if (value >= 30) color = '#f59e0b'; // amber

  return (
    <div className="flex items-center gap-2 w-full min-w-[60px]">
      <div className="flex-1 bg-[#ffffff12] rounded-full overflow-hidden" style={{ height }}>
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }}
        />
      </div>
      {(label || label === "") && (
        <span className="text-[11px] font-mono text-[#9399a8] min-w-[24px] text-right">
          {Math.round(value)}
        </span>
      )}
    </div>
  );
};
