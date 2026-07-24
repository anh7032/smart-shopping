import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

export const StaffDashboardScreen: React.FC = () => {
  const { products, receipts, navigate, endSession, userRole } = useApp();

  // Calculate metrics dynamically from state
  const totalProducts = useMemo(() => products.filter(p => p.isActive !== false).length, [products]);
  const outOfStockCount = useMemo(() => products.filter(p => p.stock === 0).length, [products]);
  const lowStockCount = useMemo(() => products.filter(p => p.stock > 0 && p.stock <= 10).length, [products]);
  const disabledCount = useMemo(() => products.filter(p => p.isActive === false).length, [products]);
  
  // Exit verification queue count
  const pendingExitCount = useMemo(() => receipts.filter(r => r.status === 'paid').length, [receipts]);
  const discrepancyExitCount = useMemo(() => receipts.filter(r => r.status === 'discrepancy').length, [receipts]);

  // Simulated ERP/POS Sync Status
  const lastSyncTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Staff Portal 🏢</Text>
          <Text style={styles.headerSub}>Nhân viên siêu thị • STORE_STAFF</Text>
        </View>
        <Pressable style={styles.logoutBtn} onPress={() => endSession()}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.RED} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Block */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Chào buổi sáng, Nhân viên!</Text>
          <Text style={styles.welcomeSub}>Hôm nay siêu thị hoạt động bình thường. Hãy theo dõi các thông số tồn kho và hàng hóa dưới đây.</Text>
        </View>

        {/* Overview KPI Cards Grid */}
        <Text style={styles.sectionTitle}>Chỉ số vận hành</Text>
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#E2F3FF' }]}>
              <Ionicons name="cube-outline" size={18} color="#0066FF" />
            </View>
            <Text style={styles.kpiVal}>{totalProducts}</Text>
            <Text style={styles.kpiLabel}>Sản phẩm Active</Text>
          </View>

          <View style={[styles.kpiCard, outOfStockCount > 0 && styles.kpiCardDanger]}>
            <View style={[styles.iconCircle, { backgroundColor: outOfStockCount > 0 ? '#FFF0F2' : '#F1FBF3' }]}>
              <Ionicons name="alert-circle-outline" size={18} color={outOfStockCount > 0 ? COLORS.RED : COLORS.GREEN} />
            </View>
            <Text style={[styles.kpiVal, outOfStockCount > 0 && { color: COLORS.RED }]}>{outOfStockCount}</Text>
            <Text style={styles.kpiLabel}>Hết hàng (Out)</Text>
          </View>

          <View style={[styles.kpiCard, lowStockCount > 0 && styles.kpiCardWarning]}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFF9DB' }]}>
              <Ionicons name="warning-outline" size={18} color="#E8590C" />
            </View>
            <Text style={[styles.kpiVal, { color: '#E8590C' }]}>{lowStockCount}</Text>
            <Text style={styles.kpiLabel}>Sắp hết hàng (Low)</Text>
          </View>

          <View style={[styles.kpiCard, pendingExitCount > 0 && styles.kpiCardNotify]}>
            <View style={[styles.iconCircle, { backgroundColor: '#F2E8FF' }]}>
              <Ionicons name="exit-outline" size={18} color="#7E22CE" />
            </View>
            <Text style={[styles.kpiVal, { color: '#7E22CE' }]}>{pendingExitCount}</Text>
            <Text style={styles.kpiLabel}>Chờ kiểm soát ra</Text>
          </View>
        </View>

        {/* Navigation Actions List */}
        <Text style={styles.sectionTitle}>Nhiệm vụ & Chức năng</Text>
        <View style={styles.menuList}>
          <MenuButton
            title="Quản lý sản phẩm (Product Management)"
            desc="Sửa thông tin, SKU, chỉnh giá, kho, khóa/mở sản phẩm"
            icon="barcode-outline"
            color="#40C057"
            badge={disabledCount > 0 ? `${disabledCount} đã khóa` : undefined}
            onPress={() => navigate('product_management')}
          />

          <MenuButton
            title="Quản lý kệ hàng (Shelf Management)"
            desc="Sắp xếp sản phẩm, đổi kệ, định vị bản đồ siêu thị"
            icon="map-outline"
            color="#0066FF"
            onPress={() => navigate('shelf_management')}
          />

          <MenuButton
            title="Cảnh báo tồn kho (Inventory Alerts)"
            desc="Xem danh sách cảnh báo thiếu hàng, bổ sung hàng nhanh"
            icon="notifications-outline"
            color="#FF922B"
            badge={outOfStockCount + lowStockCount > 0 ? `${outOfStockCount + lowStockCount} Alert` : undefined}
            onPress={() => navigate('inventory_alerts')}
          />

          <MenuButton
            title="Hàng đợi soát vé (Exit Verification Queue)"
            desc="Xem và giải quyết các phiên lệch hóa đơn từ Exit Staff"
            icon="checkmark-done-circle-outline"
            color="#7E22CE"
            badge={discrepancyExitCount > 0 ? `${discrepancyExitCount} LỆCH` : undefined}
            onPress={() => navigate('exit_verification_queue')}
          />

          <MenuButton
            title="Tích hợp ERP/POS (Integration Status)"
            desc="Kiểm tra trạng thái đồng bộ giá và kho với hệ thống trung tâm"
            icon="swap-horizontal-outline"
            color="#0066FF"
            badge="Chỉ xem"
            onPress={() => navigate('integration_status')}
          />
        </View>

        {/* ERP Sync Info Block */}
        <View style={styles.syncCard}>
          <Ionicons name="sync-outline" size={16} color={COLORS.MUTED} />
          <Text style={styles.syncText}>Hệ thống POS/ERP: Đã kết nối • Đồng bộ lần cuối lúc {lastSyncTime}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Subcomponent: MenuButton
interface MenuButtonProps {
  title: string;
  desc: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  badge?: string;
  onPress: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ title, desc, icon, color, badge, onPress }) => {
  return (
    <Pressable style={styles.menuBtn} onPress={onPress}>
      <View style={[styles.menuIconCircle, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.menuTextWrap}>
        <View style={styles.menuTitleRow}>
          <Text style={styles.menuTitle} numberOfLines={1}>{title}</Text>
          {badge && (
            <View style={[styles.menuBadge, { backgroundColor: color }]}>
              <Text style={styles.menuBadgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.menuDesc} numberOfLines={2}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.MUTED} style={styles.menuChevron} />
    </Pressable>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  headerSub: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '700',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF0F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  logoutText: {
    color: COLORS.RED,
    fontSize: 11,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: 16,
    ...SHADOW,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  welcomeSub: {
    fontSize: 12,
    color: COLORS.MUTED,
    lineHeight: 18,
    marginTop: 6,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.MUTED,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 8,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 12,
    ...SHADOW,
  },
  kpiCardDanger: {
    borderColor: '#FFA8A8',
    backgroundColor: '#FFF5F5',
  },
  kpiCardWarning: {
    borderColor: '#FFE8CC',
    backgroundColor: '#FFF9DB',
  },
  kpiCardNotify: {
    borderColor: '#E8E8FF',
    backgroundColor: '#F8F8FF',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiVal: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  kpiLabel: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
    marginTop: 2,
  },
  menuList: {
    gap: 10,
    marginBottom: 16,
  },
  menuBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 12,
    alignItems: 'center',
    ...SHADOW,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextWrap: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 6,
  },
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.TEXT,
    flexShrink: 1,
  },
  menuBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  menuBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  menuDesc: {
    fontSize: 10,
    color: COLORS.MUTED,
    lineHeight: 14,
    marginTop: 3,
    fontWeight: '600',
  },
  menuChevron: {
    marginLeft: 'auto',
  },
  syncCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FAFCFA',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  syncText: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
});
