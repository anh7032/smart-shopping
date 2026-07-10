import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOW } from '../components/Theme';

const BUDGET_PRESETS = [200000, 500000, 1000000, 2000000];

export const SessionInitScreen: React.FC = () => {
  const { startSession, navigate } = useApp();
  const [customerName, setCustomerName] = useState('Khách hàng');
  const [cartCode, setCartCode] = useState(`CART-${Math.floor(100 + Math.random() * 900)}`);
  const [budget, setBudget] = useState(500000);
  const [customBudgetInput, setCustomBudgetInput] = useState('');
  const [isCustomBudget, setIsCustomBudget] = useState(false);

  const handleStartSession = async () => {
    let finalBudget = budget;
    if (isCustomBudget) {
      const parsed = parseInt(customBudgetInput.replace(/[^0-9]/g, ''), 10);
      if (isNaN(parsed) || parsed <= 0) {
        Alert.alert('Ngân sách không hợp lệ', 'Vui lòng nhập số tiền ngân sách lớn hơn 0đ.');
        return;
      }
      finalBudget = parsed;
    }

    await startSession(customerName, cartCode, finalBudget);
  };

  const selectPreset = (val: number) => {
    setBudget(val);
    setIsCustomBudget(false);
  };

  const enableCustomBudget = () => {
    setIsCustomBudget(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigate('welcome')}>
            <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Khởi tạo mua sắm</Text>
          <View style={{ width: 35 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân & Xe đẩy</Text>

            {/* Customer Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên của bạn (Tùy chọn)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={COLORS.MUTED} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tên của bạn..."
                  placeholderTextColor="#A1AEA5"
                  value={customerName}
                  onChangeText={setCustomerName}
                />
              </View>
            </View>

            {/* Cart Code */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mã xe đẩy (Quét tự động hoặc nhập tay)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="barcode-outline" size={18} color={COLORS.MUTED} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mã xe đẩy..."
                  placeholderTextColor="#A1AEA5"
                  value={cartCode}
                  onChangeText={setCartCode}
                />
                <Pressable
                  style={styles.randomBtn}
                  onPress={() => setCartCode(`CART-${Math.floor(100 + Math.random() * 900)}`)}
                >
                  <Ionicons name="refresh" size={16} color={COLORS.GREEN} />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ngân sách mua sắm dự kiến</Text>
            <Text style={styles.sectionSub}>Ứng dụng sẽ theo dõi và cảnh báo nếu bạn vượt ngân sách này.</Text>

            {/* Presets */}
            <View style={styles.presetsGrid}>
              {BUDGET_PRESETS.map((val) => {
                const isSelected = !isCustomBudget && budget === val;
                return (
                  <Pressable
                    key={val}
                    style={[styles.presetCard, isSelected && styles.presetCardActive]}
                    onPress={() => selectPreset(val)}
                  >
                    <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                      {val.toLocaleString('vi-VN')}đ
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Custom Input */}
            <Pressable
              style={[styles.customBudgetWrapper, isCustomBudget && styles.customBudgetWrapperActive]}
              onPress={enableCustomBudget}
            >
              <View style={styles.customBudgetHeader}>
                <Ionicons
                  name={isCustomBudget ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={isCustomBudget ? COLORS.GREEN : COLORS.MUTED}
                />
                <Text style={styles.customBudgetLabel}>Nhập ngân sách tùy chỉnh</Text>
              </View>
              {isCustomBudget && (
                <View style={styles.customInputWrapper}>
                  <TextInput
                    style={styles.customInput}
                    placeholder="Ví dụ: 350.000"
                    placeholderTextColor="#A1AEA5"
                    keyboardType="number-pad"
                    value={customBudgetInput}
                    onChangeText={setCustomBudgetInput}
                    autoFocus
                  />
                  <Text style={styles.customInputUnit}>đ</Text>
                </View>
              )}
            </Pressable>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.startButton} onPress={handleStartSession}>
            <Text style={styles.startButtonText}>Bắt đầu mua sắm</Text>
            <Ionicons name="play" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOW,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.MUTED,
    marginBottom: 14,
    lineHeight: 18,
  },
  inputGroup: {
    marginTop: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 6,
  },
  inputWrapper: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
    backgroundColor: '#FAFCFA',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT,
    fontWeight: '600',
    height: '100%',
  },
  randomBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.LIGHT_GREEN,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  presetCard: {
    flex: 1,
    minWidth: '45%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFCFA',
  },
  presetCardActive: {
    borderColor: COLORS.GREEN,
    backgroundColor: COLORS.LIGHT_GREEN,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  presetTextActive: {
    color: COLORS.DARK_GREEN,
  },
  customBudgetWrapper: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
  },
  customBudgetWrapperActive: {
    borderColor: COLORS.GREEN,
    backgroundColor: '#FFFFFF',
  },
  customBudgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customBudgetLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  customInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.GREEN,
    marginTop: 10,
    paddingBottom: 4,
  },
  customInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.TEXT,
    padding: 0,
  },
  customInputUnit: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.GREEN,
    marginLeft: 6,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  startButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOW,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
