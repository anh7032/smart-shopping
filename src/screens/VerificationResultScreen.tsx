import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

export const VerificationResultScreen: React.FC = () => {
  const { currentReceipt, selectedCategory, endSession, navigate, updateReceipt } = useApp();
  
  // States to handle interactive mock actions inside mismatch scenario
  const [simulationState, setSimulationState] = useState<'MATCH' | 'MISMATCH'>(
    selectedCategory === 'mismatch' ? 'MISMATCH' : 'MATCH'
  );
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const receipt = currentReceipt;

  if (!receipt) {
    return (
      <View style={styles.errorScreen}>
        <Ionicons name="warning-outline" size={48} color={COLORS.RED} />
        <Text style={styles.errorText}>Không tìm thấy hóa đơn đối chiếu.</Text>
        <Pressable style={styles.backButtonLarge} onPress={() => navigate('home')}>
          <Text style={styles.backButtonLargeText}>Quay về trang chủ</Text>
        </Pressable>
      </View>
    );
  }

  // Mock mismatch item details
  const mismatchItem = {
    id: 'sua-tuoi-th',
    name: 'Sữa tươi TH True Milk',
    price: 28000,
    quantity: 1, // Lệch thừa 1 hộp trong giỏ thực tế
  };

  const handlePayDifference = () => {
    setIsProcessingAction(true);
    setTimeout(async () => {
      setIsProcessingAction(false);
      
      // Update receipt in context to add discrepancy item and mark as paid
      const updatedReceipt = {
        ...receipt,
        totalPrice: receipt.totalPrice + mismatchItem.price,
        status: 'checked' as any,
        discrepancyItems: [mismatchItem],
        additionalPaymentNeeded: mismatchItem.price,
        additionalPaymentPaid: true,
      };
      await updateReceipt(updatedReceipt);

      setSimulationState('MATCH');
      Alert.alert(
        'Thanh toán bổ sung thành công 🎉',
        `Đã nộp thêm ${money(mismatchItem.price)} cho 1 x ${mismatchItem.name}. Hóa đơn của bạn hiện đã trùng khớp hoàn toàn!`
      );
    }, 1500);
  };

  const handleRemoveItem = () => {
    setIsProcessingAction(true);
    setTimeout(async () => {
      setIsProcessingAction(false);

      // Match invoice by removing extra item from physical cart
      const updatedReceipt = {
        ...receipt,
        status: 'checked' as any,
      };
      await updateReceipt(updatedReceipt);

      setSimulationState('MATCH');
      Alert.alert(
        'Đã bỏ sản phẩm thừa ✅',
        `Bạn đã bỏ 1 x ${mismatchItem.name} ra khỏi giỏ hàng. Hóa đơn và giỏ hàng hiện đã trùng khớp hoàn toàn!`
      );
    }, 1000);
  };

  const handleCallStaff = () => {
    Alert.alert(
      'Đang gọi nhân viên hỗ trợ 📣',
      'Đã gửi yêu cầu hỗ trợ tới trạm kiểm soát lối ra. Nhân viên Exit Control sẽ có mặt tại xe đẩy của bạn ngay lập tức.'
    );
  };

  const handleFinishSession = async () => {
    Alert.alert(
      'Rời siêu thị thành công 👋',
      'Cảm ơn bạn đã mua sắm tại SmartCart. Chúc bạn một ngày tốt lành và hẹn gặp lại!',
      [
        {
          text: 'Đồng ý',
          onPress: async () => {
            await endSession();
            navigate('welcome');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 35 }} />
        <Text style={styles.headerTitle}>Kết quả Đối chiếu</Text>
        <View style={{ width: 35 }} />
      </View>

      <View style={styles.container}>
        {isProcessingAction ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.GREEN} />
            <Text style={styles.loadingText}>Đang cập nhật trạng thái hệ thống...</Text>
          </View>
        ) : simulationState === 'MATCH' ? (
          /* CASE 1: MATCHING SUCCESS VIEW */
          <View style={styles.resultBox}>
            <View style={[styles.card, styles.successCard]}>
              <View style={styles.iconCircleSuccess}>
                <Ionicons name="checkmark-sharp" size={44} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>XÁC THỰC THÀNH CÔNG!</Text>
              <Text style={styles.successSub}>Khách hàng hợp lệ. Cho phép ra khỏi siêu thị.</Text>

              <View style={styles.receiptDetailsBox}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Hóa đơn:</Text>
                  <Text style={styles.detailValue}>{receipt.id}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Mã xe đẩy:</Text>
                  <Text style={styles.detailValue}>{receipt.cartCode}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Số lượng SP:</Text>
                  <Text style={styles.detailValue}>{receipt.totalQuantity} sản phẩm</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tổng thanh toán:</Text>
                  <Text style={[styles.detailValue, { color: COLORS.DARK_GREEN, fontWeight: '900' }]}>
                    {money(receipt.totalPrice)}
                  </Text>
                </View>
              </View>

              <View style={styles.readyBadge}>
                <Ionicons name="shield-checkmark" size={16} color={COLORS.GREEN} />
                <Text style={styles.readyBadgeText}>HỆ THỐNG ĐÃ MỞ CỬA RA CỔNG</Text>
              </View>
            </View>

            <Pressable style={styles.finishBtn} onPress={handleFinishSession}>
              <Ionicons name="exit-outline" size={20} color="#FFFFFF" />
              <Text style={styles.finishBtnText}>Giải phóng xe đẩy & Hoàn tất phiên</Text>
            </Pressable>
          </View>
        ) : (
          /* CASE 2: MISMATCH WARNING VIEW */
          <View style={styles.resultBox}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ gap: 16 }}>
              <View style={[styles.card, styles.mismatchCard]}>
                <View style={styles.iconCircleWarning}>
                  <Ionicons name="alert-outline" size={40} color="#FFFFFF" />
                </View>
                <Text style={styles.warningTitle}>PHÁT HIỆN CHÊNH LỆCH HÀNG HÓA!</Text>
                <Text style={styles.warningSub}>
                  Số lượng sản phẩm trong xe đẩy không trùng khớp với hóa đơn đã thanh toán.
                </Text>

                <View style={styles.discrepancyBox}>
                  <Text style={styles.discrepancyTitle}>Chi tiết chênh lệch phát hiện:</Text>
                  <View style={styles.discrepancyRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.discrepancyName}>{mismatchItem.name}</Text>
                      <Text style={styles.discrepancyQty}>
                        Hóa đơn: x0 • Xe đẩy thực tế: <Text style={{ color: COLORS.RED, fontWeight: '800' }}>x1</Text> (thừa 1)
                      </Text>
                    </View>
                    <Text style={styles.discrepancyPrice}>+{money(mismatchItem.price)}</Text>
                  </View>

                  <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: '#F0D8D8', paddingTop: 8, marginTop: 10 }]}>
                    <Text style={[styles.detailLabel, { color: COLORS.RED }]}>Tổng chênh lệch cần nộp:</Text>
                    <Text style={[styles.detailValue, { color: COLORS.RED, fontWeight: '900', fontSize: 16 }]}>
                      {money(mismatchItem.price)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Mismatch interactive action triggers */}
              <View style={styles.actionSection}>
                <Text style={styles.actionSectionTitle}>HÀNH ĐỘNG KHẮC PHỤC CHÊNH LỆCH</Text>

                <Pressable style={styles.actionBtnPrimary} onPress={handlePayDifference}>
                  <Ionicons name="card-outline" size={18} color="#FFFFFF" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.actionBtnTitle}>1. Thanh toán phần chênh lệch</Text>
                    <Text style={styles.actionBtnSub}>Nộp thêm {money(mismatchItem.price)} bằng QR giả lập</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                </Pressable>

                <Pressable style={styles.actionBtnSecondary} onPress={handleRemoveItem}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.TEXT} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.actionBtnTitleDark}>2. Bỏ sản phẩm thừa ra ngoài</Text>
                    <Text style={styles.actionBtnSubDark}>Trả lại 1 x {mismatchItem.name} cho quầy kiểm soát</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.MUTED} />
                </Pressable>

                <Pressable style={styles.actionBtnMuted} onPress={handleCallStaff}>
                  <Ionicons name="megaphone-outline" size={18} color="#E8590C" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.actionBtnTitleOrange}>3. Gọi nhân viên hỗ trợ lối ra</Text>
                    <Text style={styles.actionBtnSubOrange}>Yêu cầu kiểm soát viên xử lý thủ công</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#E8590C" />
                </Pressable>
              </View>
            </ScrollView>
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
    paddingTop: TOP_INSET + 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  resultBox: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    ...SHADOW,
  },
  successCard: {
    borderColor: COLORS.GREEN,
    backgroundColor: '#F3FCF5',
  },
  mismatchCard: {
    borderColor: COLORS.RED,
    backgroundColor: '#FFF5F5',
  },
  iconCircleSuccess: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...SHADOW,
  },
  iconCircleWarning: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...SHADOW,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  successSub: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.MUTED,
    textAlign: 'center',
    marginTop: 6,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.RED,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  warningSub: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.MUTED,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
  receiptDetailsBox: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#E2EAF0',
    paddingTop: 16,
    marginTop: 18,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.MUTED,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.TEXT,
    fontWeight: '800',
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6F4EA',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#C3E6CB',
  },
  readyBadgeText: {
    color: COLORS.DARK_GREEN,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  discrepancyBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFA8A8',
    padding: 12,
    marginTop: 18,
    ...SHADOW,
  },
  discrepancyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.RED,
    marginBottom: 8,
  },
  discrepancyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discrepancyName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  discrepancyQty: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '600',
    marginTop: 2,
  },
  discrepancyPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.RED,
  },
  finishBtn: {
    backgroundColor: COLORS.GREEN,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    ...SHADOW,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  actionSection: {
    marginTop: 6,
    gap: 10,
  },
  actionSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.MUTED,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.GREEN,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOW,
  },
  actionBtnTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  actionBtnSub: {
    color: '#D1FAE5',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  actionBtnSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOW,
  },
  actionBtnTitleDark: {
    color: COLORS.TEXT,
    fontSize: 12,
    fontWeight: '800',
  },
  actionBtnSubDark: {
    color: COLORS.MUTED,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  actionBtnMuted: {
    backgroundColor: '#FFF9DB',
    borderWidth: 1.5,
    borderColor: '#FFE8CC',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOW,
  },
  actionBtnTitleOrange: {
    color: '#D9480F',
    fontSize: 12,
    fontWeight: '800',
  },
  actionBtnSubOrange: {
    color: '#F76707',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    gap: 14,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.MUTED,
    fontWeight: '700',
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
