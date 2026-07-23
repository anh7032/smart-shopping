import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

export const ExitVerificationScreen: React.FC = () => {
  const { currentReceipt, navigate, setRole, cart } = useApp();
  const [laserPosition, setLaserPosition] = useState(0);

  // Laser line mock animation back and forth
  useEffect(() => {
    const interval = setInterval(() => {
      setLaserPosition((prev) => (prev === 0 ? 140 : 0));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const receipt = currentReceipt;

  if (!receipt) {
    return (
      <View style={styles.errorScreen}>
        <Ionicons name="warning-outline" size={48} color={COLORS.RED} />
        <Text style={styles.errorText}>Không tìm thấy hóa đơn cần xác thực lối ra.</Text>
        <Pressable style={styles.backButtonLarge} onPress={() => navigate('home')}>
          <Text style={styles.backButtonLargeText}>Quay về trang chủ</Text>
        </Pressable>
      </View>
    );
  }

  // Navigate to VerificationResultScreen, passing scenario param
  const handleSimulateScan = (scenario: 'match' | 'mismatch') => {
    // Switch role to inspector for exit control simulation
    setRole('inspector');
    navigate('verification_result', { receipt, category: scenario } as any);
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('invoice', { receipt })}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Xác thực Lối ra</Text>
        <Pressable style={styles.homeButton} onPress={() => navigate('home')}>
          <Ionicons name="home-outline" size={20} color={COLORS.TEXT} />
        </Pressable>
      </View>

      <View style={styles.container}>
        {/* Verification Status */}
        <View style={styles.statusCard}>
          <View style={styles.pulseContainer}>
            <View style={styles.pulseDot} />
            <Text style={styles.pulseText}>ĐANG CHỜ ĐỐI CHIẾU...</Text>
          </View>
          <Text style={styles.statusSub}>
            Vui lòng xuất trình mã QR dưới đây cho Nhân viên Exit Control để quét đối chiếu hàng hóa.
          </Text>
        </View>

        {/* QR Code Card with Laser Animation */}
        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>MÃ XÁC THỰC LỐI RA (EXIT QR)</Text>
          <Text style={styles.qrCodeText}>{receipt.id}</Text>

          <View style={styles.qrWrapper}>
            <Image
              source={require('../../image/z8027286543607_f5dac330b54064fa54e2a405e41d795a.jpg')}
              style={styles.qrImage}
            />
            {/* Animated Laser line */}
            <View style={[styles.laserLine, { top: laserPosition }]} />
          </View>

          <View style={styles.receiptMeta}>
            <Text style={styles.metaLabel}>Mã xe đẩy: <Text style={styles.metaValue}>{receipt.cartCode}</Text></Text>
            <Text style={styles.metaLabel}>Khách hàng: <Text style={styles.metaValue}>{receipt.customerName}</Text></Text>
            <Text style={styles.metaLabel}>Tổng tiền: <Text style={[styles.metaValue, { color: COLORS.DARK_GREEN }]}>{money(receipt.totalPrice)}</Text></Text>
          </View>
        </View>

        {/* Simulator buttons */}
        <View style={styles.simulatorSection}>
          <Text style={styles.simulatorTitle}>MÔ PHỎNG QUÉT ĐỐI CHIẾU (CHỌN KỊCH BẢN DEMO)</Text>
          <View style={styles.simButtons}>
            <Pressable
              style={[styles.simBtn, styles.matchBtn]}
              onPress={() => handleSimulateScan('match')}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
              <Text style={styles.simBtnText}>1. Khớp Hóa Đơn (MATCH)</Text>
            </Pressable>

            <Pressable
              style={[styles.simBtn, styles.mismatchBtn]}
              onPress={() => handleSimulateScan('mismatch')}
            >
              <Ionicons name="close-circle-outline" size={16} color="#FFFFFF" />
              <Text style={styles.simBtnText}>2. Lệch Hàng Hóa (MISMATCH)</Text>
            </Pressable>
          </View>
        </View>
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
  backButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF2EE',
  },
  homeButton: {
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
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
    justifyContent: 'center',
  },
  statusCard: {
    backgroundColor: '#EBF8FF',
    borderWidth: 1,
    borderColor: '#BEE3F8',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    ...SHADOW,
  },
  pulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3182CE',
  },
  pulseText: {
    color: '#2B6CB0',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusSub: {
    color: '#4A5568',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
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
  qrTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.MUTED,
  },
  qrCodeText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.GREEN,
    marginTop: 4,
  },
  qrWrapper: {
    marginVertical: 18,
    width: 150,
    height: 150,
    position: 'relative',
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    padding: 4,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  qrImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 8,
  },
  laserLine: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 3,
    backgroundColor: COLORS.GREEN,
    shadowColor: COLORS.GREEN,
    shadowOpacity: 0.8,
    shadowRadius: 5,
    zIndex: 10,
  },
  receiptMeta: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: 12,
    gap: 6,
  },
  metaLabel: {
    fontSize: 12,
    color: COLORS.MUTED,
    fontWeight: '600',
  },
  metaValue: {
    color: COLORS.TEXT,
    fontWeight: '800',
  },
  simulatorSection: {
    gap: 10,
  },
  simulatorTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.MUTED,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  simButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  simBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...SHADOW,
  },
  matchBtn: {
    backgroundColor: COLORS.GREEN,
  },
  mismatchBtn: {
    backgroundColor: COLORS.RED,
  },
  simBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
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
