export const Colors = {
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0051D5',
  primaryLight: '#4DA2FF',
  
  // Secondary colors
  secondary: '#5856D6',
  secondaryDark: '#3634A3',
  secondaryLight: '#8583FF',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#A3A3A3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',
  
  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5AC8FA',
  
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  backgroundDark: '#000000',
  
  // Text colors
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  textInverse: '#FFFFFF',
  
  // Border colors
  border: '#E5E5EA',
  borderDark: '#38383A',
};

export const DarkColors = {
  ...Colors,
  
  // Override for dark mode
  background: '#000000',
  backgroundSecondary: '#1C1C1E',
  backgroundDark: '#000000',
  
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#48484A',
  textInverse: '#000000',
  
  border: '#38383A',
  borderDark: '#48484A',
};
