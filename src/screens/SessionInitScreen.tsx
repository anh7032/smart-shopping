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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOW } from '../components/Theme';

const BUDGET_PRESETS = [200000, 500000, 1000000, 2000000];

const MOCK_MEMBERS = [
  {
    id: 'MB-0382',
    phone: '0987654321',
    email: 'nguyenvana@smartcart.vn',
    name: 'Nguyễn Văn A',
    points: 350,
    history: ['rau-cai-organic', 'sua-tuoi-th'],
  },
  {
    id: 'MB-8921',
    phone: '0912345678',
    email: 'tranvanb@smartcart.vn',
    name: 'Trần Văn B',
    points: 820,
    history: ['nuoc-cam-ep', 'thit-bo-uc'],
  },
];

export const SessionInitScreen: React.FC = () => {
  const { startSession, navigate, userRole, setRole } = useApp();
  const [userType, setUserType] = useState<'member' | 'guest'>(userRole === 'vip' ? 'member' : 'guest');
  const [memberId, setMemberId] = useState('');
  const [memberPoints, setMemberPoints] = useState(0);
  const [memberHistory, setMemberHistory] = useState<string[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [memberLoaded, setMemberLoaded] = useState(false);
  const [isSearchingMember, setIsSearchingMember] = useState(false);

  const [customerName, setCustomerName] = useState(userRole === 'vip' ? 'Nguyễn Văn A' : 'Khách hàng');
  const [cartCode, setCartCode] = useState(`CART-${Math.floor(100 + Math.random() * 900)}`);
  const [budget, setBudget] = useState(500000);
  const [customBudgetInput, setCustomBudgetInput] = useState('');
  const [isCustomBudget, setIsCustomBudget] = useState(false);

  // Automatically load Nguyễn Văn A if they started as VIP (Hạng Tím)
  React.useEffect(() => {
    const autoLoadVip = async () => {
      if (userRole === 'vip') {
        let membersList = MOCK_MEMBERS;
        try {
          const stored = await AsyncStorage.getItem('@smart_shopping_members');
          if (stored) {
            membersList = JSON.parse(stored);
          }
        } catch (e) {
          console.error(e);
        }

        const defaultVip = membersList[0];
        setCustomerName(defaultVip.name);
        setCustomerId(defaultVip.id);
        setMemberPoints(defaultVip.points);
        setMemberHistory(defaultVip.history);
        setMemberLoaded(true);
        setMemberId(defaultVip.phone);
      }
    };
    autoLoadVip();
  }, [userRole]);

  const handleMemberLookup = async () => {
    const trimmed = memberId.trim();
    if (!trimmed) {
      Alert.alert('Nhập thông tin', 'Vui lòng nhập SĐT, Email hoặc Mã hội viên.');
      return;
    }

    setIsSearchingMember(true);

    let membersList = MOCK_MEMBERS;
    try {
      const stored = await AsyncStorage.getItem('@smart_shopping_members');
      if (stored) {
        membersList = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Lỗi tải danh sách hội viên:', e);
    }

    setTimeout(() => {
      setIsSearchingMember(false);
      const found = membersList.find(
        (m) =>
          m.id.toLowerCase() === trimmed.toLowerCase() ||
          m.phone === trimmed ||
          m.email.toLowerCase() === trimmed.toLowerCase()
      );

      if (found) {
        setCustomerName(found.name);
        setCustomerId(found.id);
        setMemberPoints(found.points);
        setMemberHistory(found.history);
        setMemberLoaded(true);
        Alert.alert(
          'Xác thái thành công 🎉',
          `Chào mừng ${found.name} quay trở lại! Điểm tích lũy hiện tại: ${found.points}.`
        );
      } else {
        Alert.alert(
          'Không tìm thấy',
          'Không tìm thấy thông tin hội viên này. Vui lòng nhập SĐT demo: 0987654321 hoặc 0912345678 để thử.'
        );
        setMemberLoaded(false);
      }
    }, 800);
  };

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

    if (userType === 'member' && !memberLoaded) {
      Alert.alert('Chưa đăng nhập hội viên', 'Vui lòng xác thực tài khoản hội viên của bạn hoặc chọn Guest Mode.');
      return;
    }

    // Đồng bộ userRole trong AppContext tương ứng với userType của phiên mới
    setRole(userType === 'member' ? 'vip' : 'customer');

    await startSession(
      customerName,
      cartCode,
      finalBudget,
      userType,
      userType === 'member' ? customerId : null,
      userType === 'member' ? memberPoints : 0,
      userType === 'member' ? memberHistory : []
    );
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
          {/* Segmented Control Guest/Member */}
          <View style={styles.segmentContainer}>
            <Pressable
              style={[styles.segmentBtn, userType === 'guest' && styles.segmentBtnActive]}
              onPress={() => {
                setUserType('guest');
                setCustomerName('Khách hàng');
                setMemberLoaded(false);
              }}
            >
              <Ionicons name="person-outline" size={16} color={userType === 'guest' ? '#FFFFFF' : COLORS.MUTED} />
              <Text style={[styles.segmentText, userType === 'guest' && styles.segmentTextActive]}>Guest Mode (Khách)</Text>
            </Pressable>
            <Pressable
              style={[styles.segmentBtn, userType === 'member' && styles.segmentBtnActive]}
              onPress={() => {
                setUserType('member');
                if (memberLoaded) {
                  setCustomerName(customerName);
                } else {
                  setCustomerName('Thành viên');
                }
              }}
            >
              <Ionicons name="ribbon-outline" size={16} color={userType === 'member' ? '#FFFFFF' : COLORS.MUTED} />
              <Text style={[styles.segmentText, userType === 'member' && styles.segmentTextActive]}>Member Mode (Hội viên)</Text>
            </Pressable>
          </View>

          {userRole === 'vip' && (
            <View style={styles.vipRibbon}>
              <Ionicons name="ribbon" size={18} color="#FFFFFF" />
              <Text style={styles.vipRibbonText}>ĐÃ KẾT NỐI: THÀNH VIÊN VIP HẠNG TÍM 👑</Text>
            </View>
          )}

          {userType === 'member' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Xác thực hội viên SmartCart</Text>
              <Text style={styles.sectionSub}>Nhập số điện thoại, email hoặc mã hội viên để tích điểm và hưởng ưu đãi.</Text>

              <View style={[styles.inputWrapper, { marginBottom: 10 }]}>
                <Ionicons name="search-outline" size={18} color={COLORS.MUTED} />
                <TextInput
                  style={styles.input}
                  placeholder="Demo: 0987654321 hoặc 0912345678"
                  placeholderTextColor="#A1AEA5"
                  value={memberId}
                  onChangeText={setMemberId}
                  keyboardType="number-pad"
                />
                <Pressable style={styles.verifyBtn} onPress={handleMemberLookup} disabled={isSearchingMember}>
                  <Text style={styles.verifyBtnText}>{isSearchingMember ? 'Đang check...' : 'Xác thực'}</Text>
                </Pressable>
              </View>

              {memberLoaded && (
                <View style={styles.memberSuccessBox}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.GREEN} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberSuccessTitle}>Hội viên: {customerName}</Text>
                    <Text style={styles.memberSuccessSub}>
                      Mã thẻ: {customerId} • Điểm: {memberPoints}đ
                    </Text>
                    {memberHistory.length > 0 && (
                      <Text style={[styles.memberSuccessSub, { color: COLORS.GREEN, fontWeight: '700' }]}>
                        ✓ Đã đồng bộ {memberHistory.length} SP trong lịch sử mua sắm
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}

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
    paddingBottom: 120,
  },
  vipRibbon: {
    backgroundColor: '#7E22CE', // Purple VIP theme color
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    ...SHADOW,
  },
  vipRibbonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
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
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#EAEAEA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.GREEN,
    ...SHADOW,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  verifyBtn: {
    backgroundColor: COLORS.GREEN,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  memberSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.LIGHT_GREEN,
    borderWidth: 1,
    borderColor: '#C3E6CB',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  memberSuccessTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.DARK_GREEN,
  },
  memberSuccessSub: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.MUTED,
    marginTop: 2,
  },
});
