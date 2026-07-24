import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, CartItem, SessionState, Receipt, ScreenName, UserRole, AuditLog, Promotion, ManagerAlert, AlertSeverity, AlertStatus, IntegrationStatus, SyncHistoryEntry } from '../types';
import { mockProducts } from '../data/mockProducts';

interface AppContextProps {
  // State
  products: Product[];
  cart: CartItem[];
  session: SessionState | null;
  userRole: UserRole;
  currentScreen: ScreenName;
  receipts: Receipt[];
  currentReceipt: Receipt | null;
  selectedProduct: Product | null;
  selectedCategory: string | null;
  isLoading: boolean;
  auditLogs: AuditLog[];
  promotions: Promotion[];
  managerAlerts: ManagerAlert[];
  erpStatus: IntegrationStatus;
  posStatus: IntegrationStatus;
  lastSync: string;
  syncHistory: SyncHistoryEntry[];

  // Actions
  setRole: (role: UserRole) => void;
  navigate: (screen: ScreenName, params?: { product?: Product; category?: string; receipt?: Receipt }) => void;
  startSession: (
    customerName: string,
    cartCode: string,
    budget: number,
    userType?: 'member' | 'guest',
    customerId?: string | null,
    loyaltyPoints?: number,
    shoppingHistory?: string[]
  ) => Promise<void>;
  endSession: () => Promise<void>;
  updateBudget: (budget: number) => Promise<void>;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  changeQuantity: (productId: string, delta: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  checkout: (paymentMethod: Receipt['paymentMethod']) => Promise<Receipt>;
  updateReceipt: (updatedReceipt: Receipt) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  resetProducts: () => Promise<void>;
  logAuditAction: (action: string, target: string, description: string) => Promise<void>;
  addPromotion: (promo: Omit<Promotion, 'id' | 'usageCount' | 'revenueGenerated' | 'totalDiscountAmount'>) => Promise<void>;
  updatePromotion: (promo: Promotion) => Promise<void>;
  addManagerAlert: (type: ManagerAlert['type'], severity: AlertSeverity, message: string) => Promise<void>;
  resolveManagerAlert: (alertId: string) => Promise<void>;
  resetPromotionsAndAlerts: () => Promise<void>;
  getCartTotals: (items: CartItem[]) => { totalPrice: number; savings: number };
  triggerSync: (scenario: 'success' | 'erp_error' | 'pos_error') => Promise<void>;
  resetSyncState: () => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const STORAGE_KEYS = {
  CART: '@smart_shopping_cart',
  SESSION: '@smart_shopping_session',
  USER_ROLE: '@smart_shopping_user_role',
  CURRENT_SCREEN: '@smart_shopping_current_screen',
  RECEIPTS: '@smart_shopping_receipts',
  CURRENT_RECEIPT: '@smart_shopping_current_receipt',
  PRODUCTS: '@smart_shopping_products_state',
  AUDIT_LOGS: '@smart_shopping_audit_logs',
  PROMOTIONS: '@smart_shopping_promotions_state',
  MANAGER_ALERTS: '@smart_shopping_manager_alerts_state',
  ERP_STATUS: '@smart_shopping_erp_status',
  POS_STATUS: '@smart_shopping_pos_status',
  LAST_SYNC: '@smart_shopping_last_sync',
  SYNC_HISTORY: '@smart_shopping_sync_history',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [session, setSession] = useState<SessionState | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('welcome');
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [currentReceipt, setCurrentReceipt] = useState<Receipt | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [managerAlerts, setManagerAlerts] = useState<ManagerAlert[]>([]);
  const [erpStatus, setErpStatus] = useState<IntegrationStatus>('Connected');
  const [posStatus, setPosStatus] = useState<IntegrationStatus>('Connected');
  const [lastSync, setLastSync] = useState<string>('Chưa đồng bộ');
  const [syncHistory, setSyncHistory] = useState<SyncHistoryEntry[]>([]);

  // Load state from AsyncStorage on startup
  useEffect(() => {
    const hydrateState = async () => {
      try {
        const storedCart = await AsyncStorage.getItem(STORAGE_KEYS.CART);
        const storedSession = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
        const storedRole = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
        const storedScreen = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_SCREEN);
        const storedReceipts = await AsyncStorage.getItem(STORAGE_KEYS.RECEIPTS);
        const storedCurrentReceipt = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_RECEIPT);
        const storedProducts = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
        const storedAuditLogs = await AsyncStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
        const storedPromotions = await AsyncStorage.getItem(STORAGE_KEYS.PROMOTIONS);
        const storedAlerts = await AsyncStorage.getItem(STORAGE_KEYS.MANAGER_ALERTS);
        const storedErpStatus = await AsyncStorage.getItem(STORAGE_KEYS.ERP_STATUS);
        const storedPosStatus = await AsyncStorage.getItem(STORAGE_KEYS.POS_STATUS);
        const storedLastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
        const storedSyncHistory = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_HISTORY);

        if (storedCart) setCart(JSON.parse(storedCart));
        if (storedSession) setSession(JSON.parse(storedSession));
        if (storedRole) setUserRole(JSON.parse(storedRole) as UserRole);
        if (storedScreen) setCurrentScreen(JSON.parse(storedScreen) as ScreenName);
        if (storedReceipts) setReceipts(JSON.parse(storedReceipts));
        if (storedCurrentReceipt) setCurrentReceipt(JSON.parse(storedCurrentReceipt));
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        } else {
          setProducts(mockProducts);
          await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mockProducts));
        }
        if (storedAuditLogs) setAuditLogs(JSON.parse(storedAuditLogs));

        if (storedPromotions) {
          setPromotions(JSON.parse(storedPromotions));
        } else {
          const defaultPromotions: Promotion[] = [
            {
              id: 'PROMO-001',
              name: 'Siêu Sale Cà Chua Bi',
              type: 'percentage',
              applicableProductIds: ['ca-chua-bi'],
              discountValue: 29,
              startDate: '2026-07-01',
              endDate: '2026-08-31',
              usageCount: 4,
              status: 'active',
              revenueGenerated: 100000,
              totalDiscountAmount: 40000,
            },
            {
              id: 'PROMO-002',
              name: 'Đặc Quyền Thành Viên Sữa TH',
              type: 'member_only',
              applicableProductIds: ['sua-tuoi-th'],
              discountValue: 15,
              startDate: '2026-07-15',
              endDate: '2026-08-15',
              usageCount: 8,
              status: 'active',
              revenueGenerated: 224000,
              totalDiscountAmount: 33600,
            },
            {
              id: 'PROMO-003',
              name: 'BOGO Trà Xanh C2',
              type: 'bogo',
              applicableProductIds: ['tra-xanh-c2'],
              discountValue: 100, // Buy 1 Get 1
              startDate: '2026-08-01',
              endDate: '2026-08-07',
              usageCount: 0,
              status: 'scheduled',
              revenueGenerated: 0,
              totalDiscountAmount: 0,
            },
          ];
          setPromotions(defaultPromotions);
          await AsyncStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(defaultPromotions));
        }

        if (storedAlerts) {
          setManagerAlerts(JSON.parse(storedAlerts));
        } else {
          const defaultAlerts: ManagerAlert[] = [
            {
              id: 'ALT-101',
              type: 'low_stock',
              severity: 'warning',
              message: 'Sản phẩm "Thịt bò Úc nhập khẩu" sắp hết hàng trong kho (chỉ còn 8 sản phẩm).',
              createdAt: new Date().toLocaleString('vi-VN'),
              status: 'new',
            },
            {
              id: 'ALT-102',
              type: 'exit_mismatch',
              severity: 'critical',
              message: 'Lệch giỏ hàng soát vé tại lối ra cho Hóa đơn HD-481902 (Khách hàng Nguyễn Văn A).',
              createdAt: new Date().toLocaleString('vi-VN'),
              status: 'new',
            },
          ];
          setManagerAlerts(defaultAlerts);
          await AsyncStorage.setItem(STORAGE_KEYS.MANAGER_ALERTS, JSON.stringify(defaultAlerts));
        }

        if (storedErpStatus) setErpStatus(JSON.parse(storedErpStatus) as IntegrationStatus);
        if (storedPosStatus) setPosStatus(JSON.parse(storedPosStatus) as IntegrationStatus);
        if (storedLastSync) setLastSync(JSON.parse(storedLastSync));
        
        if (storedSyncHistory) {
          setSyncHistory(JSON.parse(storedSyncHistory));
        } else {
          const defaultHistory: SyncHistoryEntry[] = [
            {
              id: 'SYNC-101',
              system: 'ERP',
              startTime: '24/07/2026, 08:00:15',
              endTime: '24/07/2026, 08:00:16',
              recordsProcessed: 15,
              status: 'success',
            },
            {
              id: 'SYNC-102',
              system: 'POS',
              startTime: '24/07/2026, 08:15:30',
              endTime: '24/07/2026, 08:15:32',
              recordsProcessed: 8,
              status: 'success',
            },
          ];
          setSyncHistory(defaultHistory);
          await AsyncStorage.setItem(STORAGE_KEYS.SYNC_HISTORY, JSON.stringify(defaultHistory));
        }

        // Khởi tạo database hội viên ảo trong AsyncStorage nếu chưa có
        const storedMembers = await AsyncStorage.getItem('@smart_shopping_members');
        if (!storedMembers) {
          const defaultMembers = [
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
          await AsyncStorage.setItem('@smart_shopping_members', JSON.stringify(defaultMembers));
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu từ AsyncStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    hydrateState();
  }, []);

  // Helper function to save to AsyncStorage
  const saveState = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Lỗi lưu dữ liệu [${key}]:`, error);
    }
  };

  const getCartTotals = (items: CartItem[]) => {
    let totalPrice = 0;
    let savings = 0;

    items.forEach((item) => {
      // Tìm chương trình khuyến mại BOGO hoạt động cho sản phẩm này
      const activeBogo = promotions.find(
        (p) => p.status === 'active' && p.type === 'bogo' && p.applicableProductIds.includes(item.id)
      );

      if (activeBogo) {
        const freeQty = Math.floor(item.quantity / 2);
        const payableQty = item.quantity - freeQty;
        totalPrice += payableQty * item.price;
        savings += freeQty * item.price;
      } else {
        totalPrice += item.price * item.quantity;
      }

      if (item.oldPrice) {
        savings += (item.oldPrice - item.price) * item.quantity;
      }
    });

    return { totalPrice, savings };
  };

  const setRole = (role: UserRole) => {
    setUserRole(role);
    saveState(STORAGE_KEYS.USER_ROLE, role);
  };

  const navigate = (
    screen: ScreenName,
    params?: { product?: Product; category?: string; receipt?: Receipt }
  ) => {
    setCurrentScreen(screen);
    saveState(STORAGE_KEYS.CURRENT_SCREEN, screen);

    if (params) {
      if (params.product !== undefined) setSelectedProduct(params.product);
      if (params.category !== undefined) setSelectedCategory(params.category);
      if (params.receipt !== undefined) {
        setCurrentReceipt(params.receipt);
        saveState(STORAGE_KEYS.CURRENT_RECEIPT, params.receipt);
      }
    }
  };

  const startSession = async (
    customerName: string,
    cartCode: string,
    budget: number,
    userType: 'member' | 'guest' = 'guest',
    customerId: string | null = null,
    loyaltyPoints = 0,
    shoppingHistory: string[] = []
  ) => {
    const newSession: SessionState = {
      cartCode: cartCode || `CART-${Math.floor(100 + Math.random() * 900)}`,
      isConnected: true,
      budget,
      initialBudget: budget,
      startedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      customerName: customerName || (userType === 'member' ? 'Thành viên SmartCart' : 'Khách hàng'),
      userType,
      customerId,
      loyaltyPoints,
      shoppingHistory,
    };

    setSession(newSession);
    setCart([]); // Reset giỏ hàng cho phiên mới
    setCurrentReceipt(null); // Xóa hóa đơn cũ
    setCurrentScreen('home');

    await saveState(STORAGE_KEYS.SESSION, newSession);
    await saveState(STORAGE_KEYS.CART, []);
    await saveState(STORAGE_KEYS.CURRENT_RECEIPT, null);
    await saveState(STORAGE_KEYS.CURRENT_SCREEN, 'home');
  };

  const endSession = async () => {
    setSession(null);
    setCart([]);
    setCurrentReceipt(null);
    setCurrentScreen('welcome');
    setRole('customer');

    await saveState(STORAGE_KEYS.SESSION, null);
    await saveState(STORAGE_KEYS.CART, []);
    await saveState(STORAGE_KEYS.CURRENT_RECEIPT, null);
    await saveState(STORAGE_KEYS.USER_ROLE, 'customer');
    await saveState(STORAGE_KEYS.CURRENT_SCREEN, 'welcome');
  };

  const updateBudget = async (newBudget: number) => {
    if (!session) return;
    const updatedSession = { ...session, budget: newBudget, initialBudget: newBudget };
    setSession(updatedSession);
    await saveState(STORAGE_KEYS.SESSION, updatedSession);
  };

  const addToCart = async (product: Product, quantity = 1) => {
    // Lấy thông tin tồn kho thực tế mới nhất từ danh sách products
    const freshProduct = products.find((p) => p.id === product.id) || product;

    // 1. Kiểm tra tồn kho
    const existingItem = cart.find((item) => item.id === freshProduct.id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    const requestedQty = currentQty + quantity;

    if (requestedQty > freshProduct.stock) {
      Alert.alert(
        'Hết hàng hoặc vượt giới hạn',
        `Sản phẩm này chỉ còn ${freshProduct.stock} sản phẩm trong kho. Bạn đã có ${currentQty} sản phẩm trong giỏ.`
      );
      return;
    }

    // Cảnh báo tồn kho thấp (nếu stock từ 1 đến 10)
    if (freshProduct.stock > 0 && freshProduct.stock <= 10) {
      Alert.alert(
        'Cảnh báo tồn kho thấp ⚠️',
        `Sản phẩm "${freshProduct.name}" sắp hết hàng trong hệ thống siêu thị (chỉ còn ${freshProduct.stock} sản phẩm). Quý khách vui lòng cân nhắc mua số lượng vừa đủ!`
      );
    }

    // 2. Cập nhật giỏ hàng
    let newCart: CartItem[];
    if (existingItem) {
      newCart = cart.map((item) =>
        item.id === freshProduct.id ? { ...item, quantity: requestedQty } : item
      );
    } else {
      newCart = [...cart, { ...freshProduct, quantity }];
    }

    setCart(newCart);
    await saveState(STORAGE_KEYS.CART, newCart);

    // 3. Kiểm tra ngân sách cảnh báo
    const totalPrice = newCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (session && totalPrice > session.budget) {
      const overAmount = totalPrice - session.budget;
      Alert.alert(
        'Vượt ngân sách!',
        `Bạn đang vượt ngân sách dự kiến ${overAmount.toLocaleString('vi-VN')}đ. Hãy xem xét loại bỏ bớt sản phẩm.`
      );
    } else if (session && totalPrice >= session.budget * 0.9) {
      Alert.alert(
        'Cảnh báo ngân sách',
        'Tổng tiền giỏ hàng đã đạt hơn 90% ngân sách dự kiến của bạn.'
      );
    }
  };

  const changeQuantity = async (productId: string, delta: number) => {
    const item = cart.find((i) => i.id === productId);
    if (!item) return;

    // Lấy thông tin tồn kho thực tế mới nhất từ danh sách products
    const freshProduct = products.find((p) => p.id === productId) || item;

    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      // Hỏi xác nhận xóa
      Alert.alert(
        'Xóa sản phẩm',
        `Bạn có muốn xóa "${item.name}" khỏi giỏ hàng?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: async () => {
              const newCart = cart.filter((i) => i.id !== productId);
              setCart(newCart);
              await saveState(STORAGE_KEYS.CART, newCart);
            },
          },
        ]
      );
    } else {
      // Kiểm tra kho
      if (newQty > freshProduct.stock) {
        Alert.alert('Không thể tăng thêm', `Sản phẩm này chỉ còn tối đa ${freshProduct.stock} cái trong kho.`);
        return;
      }

      // Cảnh báo tồn kho thấp (nếu stock từ 1 đến 10 và đang tăng số lượng)
      if (freshProduct.stock > 0 && freshProduct.stock <= 10 && delta > 0) {
        Alert.alert(
          'Cảnh báo tồn kho thấp ⚠️',
          `Sản phẩm "${freshProduct.name}" sắp hết hàng trong hệ thống siêu thị (chỉ còn ${freshProduct.stock} sản phẩm). Quý khách vui lòng cân nhắc mua số lượng vừa đủ!`
        );
      }

      const newCart = cart.map((i) =>
        i.id === productId ? { ...i, quantity: newQty } : i
      );
      setCart(newCart);
      await saveState(STORAGE_KEYS.CART, newCart);

      // Kiểm tra ngân sách
      const totalPrice = newCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      if (session && totalPrice > session.budget && delta > 0) {
        const overAmount = totalPrice - session.budget;
        Alert.alert(
          'Vượt ngân sách!',
          `Bạn đang vượt ngân sách dự kiến ${overAmount.toLocaleString('vi-VN')}đ.`
        );
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    const newCart = cart.filter((item) => item.id !== productId);
    setCart(newCart);
    await saveState(STORAGE_KEYS.CART, newCart);
  };

  const checkout = async (paymentMethod: Receipt['paymentMethod']): Promise<Receipt> => {
    if (!session) throw new Error('Không có phiên mua sắm hoạt động.');

    const originalTotalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const savings = cart.reduce(
      (sum, item) =>
        sum + (item.oldPrice ? (item.oldPrice - item.price) * item.quantity : 0),
      0
    );

    // Tính chiết khấu 5% cho thành viên VIP Hạng Tím
    const vipDiscount = userRole === 'vip' ? Math.round(originalTotalPrice * 0.05) : 0;
    const finalTotalPrice = originalTotalPrice - vipDiscount;

    const newReceipt: Receipt = {
      id: `HD-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toLocaleString('vi-VN'),
      customerName: session.customerName || 'Khách hàng',
      cartCode: session.cartCode,
      items: [...cart],
      totalQuantity,
      totalPrice: finalTotalPrice,
      savings: savings + vipDiscount, // Ghi nhận tiền VIP giảm giá vào tiền tiết kiệm
      paymentMethod,
      status: 'paid',
      vipDiscount: vipDiscount > 0 ? vipDiscount : undefined,
    };

    // Tính điểm tích lũy mới nếu là Member
    let earnedPoints = 0;
    if (session.userType === 'member') {
      earnedPoints = Math.floor(finalTotalPrice / 1000); // 1 điểm cho mỗi 1000đ
      const updatedSession: SessionState = {
        ...session,
        loyaltyPoints: session.loyaltyPoints + earnedPoints,
        // Cập nhật lịch sử mua hàng với các sản phẩm vừa mua
        shoppingHistory: Array.from(new Set([...session.shoppingHistory, ...cart.map(item => item.id)]))
      };
      setSession(updatedSession);
      await saveState(STORAGE_KEYS.SESSION, updatedSession);

      // Cập nhật điểm và lịch sử của thành viên trong cơ sở dữ liệu hội viên ảo persisted
      try {
        const storedMembers = await AsyncStorage.getItem('@smart_shopping_members');
        if (storedMembers) {
          const membersList = JSON.parse(storedMembers);
          const memberIndex = membersList.findIndex((m: any) => m.id === session.customerId);
          if (memberIndex !== -1) {
            membersList[memberIndex].points += earnedPoints;
            membersList[memberIndex].history = Array.from(
              new Set([...membersList[memberIndex].history, ...cart.map((item) => item.id)])
            );
            await AsyncStorage.setItem('@smart_shopping_members', JSON.stringify(membersList));
          }
        }
      } catch (e) {
        console.error('Lỗi cập nhật điểm hội viên:', e);
      }
    }

    const newReceipts = [newReceipt, ...receipts];
    setReceipts(newReceipts);
    setCurrentReceipt(newReceipt);

    // Giảm tồn kho sản phẩm trong mảng products dựa trên giỏ hàng vừa mua
    const updatedProducts = products.map((p) => {
      const purchasedItem = cart.find((item) => item.id === p.id);
      if (purchasedItem) {
        const remainingStock = Math.max(0, p.stock - purchasedItem.quantity);
        return { ...p, stock: remainingStock };
      }
      return p;
    });
    setProducts(updatedProducts);

    await saveState(STORAGE_KEYS.RECEIPTS, newReceipts);
    await saveState(STORAGE_KEYS.CURRENT_RECEIPT, newReceipt);
    await saveState(STORAGE_KEYS.PRODUCTS, updatedProducts);

    return newReceipt;
  };

  const updateReceipt = async (updatedReceipt: Receipt) => {
    const updatedList = receipts.map((r) => (r.id === updatedReceipt.id ? updatedReceipt : r));
    setReceipts(updatedList);
    await saveState(STORAGE_KEYS.RECEIPTS, updatedList);

    if (currentReceipt?.id === updatedReceipt.id) {
      setCurrentReceipt(updatedReceipt);
      await saveState(STORAGE_KEYS.CURRENT_RECEIPT, updatedReceipt);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    const updatedList = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    setProducts(updatedList);
    await saveState(STORAGE_KEYS.PRODUCTS, updatedList);
  };

  const resetProducts = async () => {
    setProducts(mockProducts);
    await saveState(STORAGE_KEYS.PRODUCTS, mockProducts);
  };

  const logAuditAction = async (action: string, target: string, description: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
      userRole,
      action,
      target,
      timestamp: new Date().toLocaleString('vi-VN'),
      description,
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    await saveState(STORAGE_KEYS.AUDIT_LOGS, updatedLogs);
  };

  const addPromotion = async (promo: Omit<Promotion, 'id' | 'usageCount' | 'revenueGenerated' | 'totalDiscountAmount'>) => {
    const newPromo: Promotion = {
      ...promo,
      id: `PROMO-${Math.floor(100 + Math.random() * 900)}`,
      usageCount: 0,
      revenueGenerated: 0,
      totalDiscountAmount: 0,
    };
    const updatedList = [newPromo, ...promotions];
    setPromotions(updatedList);
    await saveState(STORAGE_KEYS.PROMOTIONS, updatedList);
  };

  const updatePromotion = async (updatedPromo: Promotion) => {
    const updatedList = promotions.map((p) => (p.id === updatedPromo.id ? updatedPromo : p));
    setPromotions(updatedList);
    await saveState(STORAGE_KEYS.PROMOTIONS, updatedList);
  };

  const addManagerAlert = async (type: ManagerAlert['type'], severity: AlertSeverity, message: string) => {
    const newAlert: ManagerAlert = {
      id: `ALT-${Math.floor(100 + Math.random() * 900)}`,
      type,
      severity,
      message,
      createdAt: new Date().toLocaleString('vi-VN'),
      status: 'new',
    };
    const updatedList = [newAlert, ...managerAlerts];
    setManagerAlerts(updatedList);
    await saveState(STORAGE_KEYS.MANAGER_ALERTS, updatedList);
  };

  const resolveManagerAlert = async (alertId: string) => {
    const updatedList = managerAlerts.map((a) => (a.id === alertId ? { ...a, status: 'resolved' as AlertStatus } : a));
    setManagerAlerts(updatedList);
    await saveState(STORAGE_KEYS.MANAGER_ALERTS, updatedList);
  };

  const resetPromotionsAndAlerts = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.PROMOTIONS);
    await AsyncStorage.removeItem(STORAGE_KEYS.MANAGER_ALERTS);
  };

  const triggerSync = async (scenario: 'success' | 'erp_error' | 'pos_error') => {
    // 1. Chuyển trạng thái sang Syncing
    setErpStatus('Syncing');
    setPosStatus('Syncing');
    
    // Ghi audit log vận hành
    await logAuditAction('SYNC_TRIGGERED', 'ERP/POS', 'Yêu cầu đồng bộ dữ liệu POS/ERP hệ thống trung tâm đã được kích hoạt.');

    // 2. Chờ 1.5 giây mô phỏng
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const nowStr = new Date().toLocaleString('vi-VN');
    const syncId = `SYNC-${Math.floor(100 + Math.random() * 900)}`;

    if (scenario === 'success') {
      setErpStatus('Connected');
      setPosStatus('Connected');
      setLastSync(nowStr);

      const newHistory: SyncHistoryEntry[] = [
        {
          id: `${syncId}-A`,
          system: 'ERP',
          startTime: nowStr,
          endTime: nowStr,
          recordsProcessed: products.length,
          status: 'success',
        },
        {
          id: `${syncId}-B`,
          system: 'POS',
          startTime: nowStr,
          endTime: nowStr,
          recordsProcessed: receipts.length,
          status: 'success',
        },
        ...syncHistory,
      ];
      setSyncHistory(newHistory);

      await saveState(STORAGE_KEYS.ERP_STATUS, 'Connected');
      await saveState(STORAGE_KEYS.POS_STATUS, 'Connected');
      await saveState(STORAGE_KEYS.LAST_SYNC, nowStr);
      await saveState(STORAGE_KEYS.SYNC_HISTORY, newHistory);

      await logAuditAction('SYNC_SUCCESS', 'ERP/POS', `Đồng bộ POS/ERP thành công. Đã cập nhật ${products.length} sản phẩm, ${receipts.length} hóa đơn.`);
    } else if (scenario === 'erp_error') {
      setErpStatus('Error');
      setPosStatus('Connected'); // POS vẫn ok

      const newHistory: SyncHistoryEntry[] = [
        {
          id: syncId,
          system: 'ERP',
          startTime: nowStr,
          endTime: nowStr,
          recordsProcessed: 0,
          status: 'error',
          errorMessage: 'ERP Connection Timeout (Error 504)',
        },
        ...syncHistory,
      ];
      setSyncHistory(newHistory);

      await saveState(STORAGE_KEYS.ERP_STATUS, 'Error');
      await saveState(STORAGE_KEYS.POS_STATUS, 'Connected');
      await saveState(STORAGE_KEYS.SYNC_HISTORY, newHistory);

      // Tự động đẩy Cảnh báo khẩn cấp sang Quản lý siêu thị
      await addManagerAlert(
        'sync_error',
        'critical',
        `LỖI KẾT NỐI ERP: Hệ thống xe đẩy mất kết nối đồng bộ danh mục kho ERP trung tâm (Mã: ${syncId}).`
      );

      await logAuditAction('SYNC_FAILED', 'ERP', `Đồng bộ ERP thất bại (Mã: ${syncId}). Đã tạo cảnh báo khẩn cấp cho Quản lý.`);
    } else if (scenario === 'pos_error') {
      setErpStatus('Connected');
      setPosStatus('Error');

      const newHistory: SyncHistoryEntry[] = [
        {
          id: syncId,
          system: 'POS',
          startTime: nowStr,
          endTime: nowStr,
          recordsProcessed: 0,
          status: 'error',
          errorMessage: 'POS Database Locked (Error 409)',
        },
        ...syncHistory,
      ];
      setSyncHistory(newHistory);

      await saveState(STORAGE_KEYS.ERP_STATUS, 'Connected');
      await saveState(STORAGE_KEYS.POS_STATUS, 'Error');
      await saveState(STORAGE_KEYS.SYNC_HISTORY, newHistory);

      // Tự động đẩy Cảnh báo sang Quản lý
      await addManagerAlert(
        'sync_error',
        'critical',
        `LỖI KẾT NỐI POS: Mất đồng bộ lịch sử giao dịch hóa đơn Smart Cart sang hệ thống POS quầy thu ngân (Mã: ${syncId}).`
      );

      await logAuditAction('SYNC_FAILED', 'POS', `Đồng bộ POS thất bại (Mã: ${syncId}). Đã tạo cảnh báo khẩn cấp cho Quản lý.`);
    }
  };

  const resetSyncState = async () => {
    setErpStatus('Connected');
    setPosStatus('Connected');
    setLastSync('Chưa đồng bộ');
    setSyncHistory([]);
    await AsyncStorage.removeItem(STORAGE_KEYS.ERP_STATUS);
    await AsyncStorage.removeItem(STORAGE_KEYS.POS_STATUS);
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    await AsyncStorage.removeItem(STORAGE_KEYS.SYNC_HISTORY);
  };

  return (
    <AppContext.Provider
      value={{
        products,
        cart,
        session,
        userRole,
        currentScreen,
        receipts,
        currentReceipt,
        selectedProduct,
        selectedCategory,
        isLoading,
        auditLogs,
        promotions,
        managerAlerts,
        erpStatus,
        posStatus,
        lastSync,
        syncHistory,
        setRole,
        navigate,
        startSession,
        endSession,
        updateBudget,
        addToCart,
        changeQuantity,
        removeFromCart,
        checkout,
        updateReceipt,
        updateProduct,
        resetProducts,
        logAuditAction,
        addPromotion,
        updatePromotion,
        addManagerAlert,
        resolveManagerAlert,
        resetPromotionsAndAlerts,
        getCartTotals,
        triggerSync,
        resetSyncState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp phải được sử dụng trong AppProvider');
  }
  return context;
};
