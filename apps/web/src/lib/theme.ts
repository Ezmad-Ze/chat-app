export type Theme = 'light' | 'dark';

export const themes: Record<Theme, Record<string, string>> = {
  light: {
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.1 0 0)',
    card: 'oklch(0.98 0 0)',
    'card-foreground': 'oklch(0.1 0 0)',
    primary: 'oklch(0.45 0.25 250)',
    'primary-foreground': 'oklch(1 0 0)',
    secondary: 'oklch(0.92 0.05 250)',
    'secondary-foreground': 'oklch(0.1 0 0)',
  },
  dark: {
    background: 'oklch(0.1 0 0)',
    foreground: 'oklch(0.95 0 0)',
    card: 'oklch(0.12 0 0)',
    'card-foreground': 'oklch(0.95 0 0)',
    primary: 'oklch(0.7 0.25 250)',
    'primary-foreground': 'oklch(1 0 0)',
    secondary: 'oklch(0.18 0.05 250)',
    'secondary-foreground': 'oklch(0.95 0 0)',
  },
};