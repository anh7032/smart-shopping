import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOW, TOP_INSET } from '../components/Theme';

interface ReqRow {
  id: string;
  name: string;
  type: 'US' | 'F';
  status: 'Completed' | 'Partial';
  screen: string;
  scenario: string;
}

export const RequirementCoverageScreen: React.FC = () => {
  const { navigate } = useApp();
  const [filterType, setFilterType] = useState<'ALL' | 'US' | 'F'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const requirements: ReqRow[] = [
    // User Stories
    { id: 'US01', type: 'US', name: 'Khởi tạo phiên mua sắm với giỏ hàng rỗng', status: 'Completed', screen: 'WelcomeScreen / SessionInitScreen', scenario: 'Chọn Guest/Member nhập thông tin' },
    { id: 'US02', type: 'US', name: 'Xác thực tư cách hội viên tích điểm', status: 'Completed', screen: 'SessionInitScreen', scenario: 'Nhập SĐT hội viên nạp thông tin điểm' },
    { id: 'US03', type: 'US', name: 'Tìm kiếm sản phẩm trong siêu thị', status: 'Completed', screen: 'SearchScreen', scenario: 'Tìm kiếm tên, SKU, barcode sản phẩm' },
    { id: 'US04', type: 'US', name: 'Xem thông tin chi tiết sản phẩm', status: 'Completed', screen: 'ProductDetailScreen', scenario: 'Nhấn vào sản phẩm xem vị trí, mô tả, giá' },
    { id: 'US05', type: 'US', name: 'Định vị sản phẩm trên sơ đồ kệ hàng', status: 'Completed', screen: 'ShelfMapScreen', scenario: 'Chỉ dẫn lối đi, dãy A/B, kệ số, tủ freezes' },
    { id: 'US06', type: 'US', name: 'Quét mô phỏng mã vạch sản phẩm', status: 'Completed', screen: 'ScanScreen', scenario: 'Quét mã hoặc nhập mã vạch để nạp hàng' },
    { id: 'US07', type: 'US', name: 'Thêm sản phẩm trực tiếp vào giỏ hàng', status: 'Completed', screen: 'ScanScreen / ProductDetail', scenario: 'Chọn số lượng nạp thẳng sản phẩm vào giỏ' },
    { id: 'US08', type: 'US', name: 'Gợi ý sản phẩm thông minh AI', status: 'Completed', screen: 'AISuggestionScreen / CartScreen', scenario: 'AI gợi ý combo bữa sáng, mua kèm thịt bò' },
    { id: 'US09', type: 'US', name: 'Áp dụng chương trình khuyến mãi tự động', status: 'Completed', screen: 'CartScreen / ProductCard', scenario: 'Sản phẩm giảm giá tự động cập nhật giỏ hàng' },
    { id: 'US10', type: 'US', name: 'Áp dụng khuyến mãi BOGO (Mua 1 Tặng 1)', status: 'Completed', screen: 'CartScreen / PromoManager', scenario: 'C2, Rau cải tự động tặng 1 chai khi giỏ có 2' },
    { id: 'US11', type: 'US', name: 'Quản lý ngân sách mua sắm cảnh báo', status: 'Completed', screen: 'CartScreen / HomeScreen', scenario: 'Hệ thống báo khi giỏ hàng vượt 90%, 100% budget' },
    { id: 'US12', type: 'US', name: 'Xác nhận giỏ hàng và tiến hành thanh toán', status: 'Completed', screen: 'CheckoutScreen', scenario: 'Xem tóm tắt hóa đơn, tiết kiệm, chiết khấu VIP' },
    { id: 'US13', type: 'US', name: 'Thanh toán giả lập bằng QR ngân hàng', status: 'Completed', screen: 'QRPaymentScreen', scenario: 'Quét mã QR giả lập thanh toán hóa đơn siêu thị' },
    { id: 'US14', type: 'US', name: 'Nhận hóa đơn điện tử E-Invoice', status: 'Completed', screen: 'InvoiceScreen', scenario: 'Hiển thị hóa đơn chi tiết, mã hóa đơn HD-xxxx' },
    { id: 'US15', type: 'US', name: 'Tạo mã QR đối chiếu lối ra siêu thị', status: 'Completed', screen: 'ExitVerificationScreen', scenario: 'QR code chứa mã hóa đơn đối chiếu trọng lượng' },
    { id: 'US16', type: 'US', name: 'Kiểm soát viên quét mã QR đối chiếu lối ra', status: 'Completed', screen: 'VerificationResultScreen', scenario: 'Quét mã QR hóa đơn, mô phỏng cân giỏ hàng' },
    { id: 'US17', type: 'US', name: 'Xử lý lỗi chênh lệch giỏ hàng soát vé', status: 'Completed', screen: 'ExitVerificationQueueScreen', scenario: 'Gọi nhân viên hỗ trợ, nhân viên resolved lệch' },
    { id: 'US18', type: 'US', name: 'Xem báo cáo KPI doanh thu Quản lý', status: 'Completed', screen: 'ManagerDashboardScreen', scenario: 'Dashboard thống kê doanh số, số đơn, sessions' },
    { id: 'US19', type: 'US', name: 'Tích hợp đồng bộ ERP/POS hệ thống', status: 'Completed', screen: 'IntegrationStatusScreen', scenario: 'Bấm Sync Now giả lập đồng bộ thành công/lỗi' },

    // Functional Requirements
    { id: 'F01', type: 'F', name: 'Cơ chế tính giỏ hàng real-time', status: 'Completed', screen: 'CartScreen / AppContext', scenario: 'Tự động tính tổng tiền, tiết kiệm, VAT giả lập' },
    { id: 'F02', type: 'F', name: 'Định danh và quản lý SKU, Barcode sản phẩm', status: 'Completed', screen: 'ProductManagementScreen', scenario: 'Mã SKU-VEG-001 phân định kho hàng, barcode 893...' },
    { id: 'F03', type: 'F', name: 'Hỗ trợ đặc quyền VIP Hạng Tím giảm 5%', status: 'Completed', screen: 'CheckoutScreen / AppContext', scenario: 'Tài khoản VIP được tự động chiết khấu 5% đơn' },
    { id: 'F04', type: 'F', name: 'Tìm kiếm không dấu/có dấu tiếng Việt', status: 'Completed', screen: 'SearchScreen', scenario: 'Tìm kiếm "thit bo" ra "Thịt bò Úc"' },
    { id: 'F05', type: 'F', name: 'Bản đồ trong nhà định hướng kệ hàng', status: 'Completed', screen: 'ShelfMapScreen', scenario: 'Vẽ sơ đồ siêu thị co giãn đẹp đẽ chỉ dẫn lối đi' },
    { id: 'F06', type: 'F', name: 'Mô phỏng quét mã vạch sản phẩm', status: 'Completed', screen: 'ScanScreen', scenario: 'Nhập barcode hoặc click quét giả lập nhanh' },
    { id: 'F07', type: 'F', name: 'Khóa sản phẩm khỏi hệ thống siêu thị', status: 'Completed', screen: 'ProductManagementScreen', scenario: 'Disable sản phẩm ẩn khỏi tầm mắt Khách' },
    { id: 'F08', type: 'F', name: 'Hệ thống gợi ý AI kết hợp món ăn', status: 'Completed', screen: 'AISuggestionScreen / Cart', scenario: 'Robot chat gợi ý thực đơn, mua kèm bia/sữa' },
    { id: 'F09', type: 'F', name: 'Quản lý ngân sách dự chi người dùng', status: 'Completed', screen: 'WelcomeScreen / CartScreen', scenario: 'Nhập budget lúc tạo phiên, báo đỏ nếu vượt' },
    { id: 'F10', type: 'F', name: 'Thiết lập kịch bản thanh toán thành công/lỗi', status: 'Completed', screen: 'QRPaymentScreen', scenario: 'Bấm đổi kịch bản QR thành công hoặc hết hạn' },
    { id: 'F11', type: 'F', name: 'Mô phỏng cân nặng đối chiếu giỏ hàng', status: 'Completed', screen: 'VerificationResultScreen', scenario: 'Trọng lượng giỏ khớp hóa đơn -> Cho phép ra' },
    { id: 'F12', type: 'F', name: 'Trạm kiểm soát phát hiện lệch giỏ hàng', status: 'Completed', screen: 'VerificationResultScreen', scenario: 'Cân chênh lệch -> Chặn lối ra, báo đỏ Mismatch' },
    { id: 'F13', type: 'F', name: 'Quản lý danh sách chương trình khuyến mãi', status: 'Completed', screen: 'PromotionManagementScreen', scenario: 'Manager bật/tắt khuyến mại BOGO, % giảm giá' },
    { id: 'F14', type: 'F', name: 'Thống kê hiệu quả sử dụng khuyến mãi', status: 'Completed', screen: 'PromotionManagementScreen', scenario: 'Tab phân tích xếp hạng doanh số theo khuyến mại' },
    { id: 'F15', type: 'F', name: 'Nhật ký kiểm toán hệ thống (Audit Logs)', status: 'Completed', screen: 'AuditLogScreen', scenario: 'Lưu toàn bộ thao tác sửa kho, đổi giá của staff' },
    { id: 'F16', type: 'F', name: 'Bảng theo dõi và xử lý lệch giỏ soát vé', status: 'Completed', screen: 'ExitVerificationQueueScreen', scenario: 'Staff mở phiên lệch để bấm bù tiền, loại bỏ hàng' },
    { id: 'F17', type: 'F', name: 'Bộ bẫy cảnh báo sự cố khẩn cấp (Alerts)', status: 'Completed', screen: 'ManagerAlertCenterScreen', scenario: 'Mất kết nối POS, cạn kho, lệch giỏ lập tức báo manager' },
    { id: 'F18', type: 'F', name: 'Đồng bộ POS/ERP giả lập kịch bản lỗi', status: 'Completed', screen: 'IntegrationStatusScreen', scenario: 'Giả lập Sync lỗi ERP, ngắt kết nối đẩy alert đỏ' },
    { id: 'F19', type: 'F', name: 'Bản đồ phân bổ xe đẩy siêu thị rác', status: 'Completed', screen: 'ManagerDashboardScreen', scenario: 'Định vị xe đẩy bị bỏ quên, bấm dọn dẹp xe rác' },
  ];

  // Filter and search requirements
  const filteredReqs = useMemo(() => {
    return requirements.filter((r) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        r.id.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.screen.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // 2. Type Filter
      if (filterType === 'ALL') return true;
      return r.type === filterType;
    });
  }, [filterType, searchQuery]);

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('manager_dashboard')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Requirements Coverage</Text>
        <View style={{ width: 35 }} />
      </View>

      {/* Intro info */}
      <View style={styles.introCard}>
        <Text style={styles.introTitle}>Bảng ma trận đối chiếu yêu cầu (Traceability Matrix)</Text>
        <Text style={styles.introSub}>
          Đối chiếu toàn bộ các yêu cầu chức năng (F01-F19) và Kịch bản người dùng (US01-US19) theo tài liệu thiết kế SRS ứng dụng Smart Shopping Assistant.
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={COLORS.MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo ID, tên yêu cầu, màn hình..."
            placeholderTextColor="#A1AEA5"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tabs Filter */}
      <View style={styles.tabSection}>
        <Pressable style={[styles.tabBtn, filterType === 'ALL' && styles.tabBtnActive]} onPress={() => setFilterType('ALL')}>
          <Text style={[styles.tabText, filterType === 'ALL' && styles.tabTextActive]}>Tất cả ({requirements.length})</Text>
        </Pressable>
        <Pressable style={[styles.tabBtn, filterType === 'US' && styles.tabBtnActive]} onPress={() => setFilterType('US')}>
          <Text style={[styles.tabText, filterType === 'US' && styles.tabTextActive]}>User Stories ({requirements.filter(r=>r.type==='US').length})</Text>
        </Pressable>
        <Pressable style={[styles.tabBtn, filterType === 'F' && styles.tabBtnActive]} onPress={() => setFilterType('F')}>
          <Text style={[styles.tabText, filterType === 'F' && styles.tabTextActive]}>Tính năng F ({requirements.filter(r=>r.type==='F').length})</Text>
        </Pressable>
      </View>

      {/* Matrix List Scroll */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filteredReqs.map((r: ReqRow) => (
          <View key={r.id} style={styles.reqCard}>
            <View style={styles.reqHeader}>
              <View style={styles.idBox}>
                <Text style={styles.idText}>{r.id}</Text>
              </View>
              <Text style={styles.reqName} numberOfLines={1}>{r.name}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{r.status}</Text>
              </View>
            </View>

            <View style={styles.reqBody}>
              <View style={styles.metaRow}>
                <Ionicons name="desktop-outline" size={12} color={COLORS.MUTED} />
                <Text style={styles.metaLabel}>Màn hình:</Text>
                <Text style={styles.metaVal}>{r.screen}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="play-circle-outline" size={12} color={COLORS.MUTED} />
                <Text style={styles.metaLabel}>Kịch bản demo:</Text>
                <Text style={styles.metaVal}>{r.scenario}</Text>
              </View>
            </View>
          </View>
        ))}
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
    marginHorizontal: 16,
    marginTop: 12,
    ...SHADOW,
  },
  introTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  introSub: {
    fontSize: 10.5,
    color: COLORS.MUTED,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 4,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    gap: 8,
    ...SHADOW,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.TEXT,
    fontWeight: '600',
  },
  tabSection: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    borderColor: COLORS.GREEN,
    backgroundColor: COLORS.LIGHT_GREEN,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.MUTED,
  },
  tabTextActive: {
    color: COLORS.DARK_GREEN,
  },

  /* Req Card styling */
  reqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: COLORS.BORDER,
    padding: 12,
    marginBottom: 10,
    ...SHADOW,
  },
  reqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
    paddingBottom: 8,
    marginBottom: 8,
    gap: 8,
  },
  idBox: {
    width: 38,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#E2F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  idText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0066FF',
  },
  reqName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  statusBadge: {
    backgroundColor: COLORS.LIGHT_GREEN,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  reqBody: {
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: 9.5,
    color: COLORS.MUTED,
    fontWeight: '700',
    width: 80,
  },
  metaVal: {
    fontSize: 9.5,
    color: COLORS.TEXT,
    fontWeight: '800',
    flex: 1,
  },
});
