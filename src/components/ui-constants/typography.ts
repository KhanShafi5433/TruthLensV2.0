export const typography = {
  headline: 'text-2xl font-display font-bold tracking-tight text-white',
  title: 'text-lg font-display font-semibold tracking-tight text-white',
  subtitle: 'text-sm font-display font-semibold tracking-wide text-slate-300',
  body: 'text-sm font-sans font-normal text-slate-400',
  bodyMuted: 'text-sm font-sans font-normal text-slate-500',
  label: 'text-xs font-mono font-bold uppercase tracking-wider text-slate-300',
  labelMuted: 'text-xs font-mono font-medium uppercase tracking-wider text-slate-500',
  small: 'text-xs font-sans font-normal text-slate-400',
  tiny: 'text-[10px] font-mono font-normal text-slate-500',
  code: 'font-mono text-sm bg-slate-950/80 px-2 py-1 rounded text-slate-200',
} as const;

export const textWeights = {
  thin: 'font-thin',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
} as const;

export const textSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  tiny: 'text-[10px]',
  micro: 'text-[8px]',
} as const;

export const letterSpacing = {
  tight: 'tracking-tight',
  normal: 'tracking-normal',
  wide: 'tracking-wide',
  wider: 'tracking-wider',
  widest: 'tracking-widest',
} as const;

export const lineHeights = {
  tight: 'leading-tight',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  loose: 'leading-loose',
} as const;
