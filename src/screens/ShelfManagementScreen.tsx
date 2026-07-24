import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

// Standard available shelves list for rapid reassignment
const SHELF_PRESETS = [
  'Khu thực phẩm tươi - Dãy A1 - Kệ số 5',
  'Khu thực phẩm tươi - Dãy A3 - Kệ số 2',
  'Khu bánh mì - Dãy A4 - Kệ số 1',
  'Khu đồ uống - Dãy B1 - Kệ số 4',
  'Khu sữa - Dãy B2 - Kệ số 1',
  'Khu nước giải khát - Dãy B2 - Kệ số 3',
  'Khu thực phẩm tươi - Tủ đông C1',
  'Khu đồ khô - Dãy C2 - Kệ số 1',
  'Khu gia vị - Dãy C3 - Kệ số 2',
  'Khu ăn vặt - Dãy C4 - Kệ số 3',
  'Khu cá nhân - Dãy D1 - Kệ số 1',
  'Khu cá nhân - Dãy D1 - Kệ số 2',
  'Khu mỹ phẩm - Dãy D2 - Kệ số 3',
  'Khu gia dụng - Dãy E1 - Kệ số 1',
  'Khu hóa chất - Dãy E2 - Kệ số 4',
  'Không có kệ hàng (Chưa gán vị trí)',
];

export const ShelfManagementScreen: React.FC = () => {
  const { products, updateProduct, navigate, logAuditAction, selectedProduct } = useApp();
  const [selectedShelf, setSelectedShelf] = useState<string>(SHELF_PRESETS[1]); // Default to A3

  // Modals state
  const [isMoveModalVisible, setIsMoveModalVisible] = useState(false);
  const [movingProduct, setMovingProduct] = useState<Product | null>(null);

  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [searchAssignQuery, setSearchAssignQuery] = useState('');

  // Group products by shelf dynamically
  const shelfProductsMap = useMemo(() => {
    const map: { [shelfKey: string]: Product[] } = {};
    
    // Pre-populate presets in the map to show empty shelves
    SHELF_PRESETS.forEach(sh => {
      map[sh] = [];
    });

    products.forEach((p) => {
      const shelfKey = p.shelf || 'Không có kệ hàng (Chưa gán vị trí)';
      if (!map[shelfKey]) {
        map[shelfKey] = [];
      }
      map[shelfKey].push(p);
    });

    return map;
  }, [products]);

  // Extract list of unique Aisle headers (e.g. "Dãy A3", "Tủ đông C1", etc.)
  const groupedShelves = useMemo(() => {
    const aisles: { [aisle: string]: string[] } = {};
    SHELF_PRESETS.forEach((sh) => {
      // Parse aisle from format: "Khu thực phẩm tươi - Dãy A3 - Kệ số 2"
      const parts = sh.split(' - ');
      const aisle = parts[1] || parts[0]; // fallback to first part if no split
      if (!aisles[aisle]) {
        aisles[aisle] = [];
      }
      aisles[aisle].push(sh);
    });
    return aisles;
  }, []);

  const handleRemoveFromShelf = async (product: Product) => {
    Alert.alert(
      'Gỡ khỏi kệ',
      `Bạn chắc chắn muốn gỡ sản phẩm "${product.name}" khỏi kệ hiện tại?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gỡ kệ',
          style: 'destructive',
          onPress: async () => {
            const updated = { ...product, shelf: 'Không có kệ hàng (Chưa gán vị trí)' };
            await updateProduct(updated);

            // Log audit action
            await logAuditAction(
              'SHELF_REMOVED',
              product.id,
              `Đã gỡ sản phẩm "${product.name}" khỏi kệ "${product.shelf}"`
            );

            Alert.alert('Thành công', 'Đã gỡ sản phẩm khỏi kệ!');
          },
        },
      ]
    );
  };

  const handleOpenMove = (product: Product) => {
    setMovingProduct(product);
    setIsMoveModalVisible(true);
  };

  const handleConfirmMove = async (targetShelf: string) => {
    if (!movingProduct) return;

    const updated = { ...movingProduct, shelf: targetShelf };
    await updateProduct(updated);

    // Log audit action
    await logAuditAction(
      'SHELF_CHANGED',
      movingProduct.id,
      `Đã chuyển vị trí kệ hàng của "${movingProduct.name}" từ "${movingProduct.shelf}" sang "${targetShelf}"`
    );

    Alert.alert('Thành công 🎉', `Đã chuyển sản phẩm sang kệ mới:\n${targetShelf}`);
    setIsMoveModalVisible(false);
    setMovingProduct(null);
  };

  // Assign product that has no location to the current selected shelf
  const unassignedProducts = useMemo(() => {
    return products.filter((p) => {
      const isUnassigned = !p.shelf || p.shelf.includes('Không có');
      const q = searchAssignQuery.trim().toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
      return isUnassigned && matchesSearch;
    });
  }, [products, searchAssignQuery]);

  const handleAssignToShelf = async (product: Product) => {
    const updated = { ...product, shelf: selectedShelf };
    await updateProduct(updated);

    // Log audit action
    await logAuditAction(
      'SHELF_ASSIGNED',
      product.id,
      `Đã gán vị trí kệ "${selectedShelf}" cho sản phẩm "${product.name}"`
    );

    Alert.alert('Thành công', `Đã gán sản phẩm vào kệ "${selectedShelf}"!`);
    setIsAssignModalVisible(false);
    setSearchAssignQuery('');
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('staff_dashboard')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Quản lý kệ hàng</Text>
        <View style={{ width: 35 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Aisle & Shelves Tree Selector */}
        <View style={styles.shelfTreeCard}>
          <Text style={styles.cardTitle}>Sơ đồ dãy & kệ hàng</Text>
          <Text style={styles.cardSub}>Nhấn vào một kệ hàng dưới đây để quản lý danh sách sản phẩm:</Text>

          <ScrollView style={styles.treeScroll} nestedScrollEnabled>
            {Object.keys(groupedShelves).map((aisle) => (
              <View key={aisle} style={styles.aisleBlock}>
                <View style={styles.aisleHeader}>
                  <Ionicons name="grid-outline" size={14} color={COLORS.GREEN} />
                  <Text style={styles.aisleHeaderText}>{aisle}</Text>
                </View>
                <View style={styles.shelvesRow}>
                  {groupedShelves[aisle].map((sh) => {
                    const isSelected = selectedShelf === sh;
                    const parts = sh.split(' - ');
                    const shelfName = parts[2] || parts[1] || parts[0];
                    const count = shelfProductsMap[sh]?.length || 0;

                    return (
                      <Pressable
                        key={sh}
                        style={[styles.shelfPill, isSelected && styles.shelfPillActive]}
                        onPress={() => setSelectedShelf(sh)}
                      >
                        <Text style={[styles.shelfPillText, isSelected && styles.shelfPillTextActive]}>
                          {shelfName} ({count})
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Selected Shelf Details & Products List */}
        <View style={styles.shelfDetailsCard}>
          <View style={styles.shelfDetailsHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedShelfTitle}>
                {selectedShelf.split(' - ')[2] || selectedShelf.split(' - ')[1] || selectedShelf}
              </Text>
              <Text style={styles.selectedShelfFull}>{selectedShelf}</Text>
            </View>
            <Pressable style={styles.addProductsBtn} onPress={() => setIsAssignModalVisible(true)}>
              <Ionicons name="add" size={14} color="#FFFFFF" />
              <Text style={styles.addProductsText}>Gán hàng</Text>
            </Pressable>
          </View>

          <View style={styles.shelfMetricsRow}>
            <View style={styles.shelfMetricBox}>
              <Text style={styles.shelfMetricLabel}>TRẠNG THÁI</Text>
              <Text style={[styles.shelfMetricVal, { color: COLORS.DARK_GREEN }]}>Hoạt động</Text>
            </View>
            <View style={styles.shelfMetricBox}>
              <Text style={styles.shelfMetricLabel}>SỨC CHỨA MÔ PHỎNG</Text>
              <Text style={styles.shelfMetricVal}>50 SP</Text>
            </View>
            <View style={styles.shelfMetricBox}>
              <Text style={styles.shelfMetricLabel}>SỐ SP HIỆN TẠI</Text>
              <Text style={styles.shelfMetricVal}>{(shelfProductsMap[selectedShelf] || []).length} loại</Text>
            </View>
          </View>

          {/* List of Products on Selected Shelf */}
          <Text style={styles.subListTitle}>Sản phẩm trên kệ này</Text>
          {(shelfProductsMap[selectedShelf] || []).length === 0 ? (
            <View style={styles.emptyShelfBox}>
              <Ionicons name="file-tray-outline" size={32} color={COLORS.MUTED} />
              <Text style={styles.emptyShelfText}>Kệ hàng này hiện chưa có sản phẩm nào được gán vị trí.</Text>
            </View>
          ) : (
            (shelfProductsMap[selectedShelf] || []).map((p) => (
              <View key={p.id} style={styles.shelfProductRow}>
                <View style={styles.productBrief}>
                  <Text style={styles.shelfProductName}>{p.name}</Text>
                  <Text style={styles.shelfProductSku}>SKU: {p.sku || 'N/A'} • Kho: {p.stock}</Text>
                </View>
                <View style={styles.shelfProductActions}>
                  <Pressable style={styles.actionIconBtn} onPress={() => handleOpenMove(p)}>
                    <Ionicons name="swap-horizontal-outline" size={14} color="#0066FF" />
                    <Text style={[styles.actionIconText, { color: '#0066FF' }]}>Đổi kệ</Text>
                  </Pressable>
                  <Pressable style={[styles.actionIconBtn, styles.actionIconBtnDanger]} onPress={() => handleRemoveFromShelf(p)}>
                    <Ionicons name="trash-outline" size={14} color={COLORS.RED} />
                    <Text style={[styles.actionIconText, { color: COLORS.RED }]}>Gỡ kệ</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* MOVE SHELF MODAL */}
      <Modal visible={isMoveModalVisible} transparent animationType="slide" onRequestClose={() => setIsMoveModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {movingProduct && (
              <>
                <Text style={styles.modalHeaderTitle}>Di chuyển sản phẩm sang shelf khác</Text>
                <Text style={styles.modalHeaderSub}>{movingProduct.name} • Hiện tại: {movingProduct.shelf}</Text>

                <Text style={styles.subListTitle}>Chọn kệ hàng đích:</Text>
                <ScrollView style={styles.presetMoveScroll} nestedScrollEnabled>
                  {SHELF_PRESETS.filter(sh => sh !== movingProduct.shelf).map((sh) => (
                    <Pressable key={sh} style={styles.targetShelfRow} onPress={() => handleConfirmMove(sh)}>
                      <Ionicons name="arrow-forward-outline" size={14} color={COLORS.GREEN} />
                      <Text style={styles.targetShelfText}>{sh}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Pressable style={styles.modalCloseBtn} onPress={() => setIsMoveModalVisible(false)}>
                  <Text style={styles.modalCloseText}>Hủy</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ASSIGN / CHƯA GÁN VỊ TRÍ MODAL */}
      <Modal visible={isAssignModalVisible} transparent animationType="slide" onRequestClose={() => setIsAssignModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeaderTitle}>Gán sản phẩm chưa có vị trí</Text>
            <Text style={styles.modalHeaderSub}>Gán sản phẩm vào kệ: {selectedShelf}</Text>

            {/* Search filter for assigning products */}
            <View style={styles.modalSearchBox}>
              <Ionicons name="search-outline" size={16} color={COLORS.MUTED} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Tìm sản phẩm chưa có kệ..."
                placeholderTextColor="#A1AEA5"
                value={searchAssignQuery}
                onChangeText={setSearchAssignQuery}
              />
            </View>

            <ScrollView style={styles.presetMoveScroll} nestedScrollEnabled>
              {unassignedProducts.length === 0 ? (
                <View style={styles.emptyShelfBox}>
                  <Text style={styles.emptyShelfText}>Không tìm thấy sản phẩm nào chưa có kệ hàng.</Text>
                </View>
              ) : (
                unassignedProducts.map((p) => (
                  <Pressable key={p.id} style={styles.assignProductRow} onPress={() => handleAssignToShelf(p)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.assignProductName}>{p.name}</Text>
                      <Text style={styles.assignProductSku}>SKU: {p.sku || 'N/A'} • Kho: {p.stock}</Text>
                    </View>
                    <Ionicons name="add-circle" size={24} color={COLORS.GREEN} />
                  </Pressable>
                ))
              )}
            </ScrollView>

            <Pressable style={styles.modalCloseBtn} onPress={() => setIsAssignModalVisible(false)}>
              <Text style={styles.modalCloseText}>Đóng</Text>
            </Pressable>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  shelfTreeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 16,
    marginBottom: 14,
    ...SHADOW,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  cardSub: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 12,
  },
  treeScroll: {
    maxHeight: 220,
  },
  aisleBlock: {
    marginBottom: 12,
  },
  aisleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  aisleHeaderText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.GREEN,
    textTransform: 'uppercase',
  },
  shelvesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  shelfPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
  },
  shelfPillActive: {
    borderColor: COLORS.GREEN,
    backgroundColor: COLORS.LIGHT_GREEN,
  },
  shelfPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  shelfPillTextActive: {
    color: COLORS.DARK_GREEN,
  },

  /* Details Card */
  shelfDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 16,
    ...SHADOW,
  },
  shelfDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
    paddingBottom: 12,
  },
  selectedShelfTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  selectedShelfFull: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '700',
    marginTop: 2,
  },
  addProductsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.GREEN,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addProductsText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  shelfMetricsRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  shelfMetricBox: {
    flex: 1,
  },
  shelfMetricLabel: {
    fontSize: 8,
    color: COLORS.MUTED,
    fontWeight: '800',
    marginBottom: 3,
  },
  shelfMetricVal: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  subListTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.MUTED,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  emptyShelfBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyShelfText: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
    textAlign: 'center',
  },
  shelfProductRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
  },
  productBrief: {
    flex: 1.5,
  },
  shelfProductName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  shelfProductSku: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.MUTED,
    marginTop: 2,
  },
  shelfProductActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: '#D0E1FD',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: '#FAFCFF',
  },
  actionIconBtnDanger: {
    borderColor: '#FFA8A8',
    backgroundColor: '#FFFBFB',
  },
  actionIconText: {
    fontSize: 9,
    fontWeight: '800',
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
    maxHeight: '80%',
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
  presetMoveScroll: {
    maxHeight: 280,
  },
  targetShelfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
  },
  targetShelfText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  modalCloseBtn: {
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EDF2EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalCloseText: {
    fontSize: 13,
    color: COLORS.MUTED,
    fontWeight: '800',
  },

  /* Assign Unmapped */
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: '#FAFCFA',
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    gap: 8,
    marginBottom: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.TEXT,
    fontWeight: '600',
  },
  assignProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
  },
  assignProductName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  assignProductSku: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.MUTED,
    marginTop: 2,
  },
});
