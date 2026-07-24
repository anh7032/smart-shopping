import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

type FilterType = 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISABLED';

export const ProductManagementScreen: React.FC = () => {
  const { products, updateProduct, navigate, logAuditAction } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  // State for Quick Actions Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);

  // State for Quick Stock Update Modal
  const [isStockModalVisible, setIsStockModalVisible] = useState(false);
  const [newStockVal, setNewStockVal] = useState('0');

  // Filter & Search logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search Query Match (Name, SKU, Barcode)
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.barcode.includes(q);

      if (!matchesSearch) return false;

      // 2. Filter Tab Match
      switch (activeFilter) {
        case 'IN_STOCK':
          return p.stock > 10 && p.isActive !== false;
        case 'LOW_STOCK':
          return p.stock > 0 && p.stock <= 10 && p.isActive !== false;
        case 'OUT_OF_STOCK':
          return p.stock === 0 && p.isActive !== false;
        case 'DISABLED':
          return p.isActive === false;
        case 'ALL':
        default:
          return true;
      }
    });
  }, [products, searchQuery, activeFilter]);

  const handleOpenActions = (product: Product) => {
    setSelectedProduct(product);
    setIsActionModalVisible(true);
  };

  const handleToggleActive = async (product: Product) => {
    const updated = { ...product, isActive: product.isActive === false ? true : false };
    await updateProduct(updated);
    
    // Log audit action
    const actionName = updated.isActive ? 'Mở khóa sản phẩm' : 'Khóa sản phẩm';
    await logAuditAction(
      updated.isActive ? 'PRODUCT_ENABLED' : 'PRODUCT_DISABLED',
      product.id,
      `Đã ${updated.isActive ? 'mở khóa' : 'khóa'} sản phẩm "${product.name}"`
    );

    Alert.alert('Thành công', `Đã ${updated.isActive ? 'kích hoạt' : 'vô hiệu hóa'} sản phẩm này!`);
    setIsActionModalVisible(false);
  };

  const handleOpenStockUpdate = () => {
    if (!selectedProduct) return;
    setNewStockVal(selectedProduct.stock.toString());
    setIsActionModalVisible(false);
    setIsStockModalVisible(true);
  };

  const handleSaveStock = async () => {
    if (!selectedProduct) return;
    const stockNum = parseInt(newStockVal);
    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert('Lỗi nhập liệu', 'Vui lòng nhập số lượng tồn kho hợp lệ lớn hơn hoặc bằng 0.');
      return;
    }

    const updated = { ...selectedProduct, stock: stockNum };
    await updateProduct(updated);

    // Log audit action
    await logAuditAction(
      'STOCK_UPDATED',
      selectedProduct.id,
      `Đã cập nhật tồn kho từ ${selectedProduct.stock} thành ${stockNum} cho "${selectedProduct.name}"`
    );

    Alert.alert('Thành công', 'Đã cập nhật tồn kho mới!');
    setIsStockModalVisible(false);
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('staff_dashboard')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Quản lý sản phẩm</Text>
        <View style={{ width: 35 }} />
      </View>

      {/* Search Input bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, SKU, barcode..."
            placeholderTextColor="#A1AEA5"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.MUTED} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Horizontal Tabs */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {([
            { key: 'ALL', label: 'Tất cả' },
            { key: 'IN_STOCK', label: 'Còn hàng' },
            { key: 'LOW_STOCK', label: 'Sắp hết hàng' },
            { key: 'OUT_OF_STOCK', label: 'Hết hàng' },
            { key: 'DISABLED', label: 'Đã khóa' },
          ] as { key: FilterType; label: string }[]).map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveFilter(tab.key)}
              >
                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Product List Scroll */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listScrollContent}>
        <Text style={styles.resultCount}>Hiển thị {filteredProducts.length} mặt hàng</Text>
        
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color={COLORS.MUTED} />
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào khớp bộ lọc.</Text>
          </View>
        ) : (
          filteredProducts.map((p) => {
            const isLow = p.stock > 0 && p.stock <= 10;
            const isOut = p.stock === 0;
            const isDisabled = p.isActive === false;

            return (
              <Pressable key={p.id} style={[styles.productCard, isDisabled && styles.productCardDisabled]} onPress={() => handleOpenActions(p)}>
                <View style={styles.productMainInfo}>
                  <View style={styles.productLeft}>
                    <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
                    <View style={styles.skuRow}>
                      <Text style={styles.skuText}>SKU: {p.sku || 'N/A'}</Text>
                      <Text style={styles.dotSeparator}>•</Text>
                      <Text style={styles.barcodeText}>BC: {p.barcode}</Text>
                    </View>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={12} color={COLORS.MUTED} />
                      <Text style={styles.locationText}>{p.shelf}</Text>
                    </View>
                  </View>

                  <View style={styles.productRight}>
                    <Text style={styles.productPrice}>{money(p.price)}</Text>
                    {p.oldPrice && <Text style={styles.oldPrice}>{money(p.oldPrice)}</Text>}
                    
                    {/* Stock status tag */}
                    <View style={[
                      styles.stockTag,
                      isOut && styles.stockTagOut,
                      isLow && styles.stockTagLow,
                      isDisabled && styles.stockTagDisabled,
                    ]}>
                      <Text style={[
                        styles.stockTagText,
                        isOut && styles.stockTagTextOut,
                        isLow && styles.stockTagTextLow,
                        isDisabled && styles.stockTagTextDisabled,
                      ]}>
                        {isDisabled ? 'ĐÃ KHÓA' : isOut ? 'HẾT HÀNG' : isLow ? `SẮP HẾT (${p.stock})` : `KHO: ${p.stock}`}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Quick actions line indicator */}
                <View style={styles.cardFooter}>
                  <Text style={styles.footerActionText}>Nhấn để xem thao tác nhanh</Text>
                  <Ionicons name="ellipsis-horizontal" size={14} color={COLORS.MUTED} />
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* QUICK ACTION SHEET / MODAL */}
      <Modal visible={isActionModalVisible} transparent animationType="fade" onRequestClose={() => setIsActionModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsActionModalVisible(false)}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <Text style={styles.modalHeaderTitle}>{selectedProduct.name}</Text>
                <Text style={styles.modalHeaderSub}>SKU: {selectedProduct.sku || 'N/A'} • Barcode: {selectedProduct.barcode}</Text>

                <View style={styles.modalBtnGrid}>
                  <Pressable style={styles.modalActionBtn} onPress={() => {
                    setIsActionModalVisible(false);
                    navigate('product_edit', { product: selectedProduct });
                  }}>
                    <Ionicons name="create-outline" size={18} color={COLORS.GREEN} />
                    <Text style={styles.modalActionText}>Chỉnh sửa chi tiết (Edit)</Text>
                  </Pressable>

                  <Pressable style={styles.modalActionBtn} onPress={() => {
                    setIsActionModalVisible(false);
                    navigate('shelf_management', { product: selectedProduct });
                  }}>
                    <Ionicons name="map-outline" size={18} color="#0066FF" />
                    <Text style={styles.modalActionText}>Đổi vị trí kệ hàng (Shelf)</Text>
                  </Pressable>

                  <Pressable style={styles.modalActionBtn} onPress={handleOpenStockUpdate}>
                    <Ionicons name="cube-outline" size={18} color="#FF922B" />
                    <Text style={styles.modalActionText}>Cập nhật tồn kho (Stock)</Text>
                  </Pressable>

                  <Pressable style={[styles.modalActionBtn, selectedProduct.isActive === false ? styles.modalBtnEnable : styles.modalBtnDisable]} onPress={() => handleToggleActive(selectedProduct)}>
                    <Ionicons name={selectedProduct.isActive === false ? "checkmark-circle-outline" : "ban-outline"} size={18} color={selectedProduct.isActive === false ? COLORS.GREEN : COLORS.RED} />
                    <Text style={[styles.modalActionText, selectedProduct.isActive === false ? { color: COLORS.GREEN } : { color: COLORS.RED }]}>
                      {selectedProduct.isActive === false ? 'Kích hoạt sản phẩm' : 'Vô hiệu hóa sản phẩm'}
                    </Text>
                  </Pressable>
                </View>

                <Pressable style={styles.modalCloseBtn} onPress={() => setIsActionModalVisible(false)}>
                  <Text style={styles.modalCloseText}>Đóng</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* QUICK STOCK UPDATE MODAL */}
      <Modal visible={isStockModalVisible} transparent animationType="slide" onRequestClose={() => setIsStockModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentSmall}>
            {selectedProduct && (
              <>
                <Text style={styles.modalHeaderTitle}>Cập nhật tồn kho nhanh</Text>
                <Text style={styles.modalHeaderSub}>{selectedProduct.name}</Text>

                <View style={styles.stockInputRow}>
                  <Text style={styles.stockInputLabel}>Số lượng tồn mới:</Text>
                  <TextInput
                    style={styles.stockTextInput}
                    keyboardType="numeric"
                    value={newStockVal}
                    onChangeText={setNewStockVal}
                    selectTextOnFocus
                    autoFocus
                  />
                </View>

                <View style={styles.stockModalButtons}>
                  <Pressable style={styles.stockCancelBtn} onPress={() => setIsStockModalVisible(false)}>
                    <Text style={styles.stockCancelText}>Hủy</Text>
                  </Pressable>
                  <Pressable style={styles.stockSaveBtn} onPress={handleSaveStock}>
                    <Text style={styles.stockSaveText}>Lưu kho</Text>
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
  searchSection: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    backgroundColor: '#FAFCFA',
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.TEXT,
    fontWeight: '600',
    height: '100%',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  filterScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
  },
  filterTabActive: {
    borderColor: COLORS.GREEN,
    backgroundColor: COLORS.LIGHT_GREEN,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  filterTabTextActive: {
    color: COLORS.DARK_GREEN,
  },
  listScrollContent: {
    padding: 12,
    paddingBottom: 100,
  },
  resultCount: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.MUTED,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.MUTED,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 12,
    marginBottom: 10,
    ...SHADOW,
  },
  productCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#F7FAf8',
  },
  productMainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productLeft: {
    flex: 1.6,
    gap: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  skuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skuText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  dotSeparator: {
    fontSize: 10,
    color: COLORS.BORDER,
  },
  barcodeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  productRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  oldPrice: {
    fontSize: 9,
    color: COLORS.MUTED,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  stockTag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLORS.LIGHT_GREEN,
    marginTop: 6,
  },
  stockTagLow: {
    backgroundColor: '#FFF9DB',
  },
  stockTagOut: {
    backgroundColor: '#FFF0F2',
  },
  stockTagDisabled: {
    backgroundColor: '#ECECEC',
  },
  stockTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  stockTagTextLow: {
    color: '#E8590C',
  },
  stockTagTextOut: {
    color: COLORS.RED,
  },
  stockTagTextDisabled: {
    color: '#636363',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
    marginTop: 10,
    paddingTop: 8,
  },
  footerActionText: {
    fontSize: 9,
    color: COLORS.MUTED,
    fontWeight: '700',
  },

  /* Modals */
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
  modalContentSmall: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
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
  modalBtnGrid: {
    gap: 8,
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FAFCFA',
  },
  modalBtnDisable: {
    borderColor: '#FFF0F2',
    backgroundColor: '#FFFBFB',
  },
  modalBtnEnable: {
    borderColor: '#F0FAF2',
    backgroundColor: '#F9FFF9',
  },
  modalActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  modalCloseBtn: {
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EDF2EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalCloseText: {
    fontSize: 13,
    color: COLORS.MUTED,
    fontWeight: '800',
  },

  /* Quick Stock Update */
  stockInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  stockInputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  stockTextInput: {
    width: 100,
    height: 40,
    borderWidth: 2,
    borderColor: COLORS.GREEN,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.TEXT,
    fontWeight: '900',
    textAlign: 'center',
  },
  stockModalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  stockCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockCancelText: {
    fontSize: 13,
    color: COLORS.MUTED,
    fontWeight: '800',
  },
  stockSaveBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockSaveText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
