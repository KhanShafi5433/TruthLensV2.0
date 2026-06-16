export const animationDurations = {
  instant: '50ms',
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slowest: '800ms',
} as const;

export const animationEasing = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  cyberpunk: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export const motionPresets = {
  buttonHover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
  buttonClick: {
    scale: 0.98,
    transition: { duration: 0.15 },
  },
  cardEnter: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  },
  pulse: {
    animate: { opacity: [0.6, 1, 0.6] },
    transition: { duration: 2, repeat: Infinity },
  },
} as const;

export const shouldReduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
