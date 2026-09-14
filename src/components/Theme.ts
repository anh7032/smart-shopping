import { Platform, StatusBar as NativeStatusBar } from 'react-native';

export const COLORS = {
  GREEN: '#2F9143',
  DARK_GREEN: '#1D7F37',
  DEEP_GREEN: '#114D24',
  LIGHT_GREEN: '#EAF7EC',
  MINT: '#D8F0DC',
  BACKGROUND: '#F1F6F1',
  CARD: '#FFFFFF',
  TEXT: '#14291A',
  MUTED: '#68796D',
  BORDER: '#D9E5DB',
  SOFT_BORDER: '#E7EFE8',
  RED: '#FF4D5E',
  AMBER: '#FFB020',
  GOLD: '#FFD43B',
  GLASS: 'rgba(255, 255, 255, 0.72)',
};

export const RADIUS = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  pill: 999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const TYPOGRAPHY = {
  display: 26,
  title: 20,
  subtitle: 16,
  body: 14,
  caption: 12,
  micro: 10,
};

export const SHADOW = Platform.select({
  ios: {
    shadowColor: '#132A18',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  android: { elevation: 3 },
  default: {},
});

export const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#0F2B17',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  android: { elevation: 6 },
  default: {},
});

export const FLOAT_SHADOW = Platform.select({
  ios: {
    shadowColor: '#0E3B1D',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  android: { elevation: 8 },
  default: {},
});

export const TOP_INSET = Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 24 : 0;

export const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`;

