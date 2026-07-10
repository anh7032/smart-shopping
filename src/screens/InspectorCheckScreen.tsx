import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOW, TOP_INSET } from '../components/Theme';

export const InspectorCheckScreen: React.FC = () => {
  const { currentReceipt, updateReceipt, endSession } = useApp();

  const receipt = currentReceipt;

  // Mark receipt as checked in global list on mount
  useEffect(() => {
    if (receipt && receipt.status !== 'checked') {
      updateReceipt({
        ...receipt,
        status: 'checked',
      });
    }
  }, [receipt]);

  const handleEndSession = async () => {
    // Gọi hàm endSession để dọn dẹp toàn bộ dữ liệu giỏ hàng, ngân sách, phiên mua sắm về trạng thái ban đầu.
    await endSession();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Checkmark Shield representation */}
        <View style={styles.shieldWrapper}>
          <View style={styles.shieldPulse} />
          <View style={styles.shieldCircle}>
            <Ionicons name="shield-checkmark" size={64} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.title}>KIỂM TRA HOÀN TẤT</Text>
        <Text style={styles.subTitle}>Khách hàng hợp lệ. Cho phép rời siêu thị.</Text>

        <View style={styles.receiptBrief}>
          <Text style={styles.briefLabel}>Hóa đơn: <Text style={styles.briefValue}>{receipt?.id || 'HD-XXXXXX'}</Text></Text>
          <Text style={styles.briefLabel}>Mã xe đẩy: <Text style={styles.briefValue}>{receipt?.cartCode || 'CART-038'}</Text></Text>
          <Text style={styles.briefLabel}>Khách hàng: <Text style={styles.briefValue}>{receipt?.customerName || 'Khách hàng'}</Text></Text>
        </View>

        <Text style={styles.thankYouText}>
          Cảm ơn quý khách đã trải nghiệm giải pháp mua sắm thông minh SmartCart. Chúc quý khách một ngày vui vẻ và hẹn gặp lại!
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.finishButton} onPress={handleEndSession}>
          <Ionicons name="power" size={18} color="#FFFFFF" />
          <Text style={styles.finishButtonText}>Giải phóng xe đẩy & Hoàn tất phiên</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: 'space-between',
    padding: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  shieldWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  shieldPulse: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(47,145,67,0.12)',
  },
  shieldCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: COLORS.GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
    letterSpacing: 0.5,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginTop: 6,
    textAlign: 'center',
  },
  receiptBrief: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 18,
    width: '100%',
    gap: 4,
    ...SHADOW,
  },
  briefLabel: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  briefValue: {
    color: COLORS.TEXT,
    fontWeight: '800',
  },
  thankYouText: {
    fontSize: 12,
    color: COLORS.MUTED,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    fontWeight: '700',
  },
  footer: {
    width: '100%',
    paddingBottom: 20,
  },
  finishButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOW,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
