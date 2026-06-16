export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  xxl: '3rem',      // 48px
} as const;

export const spacingScale = (multiplier: number) => `${0.25 * multiplier}rem`;

export const screenSpacing = {
  section: 'gap-6',      // Between major sections
  group: 'gap-3',        // Between related items
  item: 'gap-2',         // Between list items
  padding: {
    screen: 'p-5',       // Screen padding
    card: 'p-4',         // Card interior
    tight: 'p-3',        // Compact elements
  }
} as const;
