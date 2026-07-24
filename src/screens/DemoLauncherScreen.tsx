import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Receipt, CartItem } from '../types';
import { COLORS, SHADOW, TOP_INSET } from '../components/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DemoLauncherScreen: React.FC = () => {
  const {
    setRole,
    navigate,
    resetProducts,
    products,
    receipts,
    updateReceipt,
    logAuditAction,
    resetPromotionsAndAlerts,
    resetSyncState,
  } = useApp();

  const handleLaunchScenario1 = async () => {
    // SCENARIO 1: CUSTOMER COMPLETE FLOW
    setRole('customer');
    navigate('welcome');
    Alert.alert(
      'Kịch bản 1 Khởi chạy 🚀',
      'Đã thiết lập vai trò KHÁCH HÀNG. Bạn sẽ được chuyển sang giao diện Khởi chạy của khách để tạo phiên mua sắm mới.'
    );
  };

  const handleLaunchScenario2 = async () => {
    // SCENARIO 2: EXIT MISMATCH (Tự động nạp hóa đơn lỗi để nhân viên xử lý lệch)
    setRole('store_staff');

    // Create a dummy mismatched receipt if one doesn't exist
    const mismatchReceiptId = 'HD-DEMO-MISMATCH';
    const existingMismatch = receipts.find((r) => r.id === mismatchReceiptId);

    if (!existingMismatch) {
      // Find TH True milk
      const milk = products.find((p) => p.id === 'sua-tuoi-th') || products[0];
      
      const cartItem: CartItem = {
        ...milk,
        quantity: 2,
      };

      const mockMismatchReceipt: Receipt = {
        id: mismatchReceiptId,
        createdAt: new Date().toLocaleString('vi-VN'),
        customerName: 'Kịch bản lỗi (Nguyễn Văn A)',
        cartCode: 'CART-999',
        items: [cartItem],
        totalQuantity: 2,
        totalPrice: milk.price * 2,
        savings: 0,
        paymentMethod: 'qr_bank',
        status: 'discrepancy', // Marked as Mismatch!
        additionalPaymentNeeded: 18000, // Cần đóng thêm 18k cho Rau cải bỏ quên
        discrepancyItems: [
          {
            id: 'rau-cai-organic',
            name: 'Rau cải xanh organic',
            price: 18000,
            quantity: 1,
          },
        ],
      };

      // Inject into receipts
      await updateReceipt(mockMismatchReceipt);
    } else {
      // Reset its status to discrepancy if it was previously resolved, so they can demo again
      const resetReceipt = { ...existingMismatch, status: 'discrepancy' as const };
      await updateReceipt(resetReceipt);
    }

    // Write audit log
    await logAuditAction(
      'DEMO_SCENARIO_TRIGGERED',
      'SCENARIO_2',
      'Kích hoạt kịch bản giả lập Lệch giỏ hàng lối ra siêu thị (Mismatch).'
    );

    navigate('exit_verification_queue');
    Alert.alert(
      'Kịch bản 2 Khởi chạy 🚀',
      'Đã tự động nạp hóa đơn lệch giỏ hàng mã [HD-DEMO-MISMATCH] và dẫn thẳng sang giao diện So soát vé của nhân viên. Hãy nhấn vào đơn [HD-DEMO-MISMATCH] để giải quyết lệch!'
    );
  };

  const handleLaunchScenario3 = async () => {
    // SCENARIO 3: STORE STAFF OPERATIONS
    setRole('store_staff');
    navigate('staff_dashboard');
    Alert.alert(
      'Kịch bản 3 Khởi chạy 🚀',
      'Dẫn thẳng vào giao diện vận hành Nhân viên (Staff Dashboard). Sẵn sàng demo đổi kệ, sửa kho, kiểm kho.'
    );
  };

  const handleLaunchScenario4 = async () => {
    // SCENARIO 4: MANAGER PORTAL & ANALYTICS
    setRole('manager');
    navigate('manager_dashboard');
    Alert.alert(
      'Kịch bản 4 Khởi chạy 🚀',
      'Dẫn thẳng vào trung tâm quản trị Quản lý (Manager Dashboard). Sẵn sàng demo xem KPI động, biểu đồ doanh số real-time, lập khuyến mại BOGO.'
    );
  };

  const handleLaunchScenario5 = async () => {
    // SCENARIO 5: ERP/POS INTEGRATION SYNC
    setRole('manager');
    navigate('integration_status');
    Alert.alert(
      'Kịch bản 5 Khởi chạy 🚀',
      'Dẫn thẳng vào bảng kiểm soát đồng bộ POS/ERP hệ thống. Sẵn sàng bẫy lỗi ngắt kết nối mạng.'
    );
  };

  const handleResetSystemData = async () => {
    Alert.alert(
      'Xác nhận khôi phục ⚠️',
      'Bạn muốn xóa sạch toàn bộ lịch sử giao dịch và reset tất cả sản phẩm, khuyến mại, cảnh báo về trạng thái mặc định ban đầu?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Khôi phục ngay',
          style: 'destructive',
          onPress: async () => {
            // 1. Reset products
            await resetProducts();

            // 2. Clear receipts
            await AsyncStorage.removeItem('@smart_shopping_receipts');
            await AsyncStorage.removeItem('@smart_shopping_current_receipt');

            // 3. Clear promotions & Alerts
            await resetPromotionsAndAlerts();

            // 4. Clear POS/ERP
            await resetSyncState();

            // 5. Clear Audit Logs
            await AsyncStorage.removeItem('@smart_shopping_audit_logs');

            Alert.alert(
              'Reset thành công 🎉',
              'Đã xóa sạch bộ nhớ giả lập. Hệ thống sẽ tự động khởi chạy lại về trang Welcome ngay bây giờ!',
              [
                {
                  text: 'Đồng ý',
                  onPress: () => {
                    setRole('customer');
                    navigate('welcome');
                    // Force complete reload simulation by setting screen
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('welcome')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Demo Scenario Launcher</Text>
        <View style={{ width: 35 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeaderTitle}>Kịch bản trình diễn sẵn có</Text>

        {/* Scenario 1 */}
        <Pressable style={styles.scenarioCard} onPress={handleLaunchScenario1}>
          <View style={[styles.iconWrap, { backgroundColor: '#E2F3FF' }]}>
            <Ionicons name="people-outline" size={20} color="#0066FF" />
          </View>
          <View style={styles.scenarioText}>
            <Text style={styles.scenarioTitle}>SCENARIO 1: CUSTOMER FULL FLOW</Text>
            <Text style={styles.scenarioSubText}>
              Trình diễn luồng mua sắm khép kín từ Khách hàng: tạo giỏ, quét vạch, xem chỉ đường, áp BOGO sữa TH, C2, thanh toán QR, nhận hóa đơn và QR soát vé.
            </Text>
          </View>
          <Ionicons name="play-forward" size={16} color={COLORS.MUTED} />
        </Pressable>

        {/* Scenario 2 */}
        <Pressable style={[styles.scenarioCard, { borderColor: '#FFA8A8' }]} onPress={handleLaunchScenario2}>
          <View style={[styles.iconWrap, { backgroundColor: '#FFF0F2' }]}>
            <Ionicons name="alert-circle-outline" size={20} color={COLORS.RED} />
          </View>
          <View style={styles.scenarioText}>
            <Text style={[styles.scenarioTitle, { color: COLORS.RED }]}>SCENARIO 2: EXIT MISMATCH</Text>
            <Text style={styles.scenarioSubText}>
              Tự động nạp hóa đơn lỗi [HD-DEMO-MISMATCH] và nhảy thẳng vào Soát vé nhân viên để trình diễn bẫy lệch giỏ cân nặng, đóng tiền chênh lệch.
            </Text>
          </View>
          <Ionicons name="play-forward" size={16} color={COLORS.RED} />
        </Pressable>

        {/* Scenario 3 */}
        <Pressable style={styles.scenarioCard} onPress={handleLaunchScenario3}>
          <View style={[styles.iconWrap, { backgroundColor: '#FFF9DB' }]}>
            <Ionicons name="briefcase-outline" size={20} color="#E8590C" />
          </View>
          <View style={styles.scenarioText}>
            <Text style={styles.scenarioTitle}>SCENARIO 3: STAFF OPERATIONS</Text>
            <Text style={styles.scenarioSubText}>
              Dẫn thẳng vào Staff Dashboard trình diễn: Sửa giá, chỉnh kho, gỡ sản phẩm, đổi kệ hàng trên bản đồ, bổ sung hàng nhanh (Refill).
            </Text>
          </View>
          <Ionicons name="play-forward" size={16} color={COLORS.MUTED} />
        </Pressable>

        {/* Scenario 4 */}
        <Pressable style={styles.scenarioCard} onPress={handleLaunchScenario4}>
          <View style={[styles.iconWrap, { backgroundColor: '#FCE5ED' }]}>
            <Ionicons name="key-outline" size={20} color="#E81B60" />
          </View>
          <View style={styles.scenarioText}>
            <Text style={styles.scenarioTitle}>SCENARIO 4: MANAGER ANALYTICS & BOGO</Text>
            <Text style={styles.scenarioSubText}>
              Dẫn thẳng vào Manager Dashboard trình diễn: Xem KPI động mốc thời gian, cơ cấu biểu đồ doanh số real-time, lập khuyến mại BOGO C2, tra Audit Logs.
            </Text>
          </View>
          <Ionicons name="play-forward" size={16} color={COLORS.MUTED} />
        </Pressable>

        {/* Scenario 5 */}
        <Pressable style={styles.scenarioCard} onPress={handleLaunchScenario5}>
          <View style={[styles.iconWrap, { backgroundColor: '#FAFCFA' }]}>
            <Ionicons name="sync-outline" size={20} color={COLORS.GREEN} />
          </View>
          <View style={styles.scenarioText}>
            <Text style={styles.scenarioTitle}>SCENARIO 5: ERP/POS CONNECTION FAIL</Text>
            <Text style={styles.scenarioSubText}>
              Dẫn thẳng vào bảng kiểm soát đồng bộ POS/ERP để trình diễn bẫy lỗi mất kết nối máy POS, lỗi ERP đẩy alert đỏ khẩn cấp lên Quản lý.
            </Text>
          </View>
          <Ionicons name="play-forward" size={16} color={COLORS.MUTED} />
        </Pressable>

        <View style={styles.divider} />

        {/* MASTER SYSTEM RESET */}
        <Text style={[styles.sectionHeaderTitle, { color: COLORS.RED }]}>Khôi phục dữ liệu ban đầu</Text>
        <Pressable style={styles.resetBtn} onPress={handleResetSystemData}>
          <Ionicons name="refresh-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.resetBtnText}>Lệnh: RESET TOÀN BỘ HỆ THỐNG GIẢ LẬP</Text>
        </Pressable>
        <Text style={styles.warningText}>* Thao tác này sẽ dọn sạch AsyncStorage, khôi phục kho hàng gốc và nhật ký rác để bạn chuẩn bị cho ca thuyết trình mới từ đầu sạch sẽ.</Text>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 100,
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 16,
    marginBottom: 14,
    ...SHADOW,
  },
  introTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  introSub: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 6,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.MUTED,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 6,
  },
  scenarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    padding: 14,
    marginBottom: 12,
    ...SHADOW,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scenarioText: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 10,
  },
  scenarioTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  scenarioSubText: {
    fontSize: 9.5,
    color: COLORS.MUTED,
    fontWeight: '600',
    lineHeight: 14,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: 14,
  },
  resetBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.RED,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOW,
    marginTop: 4,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  warningText: {
    fontSize: 9.5,
    color: COLORS.MUTED,
    fontWeight: '600',
    lineHeight: 14,
    marginTop: 10,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
});
