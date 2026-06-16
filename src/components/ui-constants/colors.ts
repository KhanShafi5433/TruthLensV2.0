export const cyberpunkColors = {
  risk: {
    low: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-950/20',
      border: 'border-emerald-500/30',
      accent: 'emerald-400',
    },
    moderate: {
      text: 'text-amber-400',
      bg: 'bg-amber-950/20',
      border: 'border-amber-500/30',
      accent: 'amber-400',
    },
    suspicious: {
      text: 'text-orange-400',
      bg: 'bg-orange-950/20',
      border: 'border-orange-500/30',
      accent: 'orange-400',
    },
    high: {
      text: 'text-red-400',
      bg: 'bg-red-950/20',
      border: 'border-red-500/30',
      accent: 'red-400',
    },
  },
  primary: {
    text: 'text-blue-400',
    bg: 'bg-blue-950/20',
    border: 'border-blue-500/30',
    accent: 'blue-500',
  },
  secondary: {
    text: 'text-slate-400',
    bg: 'bg-slate-900/50',
    border: 'border-slate-800',
    accent: 'slate-600',
  },
  danger: {
    text: 'text-rose-400',
    bg: 'bg-rose-950/20',
    border: 'border-rose-900/30',
    accent: 'rose-500',
  },
  success: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-950/20',
    border: 'border-emerald-500/30',
    accent: 'emerald-500',
  },
  warning: {
    text: 'text-amber-400',
    bg: 'bg-amber-950/20',
    border: 'border-amber-500/30',
    accent: 'amber-500',
  },
} as const;

export const bgGradients = {
  screenBase: 'bg-[#05070A]',
  meshOverlay: 'bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.04),transparent_60%)]',
  primaryGradient: 'bg-linear-to-r from-blue-600 to-indigo-700',
  primaryHover: 'hover:from-blue-500 hover:to-indigo-600',
} as const;

export const textColors = {
  primary: 'text-white',
  secondary: 'text-slate-300',
  tertiary: 'text-slate-400',
  muted: 'text-slate-500',
  disabled: 'text-slate-700',
} as const;

export const borderColors = {
  primary: 'border-slate-800',
  secondary: 'border-slate-900',
  focus: 'focus:border-blue-500',
  glow: 'border-blue-500/30',
} as const;
