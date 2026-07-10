import React from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOW } from '../components/Theme';

export const WelcomeScreen: React.FC = () => {
  const { navigate, setRole } = useApp();

  const handleStartAsGuest = () => {
    setRole('customer');
    navigate('session_init');
  };

  const handleStartAsInspector = () => {
    setRole('inspector');
    navigate('inspector_lookup');
  };

  const handleScanMemberCard = () => {
    // Simulated scanning member card
    setRole('customer');
    navigate('session_init');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Ionicons name="cart" size={48} color={COLORS.GREEN} />
        </View>
        <Text style={styles.brandTitle}>SmartCart</Text>
        <Text style={styles.brandTagline}>Trải nghiệm mua sắm thông minh thế hệ mới</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable style={[styles.button, styles.primaryButton]} onPress={handleStartAsGuest}>
          <Ionicons name="person-outline" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Tiếp tục với tư cách Khách</Text>
        </Pressable>

        <Pressable style={[styles.button, styles.secondaryButton]} onPress={handleScanMemberCard}>
          <Ionicons name="qr-code-outline" size={20} color={COLORS.GREEN} />
          <Text style={styles.secondaryButtonText}>Quét thẻ thành viên</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>HOẶC</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable style={[styles.button, styles.inspectorButton]} onPress={handleStartAsInspector}>
          <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.MUTED} />
          <Text style={styles.inspectorButtonText}>Khu vực Nhân viên kiểm soát</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>SmartCart Demo • v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.TEXT,
    marginTop: 16,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 14,
    color: COLORS.MUTED,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
    width: '100%',
    paddingBottom: 40,
  },
  button: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...SHADOW,
  },
  primaryButton: {
    backgroundColor: COLORS.GREEN,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.GREEN,
  },
  secondaryButtonText: {
    color: COLORS.GREEN,
    fontWeight: '800',
    fontSize: 15,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.BORDER,
  },
  dividerText: {
    fontSize: 11,
    color: COLORS.MUTED,
    paddingHorizontal: 10,
    fontWeight: '700',
  },
  inspectorButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  inspectorButtonText: {
    color: COLORS.MUTED,
    fontWeight: '700',
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: COLORS.MUTED,
  },
});
