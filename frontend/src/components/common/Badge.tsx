import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'teal' | 'green' | 'amber' | 'red' | 'blue' | 'slate';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
}) => {
  const variantStyles = {
    teal: 'bg-emerald-50 text-nature-forest border-emerald-200',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    red: 'bg-rose-50 text-rose-800 border-rose-200',
    blue: 'bg-sky-50 text-sky-800 border-sky-200',
    slate: 'bg-nature-bg text-nature-text border-nature-border',
  }[variant];

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 rounded',
    md: 'text-xs px-2.5 py-1 rounded-md',
  }[size];

  return (
    <span className={`inline-flex items-center font-medium border ${variantStyles} ${sizeStyles}`}>
      {children}
    </span>
  );
};
