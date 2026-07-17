import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

export const ManagerDashboardScreen: React.FC = () => {
  const { receipts, session, navigate } = useApp();
  const [activeTab, setActiveTab] = useState<'carts' | 'revenue'>('carts');
  const [scatteredCount, setScatteredCount] = useState(48);
  const [isCollecting, setIsCollecting] = useState(false);

  // Dynamic cart calculations based on active session
  const activeCartsCount = session ? 24 : 23;
  const idleCartsCount = session ? 428 - scatteredCount : 429 - scatteredCount;

  // Revenue calculation from receipts + mock baseline
  const baseRevenue = 42580000;
  const baseTransactions = 124;

  const dynamicRevenue = useMemo(() => {
    return receipts.reduce((sum, r) => sum + r.totalPrice, 0);
  }, [receipts]);

  const totalRevenue = baseRevenue + dynamicRevenue;
  const totalTransactions = baseTransactions + receipts.length;
  const averageTxValue = Math.round(totalRevenue / totalTransactions);

  const handleCollectCarts = () => {
    if (scatteredCount === 0) {
      Alert.alert('Không có xe rác', 'Toàn bộ xe đẩy đã được dọn dẹp và tập kết đầy đủ tại Cổng vào.');
      return;
    }

    setIsCollecting(true);
    setTimeout(() => {
      setIsCollecting(false);
      setScatteredCount(0);
      Alert.alert(
        'Tập kết xe thành công 🎉',
        'Đã điều phối nhân viên thu gom thành công 48 chiếc xe đẩy bị bỏ quên rải rác trong siêu thị và xếp gọn gàng tại Lối vào của khách hàng!',
        [{ text: 'Đồng ý' }]
      );
    }, 2000); // Simulate collection delay
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('welcome')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Hệ thống Quản lý siêu thị</Text>
        <View style={{ width: 35 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'carts' && styles.tabActive]}
          onPress={() => setActiveTab('carts')}
        >
          <Ionicons
            name="cart-outline"
            size={18}
            color={activeTab === 'carts' ? COLORS.DARK_GREEN : COLORS.MUTED}
          />
          <Text style={[styles.tabText, activeTab === 'carts' && styles.tabTextActive]}>
            Quản lý xe đẩy
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === 'revenue' && styles.tabActive]}
          onPress={() => setActiveTab('revenue')}
        >
          <Ionicons
            name="bar-chart-outline"
            size={18}
            color={activeTab === 'revenue' ? COLORS.DARK_GREEN : COLORS.MUTED}
          />
          <Text style={[styles.tabText, activeTab === 'revenue' && styles.tabTextActive]}>
            Báo cáo doanh thu
          </Text>
        </Pressable>
      </View>

      {/* Loading Overlay */}
      {isCollecting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Đang gom xe đẩy bị bỏ quên...</Text>
          <Text style={styles.loadingSubText}>Đang di chuyển toàn bộ xe về lại Lối vào chính</Text>
        </View>
      )}

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'carts' ? (
          /* TAB 1: CART MANAGEMENT MAP & STATS */
          <View>
            {/* Stats Dashboard */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>TỔNG SỐ XE ĐẨY</Text>
                <Text style={[styles.statValue, { color: COLORS.TEXT }]}>500 xe</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>ĐANG SỬ DỤNG</Text>
                <Text style={[styles.statValue, { color: COLORS.GREEN }]}>{activeCartsCount} xe</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>CHỜ Ở CỔNG</Text>
                <Text style={[styles.statValue, { color: '#1C7ED6' }]}>{idleCartsCount} xe</Text>
              </View>
              <View style={[styles.statCard, scatteredCount > 0 && { borderColor: '#FFA8A8', backgroundColor: '#FFF5F5' }]}>
                <Text style={[styles.statLabel, scatteredCount > 0 && { color: COLORS.RED }]}>XE BỎ QUÊN (RÁC)</Text>
                <Text style={[styles.statValue, { color: scatteredCount > 0 ? COLORS.RED : COLORS.MUTED }]}>
                  {scatteredCount} xe
                </Text>
              </View>
            </View>

            {/* Sơ đồ xe rải rác */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>SƠ ĐỒ PHÂN BỔ XE ĐẨY REAL-TIME</Text>
              <Text style={styles.sectionSub}>Bản đồ định vị các xe đẩy đang bị bỏ quên rải rác trong siêu thị.</Text>

              {/* 2D Grid Supermarket representing scattered cart dots */}
              <View style={styles.supermarketGrid}>
                {/* Food Zone */}
                <View style={[styles.mapZone, styles.zoneFood]}>
                  <Ionicons name="leaf-outline" size={14} color="#5C940E" />
                  <Text style={styles.zoneText}>Khu Thực phẩm</Text>
                  
                  {/* Carts dots representing scattered carts */}
                  {scatteredCount > 0 && (
                    <View style={styles.scatteredCartDotsRow}>
                      <View style={styles.redCartDot}><Ionicons name="cart" size={10} color="#FFFFFF" /></View>
                      <View style={styles.redCartDot}><Ionicons name="cart" size={10} color="#FFFFFF" /></View>
                    </View>
                  )}
                </View>

                {/* Drinks Zone */}
                <View style={[styles.mapZone, styles.zoneDrinks]}>
                  <Ionicons name="cafe-outline" size={14} color="#1C7ED6" />
                  <Text style={styles.zoneText}>Khu Sữa & Nước</Text>
                  {scatteredCount > 0 && (
                    <View style={styles.scatteredCartDotsRow}>
                      <View style={styles.redCartDot}><Ionicons name="cart" size={10} color="#FFFFFF" /></View>
                    </View>
                  )}
                </View>

                {/* Dry Goods / Cosmetics */}
                <View style={[styles.mapZone, styles.zoneDry]}>
                  <Ionicons name="restaurant-outline" size={14} color="#F59F00" />
                  <Text style={styles.zoneText}>Khu Đồ khô & Mỹ phẩm</Text>
                  {scatteredCount > 0 && (
                    <View style={styles.scatteredCartDotsRow}>
                      <View style={styles.redCartDot}><Ionicons name="cart" size={10} color="#FFFFFF" /></View>
                      <View style={styles.redCartDot}><Ionicons name="cart" size={10} color="#FFFFFF" /></View>
                    </View>
                  )}
                </View>

                {/* Bottom Main Entrance & Carts stacking */}
                <View style={styles.bottomEntranceRow}>
                  <View style={styles.entrancePill}>
                    <View style={styles.greenPulseDot} />
                    <Text style={styles.entranceText}>LỐI VÀO (Xếp {idleCartsCount} xe rỗi)</Text>
                  </View>
                  <View style={styles.cashierBox}>
                    <Text style={styles.cashierText}>THU NGÂN</Text>
                  </View>
                </View>
              </View>

              {/* Legend row */}
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={styles.greenDot} />
                  <Text style={styles.legendLabel}>Xe sẵn sàng phục vụ</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={styles.redDot} />
                  <Text style={styles.legendLabel}>Xe bị bỏ quên rải rác</Text>
                </View>
              </View>
            </View>

            {/* Collection request button */}
            <Pressable
              style={[styles.collectBtn, scatteredCount === 0 && styles.collectBtnDisabled]}
              onPress={handleCollectCarts}
              disabled={scatteredCount === 0}
            >
              <Ionicons name="shuffle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.collectBtnText}>Lệnh: Tập kết xe đẩy rải rác về Cổng vào</Text>
            </Pressable>
          </View>
        ) : (
          /* TAB 2: REVENUE REPORTS */
          <View>
            {/* Revenue Highlights cards */}
            <View style={styles.revenueHighlight}>
              <View style={styles.revCard}>
                <Ionicons name="cash-outline" size={20} color={COLORS.GREEN} />
                <Text style={styles.revLabel}>TỔNG DOANH THU</Text>
                <Text style={[styles.revValue, { color: COLORS.DARK_GREEN }]}>{money(totalRevenue)}</Text>
              </View>
              <View style={styles.revCard}>
                <Ionicons name="receipt-outline" size={20} color="#1C7ED6" />
                <Text style={styles.revLabel}>TỔNG ĐƠN HÀNG</Text>
                <Text style={[styles.revValue, { color: '#1C7ED6' }]}>{totalTransactions} đơn</Text>
              </View>
              <View style={styles.revCard}>
                <Ionicons name="stats-chart-outline" size={20} color="#E8590C" />
                <Text style={styles.revLabel}>GIÁ TRỊ TB ĐƠN</Text>
                <Text style={[styles.revValue, { color: '#E8590C' }]}>{money(averageTxValue)}</Text>
              </View>
            </View>

            {/* Paid receipts in current demo session */}
            <Text style={styles.historyTitle}>Danh sách giao dịch trực tuyến gần đây ({receipts.length})</Text>
            {receipts.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Ionicons name="alert-circle-outline" size={32} color={COLORS.MUTED} />
                <Text style={styles.emptyHistoryText}>Chưa có hóa đơn nào được khởi tạo trực tuyến trong phiên này.</Text>
                <Text style={styles.emptyHistorySub}>Mở luồng Khách hàng mua sắm để tạo giao dịch thực tế.</Text>
              </View>
            ) : (
              receipts.map((r) => (
                <View key={r.id} style={styles.receiptCard}>
                  <View style={styles.receiptHeader}>
                    <Text style={styles.receiptId}>{r.id}</Text>
                    {r.vipDiscount ? (
                      <View style={styles.vipTag}>
                        <Text style={styles.vipTagText}>VIP HẠNG TÍM 👑</Text>
                      </View>
                    ) : (
                      <View style={styles.guestTag}>
                        <Text style={styles.guestTagText}>KHÁCH THƯỜNG</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.receiptMeta}>
                    <Text style={styles.metaLabel}>Khách: <Text style={styles.metaValue}>{r.customerName}</Text></Text>
                    <Text style={styles.metaLabel}>Tổng: <Text style={[styles.metaValue, { color: COLORS.DARK_GREEN }]}>{money(r.totalPrice)}</Text></Text>
                  </View>
                  <View style={styles.receiptFooter}>
                    <Text style={styles.metaLabel}>Xe: <Text style={styles.metaValue}>{r.cartCode}</Text></Text>
                    <View style={styles.paidBadge}>
                      <Ionicons name="checkmark-circle" size={10} color="#40C057" />
                      <Text style={styles.paidBadgeText}>Đã thanh toán ({getMethodName(r.paymentMethod)})</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const getMethodName = (method: string) => {
  switch (method) {
    case 'qr_bank':
      return 'QR';
    case 'e_wallet':
      return 'Ví';
    case 'member_card':
      return 'Thẻ';
    default:
      return 'QR';
  }
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
    zIndex: 10,
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    height: 48,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.DARK_GREEN,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  tabTextActive: {
    color: COLORS.DARK_GREEN,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 12,
    ...SHADOW,
  },
  statLabel: {
    fontSize: 8,
    color: COLORS.MUTED,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 14,
    ...SHADOW,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.TEXT,
    letterSpacing: 0.5,
  },
  sectionSub: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 14,
  },
  supermarketGrid: {
    backgroundColor: '#F3F6F3',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D2DDD4',
    padding: 10,
    gap: 10,
  },
  mapZone: {
    height: 76,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(26,95,44,0.08)',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  zoneFood: {
    backgroundColor: '#F4FCF6',
    borderColor: '#D8ECDF',
  },
  zoneDrinks: {
    backgroundColor: '#F1F9FF',
    borderColor: '#D0EBFF',
  },
  zoneDry: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFE3E3',
  },
  zoneText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginTop: 2,
  },
  scatteredCartDotsRow: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  redCartDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.RED,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  bottomEntranceRow: {
    flexDirection: 'row',
    height: 48,
    gap: 8,
  },
  entrancePill: {
    flex: 2,
    backgroundColor: '#E2F3FF',
    borderWidth: 1,
    borderColor: '#A5D8FF',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    gap: 6,
  },
  greenPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#40C057',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    ...SHADOW,
  },
  entranceText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1C7ED6',
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
    fontSize: 9,
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
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#40C057',
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.RED,
  },
  legendLabel: {
    fontSize: 8,
    color: COLORS.MUTED,
    fontWeight: '800',
  },
  collectBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8590C', // Urgent orange color
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOW,
  },
  collectBtnDisabled: {
    backgroundColor: '#D2DDD4',
    elevation: 0,
    shadowOpacity: 0,
  },
  collectBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  /* TAB 2: REVENUE REPORTS */
  revenueHighlight: {
    gap: 8,
    marginBottom: 16,
  },
  revCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...SHADOW,
  },
  revLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.MUTED,
    width: 100,
  },
  revValue: {
    fontSize: 18,
    fontWeight: '900',
    flex: 1,
    textAlign: 'right',
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.TEXT,
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 6,
  },
  emptyHistoryText: {
    fontSize: 13,
    color: COLORS.TEXT,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyHistorySub: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
    textAlign: 'center',
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 12,
    marginBottom: 10,
    ...SHADOW,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptId: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  vipTag: {
    backgroundColor: '#F3E8FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  vipTagText: {
    color: '#7E22CE',
    fontSize: 8,
    fontWeight: '900',
  },
  guestTag: {
    backgroundColor: '#EDF2EE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  guestTagText: {
    color: COLORS.MUTED,
    fontSize: 8,
    fontWeight: '900',
  },
  receiptMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaLabel: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  metaValue: {
    color: COLORS.TEXT,
    fontWeight: '800',
  },
  receiptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  paidBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#40C057',
  },

  /* Loading collection overlay */
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10,
  },
  loadingSubText: {
    color: '#B2F2BB',
    fontSize: 12,
    fontWeight: '700',
  },
});
