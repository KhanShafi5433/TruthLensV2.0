import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ButtonProps } from './Button.types';
import { cyberpunkColors } from '../ui-constants/colors';
import { animationDurations } from '../ui-constants/animations';

const variantStyles = {
  primary: `bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/10 border border-blue-600/50`,
  secondary: `bg-slate-900/50 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold`,
  danger: `bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-rose-400 hover:text-rose-300 font-semibold`,
  ghost: `bg-transparent hover:bg-slate-900/30 border border-slate-800/50 text-slate-400 hover:text-slate-200 font-medium`,
  success: `bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 hover:text-emerald-300 font-semibold`,
  warning: `bg-amber-950/20 hover:bg-amber-950/40 border border-amber-900/30 text-amber-400 hover:text-amber-300 font-semibold`,
} as const;

const sizeStyles = {
  xs: 'px-2 py-1 text-xs rounded-lg',
  sm: 'px-3 py-1.5 text-sm rounded-xl',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-2xl',
} as const;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isPulsing = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const baseStyles = `
      relative inline-flex items-center justify-center gap-2 transition-all duration-200
      font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      focus:ring-offset-[#05070A] disabled:opacity-50 disabled:cursor-not-allowed
      ${isPulsing ? 'animate-pulse' : ''}
      ${fullWidth ? 'w-full' : ''}
    `;

    return (
      <motion.button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.15 }}
        disabled={isDisabled}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
