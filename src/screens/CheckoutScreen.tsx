import React, { useState } from 'react';
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

export const CheckoutScreen: React.FC = () => {
  const { cart, session, navigate } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<'qr_bank' | 'e_wallet' | 'member_card'>('qr_bank');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const savings = cart.reduce(
    (sum, item) =>
      sum + (item.oldPrice ? (item.oldPrice - item.price) * item.quantity : 0),
    0
  );

  const budget = session?.budget || 500000;
  const remaining = budget - totalPrice;

  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      Alert.alert('Lỗi', 'Giỏ hàng của bạn đang trống.');
      return;
    }
    if (!isConfirmed) {
      Alert.alert('Xác nhận giỏ hàng', 'Vui lòng xác nhận rằng bạn đã kiểm tra kỹ các sản phẩm trong giỏ hàng.');
      return;
    }

    // Chuyển sang màn hình Thanh toán QR giả lập
    // Chúng ta sẽ truyền thông số qua navigate (AppContext sẽ lưu tạm hóa đơn hoặc phương thức thanh toán)
    navigate('qr_payment', { category: paymentMethod }); // Lợi dụng trường category có sẵn để truyền phương thức thanh toán dạng string!
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('cart')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Xác nhận đơn hàng</Text>
        <View style={{ width: 35 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Bill summary card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          <Text style={styles.sectionSub}>Kiểm tra lại số lượng sản phẩm trước khi thanh toán.</Text>

          {cart.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemNameCol}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{money(item.price * item.quantity)}</Text>
            </View>
          ))}

          {/* Pricing detail list */}
          <View style={styles.priceDetails}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tạm tính ({totalQuantity} SP)</Text>
              <Text style={styles.priceVal}>{money(totalPrice + savings)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Khuyến mãi giảm giá</Text>
              <Text style={[styles.priceVal, { color: COLORS.RED }]}>-{money(savings)}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>TỔNG THANH TOÁN</Text>
              <Text style={styles.totalVal}>{money(totalPrice)}</Text>
            </View>
          </View>
        </View>

        {/* Budget reminder */}
        <View style={[styles.sectionCard, styles.budgetCard, remaining < 0 && styles.budgetCardDanger]}>
          <View style={styles.budgetHeader}>
            <Ionicons
              name={remaining < 0 ? 'warning-outline' : 'wallet-outline'}
              size={18}
              color={remaining < 0 ? COLORS.RED : COLORS.GREEN}
            />
            <Text style={[styles.budgetTitle, remaining < 0 && { color: COLORS.RED }]}>
              {remaining < 0 ? 'Vượt quá ngân sách!' : 'Kiểm soát ngân sách'}
            </Text>
          </View>
          <Text style={styles.budgetText}>
            Ngân sách của bạn: {money(budget)}. Đơn hàng chiếm {Math.round((totalPrice / budget) * 100)}% ngân sách. 
            {remaining < 0 
              ? ` Bạn đang vượt mức ${money(Math.abs(remaining))}.` 
              : ` Bạn còn dư ${money(remaining)}.`
            }
          </Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <Text style={styles.sectionSub}>Chọn một trong các phương thức thanh toán giả lập sau:</Text>

          {/* QR Bank */}
          <Pressable
            style={[styles.methodCard, paymentMethod === 'qr_bank' && styles.methodCardActive]}
            onPress={() => setPaymentMethod('qr_bank')}
          >
            <Ionicons
              name={paymentMethod === 'qr_bank' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={paymentMethod === 'qr_bank' ? COLORS.GREEN : COLORS.MUTED}
            />
            <View style={styles.methodIconBox}>
              <Ionicons name="qr-code-outline" size={20} color={COLORS.DARK_GREEN} />
            </View>
            <View style={styles.methodText}>
              <Text style={styles.methodTitle}>Thanh toán QR Ngân hàng</Text>
              <Text style={styles.methodSubTitle}>Quét mã QR để chuyển khoản nhanh</Text>
            </View>
          </Pressable>

          {/* E-wallet */}
          <Pressable
            style={[styles.methodCard, paymentMethod === 'e_wallet' && styles.methodCardActive]}
            onPress={() => setPaymentMethod('e_wallet')}
          >
            <Ionicons
              name={paymentMethod === 'e_wallet' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={paymentMethod === 'e_wallet' ? COLORS.GREEN : COLORS.MUTED}
            />
            <View style={[styles.methodIconBox, { backgroundColor: '#FFF0F5' }]}>
              <Ionicons name="wallet-outline" size={20} color="#FF1493" />
            </View>
            <View style={styles.methodText}>
              <Text style={styles.methodTitle}>Ví điện tử (Momo / ZaloPay)</Text>
              <Text style={styles.methodSubTitle}>Thanh toán qua ví điện tử liên kết</Text>
            </View>
          </Pressable>

          {/* Member Card */}
          <Pressable
            style={[styles.methodCard, paymentMethod === 'member_card' && styles.methodCardActive]}
            onPress={() => setPaymentMethod('member_card')}
          >
            <Ionicons
              name={paymentMethod === 'member_card' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={paymentMethod === 'member_card' ? COLORS.GREEN : COLORS.MUTED}
            />
            <View style={[styles.methodIconBox, { backgroundColor: '#E2F3FF' }]}>
              <Ionicons name="card-outline" size={20} color="#1C7ED6" />
            </View>
            <View style={styles.methodText}>
              <Text style={styles.methodTitle}>Thẻ thành viên SmartCart</Text>
              <Text style={styles.methodSubTitle}>Khấu trừ trực tiếp vào số dư tích điểm</Text>
            </View>
          </Pressable>
        </View>

        {/* Confirmation check */}
        <Pressable
          style={styles.confirmCheckboxRow}
          onPress={() => setIsConfirmed(!isConfirmed)}
        >
          <Ionicons
            name={isConfirmed ? 'checkbox' : 'square-outline'}
            size={22}
            color={isConfirmed ? COLORS.GREEN : COLORS.MUTED}
          />
          <Text style={styles.confirmCheckboxText}>
            Tôi xác nhận đã kiểm tra kỹ số lượng sản phẩm trong giỏ hàng thực tế khớp với ứng dụng.
          </Text>
        </Pressable>
      </ScrollView>

      {/* Fixed bottom action */}
      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.payButton, !isConfirmed && styles.payButtonDisabled]}
          onPress={handleProceedToPayment}
        >
          <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
          <Text style={styles.payButtonText}>Xác nhận & Tiến hành thanh toán</Text>
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
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  sectionSub: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 14,
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
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.TEXT,
    maxWidth: '75%',
  },
  itemQty: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.GREEN,
    backgroundColor: COLORS.LIGHT_GREEN,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  priceDetails: {
    marginTop: 14,
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  priceVal: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  totalRow: {
    borderTopWidth: 1.5,
    borderTopColor: COLORS.BORDER,
    paddingTop: 12,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  budgetCard: {
    backgroundColor: '#FAFCFA',
    borderColor: '#BDE3C5',
  },
  budgetCardDanger: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFA8A8',
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  budgetTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.GREEN,
  },
  budgetText: {
    fontSize: 12,
    color: COLORS.TEXT,
    lineHeight: 18,
    marginTop: 6,
    opacity: 0.85,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 10,
  },
  methodCardActive: {
    borderColor: COLORS.GREEN,
    backgroundColor: COLORS.LIGHT_GREEN,
  },
  methodIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodText: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  methodSubTitle: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '700',
    marginTop: 1,
  },
  confirmCheckboxRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 4,
    marginVertical: 12,
    alignItems: 'flex-start',
  },
  confirmCheckboxText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.TEXT,
    lineHeight: 18,
    fontWeight: '700',
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
  payButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOW,
  },
  payButtonDisabled: {
    backgroundColor: '#D2DDD4',
    elevation: 0,
    shadowOpacity: 0,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
