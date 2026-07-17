import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

export const InvoiceScreen: React.FC = () => {
  const { currentReceipt, navigate, setRole } = useApp();

  const receipt = currentReceipt;

  if (!receipt) {
    return (
      <View style={styles.errorScreen}>
        <Ionicons name="receipt-outline" size={48} color={COLORS.MUTED} />
        <Text style={styles.errorText}>Không tìm thấy hóa đơn gần đây.</Text>
        <Pressable style={styles.backButtonLarge} onPress={() => navigate('home')}>
          <Text style={styles.backButtonLargeText}>Quay về trang chủ</Text>
        </Pressable>
      </View>
    );
  }

  const handleDownload = () => {
    Alert.alert(
      'Tải hóa đơn thành công',
      'Đã lưu file PDF hóa đơn điện tử giả lập vào bộ nhớ máy điện thoại của bạn.'
    );
  };

  const handleSendEmail = () => {
    Alert.alert(
      'Gửi email thành công',
      'Đã gửi bản sao hóa đơn điện tử đến địa chỉ email đăng ký của bạn.'
    );
  };

  const handleGoToCheckpoint = () => {
    // Chuyển sang vai trò Nhân viên kiểm soát để thực hiện bước đối chiếu
    setRole('inspector');
    // Truyền receipt sang cho inspector_lookup đối chiếu trực tiếp!
    navigate('inspector_lookup', { receipt });
    Alert.alert(
      'Chuyển sang quầy kiểm soát',
      'Bạn đã chuyển sang vai trò Nhân viên kiểm soát siêu thị để đối chiếu sản phẩm trong giỏ hàng thực tế với hóa đơn này.'
    );
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case 'qr_bank':
        return 'QR Ngân hàng';
      case 'e_wallet':
        return 'Ví điện tử';
      case 'member_card':
        return 'Thẻ thành viên';
      default:
        return 'QR Ngân hàng';
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('home')}>
          <Ionicons name="home-outline" size={21} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Hóa đơn điện tử</Text>
        <View style={{ width: 35 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Receipt Visual Representation */}
        <View style={styles.receiptContainer}>
          {/* Top circle punches */}
          <View style={styles.jaggedHeader}>
            <View style={styles.jaggedTooth} />
            <View style={styles.jaggedTooth} />
            <View style={styles.jaggedTooth} />
            <View style={styles.jaggedTooth} />
            <View style={styles.jaggedTooth} />
            <View style={styles.jaggedTooth} />
            <View style={styles.jaggedTooth} />
            <View style={styles.jaggedTooth} />
            <View style={styles.jaggedTooth} />
            <View style={styles.jaggedTooth} />
          </View>

          <View style={styles.receiptBody}>
            {/* Supermarket Name */}
            <Text style={styles.marketName}>SMARTCART SUPERMARKET</Text>
            <Text style={styles.marketAddress}>Tầng 1, Vincom Center, Hà Nội</Text>
            <Text style={styles.marketPhone}>Hotline: 1900 6789</Text>

            <View style={styles.dividerDotted} />

            {/* Receipt metadata */}
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>MÃ HÓA ĐƠN:</Text>
              <Text style={styles.metaValue}>{receipt.id}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>NGÀY GIỜ:</Text>
              <Text style={styles.metaValue}>{receipt.createdAt}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>KHÁCH HÀNG:</Text>
              <Text style={styles.metaValue}>{receipt.customerName}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>XE ĐẨY:</Text>
              <Text style={styles.metaValue}>{receipt.cartCode}</Text>
            </View>

            <View style={styles.dividerDotted} />

            {/* Items table */}
            <Text style={styles.tableHeader}>CHI TIẾT SẢN PHẨM</Text>
            {receipt.items.map((item) => (
              <View key={item.id} style={styles.billItemRow}>
                <View style={styles.billItemCol}>
                  <Text style={styles.billItemName}>{item.name}</Text>
                  <Text style={styles.billItemQty}>
                    {item.quantity} x {money(item.price)}
                  </Text>
                </View>
                <Text style={styles.billItemPrice}>
                  {money(item.price * item.quantity)}
                </Text>
              </View>
            ))}

            <View style={styles.dividerDotted} />

            {/* Payment Summary */}
            <View style={styles.receiptSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tạm tính:</Text>
                <Text style={styles.summaryValue}>{money(receipt.totalPrice + receipt.savings)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tiết kiệm giảm giá:</Text>
                <Text style={[styles.summaryValue, { color: COLORS.RED }]}>-{money(receipt.savings - (receipt.vipDiscount || 0))}</Text>
              </View>
              {receipt.vipDiscount && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: '#7E22CE', fontWeight: '800' }]}>Chiết khấu VIP Hạng Tím:</Text>
                  <Text style={[styles.summaryValue, { color: '#7E22CE', fontWeight: '800' }]}>-{money(receipt.vipDiscount)}</Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.finalTotalRow]}>
                <Text style={styles.finalTotalLabel}>TỔNG THANH TOÁN:</Text>
                <Text style={styles.finalTotalValue}>{money(receipt.totalPrice)}</Text>
              </View>
            </View>

            <View style={styles.dividerDotted} />

            <View style={styles.statusBox}>
              <Text style={styles.statusLabel}>PHƯƠNG THỨC: <Text style={styles.statusVal}>{getMethodName(receipt.paymentMethod)}</Text></Text>
              <View style={styles.paidBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                <Text style={styles.paidBadgeText}>ĐÃ THANH TOÁN</Text>
              </View>
            </View>

            {/* QR Check code representation */}
            <View style={styles.qrVerificationWrapper}>
              <View style={styles.qrVerifyBox}>
                <View style={[styles.qrSquare, { top: 6, left: 6 }]} />
                <View style={[styles.qrSquare, { top: 6, right: 6 }]} />
                <View style={[styles.qrSquare, { bottom: 6, left: 6 }]} />
                <Ionicons name="qr-code" size={32} color="#404040" style={{ opacity: 0.2 }} />
              </View>
              <Text style={styles.qrVerifyText}>Mã hóa đơn bảo mật QR để nhân viên quét đối chiếu</Text>
            </View>
          </View>
        </View>

        {/* Action utility buttons */}
        <View style={styles.utilityButtons}>
          <Pressable style={styles.utilityBtn} onPress={handleDownload}>
            <Ionicons name="download-outline" size={16} color={COLORS.GREEN} />
            <Text style={styles.utilityBtnText}>Tải hóa đơn giả lập</Text>
          </Pressable>
          <Pressable style={styles.utilityBtn} onPress={handleSendEmail}>
            <Ionicons name="mail-outline" size={16} color={COLORS.GREEN} />
            <Text style={styles.utilityBtnText}>Gửi qua Email</Text>
          </Pressable>
        </View>

        {/* Primary flow exit - GO TO CHECKPOINT */}
        <Pressable style={styles.checkpointBtn} onPress={handleGoToCheckpoint}>
          <Text style={styles.checkpointBtnText}>Đi đến Điểm kiểm soát đơn hàng</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </ScrollView>
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
    paddingBottom: 50,
  },
  receiptContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOW,
  },
  jaggedHeader: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: '#F3F6F3',
    justifyContent: 'space-around',
  },
  jaggedTooth: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.BACKGROUND,
    marginTop: -8,
  },
  receiptBody: {
    padding: 20,
  },
  marketName: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  marketAddress: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  marketPhone: {
    fontSize: 9,
    color: COLORS.MUTED,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  dividerDotted: {
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
    marginVertical: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '800',
  },
  metaValue: {
    fontSize: 11,
    color: COLORS.TEXT,
    fontWeight: '800',
  },
  tableHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.TEXT,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  billItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  billItemCol: {
    flex: 1,
  },
  billItemName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  billItemQty: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '700',
    marginTop: 2,
  },
  billItemPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  receiptSummary: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  finalTotalRow: {
    borderTopWidth: 1.5,
    borderTopColor: COLORS.BORDER,
    borderStyle: 'dashed',
    paddingTop: 10,
    marginTop: 4,
  },
  finalTotalLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  statusBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFCFA',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDF2E1',
  },
  statusLabel: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  statusVal: {
    color: COLORS.TEXT,
    fontWeight: '800',
  },
  paidBadge: {
    backgroundColor: '#40C057',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...SHADOW,
  },
  paidBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  qrVerificationWrapper: {
    alignItems: 'center',
    marginTop: 18,
    gap: 8,
  },
  qrVerifyBox: {
    width: 80,
    height: 80,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#FAFCFA',
  },
  qrSquare: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderWidth: 3,
    borderColor: '#404040',
    borderRadius: 3,
  },
  qrVerifyText: {
    fontSize: 9,
    color: COLORS.MUTED,
    fontWeight: '700',
    textAlign: 'center',
    width: '75%',
    lineHeight: 13,
  },
  utilityButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  utilityBtn: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: COLORS.GREEN,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...SHADOW,
  },
  utilityBtnText: {
    color: COLORS.GREEN,
    fontSize: 12,
    fontWeight: '800',
  },
  checkpointBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8590C', // Orange warning/attention color for checkpoint transition
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    ...SHADOW,
  },
  checkpointBtnText: {
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
