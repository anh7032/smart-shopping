export type ScreenName =
  | 'welcome'
  | 'session_init'
  | 'home'
  | 'catalog'
  | 'search'
  | 'search_results'
  | 'product_detail'
  | 'shelf_map'
  | 'scan'
  | 'ai_suggestions'
  | 'cart'
  | 'checkout_confirm'
  | 'qr_payment'
  | 'payment_success'
  | 'invoice'
  | 'inspector_lookup'
  | 'inspector_check'
  | 'inspector_discrepancy'
  | 'manager_dashboard'
  | 'exit_verification'
  | 'verification_result'
  | 'session_complete'
  | 'staff_dashboard'
  | 'product_management'
  | 'product_edit'
  | 'shelf_management'
  | 'inventory_alerts'
  | 'exit_verification_queue'
  | 'promotion_management'
  | 'promotion_analytics'
  | 'manager_alert_center'
  | 'integration_status'
  | 'sync_history'
  | 'audit_log'
  | 'requirement_coverage'
  | 'demo_launcher';

export type UserRole = 'customer' | 'vip' | 'inspector' | 'manager' | 'register' | 'store_staff' | 'exit_staff';

export type Product = {
  id: string;
  barcode: string;
  name: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  category: string;
  shelf: string; // ví dụ: "Khu thực phẩm tươi - Dãy A3 - Kệ số 2 - Tầng 1"
  stock: number;
  description: string;
  image?: any;
  rating?: number; // Hỗ trợ hiển thị rating cũ
  badge?: string;  // Hỗ trợ hiển thị nhãn cũ
  isActive?: boolean; // Trạng thái hoạt động (mặc định là true nếu undefined)
  sku?: string; // Mã SKU của sản phẩm
};

export type CartItem = Product & {
  quantity: number;
};

export type SessionState = {
  cartCode: string; // ví dụ: CART-038
  isConnected: boolean;
  budget: number;
  initialBudget: number;
  startedAt?: string;
  customerName?: string;
  userType: 'member' | 'guest';
  customerId: string | null;
  shoppingHistory: string[]; // danh sách sản phẩm đã mua
  loyaltyPoints: number; // điểm tích lũy
};

export type ReceiptStatus = 'paid' | 'checked' | 'discrepancy' | 'resolved' | 'cancelled';

export type Receipt = {
  id: string; // Mã hóa đơn, ví dụ: HD-123456
  createdAt: string;
  customerName: string;
  cartCode: string;
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  savings: number;
  paymentMethod: 'qr_bank' | 'e_wallet' | 'member_card';
  status: ReceiptStatus;
  vipDiscount?: number; // Số tiền giảm giá dành cho hội viên VIP
  additionalPaymentNeeded?: number; // Số tiền cần thanh toán bổ sung khi chênh lệch
  additionalPaymentPaid?: boolean;
  checkedBy?: string; // Tên nhân viên kiểm soát
  discrepancyItems?: { id: string; name: string; price: number; quantity: number }[]; // Các mặt hàng chênh lệch phát hiện thêm
  resolutionNote?: string; // Ghi chú giải quyết chênh lệch từ Store Staff
};

export type AuditLog = {
  id: string;
  userRole: UserRole;
  action: string;
  target: string;
  timestamp: string;
  description: string;
};
