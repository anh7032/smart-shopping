import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

export const QRPaymentScreen: React.FC = () => {
  const { cart, selectedCategory, checkout, navigate } = useApp();
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutes count down
  const [isProcessing, setIsProcessing] = useState(false);

  // Extract payment method from our carrier selectedCategory
  const paymentMethod = (selectedCategory as 'qr_bank' | 'e_wallet' | 'member_card') || 'qr_bank';

  // Tick down timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          Alert.alert(
            'Mã QR hết hạn',
            'Giao dịch thanh toán đã hết thời gian hiệu lực. Vui lòng thử lại.',
            [{ text: 'Quay lại', onPress: () => navigate('cart') }]
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);
    setTimeout(async () => {
      setIsProcessing(false);
      try {
        const receipt = await checkout(paymentMethod);
        Alert.alert(
          'Thanh toán thành công 🎉',
          `Đơn hàng ${receipt.id} đã được thanh toán thành công bằng ${getMethodName(paymentMethod)}.`,
          [
            {
              text: 'Xem hóa đơn',
              onPress: () => navigate('invoice', { receipt }),
            },
          ]
        );
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể khởi tạo hóa đơn.');
      }
    }, 1000); // Mock processing wait
  };

  const handlePaymentFailure = () => {
    Alert.alert(
      'Thanh toán thất bại ❌',
      'Mô phỏng thanh toán không thành công. Hãy thử lại hoặc lựa chọn phương thức thanh toán khác.',
      [
        { text: 'Thử lại' },
        { text: 'Chọn phương thức khác', onPress: () => navigate('checkout_confirm') },
      ]
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
        <Pressable style={styles.backButton} onPress={() => navigate('checkout_confirm')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Thanh toán QR</Text>
        <View style={{ width: 35 }} />
      </View>

      <View style={styles.content}>
        {isProcessing ? (
          <View style={styles.processingWrapper}>
            <ActivityIndicator size="large" color={COLORS.GREEN} />
            <Text style={styles.processingText}>Hệ thống đang kiểm tra giao dịch...</Text>
            <Text style={styles.processingSub}>Vui lòng không tắt màn hình hoặc thoát ứng dụng</Text>
          </View>
        ) : (
          <View style={styles.qrCard}>
            <Text style={styles.qrMethodTitle}>Mã QR thanh toán giả lập</Text>
            <Text style={styles.qrMethodName}>{getMethodName(paymentMethod)}</Text>

            {/* Real QR Code Image */}
            <View style={styles.qrContainer}>
              <Image
                source={require('../../image/z8027286543607_f5dac330b54064fa54e2a405e41d795a.jpg')}
                style={styles.qrImage}
              />
            </View>

            {/* Price Row */}
            <Text style={styles.qrTotalAmount}>{money(totalPrice)}</Text>
            <Text style={styles.qrSub}>Quét mã này bằng App ngân hàng hoặc Ví để demo</Text>

            {/* Countdown timer */}
            <View style={styles.timerRow}>
              <Ionicons name="time-outline" size={14} color="#FF6B7B" />
              <Text style={styles.timerText}>Mã QR hết hạn sau: </Text>
              <Text style={styles.timerVal}>{formatTimer(secondsLeft)}</Text>
            </View>
          </View>
        )}

        {/* Demo interactive simulations buttons */}
        {!isProcessing && (
          <View style={styles.simWrapper}>
            <Text style={styles.simTitle}>Thao tác demo giả lập (Chọn kết quả)</Text>
            <View style={styles.simButtons}>
              <Pressable style={styles.simSuccessBtn} onPress={handlePaymentSuccess}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.simSuccessText}>Mô phỏng THÀNH CÔNG</Text>
              </Pressable>
              <Pressable style={styles.simFailBtn} onPress={handlePaymentFailure}>
                <Ionicons name="close-circle-outline" size={18} color={COLORS.RED} />
                <Text style={styles.simFailText}>Mô phỏng THẤT BẠI</Text>
              </Pressable>
            </View>

            <Pressable style={styles.cancelBtn} onPress={() => navigate('cart')}>
              <Text style={styles.cancelBtnText}>Hủy giao dịch & Quay lại giỏ hàng</Text>
            </Pressable>
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
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    gap: 16,
  },
  processingWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 30,
    alignItems: 'center',
    ...SHADOW,
    gap: 12,
  },
  processingText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  processingSub: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
    textAlign: 'center',
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 20,
    alignItems: 'center',
    ...SHADOW,
  },
  qrMethodTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.MUTED,
    textTransform: 'uppercase',
  },
  qrMethodName: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.GREEN,
    marginTop: 4,
  },
  qrContainer: {
    marginVertical: 18,
    width: 180,
    height: 180,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    borderRadius: 16,
    padding: 6,
    backgroundColor: '#FFFFFF',
  },
  qrImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 10,
  },
  qrBox: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#ECECEC',
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  qrCornerBlock: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderWidth: 5,
    borderColor: COLORS.TEXT,
    borderRadius: 6,
  },
  qrCenterPatterns: {
    position: 'absolute',
    top: 55,
    bottom: 55,
    left: 55,
    right: 55,
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: 8,
  },
  qrPatternBox: {
    width: 14,
    height: 14,
    backgroundColor: '#A0A0A0',
    borderRadius: 2,
  },
  qrLaser: {
    position: 'absolute',
    top: '30%',
    left: 10,
    right: 10,
    height: 2.5,
    backgroundColor: COLORS.GREEN,
    shadowColor: COLORS.GREEN,
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  qrTotalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  qrSub: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: '#FFF0F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  timerText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  timerVal: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FF4D5E',
  },
  simWrapper: {
    gap: 12,
  },
  simTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.MUTED,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  simButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  simSuccessBtn: {
    flex: 1.2,
    height: 48,
    backgroundColor: COLORS.GREEN,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...SHADOW,
  },
  simSuccessText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  simFailBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.RED,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...SHADOW,
  },
  simFailText: {
    color: COLORS.RED,
    fontWeight: '800',
    fontSize: 12,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  cancelBtnText: {
    color: COLORS.MUTED,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
