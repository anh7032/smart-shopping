import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { mockProducts } from '../data/mockProducts';
import { Product, Receipt } from '../types';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

interface DiscrepancyItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const InspectorDiscrepancyScreen: React.FC = () => {
  const { currentReceipt, updateReceipt, navigate } = useApp();
  const [discrepancyList, setDiscrepancyList] = useState<DiscrepancyItem[]>([]);
  const [isPaid, setIsPaid] = useState(false);

  const receipt = currentReceipt;

  if (!receipt) {
    return (
      <View style={styles.errorScreen}>
        <Ionicons name="warning-outline" size={48} color={COLORS.RED} />
        <Text style={styles.errorText}>Không tìm thấy hóa đơn cần xử lý chênh lệch.</Text>
        <Pressable style={styles.backButtonLarge} onPress={() => navigate('inspector_lookup')}>
          <Text style={styles.backButtonLargeText}>Quay về tra cứu</Text>
        </Pressable>
      </View>
    );
  }

  const handleAddDiscrepancy = (product: Product) => {
    const existing = discrepancyList.find((item) => item.id === product.id);
    if (existing) {
      setDiscrepancyList(
        discrepancyList.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setDiscrepancyList([
        ...discrepancyList,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
  };

  const handleRemoveDiscrepancy = (id: string) => {
    setDiscrepancyList(discrepancyList.filter((item) => item.id !== id));
  };

  const totalAdditionalCost = useMemo(() => {
    return discrepancyList.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [discrepancyList]);

  const handleConfirmDiscrepancyPaid = async () => {
    if (discrepancyList.length === 0) {
      Alert.alert('Chưa có chênh lệch', 'Vui lòng thêm sản phẩm chênh lệch trước.');
      return;
    }

    // 1. Tạo bản cập nhật hóa đơn có ghi nhận chênh lệch và đánh dấu Đã kiểm soát
    const updatedReceipt: Receipt = {
      ...receipt,
      totalPrice: receipt.totalPrice + totalAdditionalCost,
      status: 'checked',
      additionalPaymentNeeded: totalAdditionalCost,
      additionalPaymentPaid: true,
      discrepancyItems: discrepancyList,
    };

    // 2. Cập nhật hóa đơn toàn cục
    await updateReceipt(updatedReceipt);

    // 3. Chuyển sang màn hình xác nhận cho phép rời siêu thị
    Alert.alert(
      'Thanh toán bổ sung thành công 🎉',
      `Đã thu hồi thêm số tiền chênh lệch ${money(totalAdditionalCost)}. Hóa đơn đã được khớp thành công!`,
      [
        {
          text: 'Hoàn tất kiểm tra',
          onPress: () => navigate('inspector_check', { receipt: updatedReceipt }),
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('inspector_lookup')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Xử lý chênh lệch</Text>
        <View style={{ width: 35 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Discrepancy input/selector area */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thêm hàng hóa chưa quét thanh toán</Text>
          <Text style={styles.sectionSub}>Nhấn vào sản phẩm dưới đây để đưa vào danh sách chênh lệch:</Text>

          {/* Quick product selector horizontal grid */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsSelectorScroll}>
            {mockProducts.map((p) => (
              <Pressable
                key={p.id}
                style={styles.productChip}
                onPress={() => handleAddDiscrepancy(p)}
              >
                <Text style={styles.productChipName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.productChipPrice}>{money(p.price)}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Discrepancy current list */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: COLORS.RED }]}>Danh sách mặt hàng chênh lệch</Text>
          {discrepancyList.length === 0 ? (
            <View style={styles.emptyList}>
              <Ionicons name="alert-circle-outline" size={32} color={COLORS.MUTED} />
              <Text style={styles.emptyListText}>Chưa có mặt hàng chênh lệch nào được chọn.</Text>
            </View>
          ) : (
            discrepancyList.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemQty}>x{item.quantity} • {money(item.price)}</Text>
                </View>
                <View style={styles.itemAction}>
                  <Text style={styles.itemPrice}>{money(item.price * item.quantity)}</Text>
                  <Pressable style={styles.deleteBtn} onPress={() => handleRemoveDiscrepancy(item.id)}>
                    <Ionicons name="trash-outline" size={15} color={COLORS.RED} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Additional Payment QR Box if discrepancy exists */}
        {discrepancyList.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.paymentQRHeader}>
              <View>
                <Text style={styles.qrTitle}>Yêu cầu thanh toán bổ sung</Text>
                <Text style={styles.qrSub}>Khách hàng quét mã này để thanh toán phần chênh lệch</Text>
              </View>
              <Text style={styles.additionalCostVal}>{money(totalAdditionalCost)}</Text>
            </View>

            {/* Render z8027 QR Code Image */}
            <View style={styles.qrWrapper}>
              <Image
                source={require('../../image/z8027286543607_f5dac330b54064fa54e2a405e41d795a.jpg')}
                style={styles.qrImage}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Fixed bottom checkout discrepancy confirm */}
      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.confirmBtn, discrepancyList.length === 0 && styles.confirmBtnDisabled]}
          onPress={handleConfirmDiscrepancyPaid}
          disabled={discrepancyList.length === 0}
        >
          <Ionicons name="card" size={18} color="#FFFFFF" />
          <Text style={styles.confirmBtnText}>Xác nhận khách đã quét thanh toán bổ sung</Text>
        </Pressable>
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
    backgroundColor: '#EDF2EE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 16,
    marginBottom: 12,
    ...SHADOW,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  sectionSub: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 12,
  },
  productsSelectorScroll: {
    gap: 8,
    paddingBottom: 6,
  },
  productChip: {
    width: 120,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  productChipName: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.TEXT,
    width: '100%',
    textAlign: 'center',
  },
  productChipPrice: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  emptyList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  emptyListText: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  itemQty: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.GREEN,
  },
  itemAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  deleteBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF0F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentQRHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    paddingBottom: 12,
  },
  qrTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  qrSub: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '700',
    marginTop: 2,
  },
  additionalCostVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.RED,
  },
  qrWrapper: {
    alignItems: 'center',
    marginTop: 14,
  },
  qrImage: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingHorizontal: 16,
    paddingBottom: 10,
    justifyContent: 'center',
    ...SHADOW,
  },
  confirmBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOW,
  },
  confirmBtnDisabled: {
    backgroundColor: '#D2DDD4',
    elevation: 0,
    shadowOpacity: 0,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
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
});
