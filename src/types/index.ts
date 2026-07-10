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
  | 'session_complete';

export type UserRole = 'customer' | 'inspector';

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
};

export type ReceiptStatus = 'paid' | 'checked' | 'discrepancy';

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
  additionalPaymentNeeded?: number; // Số tiền cần thanh toán bổ sung khi chênh lệch
  additionalPaymentPaid?: boolean;
  checkedBy?: string; // Tên nhân viên kiểm soát
  discrepancyItems?: { id: string; name: string; price: number; quantity: number }[]; // Các mặt hàng chênh lệch phát hiện thêm
};
