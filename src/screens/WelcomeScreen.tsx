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

  const handleStartAsStaff = () => {
    setRole('store_staff');
    navigate('staff_dashboard');
  };

  const handleStartAsVip = () => {
    setRole('vip');
    navigate('session_init');
  };

  const handleStartAsRegister = () => {
    setRole('register');
    navigate('session_init');
  };

  const handleStartAsManager = () => {
    setRole('manager');
    navigate('manager_dashboard');
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

        <Pressable style={[styles.button, styles.vipButton]} onPress={handleStartAsVip}>
          <Ionicons name="ribbon-outline" size={20} color="#7E22CE" />
          <Text style={styles.vipButtonText}>Thành viên VIP (Hạng Tím)</Text>
        </Pressable>

        <Pressable style={[styles.button, styles.registerButton]} onPress={handleStartAsRegister}>
          <Ionicons name="person-add-outline" size={20} color="#0D9488" />
          <Text style={styles.registerButtonText}>Đăng ký hội viên mới</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>HỆ THỐNG PHÍA SAU</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.systemRow}>
          <Pressable style={[styles.button, styles.systemButton]} onPress={handleStartAsStaff}>
            <Ionicons name="briefcase-outline" size={14} color="#FF922B" />
            <Text style={[styles.systemButtonText, { color: '#FF922B' }]}>Nhân viên</Text>
          </Pressable>

          <Pressable style={[styles.button, styles.systemButton]} onPress={handleStartAsInspector}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#0066FF" />
            <Text style={[styles.systemButtonText, { color: '#0066FF' }]}>Kiểm soát</Text>
          </Pressable>

          <Pressable style={[styles.button, styles.systemButton]} onPress={handleStartAsManager}>
            <Ionicons name="bar-chart-outline" size={14} color="#0D9488" />
            <Text style={[styles.systemButtonText, { color: '#0D9488' }]}>Quản lý</Text>
          </Pressable>
        </View>
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
  vipButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#7E22CE', // Purple VIP card border
  },
  vipButtonText: {
    color: '#7E22CE', // Purple text
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
    fontSize: 10,
    color: COLORS.MUTED,
    paddingHorizontal: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  systemRow: {
    flexDirection: 'row',
    gap: 10,
  },
  systemButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    height: 48,
  },
  systemButtonText: {
    fontWeight: '800',
    fontSize: 11,
  },
  inspectorHalfButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    height: 48,
  },
  inspectorHalfButtonText: {
    color: COLORS.MUTED,
    fontWeight: '700',
    fontSize: 12,
  },
  managerHalfButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0D9488', // Teal Store Manager border
    height: 48,
  },
  managerHalfButtonText: {
    color: '#0D9488', // Teal text
    fontWeight: '700',
    fontSize: 12,
  },
  registerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0D9488', // Teal border
  },
  registerButtonText: {
    color: '#0D9488', // Teal text
    fontWeight: '800',
    fontSize: 15,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: COLORS.MUTED,
  },
});
