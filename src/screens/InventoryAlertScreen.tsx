import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

type AlertFilter = 'ALL' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'NO_SHELF';

export const InventoryAlertScreen: React.FC = () => {
  const { products, updateProduct, navigate, logAuditAction } = useApp();
  const [activeTab, setActiveTab] = useState<AlertFilter>('ALL');

  // Dismissed alerts local tracking (simulated session state)
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // For quick refilling
  const [refillProduct, setRefillProduct] = useState<Product | null>(null);
  const [isRefillVisible, setIsRefillVisible] = useState(false);
  const [refillAmount, setRefillAmount] = useState('50');

  // Calculate alerts list dynamically
  const alertsList = useMemo(() => {
    const list: { product: Product; type: 'OUT' | 'LOW' | 'NO_SHELF'; message: string; severity: 'CRITICAL' | 'WARNING' | 'INFO' }[] = [];

    products.forEach((p) => {
      // Skip if alert is dismissed
      if (dismissedAlerts.includes(p.id)) return;

      if (p.stock === 0 && p.isActive !== false) {
        list.push({
          product: p,
          type: 'OUT',
          message: 'Sản phẩm đã hết hàng hoàn toàn trong kho!',
          severity: 'CRITICAL',
        });
      } else if (p.stock > 0 && p.stock <= 10 && p.isActive !== false) {
        list.push({
          product: p,
          type: 'LOW',
          message: `Sản phẩm sắp hết hàng, tồn kho hiện tại chỉ còn ${p.stock} cái.`,
          severity: 'WARNING',
        });
      }

      const isNoShelf = !p.shelf || p.shelf.includes('Không có');
      if (isNoShelf) {
        list.push({
          product: p,
          type: 'NO_SHELF',
          message: 'Sản phẩm chưa được xếp lên kệ hàng.',
          severity: 'INFO',
        });
      }
    });

    // Filter by tab
    return list.filter((a) => {
      if (activeTab === 'ALL') return true;
      if (activeTab === 'OUT_OF_STOCK') return a.type === 'OUT';
      if (activeTab === 'LOW_STOCK') return a.type === 'LOW';
      if (activeTab === 'NO_SHELF') return a.type === 'NO_SHELF';
      return true;
    });
  }, [products, activeTab, dismissedAlerts]);

  const handleDismissAlert = (id: string, productName: string) => {
    Alert.alert(
      'Bỏ qua cảnh báo',
      `Bạn muốn ẩn cảnh báo này đối với sản phẩm "${productName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Ẩn cảnh báo',
          onPress: () => {
            setDismissedAlerts([...dismissedAlerts, id]);
          },
        },
      ]
    );
  };

  const handleOpenRefill = (product: Product) => {
    setRefillProduct(product);
    setRefillAmount('50'); // default replenish amount
    setIsRefillVisible(true);
  };

  const handleConfirmRefill = async () => {
    if (!refillProduct) return;
    const addAmt = parseInt(refillAmount);
    if (isNaN(addAmt) || addAmt <= 0) {
      Alert.alert('Lỗi nhập liệu', 'Vui lòng nhập số lượng bổ sung lớn hơn 0.');
      return;
    }

    const newStock = refillProduct.stock + addAmt;
    const updated = { ...refillProduct, stock: newStock };
    await updateProduct(updated);

    // Log audit action
    await logAuditAction(
      'STOCK_REPLENISHED',
      refillProduct.id,
      `Nhân viên đã bổ sung ${addAmt} SP cho "${refillProduct.name}" (Tồn kho mới: ${newStock})`
    );

    Alert.alert('Thành công 🎉', `Đã bổ sung ${addAmt} sản phẩm thành công!`);
    setIsRefillVisible(false);
    setRefillProduct(null);
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('staff_dashboard')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Cảnh báo tồn kho</Text>
        <View style={{ width: 35 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabSection}>
        {([
          { key: 'ALL', label: 'Tất cả' },
          { key: 'OUT_OF_STOCK', label: 'Hết hàng' },
          { key: 'LOW_STOCK', label: 'Sắp hết' },
          { key: 'NO_SHELF', label: 'Chưa xếp kệ' },
        ] as { key: AlertFilter; label: string }[]).map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Alerts Scroll List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.resultsTitle}>Đang có {alertsList.length} cảnh báo vận hành</Text>

        {alertsList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={54} color={COLORS.GREEN} />
            <Text style={styles.emptyTitle}>Kho hàng an toàn!</Text>
            <Text style={styles.emptySub}>Không có cảnh báo hết hàng hoặc thiếu vị trí nào vào lúc này.</Text>
          </View>
        ) : (
          alertsList.map(({ product, type, message, severity }, index) => (
            <View key={`${product.id}-${type}-${index}`} style={[
              styles.alertCard,
              severity === 'CRITICAL' && styles.alertCardCritical,
              severity === 'WARNING' && styles.alertCardWarning,
              severity === 'INFO' && styles.alertCardInfo,
            ]}>
              <View style={styles.alertHeader}>
                <Ionicons
                  name={severity === 'CRITICAL' ? 'close-circle' : severity === 'WARNING' ? 'warning' : 'information-circle'}
                  size={20}
                  color={severity === 'CRITICAL' ? COLORS.RED : severity === 'WARNING' ? '#E8590C' : '#0066FF'}
                />
                <Text style={[
                  styles.severityTag,
                  severity === 'CRITICAL' && styles.sevCritical,
                  severity === 'WARNING' && styles.sevWarning,
                  severity === 'INFO' && styles.sevInfo,
                ]}>
                  {severity}
                </Text>
              </View>

              <Text style={styles.alertProductName}>{product.name}</Text>
              <Text style={styles.alertSkuText}>SKU: {product.sku || 'N/A'} • Barcode: {product.barcode}</Text>
              <Text style={styles.alertDesc}>{message}</Text>
              
              <View style={styles.locationWrap}>
                <Ionicons name="location-outline" size={12} color={COLORS.MUTED} />
                <Text style={styles.locationText}>{product.shelf}</Text>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.alertActions}>
                <Pressable style={styles.dismissBtn} onPress={() => handleDismissAlert(product.id, product.name)}>
                  <Text style={styles.dismissBtnText}>Ẩn cảnh báo</Text>
                </Pressable>

                {type !== 'NO_SHELF' ? (
                  <Pressable style={styles.refillBtn} onPress={() => handleOpenRefill(product)}>
                    <Ionicons name="add" size={14} color="#FFFFFF" />
                    <Text style={styles.refillBtnText}>Bổ sung hàng (Refill)</Text>
                  </Pressable>
                ) : (
                  <Pressable style={[styles.refillBtn, { backgroundColor: '#0066FF' }]} onPress={() => navigate('shelf_management', { product })}>
                    <Ionicons name="map-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.refillBtnText}>Gán kệ hàng</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* REFILL MODAL */}
      <Modal visible={isRefillVisible} transparent animationType="slide" onRequestClose={() => setIsRefillVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {refillProduct && (
              <>
                <Text style={styles.modalHeaderTitle}>Bổ sung hàng hóa (Refill)</Text>
                <Text style={styles.modalHeaderSub}>{refillProduct.name} • Tồn hiện tại: {refillProduct.stock}</Text>

                <View style={styles.refillInputRow}>
                  <Text style={styles.refillLabel}>Nhập số lượng bổ sung:</Text>
                  <TextInput
                    style={styles.refillTextInput}
                    keyboardType="numeric"
                    value={refillAmount}
                    onChangeText={setRefillAmount}
                    autoFocus
                    selectTextOnFocus
                  />
                </View>

                <View style={styles.modalActionsRow}>
                  <Pressable style={styles.modalCancelBtn} onPress={() => setIsRefillVisible(false)}>
                    <Text style={styles.modalCancelText}>Hủy</Text>
                  </Pressable>
                  <Pressable style={styles.modalSaveBtn} onPress={handleConfirmRefill}>
                    <Text style={styles.modalSaveText}>Bổ sung ngay</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  tabTextActive: {
    color: COLORS.DARK_GREEN,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  resultsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.MUTED,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.MUTED,
    textAlign: 'center',
    lineHeight: 18,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 12,
    ...SHADOW,
  },
  alertCardCritical: {
    borderColor: '#FFA8A8',
    backgroundColor: '#FFF8F8',
  },
  alertCardWarning: {
    borderColor: '#FFE8CC',
    backgroundColor: '#FFFBF5',
  },
  alertCardInfo: {
    borderColor: '#D0E1FD',
    backgroundColor: '#F7FAFF',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  severityTag: {
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sevCritical: {
    backgroundColor: '#FF3E52',
    color: '#FFFFFF',
  },
  sevWarning: {
    backgroundColor: '#FF922B',
    color: '#FFFFFF',
  },
  sevInfo: {
    backgroundColor: '#0066FF',
    color: '#FFFFFF',
  },
  alertProductName: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  alertSkuText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.MUTED,
    marginTop: 2,
  },
  alertDesc: {
    fontSize: 12,
    color: COLORS.TEXT,
    fontWeight: '600',
    marginTop: 6,
    lineHeight: 16,
  },
  locationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
    paddingBottom: 10,
  },
  locationText: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  dismissBtn: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  dismissBtnText: {
    color: COLORS.MUTED,
    fontSize: 11,
    fontWeight: '800',
  },
  refillBtn: {
    flex: 1.5,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  refillBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  /* Refill Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 38,
    gap: 12,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  modalHeaderSub: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  refillInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  refillLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  refillTextInput: {
    width: 100,
    height: 40,
    borderWidth: 2,
    borderColor: COLORS.GREEN,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    color: COLORS.MUTED,
    fontWeight: '800',
  },
  modalSaveBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
