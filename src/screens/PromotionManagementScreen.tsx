import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Modal, TextInput, Switch, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Promotion, PromotionType, Product } from '../types';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

export const PromotionManagementScreen: React.FC = () => {
  const { promotions, addPromotion, updatePromotion, products, updateProduct, logAuditAction, navigate } = useApp();
  const [activeTab, setActiveTab] = useState<'LIST' | 'ANALYTICS'>('LIST');

  // Modals state for creation
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [promoName, setPromoName] = useState('');
  const [promoType, setPromoType] = useState<PromotionType>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('2026-07-24');
  const [endDate, setEndDate] = useState('2026-08-24');

  // Toggle products list inside creation modal
  const handleToggleProductSelection = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter(id => id !== productId));
    } else {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  const handleCreatePromo = async () => {
    // 1. Validations
    if (promoName.trim() === '') {
      Alert.alert('Lỗi nhập liệu', 'Vui lòng nhập tên chương trình khuyến mại.');
      return;
    }

    if (selectedProductIds.length === 0) {
      Alert.alert('Lỗi nhập liệu', 'Vui lòng chọn ít nhất một sản phẩm áp dụng.');
      return;
    }

    const valueNum = parseInt(discountValue);
    if (isNaN(valueNum) || valueNum <= 0) {
      Alert.alert('Lỗi nhập liệu', 'Giá trị chiết khấu phải là số hợp lệ lớn hơn 0.');
      return;
    }

    if (promoType === 'percentage' && valueNum > 100) {
      Alert.alert('Lỗi nhập liệu', 'Tỷ lệ phần trăm giảm giá không được lớn hơn 100%.');
      return;
    }

    // Simple date string validation (ensure end date isn't before start date)
    if (endDate < startDate) {
      Alert.alert('Lỗi nhập liệu', 'Ngày kết thúc không được trước ngày bắt đầu.');
      return;
    }

    // 2. Add promotion
    await addPromotion({
      name: promoName.trim(),
      type: promoType,
      applicableProductIds: selectedProductIds,
      discountValue: valueNum,
      startDate,
      endDate,
      status: 'draft', // Created as draft initially
    });

    // Write audit log
    await logAuditAction(
      'PROMOTION_CREATED',
      'PROMOTION',
      `Đã tạo chương trình khuyến mại nháp "${promoName.trim()}"`
    );

    Alert.alert('Thành công 🎉', 'Đã tạo chương trình khuyến mại dạng bản nháp. Hãy kích hoạt để áp dụng ngay!');
    setIsCreateVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setPromoName('');
    setPromoType('percentage');
    setDiscountValue('10');
    setSelectedProductIds([]);
    setStartDate('2026-07-24');
    setEndDate('2026-08-24');
  };

  // Activate / Disable Promotion
  const handleTogglePromoStatus = async (promo: Promotion) => {
    const isActivating = promo.status !== 'active';
    const nextStatus = isActivating ? 'active' : 'disabled';

    const updatedPromo: Promotion = {
      ...promo,
      status: nextStatus,
    };

    await updatePromotion(updatedPromo);

    // Apply price changes to the applicable products
    for (const prodId of promo.applicableProductIds) {
      const product = products.find(p => p.id === prodId);
      if (product) {
        let updatedProd: Product;

        if (isActivating) {
          // Applying discount
          let newPrice = product.price;
          if (promo.type === 'percentage') {
            newPrice = Math.round(product.price * (1 - promo.discountValue / 100));
          } else if (promo.type === 'fixed_amount') {
            newPrice = Math.max(0, product.price - promo.discountValue);
          } else if (promo.type === 'member_only') {
            newPrice = Math.round(product.price * (1 - promo.discountValue / 100));
          }

          updatedProd = {
            ...product,
            oldPrice: promo.type === 'bogo' ? undefined : (product.oldPrice ?? product.price), // Không gán oldPrice cho BOGO để tránh hiển thị gạch ngang trùng giá
            price: newPrice,
            discount: promo.type === 'percentage' ? promo.discountValue : promo.type === 'bogo' ? undefined : Math.round(((product.price - newPrice) / product.price) * 100),
            badge: promo.type === 'member_only' ? 'Hội viên' : promo.type === 'bogo' ? 'Mua 1 Tặng 1' : 'Khuyến mãi',
          };
        } else {
          // Restoring original price
          updatedProd = {
            ...product,
            price: product.oldPrice ?? product.price,
            oldPrice: undefined,
            discount: undefined,
            badge: undefined,
          };
        }

        await updateProduct(updatedProd);
      }
    }

    // Write audit log
    await logAuditAction(
      isActivating ? 'PROMOTION_ACTIVATED' : 'PROMOTION_DISABLED',
      promo.id,
      `Đã ${isActivating ? 'kích hoạt' : 'vô hiệu hóa'} chương trình khuyến mại "${promo.name}"`
    );

    Alert.alert(
      'Thành công',
      isActivating
        ? `Đã kích hoạt chương trình khuyến mại và áp dụng giảm giá trực tiếp lên ${promo.applicableProductIds.length} sản phẩm!`
        : 'Đã ngừng áp dụng chương trình khuyến mại và khôi phục giá gốc sản phẩm!'
    );
  };

  // Sorting Promotions in Analytics Tab
  const sortedPromotions = useMemo(() => {
    return [...promotions].sort((a, b) => b.usageCount - a.usageCount);
  }, [promotions]);

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('manager_dashboard')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Quản lý khuyến mại</Text>
        {activeTab === 'LIST' ? (
          <Pressable style={styles.createBtn} onPress={() => setIsCreateVisible(true)}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.createBtnText}>Tạo mới</Text>
          </Pressable>
        ) : (
          <View style={{ width: 35 }} />
        )}
      </View>

      {/* Local Tabs */}
      <View style={styles.tabSection}>
        <Pressable style={[styles.tabBtn, activeTab === 'LIST' && styles.tabBtnActive]} onPress={() => setActiveTab('LIST')}>
          <Text style={[styles.tabText, activeTab === 'LIST' && styles.tabTextActive]}>Chương trình</Text>
        </Pressable>
        <Pressable style={[styles.tabBtn, activeTab === 'ANALYTICS' && styles.tabBtnActive]} onPress={() => setActiveTab('ANALYTICS')}>
          <Text style={[styles.tabText, activeTab === 'ANALYTICS' && styles.tabTextActive]}>Hiệu suất (Analytics)</Text>
        </Pressable>
      </View>

      {activeTab === 'LIST' ? (
        /* PROMOTION LIST SUB-VIEW */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.resultsCount}>Đang cấu hình {promotions.length} khuyến mại</Text>

          {promotions.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="pricetag-outline" size={54} color={COLORS.MUTED} />
              <Text style={styles.emptyTitle}>Chưa có chương trình nào</Text>
              <Text style={styles.emptySub}>Bấm Tạo mới ở trên đầu để khởi tạo chương trình khuyến mại đầu tiên.</Text>
            </View>
          ) : (
            promotions.map((promo) => {
              const isActive = promo.status === 'active';
              const isScheduled = promo.status === 'scheduled';
              const isDisabled = promo.status === 'disabled';

              return (
                <View key={promo.id} style={[styles.promoCard, isDisabled && styles.promoCardDisabled]}>
                  <View style={styles.promoCardHeader}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={styles.promoId}>{promo.id}</Text>
                      <Text style={styles.promoName}>{promo.name}</Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      isActive && styles.badgeActive,
                      isScheduled && styles.badgeScheduled,
                      isDisabled && styles.badgeDisabled,
                    ]}>
                      <Text style={[
                        styles.statusBadgeText,
                        isActive && styles.badgeTextActive,
                        isScheduled && styles.badgeTextScheduled,
                        isDisabled && styles.badgeTextDisabled,
                      ]}>
                        {promo.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.promoCardBody}>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Hình thức:</Text>
                      <Text style={styles.metaValue}>
                        {promo.type === 'percentage' ? `Giảm giá phần trăm (${promo.discountValue}%)` :
                         promo.type === 'fixed_amount' ? `Giảm giá tiền mặt (${money(promo.discountValue)})` :
                         promo.type === 'bogo' ? 'Mua 1 Tặng 1 (BOGO)' : `Ưu đãi Hội viên (${promo.discountValue}%)`}
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Số sản phẩm áp dụng:</Text>
                      <Text style={styles.metaValue}>{promo.applicableProductIds.length} sản phẩm</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Thời gian:</Text>
                      <Text style={styles.metaValue}>{promo.startDate} đến {promo.endDate}</Text>
                    </View>
                  </View>

                  {/* Actions Row */}
                  <View style={styles.promoActionsRow}>
                    <View style={styles.statBrief}>
                      <Text style={styles.briefLabel}>Lượt dùng:</Text>
                      <Text style={styles.briefValue}>{promo.usageCount} lần</Text>
                    </View>

                    <Pressable
                      style={[styles.toggleBtn, isActive ? styles.toggleBtnDisable : styles.toggleBtnActive]}
                      onPress={() => handleTogglePromoStatus(promo)}
                    >
                      <Ionicons name={isActive ? 'ban-outline' : 'checkmark-circle-outline'} size={14} color="#FFFFFF" />
                      <Text style={styles.toggleBtnText}>
                        {isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      ) : (
        /* PROMOTION PERFORMANCE ANALYTICS VIEW */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.resultsCount}>Bảng xếp hạng mức độ sử dụng khuyến mại</Text>

          {sortedPromotions.map((promo, index) => (
            <View key={promo.id} style={styles.analyticsCard}>
              <View style={styles.analyticsHeader}>
                <View style={styles.rankBox}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.analyticsPromoName}>{promo.name}</Text>
                  <Text style={styles.analyticsPromoId}>Mã: {promo.id} • {promo.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.analyticsGrid}>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsLabel}>SỐ ĐƠN ÁP DỤNG</Text>
                  <Text style={[styles.analyticsVal, { color: '#0066FF' }]}>{promo.usageCount} đơn</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsLabel}>DOANH THU ĐƠN</Text>
                  <Text style={[styles.analyticsVal, { color: COLORS.DARK_GREEN }]}>{money(promo.revenueGenerated || 0)}</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsLabel}>TỔNG TIỀN ĐÃ GIẢM</Text>
                  <Text style={[styles.analyticsVal, { color: COLORS.RED }]}>{money(promo.totalDiscountAmount || 0)}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* CREATE NEW PROMOTION MODAL */}
      <Modal visible={isCreateVisible} transparent animationType="slide" onRequestClose={() => setIsCreateVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeaderTitle}>Tạo khuyến mại mới</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }} contentContainerStyle={{ gap: 10 }}>
              {/* Promo Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên chương trình khuyến mại *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ví dụ: Giảm giá ngày hè / Tri ân thành viên..."
                  placeholderTextColor="#A1AEA5"
                  value={promoName}
                  onChangeText={setPromoName}
                />
              </View>

              {/* Promo Type & Discount Value */}
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1.5 }]}>
                  <Text style={styles.inputLabel}>Loại ưu đãi *</Text>
                  <View style={styles.typeSelectorRow}>
                    <Pressable style={[styles.typeBtn, promoType === 'percentage' && styles.typeBtnActive]} onPress={() => setPromoType('percentage')}>
                      <Text style={[styles.typeBtnText, promoType === 'percentage' && styles.typeBtnTextActive]}>% Giảm</Text>
                    </Pressable>
                    <Pressable style={[styles.typeBtn, promoType === 'member_only' && styles.typeBtnActive]} onPress={() => setPromoType('member_only')}>
                      <Text style={[styles.typeBtnText, promoType === 'member_only' && styles.typeBtnTextActive]}>M-Only</Text>
                    </Pressable>
                    <Pressable style={[styles.typeBtn, promoType === 'bogo' && styles.typeBtnActive]} onPress={() => {
                      setPromoType('bogo');
                      setDiscountValue('100'); // Buy 1 Get 1 free (100% discount on second item)
                    }}>
                      <Text style={[styles.typeBtnText, promoType === 'bogo' && styles.typeBtnTextActive]}>Mua 1 Tặng 1</Text>
                    </Pressable>
                  </View>
                </View>
                
                <View style={[styles.inputGroup, { flex: 0.6 }]}>
                  <Text style={styles.inputLabel}>Giá trị *</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={discountValue}
                    onChangeText={setDiscountValue}
                    editable={promoType !== 'bogo'} // disable editing if BOGO
                  />
                </View>
              </View>

              {/* Date Ranges */}
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Bắt đầu (YYYY-MM-DD) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={startDate}
                    onChangeText={setStartDate}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Kết thúc (YYYY-MM-DD) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={endDate}
                    onChangeText={setEndDate}
                  />
                </View>
              </View>

              {/* Product Applicability (Multi-select) */}
              <Text style={styles.inputLabel}>Chọn sản phẩm áp dụng *</Text>
              <View style={styles.productSelectionGrid}>
                {products.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  return (
                    <Pressable
                      key={p.id}
                      style={[styles.productSelectionChip, isSelected && styles.prodChipActive]}
                      onPress={() => handleToggleProductSelection(p.id)}
                    >
                      <Text style={[styles.prodChipText, isSelected && styles.prodChipTextActive]}>{p.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Actions Row */}
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setIsCreateVisible(false)}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleCreatePromo}>
                <Text style={styles.saveBtnText}>Tạo khuyến mại</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  createBtn: {
    backgroundColor: COLORS.GREEN,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  tabSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    gap: 10,
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
    color: COLORS.TEXT,
  },
  emptySub: {
    fontSize: 11,
    color: COLORS.MUTED,
    textAlign: 'center',
    lineHeight: 16,
  },

  /* Promotion Card */
  promoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    ...SHADOW,
  },
  promoCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#FAFCFA',
  },
  promoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
    paddingBottom: 10,
  },
  promoId: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.MUTED,
  },
  promoName: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.TEXT,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeActive: {
    backgroundColor: COLORS.LIGHT_GREEN,
  },
  badgeScheduled: {
    backgroundColor: '#E2F3FF',
  },
  badgeDisabled: {
    backgroundColor: '#ECECEC',
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '900',
  },
  badgeTextActive: {
    color: COLORS.DARK_GREEN,
  },
  badgeTextScheduled: {
    color: '#0066FF',
  },
  badgeTextDisabled: {
    color: '#636363',
  },
  promoCardBody: {
    paddingVertical: 10,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  metaValue: {
    fontSize: 11,
    color: COLORS.TEXT,
    fontWeight: '700',
  },
  promoActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  statBrief: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  briefLabel: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  briefValue: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.GREEN,
  },
  toggleBtnDisable: {
    backgroundColor: COLORS.RED,
  },
  toggleBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  /* Performance Analytics */
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    padding: 14,
    marginBottom: 12,
    ...SHADOW,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
    paddingBottom: 10,
  },
  rankBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  analyticsPromoName: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  analyticsPromoId: {
    fontSize: 9,
    color: COLORS.MUTED,
    fontWeight: '800',
    marginTop: 1,
  },
  analyticsGrid: {
    flexDirection: 'row',
    marginTop: 12,
  },
  analyticsItem: {
    flex: 1,
    alignItems: 'center',
  },
  analyticsLabel: {
    fontSize: 8,
    color: COLORS.MUTED,
    fontWeight: '800',
    marginBottom: 4,
  },
  analyticsVal: {
    fontSize: 11,
    fontWeight: '900',
  },

  /* Modals creation */
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
    paddingBottom: 40,
    gap: 12,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.TEXT,
    textAlign: 'center',
    marginBottom: 12,
  },
  inputGroup: {
    gap: 6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  textInput: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
    paddingHorizontal: 12,
    fontSize: 12,
    color: COLORS.TEXT,
    fontWeight: '600',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  typeBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnActive: {
    borderColor: COLORS.GREEN,
    backgroundColor: COLORS.LIGHT_GREEN,
  },
  typeBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  typeBtnTextActive: {
    color: COLORS.DARK_GREEN,
  },
  productSelectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  productSelectionChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
  },
  prodChipActive: {
    borderColor: COLORS.GREEN,
    backgroundColor: COLORS.LIGHT_GREEN,
  },
  prodChipText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  prodChipTextActive: {
    color: COLORS.DARK_GREEN,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    color: COLORS.MUTED,
    fontWeight: '800',
  },
  saveBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
