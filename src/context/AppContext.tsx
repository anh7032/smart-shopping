import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, CartItem, SessionState, Receipt, ScreenName, UserRole } from '../types';

interface AppContextProps {
  // State
  cart: CartItem[];
  session: SessionState | null;
  userRole: UserRole;
  currentScreen: ScreenName;
  receipts: Receipt[];
  currentReceipt: Receipt | null;
  selectedProduct: Product | null;
  selectedCategory: string | null;
  isLoading: boolean;

  // Actions
  setRole: (role: UserRole) => void;
  navigate: (screen: ScreenName, params?: { product?: Product; category?: string; receipt?: Receipt }) => void;
  startSession: (customerName: string, cartCode: string, budget: number) => Promise<void>;
  endSession: () => Promise<void>;
  updateBudget: (budget: number) => Promise<void>;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  changeQuantity: (productId: string, delta: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  checkout: (paymentMethod: Receipt['paymentMethod']) => Promise<Receipt>;
  updateReceipt: (updatedReceipt: Receipt) => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const STORAGE_KEYS = {
  CART: '@smart_shopping_cart',
  SESSION: '@smart_shopping_session',
  USER_ROLE: '@smart_shopping_user_role',
  CURRENT_SCREEN: '@smart_shopping_current_screen',
  RECEIPTS: '@smart_shopping_receipts',
  CURRENT_RECEIPT: '@smart_shopping_current_receipt',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [session, setSession] = useState<SessionState | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('welcome');
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [currentReceipt, setCurrentReceipt] = useState<Receipt | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

        if (storedCart) setCart(JSON.parse(storedCart));
        if (storedSession) setSession(JSON.parse(storedSession));
        if (storedRole) setUserRole(JSON.parse(storedRole) as UserRole);
        if (storedScreen) setCurrentScreen(JSON.parse(storedScreen) as ScreenName);
        if (storedReceipts) setReceipts(JSON.parse(storedReceipts));
        if (storedCurrentReceipt) setCurrentReceipt(JSON.parse(storedCurrentReceipt));
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

  const startSession = async (customerName: string, cartCode: string, budget: number) => {
    const newSession: SessionState = {
      cartCode: cartCode || `CART-${Math.floor(100 + Math.random() * 900)}`,
      isConnected: true,
      budget,
      initialBudget: budget,
      startedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      customerName: customerName || 'Khách hàng',
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
    // 1. Kiểm tra tồn kho
    const existingItem = cart.find((item) => item.id === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    const requestedQty = currentQty + quantity;

    if (requestedQty > product.stock) {
      Alert.alert(
        'Hết hàng hoặc vượt giới hạn',
        `Sản phẩm này chỉ còn ${product.stock} sản phẩm trong kho. Bạn đã có ${currentQty} sản phẩm trong giỏ.`
      );
      return;
    }

    // 2. Cập nhật giỏ hàng
    let newCart: CartItem[];
    if (existingItem) {
      newCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: requestedQty } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity }];
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
      if (newQty > item.stock) {
        Alert.alert('Không thể tăng thêm', `Sản phẩm này chỉ còn tối đa ${item.stock} cái trong kho.`);
        return;
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

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const savings = cart.reduce(
      (sum, item) =>
        sum + (item.oldPrice ? (item.oldPrice - item.price) * item.quantity : 0),
      0
    );

    const newReceipt: Receipt = {
      id: `HD-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toLocaleString('vi-VN'),
      customerName: session.customerName || 'Khách hàng',
      cartCode: session.cartCode,
      items: [...cart],
      totalQuantity,
      totalPrice,
      savings,
      paymentMethod,
      status: 'paid',
    };

    const newReceipts = [newReceipt, ...receipts];
    setReceipts(newReceipts);
    setCurrentReceipt(newReceipt);

    await saveState(STORAGE_KEYS.RECEIPTS, newReceipts);
    await saveState(STORAGE_KEYS.CURRENT_RECEIPT, newReceipt);

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

  return (
    <AppContext.Provider
      value={{
        cart,
        session,
        userRole,
        currentScreen,
        receipts,
        currentReceipt,
        selectedProduct,
        selectedCategory,
        isLoading,
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
