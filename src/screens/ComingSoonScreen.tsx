import React from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../components/Theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export const ComingSoonScreen: React.FC = () => {
  const { currentScreen, navigate } = useApp();

  const config: Record<string, { title: string; icon: IconName }> = {
    search: { title: 'Tìm kiếm sản phẩm', icon: 'search-outline' },
    scan: { title: 'Quét sản phẩm', icon: 'scan-outline' },
    ai_suggestions: { title: 'Gợi ý AI', icon: 'sparkles-outline' },
  };

  const currentConfig = config[currentScreen] || {
    title: 'Tính năng mới',
    icon: 'star-outline',
  };

  return (
    <SafeAreaView style={styles.comingSoonScreen}>
      <View style={styles.comingSoonIcon}>
        <Ionicons name={currentConfig.icon} size={42} color={COLORS.GREEN} />
      </View>
      <Text style={styles.comingSoonTitle}>{currentConfig.title}</Text>
      <Text style={styles.comingSoonText}>
        Khung trang đã được kết nối sẵn. Tính năng này sẽ được phát triển đầy đủ ở các bước tiếp theo.
      </Text>
      <Pressable style={styles.returnHomeButton} onPress={() => navigate('home')}>
        <Text style={styles.returnHomeText}>Về trang chủ</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  comingSoonScreen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 76,
  },
  comingSoonIcon: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: COLORS.LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonTitle: {
    color: COLORS.TEXT,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 18,
  },
  comingSoonText: {
    color: COLORS.MUTED,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  returnHomeButton: {
    backgroundColor: COLORS.GREEN,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
    marginTop: 18,
  },
  returnHomeText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
