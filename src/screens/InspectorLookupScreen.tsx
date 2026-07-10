import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';
import { Receipt } from '../types';

export const InspectorLookupScreen: React.FC = () => {
  const { receipts, currentReceipt, navigate } = useApp();
  const [searchId, setSearchCode] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Pre-load receipt if sent from the payment flow
  useEffect(() => {
    if (currentReceipt) {
      setSelectedReceipt(currentReceipt);
      setSearchCode(currentReceipt.id);
    }
  }, [currentReceipt]);

  const handleSearch = (id: string) => {
    const trimmed = id.trim().toUpperCase();
    if (!trimmed) {
      Alert.alert('Nhập mã', 'Vui lòng nhập mã hóa đơn.');
      return;
    }

    const found = receipts.find((r) => r.id === trimmed);
    if (found) {
      setSelectedReceipt(found);
    } else {
      Alert.alert(
        'Không tìm thấy',
        `Mã hóa đơn "${trimmed}" không tồn tại hoặc chưa được thanh toán.`
      );
    }
  };

  const selectReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setSearchCode(receipt.id);
  };

  const handleMatchSuccess = () => {
    if (!selectedReceipt) return;
    
    // Đánh dấu hóa đơn đã được kiểm tra thành công
    const updated: Receipt = {
      ...selectedReceipt,
      status: 'checked',
    };
    
    navigate('inspector_check', { receipt: updated });
  };

  const handleDiscrepancy = () => {
    if (!selectedReceipt) return;
    navigate('inspector_discrepancy', { receipt: selectedReceipt });
  };

  const handleExitInspector = () => {
    Alert.alert(
      'Thoát phân hệ Nhân viên',
      'Bạn muốn thoát vai trò Nhân viên kiểm soát siêu thị và quay lại màn hình chính của khách hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xác nhận', onPress: () => navigate('welcome') },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleExitInspector}>
          <Ionicons name="exit-outline" size={23} color="#E8590C" />
        </Pressable>
        <Text style={styles.headerTitle}>Đối chiếu & Kiểm soát</Text>
        <View style={{ width: 35 }} />
      </View>

      <View style={styles.content}>
        {/* Lookup bar */}
        <View style={styles.lookupCard}>
          <Text style={styles.lookupTitle}>Tra cứu hóa đơn của khách hàng</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mã hóa đơn... (Ví dụ: HD-123456)"
              placeholderTextColor="#A1AEA5"
              autoCapitalize="characters"
              value={searchId}
              onChangeText={setSearchCode}
            />
            <Pressable style={styles.searchBtn} onPress={() => handleSearch(searchId)}>
              <Ionicons name="search" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {selectedReceipt ? (
          /* Receipt detail view for matching */
          <View style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScroll}>
              <View style={styles.receiptDetailCard}>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailCode}>{selectedReceipt.id}</Text>
                  <View
                    style={[
                      styles.statusTag,
                      selectedReceipt.status === 'checked' 
                        ? styles.statusChecked 
                        : selectedReceipt.status === 'discrepancy' 
                          ? styles.statusDiscrepancy 
                          : styles.statusPaid
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusTagText,
                        selectedReceipt.status === 'checked' 
                          ? styles.statusCheckedText 
                          : selectedReceipt.status === 'discrepancy' 
                            ? styles.statusDiscrepancyText 
                            : styles.statusPaidText
                      ]}
                    >
                      {selectedReceipt.status === 'checked' 
                        ? 'Đã kiểm soát' 
                        : selectedReceipt.status === 'discrepancy' 
                          ? 'Có chênh lệch' 
                          : 'Đã thanh toán'
                      }
                    </Text>
                  </View>
                </View>

                {/* Metadata */}
                <View style={styles.metaBox}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Khách hàng:</Text>
                    <Text style={styles.metaValue}>{selectedReceipt.customerName}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Mã xe đẩy:</Text>
                    <Text style={styles.metaValue}>{selectedReceipt.cartCode}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Thanh toán bằng:</Text>
                    <Text style={styles.metaValue}>
                      {selectedReceipt.paymentMethod === 'qr_bank' 
                        ? 'QR Ngân hàng' 
                        : selectedReceipt.paymentMethod === 'e_wallet' 
                          ? 'Ví điện tử' 
                          : 'Thẻ thành viên'
                      }
                    </Text>
                  </View>
                </View>

                {/* Paid Items */}
                <Text style={styles.itemsTitle}>DANH SÁCH SẢN PHẨM ĐÃ MUA</Text>
                {selectedReceipt.items.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemNameCol}>
                      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.itemQty}>x{item.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>{money(item.price * item.quantity)}</Text>
                  </View>
                ))}

                {/* Additional discrepancies if previously handled */}
                {selectedReceipt.discrepancyItems && selectedReceipt.discrepancyItems.length > 0 && (
                  <View style={styles.discrepancySection}>
                    <Text style={[styles.itemsTitle, { color: COLORS.RED }]}>MẶT HÀNG PHÁT HIỆN THÊM</Text>
                    {selectedReceipt.discrepancyItems.map((item) => (
                      <View key={item.id} style={styles.itemRow}>
                        <View style={styles.itemNameCol}>
                          <Text style={[styles.itemName, { color: COLORS.RED }]} numberOfLines={1}>{item.name}</Text>
                          <Text style={[styles.itemQty, { backgroundColor: '#FFF5F5', color: COLORS.RED }]}>x{item.quantity}</Text>
                        </View>
                        <Text style={[styles.itemPrice, { color: COLORS.RED }]}>{money(item.price * item.quantity)}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Summary total row */}
                <View style={styles.totalBlock}>
                  <Text style={styles.totalLabel}>Tổng tiền:</Text>
                  <Text style={styles.totalVal}>{money(selectedReceipt.totalPrice)}</Text>
                </View>
              </View>

              {/* Reset select receipt */}
              <Pressable style={styles.resetReceiptBtn} onPress={() => setSelectedReceipt(null)}>
                <Text style={styles.resetReceiptText}>Tra cứu hóa đơn khác</Text>
              </Pressable>
            </ScrollView>

            {/* Sticky Action buttons at the bottom of lookup */}
            <View style={styles.actionBlock}>
              <Pressable style={styles.discrepancyBtn} onPress={handleDiscrepancy}>
                <Ionicons name="warning" size={18} color="#FFFFFF" />
                <Text style={styles.discrepancyBtnText}>Phát hiện chênh lệch</Text>
              </Pressable>
              
              <Pressable style={styles.matchSuccessBtn} onPress={handleMatchSuccess}>
                <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
                <Text style={styles.matchSuccessBtnText}>Khớp hóa đơn (Hợp lệ)</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* Receipts history fallback (so they can select recently bought receipt easily) */
          <View style={{ flex: 1 }}>
            <Text style={styles.historyTitle}>Lịch sử hóa đơn gần đây ({receipts.length})</Text>
            {receipts.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Ionicons name="receipt-outline" size={42} color={COLORS.MUTED} />
                <Text style={styles.emptyHistoryText}>Chưa có hóa đơn nào được tạo trong phiên này.</Text>
                <Text style={styles.emptyHistorySub}>Vui lòng đóng vai trò Khách hàng, mua sắm và thanh toán trước.</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.historyScroll}>
                {receipts.map((receipt) => (
                  <Pressable key={receipt.id} style={styles.historyCard} onPress={() => selectReceipt(receipt)}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyId}>{receipt.id}</Text>
                      <Text style={styles.historyTime}>{receipt.createdAt.split(' ')[1] || receipt.createdAt}</Text>
                    </View>
                    <View style={styles.historyMeta}>
                      <Text style={styles.historyLabel}>Khách: <Text style={styles.historyVal}>{receipt.customerName}</Text></Text>
                      <Text style={styles.historyLabel}>Tiền: <Text style={[styles.historyVal, { color: COLORS.DARK_GREEN }]}>{money(receipt.totalPrice)}</Text></Text>
                    </View>
                    <View style={styles.historyFooter}>
                      <Text style={styles.historyLabel}>Xe đẩy: <Text style={styles.historyVal}>{receipt.cartCode}</Text></Text>
                      <View
                        style={[
                          styles.historyStatusPill,
                          receipt.status === 'checked' 
                            ? styles.statusChecked 
                            : receipt.status === 'discrepancy' 
                              ? styles.statusDiscrepancy 
                              : styles.statusPaid
                        ]}
                      >
                        <Text style={[
                          styles.historyStatusText,
                          receipt.status === 'checked' 
                            ? styles.statusCheckedText 
                            : receipt.status === 'discrepancy' 
                              ? styles.statusDiscrepancyText 
                              : styles.statusPaidText
                        ]}>
                          {receipt.status === 'checked' 
                            ? 'Đã kiểm' 
                            : receipt.status === 'discrepancy' 
                              ? 'Lỗi' 
                              : 'Đã mua'
                          }
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>
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
    backgroundColor: '#FFF0E8', // Light orange to show exit/danger action
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  lookupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 14,
    ...SHADOW,
  },
  lookupTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  inputWrapper: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: COLORS.TEXT,
    fontWeight: '600',
    paddingHorizontal: 12,
  },
  searchBtn: {
    backgroundColor: '#E8590C', // Orange color for lookup action
    height: '100%',
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailScroll: {
    paddingBottom: 110,
    paddingTop: 10,
  },
  receiptDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 16,
    ...SHADOW,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
    paddingBottom: 12,
  },
  detailCode: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '900',
  },
  statusPaid: {
    backgroundColor: COLORS.LIGHT_GREEN,
  },
  statusPaidText: {
    color: COLORS.DARK_GREEN,
  },
  statusChecked: {
    backgroundColor: '#E2F3FF',
  },
  statusCheckedText: {
    color: '#1C7ED6',
  },
  statusDiscrepancy: {
    backgroundColor: '#FFF5F5',
  },
  statusDiscrepancyText: {
    color: COLORS.RED,
  },
  metaBox: {
    marginTop: 12,
    gap: 6,
    backgroundColor: COLORS.BACKGROUND,
    padding: 10,
    borderRadius: 12,
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
    fontWeight: '800',
  },
  itemsTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.TEXT,
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
  },
  itemNameCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.TEXT,
    maxWidth: '75%',
  },
  itemQty: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.GREEN,
    backgroundColor: COLORS.LIGHT_GREEN,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  discrepancySection: {
    marginTop: 14,
    borderTopWidth: 1.5,
    borderTopColor: '#FFA8A8',
    borderStyle: 'dashed',
    paddingTop: 10,
  },
  totalBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.BORDER,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  resetReceiptBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  resetReceiptText: {
    fontSize: 12,
    color: COLORS.MUTED,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  actionBlock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...SHADOW,
  },
  matchSuccessBtn: {
    flex: 1.2,
    height: 50,
    backgroundColor: COLORS.GREEN,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...SHADOW,
  },
  matchSuccessBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  discrepancyBtn: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.RED,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...SHADOW,
  },
  discrepancyBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  /* Receipts History fallback */
  historyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.MUTED,
    marginTop: 18,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  historyScroll: {
    gap: 10,
    paddingBottom: 40,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 12,
    ...SHADOW,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyId: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  historyTime: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  historyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
  },
  historyLabel: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  historyVal: {
    color: COLORS.TEXT,
    fontWeight: '800',
  },
  historyStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  historyStatusText: {
    fontSize: 9,
    fontWeight: '900',
  },
  emptyHistory: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 10,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: COLORS.TEXT,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyHistorySub: {
    fontSize: 11,
    color: COLORS.MUTED,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
});
