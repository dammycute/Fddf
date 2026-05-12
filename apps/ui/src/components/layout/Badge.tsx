import React from 'react';

interface BadgeProps {
  label: string | number;
  variant: 'green' | 'red' | 'amber' | 'blue' | 'gray';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant }) => {
  const styles = {
    green: { bg: '#22c55e20', text: '#22c55e' },
    red: { bg: '#ef444420', text: '#ef4444' },
    amber: { bg: '#f59e0b20', text: '#f59e0b' },
    blue: { bg: '#3b82f620', text: '#3b82f6' },
    gray: { bg: '#ffffff12', text: '#9399a8' },
  };

  const { bg, text } = styles[variant];

  return (
    <span
      className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
};
