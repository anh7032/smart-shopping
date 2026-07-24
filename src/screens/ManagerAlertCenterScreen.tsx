import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ManagerAlert, AlertSeverity, AlertStatus } from '../types';
import { COLORS, SHADOW, TOP_INSET } from '../components/Theme';

type SeverityFilter = 'ALL' | 'INFO' | 'WARNING' | 'CRITICAL';

export const ManagerAlertCenterScreen: React.FC = () => {
  const { managerAlerts, resolveManagerAlert, logAuditAction, navigate, products } = useApp();
  const [activeSeverity, setActiveSeverity] = useState<SeverityFilter>('ALL');

  // Combine stored context alerts with live product stock alerts to match Staff portal
  const combinedAlerts = useMemo(() => {
    // 1. Generate live dynamic stock alerts from products
    const liveStockAlerts: ManagerAlert[] = products
      .filter((p) => p.stock <= 10 && p.isActive !== false)
      .map((p) => ({
        id: `PROD-${p.id}`,
        type: p.stock === 0 ? 'out_of_stock' : 'low_stock',
        severity: p.stock === 0 ? 'critical' : 'warning',
        message: p.stock === 0
          ? `Sản phẩm "${p.name}" (SKU: ${p.sku || 'N/A'}) đã HẾT HÀNG hoàn toàn trong kho!`
          : `Sản phẩm "${p.name}" (SKU: ${p.sku || 'N/A'}) sắp hết hàng (tồn kho hiện tại còn ${p.stock} cái).`,
        createdAt: 'Hệ thống Real-time',
        status: 'new' as AlertStatus,
      }));

    // 2. Filter out duplicate static stock alerts from managerAlerts state
    const customAlerts = managerAlerts.filter(
      (a) => a.type !== 'low_stock' && a.type !== 'out_of_stock'
    );

    return [...liveStockAlerts, ...customAlerts];
  }, [products, managerAlerts]);

  // Filter combined alerts dynamically by severity
  const filteredAlerts = useMemo(() => {
    return combinedAlerts.filter((alert) => {
      if (activeSeverity === 'ALL') return true;
      return alert.severity === activeSeverity.toLowerCase();
    });
  }, [combinedAlerts, activeSeverity]);

  const handleResolveAlert = async (alert: ManagerAlert) => {
    if (alert.status === 'resolved') {
      Alert.alert('Đã xử lý', 'Cảnh báo này đã được giải quyết từ trước.');
      return;
    }

    // Nếu là cảnh báo tồn kho động
    if (alert.id.startsWith('PROD-')) {
      Alert.alert(
        'Bổ sung tồn kho 📦',
        'Đối với cảnh báo hết hàng/thiếu hàng, vui lòng điều phối Nhân viên siêu thị bổ sung thêm hàng lên kệ (Refill) để tự động xóa cảnh báo này khỏi hệ thống!'
      );
      return;
    }

    Alert.alert(
      'Giải quyết sự cố',
      `Bạn xác nhận đã khắc phục xong sự cố: "${alert.message}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận xử lý',
          onPress: async () => {
            await resolveManagerAlert(alert.id);

            // Ghi audit log
            await logAuditAction(
              'ALERT_RESOLVED',
              alert.id,
              `Quản lý đã giải quyết sự cố Cảnh báo [ID: ${alert.id}]: "${alert.message}"`
            );

            Alert.alert('Thành công 🎉', 'Cảnh báo đã được đánh dấu là Đã giải quyết!');
          },
        },
      ]
    );
  };

  const getAlertIconName = (type: ManagerAlert['type']): React.ComponentProps<typeof Ionicons>['name'] => {
    switch (type) {
      case 'out_of_stock':
        return 'close-circle-outline';
      case 'low_stock':
        return 'warning-outline';
      case 'failed_payment':
        return 'card-outline';
      case 'exit_mismatch':
        return 'alert-circle-outline';
      case 'sync_error':
        return 'sync-outline';
      case 'promo_expired':
        return 'pricetag-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return COLORS.RED;
      case 'warning':
        return '#FF922B'; // Orange
      case 'info':
      default:
        return '#0066FF'; // Blue
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('manager_dashboard')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Trung tâm cảnh báo lỗi</Text>
        <View style={{ width: 35 }} />
      </View>

      {/* Severity Tabs */}
      <View style={styles.tabSection}>
        {([
          { key: 'ALL', label: 'Tất cả' },
          { key: 'CRITICAL', label: 'Critical' },
          { key: 'WARNING', label: 'Warning' },
          { key: 'INFO', label: 'Info' },
        ] as { key: SeverityFilter; label: string }[]).map((tab) => {
          const isActive = activeSeverity === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[
                styles.tabBtn,
                isActive && styles.tabBtnActive,
                isActive && tab.key === 'CRITICAL' && { borderColor: COLORS.RED, backgroundColor: '#FFF0F2' },
                isActive && tab.key === 'WARNING' && { borderColor: '#FF922B', backgroundColor: '#FFF9DB' },
              ]}
              onPress={() => setActiveSeverity(tab.key)}
            >
              <Text style={[
                styles.tabText,
                isActive && styles.tabTextActive,
                isActive && tab.key === 'CRITICAL' && { color: COLORS.RED },
                isActive && tab.key === 'WARNING' && { color: '#E8590C' },
              ]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Alerts Scroll List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.resultsCount}>Đang hiển thị {filteredAlerts.length} thông báo cảnh báo</Text>

        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="checkmark-done-circle-outline" size={54} color={COLORS.GREEN} />
            <Text style={styles.emptyTitle}>Hệ thống vận hành an toàn!</Text>
            <Text style={styles.emptySub}>Không có sự cố chưa giải quyết nào thuộc bộ lọc này.</Text>
          </View>
        ) : (
          filteredAlerts.map((alert) => {
            const isResolved = alert.status === 'resolved';
            const sevColor = getSeverityColor(alert.severity);

            return (
              <View
                key={alert.id}
                style={[
                  styles.alertCard,
                  isResolved && styles.alertCardResolved,
                  { borderColor: isResolved ? COLORS.BORDER : `${sevColor}40` },
                ]}
              >
                <View style={styles.alertHeader}>
                  <View style={styles.alertTypeRow}>
                    <Ionicons name={getAlertIconName(alert.type)} size={18} color={isResolved ? COLORS.MUTED : sevColor} />
                    <Text style={[styles.alertId, isResolved && { color: COLORS.MUTED }]}>ALT-{alert.id}</Text>
                  </View>

                  <View style={[
                    styles.severityTag,
                    { backgroundColor: isResolved ? '#ECECEC' : `${sevColor}15` }
                  ]}>
                    <Text style={[
                      styles.severityTagText,
                      { color: isResolved ? '#636363' : sevColor }
                    ]}>
                      {isResolved ? 'RESOLVED' : alert.severity.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.alertMessage, isResolved && styles.textMuted]}>{alert.message}</Text>
                <Text style={styles.alertTime}>Thời gian: {alert.createdAt}</Text>

                {/* Resolve Button Row */}
                {!isResolved && (
                  <Pressable style={[styles.resolveBtn, { backgroundColor: sevColor }]} onPress={() => handleResolveAlert(alert)}>
                    <Ionicons name="checkmark-circle-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.resolveBtnText}>Xác nhận xử lý xong</Text>
                  </Pressable>
                )}
              </View>
            );
          })
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
  tabSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    borderColor: COLORS.GREEN,
    backgroundColor: COLORS.LIGHT_GREEN,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.MUTED,
  },
  tabTextActive: {
    color: COLORS.DARK_GREEN,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  resultsCount: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.MUTED,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  emptySub: {
    fontSize: 11,
    color: COLORS.MUTED,
    textAlign: 'center',
    lineHeight: 16,
  },

  /* Alert Cards */
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 12,
    ...SHADOW,
  },
  alertCardResolved: {
    opacity: 0.7,
    backgroundColor: '#FAFCFA',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
    paddingBottom: 8,
    marginBottom: 10,
  },
  alertTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertId: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  severityTag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  severityTagText: {
    fontSize: 8,
    fontWeight: '900',
  },
  alertMessage: {
    fontSize: 13,
    color: COLORS.TEXT,
    fontWeight: '700',
    lineHeight: 18,
  },
  textMuted: {
    color: COLORS.MUTED,
    textDecorationLine: 'line-through',
  },
  alertTime: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 6,
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 36,
    borderRadius: 10,
    marginTop: 8,
  },
  resolveBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
