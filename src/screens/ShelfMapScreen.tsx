import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOW, TOP_INSET } from '../components/Theme';

const NAVIGATION_STEPS: Record<string, string[]> = {
  ZONE_A: [
    'Đi thẳng 15m dọc hành lang chính từ lối vào.',
    'Rẽ trái tại bảng hiệu "Khu Thực phẩm Tươi".',
    'Đi tiếp 20m, tìm kệ A3 tầng 2 bên phải của bạn.',
  ],
  ZONE_B: [
    'Đi thẳng 15m dọc hành lang chính từ lối vào.',
    'Rẽ trái tại biển chỉ dẫn "Sữa & Đồ uống".',
    'Đi tiếp 20m, tìm kệ sữa B2 bên trái (vị trí Shelf Level 2).',
  ],
  ZONE_C: [
    'Đi thẳng 20m dọc hành lang chính từ lối vào.',
    'Rẽ phải tại biển "Khu đồ khô & gia vị".',
    'Sản phẩm ở dãy C2, kệ số 1 bên trái của bạn.',
  ],
  ZONE_D: [
    'Đi thẳng 18m dọc hành lang chính từ lối vào.',
    'Rẽ phải tại biển "Khu cá nhân & mỹ phẩm".',
    'Sản phẩm ở dãy D1, kệ số 2, tầng 2 bên tay phải.',
  ],
  ZONE_E: [
    'Rẽ phải ngay khi vừa bước qua Cổng vào.',
    'Đi tiếp 8m dọc theo lối đi Khu Gia dụng.',
    'Sản phẩm ở dãy E1, kệ số 1 bên tay trái.',
  ],
};

export const ShelfMapScreen: React.FC = () => {
  const { selectedProduct, navigate } = useApp();
  const [navState, setNavState] = useState<'idle' | 'navigating' | 'arrived'>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const product = selectedProduct;

  if (!product) {
    return (
      <View style={styles.errorScreen}>
        <Ionicons name="warning-outline" size={48} color={COLORS.RED} />
        <Text style={styles.errorText}>Không tìm thấy thông tin sản phẩm để chỉ đường.</Text>
        <Pressable style={styles.backButtonLarge} onPress={() => navigate('home')}>
          <Text style={styles.backButtonLargeText}>Quay về trang chủ</Text>
        </Pressable>
      </View>
    );
  }

  // Parse shelf details: "Khu thực phẩm tươi - Dãy A3 - Kệ số 2"
  const shelfDetails = useMemo(() => {
    const parts = product.shelf.split(' - ');
    return {
      zone: parts[0] || 'Khu tổng hợp',
      row: parts[1] || 'Dãy chung',
      shelfNo: parts[2] || 'Kệ số 1',
    };
  }, [product.shelf]);

  // Determine destination block on our grid map based on category
  const destinationBlock = useMemo(() => {
    const cat = product.category.toLowerCase();
    if (cat.includes('thực phẩm')) return 'ZONE_A';
    if (cat.includes('uống')) return 'ZONE_B';
    if (cat.includes('chăm sóc') || cat.includes('cá nhân')) return 'ZONE_D';
    if (cat.includes('gia dụng')) return 'ZONE_E';
    return 'ZONE_C'; // Đồ khô / Khác
  }, [product.category]);

  const steps = useMemo(() => {
    return NAVIGATION_STEPS[destinationBlock] || [
      'Đi thẳng 15m từ lối vào dọc hành lang chính.',
      'Đi tiếp về phía bảng chỉ dẫn sản phẩm.',
      'Đến vị trí sản phẩm quầy hàng.',
    ];
  }, [destinationBlock]);

  const dynamicStats = useMemo(() => {
    if (navState === 'idle') {
      return { distance: 35, time: 45 };
    }
    if (navState === 'arrived') {
      return { distance: 0, time: 0 };
    }
    // navState === 'navigating'
    const totalSteps = steps.length;
    const remainingSteps = totalSteps - currentStepIndex;
    return {
      distance: Math.max(5, Math.round((remainingSteps / totalSteps) * 35)),
      time: Math.max(10, Math.round((remainingSteps / totalSteps) * 45)),
    };
  }, [navState, currentStepIndex, steps]);

  const handleStartNav = () => {
    setNavState('navigating');
    setCurrentStepIndex(0);
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setNavState('arrived');
    }
  };

  const handleSkipToDestination = () => {
    setNavState('arrived');
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('product_detail', { product })}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>Sơ đồ chỉ đường</Text>
        <View style={{ width: 35 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Destination Card Info */}
        <View style={styles.destinationCard}>
          <View style={styles.destHeader}>
            <View style={styles.destIconBox}>
              <Ionicons name="location" size={20} color={COLORS.GREEN} />
            </View>
            <View style={styles.destTextWrap}>
              <Text style={styles.destProductTitle} numberOfLines={1}>{product.name}</Text>
              <Text style={styles.destAddress}>{product.shelf}</Text>
            </View>
          </View>

          <View style={styles.destStats}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>KHOẢNG CÁCH</Text>
              <Text style={styles.statValue}>~{dynamicStats.distance} mét</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>THỜI GIAN ĐI</Text>
              <Text style={styles.statValue}>~{dynamicStats.time} giây</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>DÃY HÀNG</Text>
              <Text style={styles.statValue}>{shelfDetails.row.replace('Dãy ', '')}</Text>
            </View>
          </View>
        </View>

        {/* Supermarket Map Visual Mockup */}
        <View style={styles.mapCard}>
          <Text style={styles.mapTitle}>SƠ ĐỒ SIÊU THỊ THÔNG MINH</Text>

          {/* Supermarket map grid container */}
          <View style={styles.supermarketGrid}>
            
            {/* Rows of shelves */}
            <View style={styles.mapRow}>
              {/* ZONE A */}
              <View style={[styles.mapZone, styles.zoneFood, destinationBlock === 'ZONE_A' && styles.zoneTarget]}>
                <Ionicons name="leaf-outline" size={14} color="#5C940E" />
                <Text style={styles.zoneText}>Khu A</Text>
                <Text style={styles.zoneLabel}>Rau & Thực phẩm</Text>
                {destinationBlock === 'ZONE_A' && <View style={styles.targetPulseDot} />}
              </View>

              {/* ZONE B */}
              <View style={[styles.mapZone, styles.zoneDrinks, destinationBlock === 'ZONE_B' && styles.zoneTarget]}>
                <Ionicons name="cafe-outline" size={14} color="#1C7ED6" />
                <Text style={styles.zoneText}>Khu B</Text>
                <Text style={styles.zoneLabel}>Sữa & Đồ uống</Text>
                {destinationBlock === 'ZONE_B' && <View style={styles.targetPulseDot} />}
              </View>
            </View>

            {/* Aisle pathway */}
            <View style={styles.mapAisle}>
              <Text style={styles.aisleText}>HÀNH LANG TRUNG TÂM</Text>
              
              {/* Simulated Dotted Routing Line */}
              <View style={[styles.routingLine, styles[`routeTo_${destinationBlock}`]]} />
            </View>

            <View style={styles.mapRow}>
              {/* ZONE C */}
              <View style={[styles.mapZone, styles.zoneDry, destinationBlock === 'ZONE_C' && styles.zoneTarget]}>
                <Ionicons name="restaurant-outline" size={14} color="#F59F00" />
                <Text style={styles.zoneText}>Khu C</Text>
                <Text style={styles.zoneLabel}>Hộp & Đồ khô</Text>
                {destinationBlock === 'ZONE_C' && <View style={styles.targetPulseDot} />}
              </View>

              {/* ZONE D */}
              <View style={[styles.mapZone, styles.zoneCosmetics, destinationBlock === 'ZONE_D' && styles.zoneTarget]}>
                <Ionicons name="sparkles-outline" size={14} color="#E8590C" />
                <Text style={styles.zoneText}>Khu D</Text>
                <Text style={styles.zoneLabel}>Chăm sóc cá nhân</Text>
                {destinationBlock === 'ZONE_D' && <View style={styles.targetPulseDot} />}
              </View>
            </View>

            {/* Bottom Row with Cashier & User Start Point */}
            <View style={styles.cashierRow}>
              <View style={styles.entranceGate}>
                {/* User start pulsing dot */}
                <View style={styles.userStartPulse} />
                <Text style={styles.entranceText}>LỐI VÀO (BẠN Ở ĐÂY)</Text>
              </View>
              
              {/* ZONE E */}
              <View style={[styles.mapZoneSmall, styles.zoneHousehold, destinationBlock === 'ZONE_E' && styles.zoneTarget]}>
                <Text style={styles.zoneTextSmall}>Khu E (Gia dụng)</Text>
                {destinationBlock === 'ZONE_E' && <View style={styles.targetPulseDotSmall} />}
              </View>
              
              <View style={styles.cashierBox}>
                <Text style={styles.cashierText}>THU NGÂN</Text>
              </View>
            </View>
          </View>

          {/* Legend indicator */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={styles.legendBlueDot} />
              <Text style={styles.legendLabel}>Vị trí của bạn</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendRedDot} />
              <Text style={styles.legendLabel}>Sản phẩm đích</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendDottedLine} />
              <Text style={styles.legendLabel}>Đường đi dự kiến</Text>
            </View>
          </View>
        </View>

        {/* Navigation Step Panel or Start Button */}
        {navState === 'idle' && (
          <Pressable style={styles.startNavButton} onPress={handleStartNav}>
            <Ionicons name="compass-outline" size={20} color="#FFFFFF" />
            <Text style={styles.startNavText}>Bắt đầu chỉ đường AR giả lập</Text>
          </Pressable>
        )}

        {navState === 'navigating' && (
          <View style={styles.navPanel}>
            <View style={styles.navPanelHeader}>
              <Ionicons name="compass" size={20} color={COLORS.GREEN} />
              <Text style={styles.navPanelTitle}>
                Hướng dẫn di chuyển (Bước {currentStepIndex + 1}/{steps.length})
              </Text>
            </View>

            <View style={styles.navStepRow}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>{currentStepIndex + 1}</Text>
              </View>
              <Text style={styles.stepDescriptionText}>{steps[currentStepIndex]}</Text>
            </View>

            <View style={styles.navPanelButtons}>
              <Pressable style={styles.skipNavBtn} onPress={handleSkipToDestination}>
                <Text style={styles.skipNavBtnText}>Đến nơi luôn</Text>
              </Pressable>

              <Pressable style={styles.nextStepBtn} onPress={handleNextStep}>
                <Text style={styles.nextStepBtnText}>
                  {currentStepIndex === steps.length - 1 ? 'Hoàn tất' : 'Bước tiếp theo'}
                </Text>
                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        )}

        {navState === 'arrived' && (
          <View style={[styles.navPanel, styles.arrivedPanel]}>
            <View style={styles.navPanelHeader}>
              <Ionicons name="checkmark-circle" size={22} color={COLORS.GREEN} />
              <Text style={[styles.navPanelTitle, { color: COLORS.DARK_GREEN }]}>Bạn đã đến vị trí sản phẩm!</Text>
            </View>
            <Text style={styles.arrivedDesc}>
              Sản phẩm <Text style={{ fontWeight: '800' }}>{product.name}</Text> nằm ngay trước mặt bạn tại <Text style={{ fontWeight: '800' }}>{shelfDetails.row} • {shelfDetails.shelfNo} (Tầng 2)</Text>.
            </Text>

            <View style={styles.navPanelButtons}>
              <Pressable style={styles.backToProductBtn} onPress={() => navigate('product_detail', { product })}>
                <Text style={styles.backToProductBtnText}>Xem chi tiết</Text>
              </Pressable>

              <Pressable style={styles.scanNowBtn} onPress={() => navigate('scan')}>
                <Ionicons name="scan" size={16} color="#FFFFFF" />
                <Text style={styles.scanNowBtnText}>Quét mã thêm vào giỏ</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: TOP_INSET + 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    ...SHADOW,
  },
  backButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF2EE',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  destinationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 14,
    ...SHADOW,
  },
  destHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  destIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destTextWrap: {
    flex: 1,
  },
  destProductTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  destAddress: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
    marginTop: 2,
  },
  destStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 8,
    color: COLORS.MUTED,
    fontWeight: '800',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.BORDER,
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 14,
    marginTop: 12,
    ...SHADOW,
  },
  mapTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.MUTED,
    letterSpacing: 0.5,
    marginBottom: 14,
    textAlign: 'center',
  },
  supermarketGrid: {
    backgroundColor: '#F3F6F3',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D2DDD4',
    padding: 10,
    gap: 10,
  },
  mapRow: {
    flexDirection: 'row',
    gap: 10,
  },
  mapZone: {
    flex: 1,
    height: 90,
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  zoneText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginTop: 4,
  },
  zoneLabel: {
    fontSize: 8,
    color: COLORS.MUTED,
    fontWeight: '700',
    marginTop: 1,
    textAlign: 'center',
  },
  zoneFood: {
    borderColor: '#D8ECDF',
    backgroundColor: '#F4FCF6',
  },
  zoneDrinks: {
    borderColor: '#D0EBFF',
    backgroundColor: '#F1F9FF',
  },
  zoneDry: {
    borderColor: '#FFE3E3',
    backgroundColor: '#FFF5F5',
  },
  zoneCosmetics: {
    borderColor: '#FFF4E6',
    backgroundColor: '#FFFBF0',
  },
  zoneTarget: {
    borderColor: COLORS.RED,
    borderWidth: 2,
    backgroundColor: '#FFF0F1',
  },
  targetPulseDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.RED,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...SHADOW,
  },
  mapAisle: {
    height: 38,
    backgroundColor: '#E7ECE8',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  aisleText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#8A968D',
    letterSpacing: 1,
  },
  cashierRow: {
    flexDirection: 'row',
    height: 52,
    gap: 8,
  },
  entranceGate: {
    flex: 2,
    backgroundColor: '#E7F5FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A5D8FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    gap: 6,
  },
  entranceText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#1C7ED6',
  },
  userStartPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#228BE6',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    ...SHADOW,
  },
  mapZoneSmall: {
    flex: 1.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneHousehold: {
    borderColor: '#FFF4E6',
    backgroundColor: '#FFF9DB',
  },
  zoneTextSmall: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  targetPulseDotSmall: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.RED,
  },
  cashierBox: {
    flex: 1.2,
    backgroundColor: '#FFE3E3',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC9C9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashierText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.RED,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendBlueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#228BE6',
  },
  legendRedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.RED,
  },
  legendDottedLine: {
    width: 16,
    height: 2,
    borderWidth: 1,
    borderColor: COLORS.GREEN,
    borderStyle: 'dashed',
  },
  legendLabel: {
    fontSize: 8,
    color: COLORS.MUTED,
    fontWeight: '800',
  },
  startNavButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    ...SHADOW,
  },
  startNavText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  errorScreen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 14,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.MUTED,
    textAlign: 'center',
    fontWeight: '700',
  },
  backButtonLarge: {
    backgroundColor: COLORS.GREEN,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  backButtonLargeText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Simulated Routing path styles
  routingLine: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: COLORS.GREEN,
    borderStyle: 'dashed',
  },
  routeTo_ZONE_A: {
    left: 20,
    bottom: -10,
    width: 140,
    height: 60,
    borderLeftWidth: 1.5,
    borderTopWidth: 1.5,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  routeTo_ZONE_B: {
    right: 40,
    bottom: -10,
    width: 80,
    height: 60,
    borderRightWidth: 1.5,
    borderTopWidth: 1.5,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  routeTo_ZONE_C: {
    left: 40,
    top: -10,
    width: 80,
    height: 40,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  routeTo_ZONE_D: {
    right: 40,
    top: -10,
    width: 80,
    height: 40,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  routeTo_ZONE_E: {
    right: 130,
    bottom: -2,
    width: 40,
    height: 12,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  // Phase 1 Navigation Panel Styles
  navPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    padding: 16,
    marginTop: 14,
    ...SHADOW,
  },
  arrivedPanel: {
    borderColor: COLORS.GREEN,
    backgroundColor: '#F4FCF6',
  },
  navPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
    paddingBottom: 10,
    marginBottom: 12,
  },
  navPanelTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  navStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  stepNumCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  stepDescriptionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.TEXT,
    lineHeight: 18,
  },
  navPanelButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  skipNavBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  skipNavBtnText: {
    color: COLORS.MUTED,
    fontSize: 13,
    fontWeight: '800',
  },
  nextStepBtn: {
    flex: 1.5,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...SHADOW,
  },
  nextStepBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  arrivedDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.TEXT,
    lineHeight: 20,
    marginBottom: 16,
  },
  backToProductBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  backToProductBtnText: {
    color: COLORS.TEXT,
    fontSize: 13,
    fontWeight: '800',
  },
  scanNowBtn: {
    flex: 1.5,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...SHADOW,
  },
  scanNowBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
