export const cyberpunkShadows = {
  glow: {
    blue: 'shadow-lg shadow-blue-500/20',
    blueNeon: 'shadow-xl shadow-blue-500/30',
    red: 'shadow-lg shadow-red-500/20',
    redNeon: 'shadow-xl shadow-red-500/30',
    emerald: 'shadow-lg shadow-emerald-500/20',
    emeraldNeon: 'shadow-xl shadow-emerald-500/30',
    orange: 'shadow-lg shadow-orange-500/20',
    orangeNeon: 'shadow-xl shadow-orange-500/30',
  },
  depth: {
    xs: 'shadow-sm shadow-black/20',
    sm: 'shadow-md shadow-black/20',
    md: 'shadow-lg shadow-black/30',
    lg: 'shadow-xl shadow-black/40',
    xl: 'shadow-2xl shadow-black/50',
  },
  card: {
    default: 'shadow-lg shadow-black/20',
    elevated: 'shadow-xl shadow-blue-500/10',
    floating: 'shadow-2xl shadow-black/40',
  },
} as const;

export const dropShadowEffects = {
  glowBlue: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))',
  glowRed: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))',
  glowEmerald: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))',
  glowOrange: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.5))',
  glow: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.3))',
} as const;

export const textShadows = {
  cyberpunkSm: 'text-shadow-sm',
  cyberpunkMd: 'text-shadow-md',
  glowBlue: '0 0 10px rgba(59, 130, 246, 0.3)',
  glowRed: '0 0 10px rgba(239, 68, 68, 0.3)',
} as const;
