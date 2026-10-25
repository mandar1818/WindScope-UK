import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'teal' | 'green' | 'amber' | 'red' | 'blue' | 'slate';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md'
}) => {
  const variantStyles = {
    teal: 'bg-cyan-950/80 text-accent-cyan border-cyan-800/60',
    green: 'bg-emerald-950/80 text-accent-emerald border-emerald-800/60',
    amber: 'bg-amber-950/80 text-accent-amber border-amber-800/60',
    red: 'bg-red-950/80 text-red-400 border-red-800/60',
    blue: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
    slate: 'bg-navy-800 text-slate-300 border-navy-700',
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
