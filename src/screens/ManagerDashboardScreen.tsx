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
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Receipt, Product } from '../types';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

type TimeFilter = 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS';
type TabType = 'carts' | 'revenue' | 'system';

export const ManagerDashboardScreen: React.FC = () => {
  const { receipts, session, navigate, products, promotions, managerAlerts } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('carts');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('TODAY');
  const [scatteredCount, setScatteredCount] = useState(48);
  const [isCollecting, setIsCollecting] = useState(false);

  // Dynamic cart calculations based on active session
  const activeCartsCount = session ? 24 : 23;
  const idleCartsCount = session ? 428 - scatteredCount : 429 - scatteredCount;

  // Mock historical data builder to blend with actual session receipts
  const historicalReceipts = useMemo(() => {
    const list: Receipt[] = [
      {
        id: 'HD-109381',
        createdAt: '23/07/2026, 14:20:10',
        customerName: 'Nguyễn Thúy Hằng',
        cartCode: 'CART-112',
        items: [],
        totalQuantity: 4,
        totalPrice: 135000,
        savings: 15000,
        paymentMethod: 'qr_bank',
        status: 'checked',
      },
      {
        id: 'HD-892013',
        createdAt: '22/07/2026, 18:45:30',
        customerName: 'Lê Minh Huy',
        cartCode: 'CART-204',
        items: [],
        totalQuantity: 12,
        totalPrice: 425000,
        savings: 54000,
        paymentMethod: 'e_wallet',
        status: 'resolved',
        resolutionNote: 'Đã đóng tiền chênh lệch sản phẩm xà bông',
      },
      {
        id: 'HD-541902',
        createdAt: '20/07/2026, 10:15:00',
        customerName: 'Trần Thanh Nam',
        cartCode: 'CART-045',
        items: [],
        totalQuantity: 3,
        totalPrice: 95000,
        savings: 5000,
        paymentMethod: 'member_card',
        status: 'checked',
      },
      {
        id: 'HD-328109',
        createdAt: '18/07/2026, 21:05:12',
        customerName: 'Vũ Hoàng Yến',
        cartCode: 'CART-512',
        items: [],
        totalQuantity: 7,
        totalPrice: 320000,
        savings: 42000,
        paymentMethod: 'qr_bank',
        status: 'checked',
      },
      {
        id: 'HD-728190',
        createdAt: '15/07/2026, 12:30:25',
        customerName: 'Phạm Bảo Long',
        cartCode: 'CART-308',
        items: [],
        totalQuantity: 6,
        totalPrice: 185000,
        savings: 20000,
        paymentMethod: 'e_wallet',
        status: 'checked',
      },
      {
        id: 'HD-491028',
        createdAt: '10/07/2026, 15:10:40',
        customerName: 'Đỗ Hà Trang',
        cartCode: 'CART-119',
        items: [],
        totalQuantity: 9,
        totalPrice: 280000,
        savings: 30000,
        paymentMethod: 'qr_bank',
        status: 'checked',
      },
      {
        id: 'HD-219803',
        createdAt: '05/07/2026, 09:40:15',
        customerName: 'Bùi Anh Tuấn',
        cartCode: 'CART-087',
        items: [],
        totalQuantity: 5,
        totalPrice: 110000,
        savings: 10000,
        paymentMethod: 'member_card',
        status: 'checked',
      },
    ];
    return list;
  }, []);

  // Filter and merge receipts based on selected timeframe
  const filteredReceipts = useMemo(() => {
    // 1. Current Session Receipts (Always considered Today)
    const activeReceipts = receipts;

    if (timeFilter === 'TODAY') {
      return activeReceipts;
    }

    if (timeFilter === 'LAST_7_DAYS') {
      // Filter mock receipts within 7 days (e.g. indices 0, 1, 2, 3, 4)
      return [...activeReceipts, ...historicalReceipts.slice(0, 5)];
    }

    if (timeFilter === 'LAST_30_DAYS') {
      // Include all historical receipts
      return [...activeReceipts, ...historicalReceipts];
    }

    return activeReceipts;
  }, [receipts, historicalReceipts, timeFilter]);

  // Dynamically calculate KPIs
  const kpis = useMemo(() => {
    // Revenue calculations (Base baseline + dynamic sum of receipts)
    const baselineRevenue = timeFilter === 'TODAY' ? 1240000 : timeFilter === 'LAST_7_DAYS' ? 14250000 : 42580000;
    const baselineOrders = timeFilter === 'TODAY' ? 5 : timeFilter === 'LAST_7_DAYS' ? 42 : 124;
    const baselineItems = timeFilter === 'TODAY' ? 18 : timeFilter === 'LAST_7_DAYS' ? 154 : 452;

    const dynamicRev = filteredReceipts.reduce((sum, r) => sum + r.totalPrice, 0);
    const dynamicQty = filteredReceipts.reduce((sum, r) => sum + r.totalQuantity, 0);

    const totalRevenue = baselineRevenue + dynamicRev;
    const totalOrders = baselineOrders + filteredReceipts.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const totalItemsSold = baselineItems + dynamicQty;

    // Sessions metrics
    const activeSessions = session ? 6 : 5;
    const guestSessionsCount = timeFilter === 'TODAY' ? 2 : timeFilter === 'LAST_7_DAYS' ? 15 : 45;
    const memberSessionsCount = (timeFilter === 'TODAY' ? 3 : timeFilter === 'LAST_7_DAYS' ? 27 : 79) + (session ? 1 : 0);

    // Payment statuses
    const successfulPaymentsCount = totalOrders;
    const failedPaymentsCount = timeFilter === 'TODAY' ? 1 : timeFilter === 'LAST_7_DAYS' ? 4 : 12;

    // Verification discrepancy cases
    const exitMismatchCount = filteredReceipts.filter(r => r.status === 'discrepancy' || r.status === 'resolved').length + (timeFilter === 'TODAY' ? 1 : timeFilter === 'LAST_7_DAYS' ? 3 : 7);

    // Alert stats and promotions
    const lowStockCount = products.filter((p) => p.stock <= 10 && p.isActive !== false).length;
    const activePromos = promotions.filter((p) => p.status === 'active').length;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      totalItemsSold,
      activeSessions,
      guestSessionsCount,
      memberSessionsCount,
      successfulPaymentsCount,
      failedPaymentsCount,
      exitMismatchCount,
      lowStockCount,
      activePromos,
    };
  }, [filteredReceipts, timeFilter, session, products, promotions]);

  // Dynamic calculations for the Charts section
  const analyticsData = useMemo(() => {
    // 1. Calculate Member vs Guest revenue share
    let memberRevenue = 0;
    let guestRevenue = 0;

    // Time filter baseline split
    if (timeFilter === 'TODAY') {
      memberRevenue = 840000;
      guestRevenue = 400000;
    } else if (timeFilter === 'LAST_7_DAYS') {
      memberRevenue = 10150000;
      guestRevenue = 4100000;
    } else {
      memberRevenue = 29800000;
      guestRevenue = 12780000;
    }

    filteredReceipts.forEach((r) => {
      const isMember = r.vipDiscount !== undefined || r.paymentMethod === 'member_card';
      if (isMember) {
        memberRevenue += r.totalPrice;
      } else {
        guestRevenue += r.totalPrice;
      }
    });

    const totalRev = memberRevenue + guestRevenue;
    const memberPercent = totalRev > 0 ? Math.round((memberRevenue / totalRev) * 100) : 70;
    const guestPercent = 100 - memberPercent;

    // 2. Calculate category sales share dynamically from sold items
    const categorySalesMap: { [cat: string]: number } = {
      'Thực phẩm': timeFilter === 'TODAY' ? 450000 : timeFilter === 'LAST_7_DAYS' ? 3850000 : 12450000,
      'Đồ uống': timeFilter === 'TODAY' ? 220000 : timeFilter === 'LAST_7_DAYS' ? 1820000 : 5420000,
      'Chăm sóc cá nhân': timeFilter === 'TODAY' ? 120000 : timeFilter === 'LAST_7_DAYS' ? 1240000 : 3820000,
      'Gia dụng': timeFilter === 'TODAY' ? 90000 : timeFilter === 'LAST_7_DAYS' ? 950000 : 2560000,
    };

    filteredReceipts.forEach((r) => {
      if (r.items && r.items.length > 0) {
        r.items.forEach((item) => {
          let cat = item.category;
          if (cat.includes('Chăm sóc')) cat = 'Chăm sóc cá nhân';
          
          if (!categorySalesMap[cat]) {
            categorySalesMap[cat] = 0;
          }
          categorySalesMap[cat] += item.price * item.quantity;
        });
      }
    });

    const totalCatSales = Object.values(categorySalesMap).reduce((sum, val) => sum + val, 0);
    const categoryPercentages = Object.keys(categorySalesMap).reduce((acc, cat) => {
      acc[cat] = totalCatSales > 0 ? Math.round((categorySalesMap[cat] / totalCatSales) * 100) : 25;
      return acc;
    }, {} as { [cat: string]: number });

    return {
      memberPercent,
      guestPercent,
      categoryPercentages,
    };
  }, [filteredReceipts, timeFilter]);

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
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('welcome')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Manager Portal 👑</Text>
        <View style={{ width: 35 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Pressable style={[styles.tab, activeTab === 'carts' && styles.tabActive]} onPress={() => setActiveTab('carts')}>
          <Ionicons name="cart-outline" size={16} color={activeTab === 'carts' ? COLORS.DARK_GREEN : COLORS.MUTED} />
          <Text style={[styles.tabText, activeTab === 'carts' && styles.tabTextActive]}>Xe đẩy</Text>
        </Pressable>

        <Pressable style={[styles.tab, activeTab === 'revenue' && styles.tabActive]} onPress={() => setActiveTab('revenue')}>
          <Ionicons name="bar-chart-outline" size={16} color={activeTab === 'revenue' ? COLORS.DARK_GREEN : COLORS.MUTED} />
          <Text style={[styles.tabText, activeTab === 'revenue' && styles.tabTextActive]}>Doanh số</Text>
        </Pressable>

        <Pressable style={[styles.tab, activeTab === 'system' && styles.tabActive]} onPress={() => setActiveTab('system')}>
          <Ionicons name="grid-outline" size={16} color={activeTab === 'system' ? COLORS.DARK_GREEN : COLORS.MUTED} />
          <Text style={[styles.tabText, activeTab === 'system' && styles.tabTextActive]}>Quản trị</Text>
        </Pressable>
      </View>

      {/* Loading Overlay */}
      {isCollecting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Đang gom xe đẩy bị bỏ quên...</Text>
        </View>
      )}

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {activeTab === 'carts' && (
          /* TAB 1: CART MANAGEMENT MAP & STATS */
          <View>
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
                <Text style={[styles.statValue, { color: scatteredCount > 0 ? COLORS.RED : COLORS.MUTED }]}>{scatteredCount} xe</Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>SƠ ĐỒ PHÂN BỔ XE ĐẨY REAL-TIME</Text>
              <Text style={styles.sectionSub}>Bản đồ định vị các xe đẩy đang bị bỏ quên rải rác trong siêu thị.</Text>

              <View style={styles.supermarketGrid}>
                <View style={[styles.mapZone, styles.zoneFood]}>
                  <Ionicons name="leaf-outline" size={14} color="#5C940E" />
                  <Text style={styles.zoneText}>Khu Thực phẩm</Text>
                  {scatteredCount > 0 && (
                    <View style={styles.scatteredCartDotsRow}>
                      <View style={styles.redCartDot}><Ionicons name="cart" size={10} color="#FFFFFF" /></View>
                      <View style={styles.redCartDot}><Ionicons name="cart" size={10} color="#FFFFFF" /></View>
                    </View>
                  )}
                </View>

                <View style={[styles.mapZone, styles.zoneDrinks]}>
                  <Ionicons name="cafe-outline" size={14} color="#1C7ED6" />
                  <Text style={styles.zoneText}>Khu Sữa & Nước</Text>
                  {scatteredCount > 0 && (
                    <View style={styles.scatteredCartDotsRow}>
                      <View style={styles.redCartDot}><Ionicons name="cart" size={10} color="#FFFFFF" /></View>
                    </View>
                  )}
                </View>

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

              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={styles.greenDot} />
                  <Text style={styles.legendLabel}>Xe sẵn sàng</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={styles.redDot} />
                  <Text style={styles.legendLabel}>Xe rác/bỏ quên</Text>
                </View>
              </View>
            </View>

            <Pressable style={[styles.collectBtn, scatteredCount === 0 && styles.collectBtnDisabled]} onPress={handleCollectCarts} disabled={scatteredCount === 0}>
              <Ionicons name="shuffle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.collectBtnText}>Lệnh: Tập kết xe đẩy rải rác về Cổng vào</Text>
            </Pressable>
          </View>
        )}

        {activeTab === 'revenue' && (
          /* TAB 2: REVENUE REPORTS & KPI DASHBOARD */
          <View>
            {/* Time Filter Buttons Row */}
            <View style={styles.timeFilterContainer}>
              {([
                { key: 'TODAY', label: 'Hôm nay' },
                { key: 'LAST_7_DAYS', label: '7 ngày qua' },
                { key: 'LAST_30_DAYS', label: '30 ngày qua' },
              ] as { key: TimeFilter; label: string }[]).map((tab) => {
                const isActive = timeFilter === tab.key;
                return (
                  <Pressable key={tab.key} style={[styles.filterPill, isActive && styles.filterPillActive]} onPress={() => setTimeFilter(tab.key)}>
                    <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>{tab.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Upgraded KPI Grid */}
            <View style={styles.kpiSummaryContainer}>
              <Text style={styles.tabSectionHeader}>Bảng chỉ số vận hành chính (KPI)</Text>
              
              <View style={styles.kpiGrid}>
                <View style={styles.kpiStatCard}>
                  <Text style={styles.kpiStatLabel}>TỔNG DOANH THU</Text>
                  <Text style={[styles.kpiStatValue, { color: COLORS.DARK_GREEN }]}>{money(kpis.totalRevenue)}</Text>
                </View>
                <View style={styles.kpiStatCard}>
                  <Text style={styles.kpiStatLabel}>SỐ ĐƠN HÀNG</Text>
                  <Text style={[styles.kpiStatValue, { color: '#0066FF' }]}>{kpis.totalOrders} đơn</Text>
                </View>
                <View style={styles.kpiStatCard}>
                  <Text style={styles.kpiStatLabel}>TRUNG BÌNH/ĐƠN</Text>
                  <Text style={[styles.kpiStatValue, { color: '#E8590C' }]}>{money(kpis.avgOrderValue)}</Text>
                </View>
                <View style={styles.kpiStatCard}>
                  <Text style={styles.kpiStatLabel}>SẢN PHẨM ĐÃ BÁN</Text>
                  <Text style={styles.kpiStatValue}>{kpis.totalItemsSold} cái</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Sessions & Payments Stats */}
              <View style={styles.subKpiRow}>
                <View style={styles.subKpiColumn}>
                  <Text style={styles.subKpiLabel}>Session hoạt động: <Text style={styles.subKpiValue}>{kpis.activeSessions}</Text></Text>
                  <Text style={styles.subKpiLabel}>• Khách Member: <Text style={styles.subKpiValue}>{kpis.memberSessionsCount}</Text></Text>
                  <Text style={styles.subKpiLabel}>• Khách Guest: <Text style={styles.subKpiValue}>{kpis.guestSessionsCount}</Text></Text>
                </View>
                <View style={styles.subKpiColumn}>
                  <Text style={styles.subKpiLabel}>Thành công: <Text style={[styles.subKpiValue, { color: COLORS.GREEN }]}>{kpis.successfulPaymentsCount}</Text></Text>
                  <Text style={styles.subKpiLabel}>Thất bại/Lỗi thanh toán: <Text style={[styles.subKpiValue, { color: COLORS.RED }]}>{kpis.failedPaymentsCount}</Text></Text>
                  <Text style={styles.subKpiLabel}>Phiên lệch lối ra: <Text style={[styles.subKpiValue, { color: '#E8590C' }]}>{kpis.exitMismatchCount}</Text></Text>
                </View>
              </View>
            </View>

            {/* Sales Analytics Chart Simulation */}
            <View style={styles.analyticsCard}>
              <Text style={styles.sectionTitle}>PHÂN TÍCH DOANH THU & TOP DANH MỤC</Text>
              <Text style={styles.sectionSub}>Biểu diễn cơ cấu doanh thu theo tỷ lệ khách hàng và danh mục sản phẩm.</Text>

              {/* Chart 1: Guest vs Member revenue contribution */}
              <Text style={styles.chartTitleText}>Cơ cấu Khách hàng (% Doanh thu)</Text>
              <View style={styles.progressRow}>
                <Text style={styles.progressRowLabel}>Hội viên (Member)</Text>
                <View style={[styles.progressTrackBar, { flex: 1.5, marginLeft: 8 }]}>
                  <View style={[styles.progressFillBar, { width: `${analyticsData.memberPercent}%`, backgroundColor: COLORS.GREEN }]} />
                </View>
                <Text style={styles.progressPercentageText}>{analyticsData.memberPercent}%</Text>
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressRowLabel}>Khách vãng lai (Guest)</Text>
                <View style={[styles.progressTrackBar, { flex: 1.5, marginLeft: 8 }]}>
                  <View style={[styles.progressFillBar, { width: `${analyticsData.guestPercent}%`, backgroundColor: COLORS.MUTED }]} />
                </View>
                <Text style={styles.progressPercentageText}>{analyticsData.guestPercent}%</Text>
              </View>

              {/* Chart 2: Top Selling Categories */}
              <Text style={[styles.chartTitleText, { marginTop: 14 }]}>Doanh số theo danh mục sản phẩm</Text>
              <View style={styles.progressRow}>
                <Text style={styles.progressRowLabel}>Thực phẩm tươi</Text>
                <View style={[styles.progressTrackBar, { flex: 1.5, marginLeft: 8 }]}>
                  <View style={[styles.progressFillBar, { width: `${analyticsData.categoryPercentages['Thực phẩm'] || 0}%`, backgroundColor: '#0066FF' }]} />
                </View>
                <Text style={styles.progressPercentageText}>{analyticsData.categoryPercentages['Thực phẩm'] || 0}%</Text>
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressRowLabel}>Sữa & Đồ uống</Text>
                <View style={[styles.progressTrackBar, { flex: 1.5, marginLeft: 8 }]}>
                  <View style={[styles.progressFillBar, { width: `${analyticsData.categoryPercentages['Đồ uống'] || 0}%`, backgroundColor: '#FF922B' }]} />
                </View>
                <Text style={styles.progressPercentageText}>{analyticsData.categoryPercentages['Đồ uống'] || 0}%</Text>
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressRowLabel}>Hóa mỹ phẩm</Text>
                <View style={[styles.progressTrackBar, { flex: 1.5, marginLeft: 8 }]}>
                  <View style={[styles.progressFillBar, { width: `${analyticsData.categoryPercentages['Chăm sóc cá nhân'] || 0}%`, backgroundColor: '#7E22CE' }]} />
                </View>
                <Text style={styles.progressPercentageText}>{analyticsData.categoryPercentages['Chăm sóc cá nhân'] || 0}%</Text>
              </View>
            </View>

            {/* List of Transactions */}
            <Text style={styles.historyTitle}>Nhật ký giao dịch chi tiết ({filteredReceipts.length} đơn)</Text>
            {filteredReceipts.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Ionicons name="alert-circle-outline" size={32} color={COLORS.MUTED} />
                <Text style={styles.emptyHistoryText}>Chưa có hóa đơn nào được khởi tạo trong khung thời gian này.</Text>
              </View>
            ) : (
              filteredReceipts.map((r) => {
                const isMismatch = r.status === 'discrepancy';
                const isResolved = r.status === 'resolved' || r.status === 'checked';
                const isCancelled = r.status === 'cancelled';

                return (
                  <View key={r.id} style={styles.receiptCard}>
                    <View style={styles.receiptHeader}>
                      <Text style={styles.receiptId}>{r.id}</Text>
                      <View style={[
                        styles.statusBadge,
                        isMismatch && styles.badgeMismatch,
                        isResolved && styles.badgeResolved,
                        isCancelled && styles.badgeCancelled,
                      ]}>
                        <Text style={styles.statusBadgeText}>
                          {isMismatch ? 'LỆCH HÓA ĐƠN' : isCancelled ? 'ĐÃ HỦY' : 'ĐÃ HOÀN TẤT'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.receiptMeta}>
                      <Text style={styles.metaLabel}>Khách: <Text style={styles.metaValue}>{r.customerName}</Text></Text>
                      <Text style={styles.metaLabel}>Thời gian: <Text style={styles.metaValue}>{r.createdAt.split(', ')[0]}</Text></Text>
                    </View>
                    <View style={styles.receiptMeta}>
                      <Text style={styles.metaLabel}>Sản phẩm: <Text style={styles.metaValue}>{r.totalQuantity} món</Text></Text>
                      <Text style={styles.metaLabel}>Doanh thu: <Text style={[styles.metaValue, { color: COLORS.DARK_GREEN }]}>{money(r.totalPrice)}</Text></Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'system' && (
          /* TAB 3: SYSTEM ADMINISTRATION & MODULE LINKS */
          <View style={styles.systemMenuContainer}>
            <Text style={styles.tabSectionHeader}>Trung tâm điều hành & Quản trị</Text>
            
            <Pressable style={styles.menuRowBtn} onPress={() => navigate('promotion_management')}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#FCE5ED' }]}>
                <Ionicons name="pricetag-outline" size={20} color="#E81B60" />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitleText}>Quản lý khuyến mại (Promotions)</Text>
                <Text style={styles.menuSubText}>Thiết lập giảm giá %, voucher, chiết khấu đặc quyền thành viên.</Text>
              </View>
              <View style={styles.menuBadge}>
                <Text style={styles.menuBadgeText}>{kpis.activePromos} Active</Text>
              </View>
            </Pressable>

            <Pressable style={styles.menuRowBtn} onPress={() => navigate('manager_alert_center')}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#FFF0F2' }]}>
                <Ionicons name="notifications-outline" size={20} color={COLORS.RED} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitleText}>Trung tâm cảnh báo lỗi (Alerts)</Text>
                <Text style={styles.menuSubText}>Theo dõi sự cố lệch giỏ hàng, hết hàng, lỗi POS/ERP kết nối.</Text>
              </View>
              <View style={[styles.menuBadge, { backgroundColor: COLORS.RED }]}>
                <Text style={[styles.menuBadgeText, { color: '#FFFFFF' }]}>{managerAlerts.filter(a => a.status === 'new').length} Mới</Text>
              </View>
            </Pressable>

            <Pressable style={styles.menuRowBtn} onPress={() => navigate('audit_log')}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#E2F3FF' }]}>
                <Ionicons name="receipt-outline" size={20} color="#0066FF" />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitleText}>Nhật ký vận hành (Audit Logs)</Text>
                <Text style={styles.menuSubText}>Xem lịch sử thao tác đổi giá, sửa kệ, giải quyết lệch của nhân viên.</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.MUTED} />
            </Pressable>

            <Pressable style={styles.menuRowBtn} onPress={() => navigate('integration_status')}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#FAFCFA' }]}>
                <Ionicons name="sync-outline" size={20} color={COLORS.GREEN} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitleText}>Đồng bộ ERP/POS Integration</Text>
                <Text style={styles.menuSubText}>Xem trạng thái kết nối máy POS, hệ thống kho trung tâm ERP.</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.MUTED} />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
    fontSize: 18,
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
    fontSize: 12,
    color: COLORS.MUTED,
    fontWeight: '800',
  },
  tabTextActive: {
    color: COLORS.DARK_GREEN,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
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
    backgroundColor: '#E8590C',
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

  /* Time Filter */
  timeFilterContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: COLORS.BORDER,
    marginBottom: 14,
    ...SHADOW,
  },
  filterPill: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: COLORS.GREEN,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.MUTED,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },

  /* KPI Upgraded Summary */
  kpiSummaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 14,
    marginBottom: 14,
    ...SHADOW,
  },
  tabSectionHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.MUTED,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kpiStatCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FAFCFA',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    padding: 10,
  },
  kpiStatLabel: {
    fontSize: 8,
    color: COLORS.MUTED,
    fontWeight: '800',
    marginBottom: 3,
  },
  kpiStatValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F4F1',
    marginVertical: 12,
  },
  subKpiRow: {
    flexDirection: 'row',
    gap: 12,
  },
  subKpiColumn: {
    flex: 1,
    gap: 4,
  },
  subKpiLabel: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  subKpiValue: {
    fontWeight: '800',
    color: COLORS.TEXT,
  },

  /* Sales Analytics Simulation Charts */
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 14,
    marginBottom: 14,
    ...SHADOW,
  },
  chartTitleText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressRowLabel: {
    width: 120,
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  progressTrackBar: {
    height: 10,
    backgroundColor: '#EDF1EE',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFillBar: {
    height: '100%',
    borderRadius: 5,
  },
  progressPercentageText: {
    width: 32,
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.TEXT,
    textAlign: 'right',
  },

  /* System Tab List style */
  systemMenuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 14,
    ...SHADOW,
  },
  menuRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 10,
  },
  menuTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  menuSubText: {
    fontSize: 9,
    color: COLORS.MUTED,
    fontWeight: '600',
    lineHeight: 12,
    marginTop: 2,
  },
  menuBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLORS.LIGHT_GREEN,
  },
  menuBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },

  /* Paid receipts list */
  historyTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.MUTED,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 6,
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 6,
  },
  emptyHistoryText: {
    fontSize: 12,
    color: COLORS.MUTED,
    fontWeight: '700',
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
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeMismatch: {
    backgroundColor: '#FF3E52',
  },
  badgeResolved: {
    backgroundColor: COLORS.GREEN,
  },
  badgeCancelled: {
    backgroundColor: COLORS.MUTED,
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  receiptMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  metaLabel: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  metaValue: {
    color: COLORS.TEXT,
    fontWeight: '800',
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
    fontSize: 16,
    fontWeight: '900',
  },
});
