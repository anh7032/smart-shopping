import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ScreenName } from '../types';
import { COLORS, SHADOW } from './Theme';

type TabKey = 'home' | 'search' | 'scan' | 'ai' | 'cart';
type IconName = React.ComponentProps<typeof Ionicons>['name'];

export const BottomNavigation: React.FC = () => {
  const { currentScreen, cart, navigate, session } = useApp();

  // If there's no session, do not render BottomNavigation
  if (!session) return null;

  const tabs: { key: TabKey; screen: ScreenName; label: string; icon: IconName }[] = [
    { key: 'home', screen: 'home', label: 'Trang chủ', icon: 'home-outline' },
    { key: 'search', screen: 'search', label: 'Tìm kiếm', icon: 'search-outline' },
    { key: 'scan', screen: 'scan', label: 'Quét SP', icon: 'scan-outline' },
    { key: 'ai', screen: 'ai_suggestions', label: 'Gợi ý AI', icon: 'sparkles-outline' },
    { key: 'cart', screen: 'cart', label: 'Giỏ hàng', icon: 'cart-outline' },
  ];

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Active tab detection
  const getActiveTab = (): TabKey => {
    if (currentScreen === 'home') return 'home';
    if (currentScreen === 'search' || currentScreen === 'search_results') return 'search';
    if (currentScreen === 'scan') return 'scan';
    if (currentScreen === 'ai_suggestions') return 'ai';
    if (currentScreen === 'cart') return 'cart';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        const isScan = tab.key === 'scan';
        return (
          <Pressable
            key={tab.key}
            style={styles.navItem}
            onPress={() => navigate(tab.screen)}
          >
            <View
              style={[
                styles.navIconWrap,
                active && !isScan && styles.navIconWrapActive,
                isScan && styles.scanNavButton,
              ]}
            >
              <Ionicons
                name={tab.icon}
                size={isScan ? 25 : 21}
                color={isScan ? '#FFFFFF' : active ? COLORS.GREEN : '#607366'}
              />
              {tab.key === 'cart' && cartCount > 0 ? (
                <View style={styles.navCartBadge}>
                  <Text style={styles.navCartBadgeText}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[
                styles.navLabel,
                active && styles.navLabelActive,
                isScan && styles.scanNavLabel,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 76,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E1E8E2',
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingBottom: 4,
    ...SHADOW,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrap: {
    width: 34,
    height: 31,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapActive: {
    backgroundColor: COLORS.LIGHT_GREEN,
  },
  scanNavButton: {
    width: 52,
    height: 52,
    borderRadius: 27,
    backgroundColor: COLORS.GREEN,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginTop: -27,
    ...SHADOW,
  },
  navLabel: {
    color: '#607366',
    fontSize: 9,
    marginTop: 2,
  },
  navLabelActive: {
    color: COLORS.GREEN,
    fontWeight: '800',
  },
  scanNavLabel: {
    marginTop: -1,
  },
  navCartBadge: {
    position: 'absolute',
    right: -2,
    top: -3,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: COLORS.RED,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  navCartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
