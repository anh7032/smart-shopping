import { Platform, StatusBar as NativeStatusBar } from 'react-native';

export const COLORS = {
  GREEN: '#2F9143',
  DARK_GREEN: '#1D7F37',
  LIGHT_GREEN: '#EAF7EC',
  BACKGROUND: '#F4F7F4',
  TEXT: '#18321E',
  MUTED: '#708074',
  BORDER: '#D9E5DB',
  RED: '#FF4D5E',
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

export const TOP_INSET = Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 24 : 0;

export const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`;
