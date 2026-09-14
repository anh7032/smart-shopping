import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ScreenName } from '../types';
import { CARD_SHADOW, COLORS } from './Theme';
import { AnimatedPressable } from './ui/AnimatedPressable';

type TabKey = 'home' | 'search' | 'scan' | 'ai' | 'cart';
type IconName = React.ComponentProps<typeof Ionicons>['name'];

export const BottomNavigation: React.FC = () => {
  const { currentScreen, cart, navigate, session, userRole } = useApp();

  // Hide BottomNavigation on checkout, payment, invoice, and inspector screens to prevent overlap
  const hiddenScreens: ScreenName[] = [
    'checkout_confirm',
    'qr_payment',
    'invoice',
    'exit_verification',
    'verification_result',
    'inspector_lookup',
    'inspector_check',
    'inspector_discrepancy',
    'manager_dashboard',
    'session_complete',
    'staff_dashboard',
    'product_management',
    'product_edit',
    'shelf_management',
    'inventory_alerts',
    'exit_verification_queue',
    'promotion_management',
    'promotion_analytics',
    'manager_alert_center',
  ];

  const isCustomer = userRole === 'customer' || userRole === 'vip';
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.spring(barAnim, {
      toValue: 1,
      friction: 9,
      tension: 90,
      useNativeDriver: true,
    });

    animation.start();

    return () => {
      animation.stop();
    };
  }, [barAnim, currentScreen]);

  if (!session || !isCustomer || hiddenScreens.includes(currentScreen)) return null;

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
    <Animated.View
      style={[
        styles.bottomNav,
        {
          opacity: barAnim,
          transform: [
            {
              translateY: barAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [24, 0],
              }),
            },
          ],
        },
      ]}
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        const isScan = tab.key === 'scan';
        return (
          <AnimatedPressable
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
          </AnimatedPressable>
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
    height: 96,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(217, 229, 219, 0.9)',
    borderRadius: 26,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 20,
    paddingTop: 6,
    ...CARD_SHADOW,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrap: {
    width: 38,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  navIconWrapActive: {
    backgroundColor: COLORS.MINT,
    borderColor: 'rgba(47,145,67,0.24)',
  },
  scanNavButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.DEEP_GREEN,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginTop: -30,
    ...CARD_SHADOW,
  },
  navLabel: {
    color: '#607366',
    fontSize: 9.5,
    marginTop: 3,
    fontWeight: '700',
    letterSpacing: 0.15,
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
    right: -3,
    top: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.RED,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  navCartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
