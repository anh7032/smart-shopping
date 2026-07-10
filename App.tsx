import React, { ComponentProps, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

type TabKey = 'home' | 'search' | 'scan' | 'ai' | 'cart';
type IconName = ComponentProps<typeof Ionicons>['name'];

type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  location: string;
  rating: number;
  badge?: string;
};

type CartItem = Product & { quantity: number };

const GREEN = '#2F9143';
const DARK_GREEN = '#1D7F37';
const LIGHT_GREEN = '#EAF7EC';
const BACKGROUND = '#F4F7F4';
const TEXT = '#18321E';
const MUTED = '#708074';
const BORDER = '#D9E5DB';
const RED = '#FF4D5E';

const categories: { label: string; icon: IconName; color: string }[] = [
  { label: 'Thực phẩm', icon: 'leaf-outline', color: '#E5F5CF' },
  { label: 'Đồ uống', icon: 'cafe-outline', color: '#E2F3FF' },
  { label: 'Chăm sóc', icon: 'sparkles-outline', color: '#FCE5ED' },
  { label: 'Gia dụng', icon: 'home-outline', color: '#FFF2D9' },
  { label: 'Khuyến mãi', icon: 'pricetag-outline', color: '#F2E8FF' },
];

const products: Product[] = [
  {
    id: 'rau-cai',
    name: 'Rau cải xanh organic',
    price: 18000,
    location: 'A3 - Kệ 2',
    rating: 4.8,
    badge: 'Organic',
  },
  {
    id: 'nuoc-cam',
    name: 'Nước cam ép tươi',
    price: 35000,
    oldPrice: 45000,
    discount: 22,
    location: 'B1 - Kệ 4',
    rating: 4.6,
  },
  {
    id: 'thit-bo',
    name: 'Thịt bò Úc nhập khẩu',
    price: 185000,
    oldPrice: 220000,
    discount: 16,
    location: 'C1 - Tủ lạnh',
    rating: 4.7,
    badge: 'Bán chạy',
  },
  {
    id: 'dau-goi',
    name: 'Dầu gội Pantene',
    price: 75000,
    oldPrice: 95000,
    discount: 21,
    location: 'D2 - Kệ 3',
    rating: 4.5,
  },
  {
    id: 'ca-chua',
    name: 'Cà chua bi đỏ',
    price: 25000,
    oldPrice: 35000,
    discount: 29,
    location: 'A1 - Kệ 5',
    rating: 4.4,
  },
  {
    id: 'sua-tuoi',
    name: 'Sữa tươi TH True Milk',
    price: 28000,
    location: 'B2 - Kệ 1',
    rating: 4.7,
  },
];

const initialCart: CartItem[] = [
  { ...products[0], quantity: 2 },
  { ...products[5], quantity: 1 },
  { ...products[4], quantity: 1 },
  { ...products[1], quantity: 1 },
];

const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const budget = 500000;

  const totalQuantity = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const changeQuantity = (id: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (id: string) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const addProduct = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <HomeScreen
          cartCount={totalQuantity}
          totalPrice={totalPrice}
          budget={budget}
          onOpenCart={() => setActiveTab('cart')}
          onSearch={() => setActiveTab('search')}
          onAddProduct={addProduct}
        />
      );
    }

    if (activeTab === 'cart') {
      return (
        <CartScreen
          items={cart}
          totalPrice={totalPrice}
          totalQuantity={totalQuantity}
          budget={budget}
          onBack={() => setActiveTab('home')}
          onChangeQuantity={changeQuantity}
          onRemove={removeItem}
        />
      );
    }

    return (
      <ComingSoonScreen
        tab={activeTab}
        onBack={() => setActiveTab('home')}
      />
    );
  };

  return (
    <View style={styles.app}>
      <StatusBar style="light" />
      {renderContent()}
      <BottomNavigation
        activeTab={activeTab}
        cartCount={totalQuantity}
        onChange={setActiveTab}
      />
    </View>
  );
}

function HomeScreen({
  cartCount,
  totalPrice,
  budget,
  onOpenCart,
  onSearch,
  onAddProduct,
}: {
  cartCount: number;
  totalPrice: number;
  budget: number;
  onOpenCart: () => void;
  onSearch: () => void;
  onAddProduct: (product: Product) => void;
}) {
  const remaining = Math.max(0, budget - totalPrice);
  const progress = Math.min(100, (totalPrice / budget) * 100);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.homeScrollContent}
      >
        <View style={styles.homeHeader}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.welcomeSmall}>Chào mừng trở lại 👋</Text>
              <Text style={styles.welcomeName}>Xin chào, Tiến wibu</Text>
            </View>
            <Pressable style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={21} color="#FFFFFF" />
              <View style={styles.notificationDot} />
            </Pressable>
          </View>

          <View style={styles.cartStatusRow}>
            <View style={styles.connectedWrap}>
              <View style={styles.connectedDot} />
              <Text style={styles.connectedText}>CART-038</Text>
              <Text style={styles.connectedMuted}>• Đã kết nối</Text>
            </View>
            <Pressable style={styles.headerCartPill} onPress={onOpenCart}>
              <Ionicons name="cart-outline" size={16} color={DARK_GREEN} />
              <Text style={styles.headerCartText}>
                {cartCount} SP · {money(totalPrice)}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.homeBody}>
          <Pressable style={styles.searchBar} onPress={onSearch}>
            <Ionicons name="search-outline" size={21} color={DARK_GREEN} />
            <Text style={styles.searchPlaceholder}>Bạn muốn tìm sản phẩm gì?</Text>
            <Ionicons name="filter-outline" size={20} color={MUTED} />
          </Pressable>

          <View style={styles.promoBanner}>
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>🔥 HÔM NAY</Text>
            </View>
            <Text style={styles.promoTitle}>Giảm đến 30%</Text>
            <Text style={styles.promoHighlight}>cho thực phẩm tươi</Text>
            <View style={styles.promoBottomRow}>
              <Text style={styles.promoSub}>Áp dụng đến 23:59 hôm nay</Text>
              <Pressable
                style={styles.buyNowButton}
                onPress={() => Alert.alert('Khuyến mãi', 'Bạn tự nối sang trang khuyến mãi nhé.')}
              >
                <Text style={styles.buyNowText}>Mua ngay</Text>
                <Ionicons name="chevron-forward" size={14} color={DARK_GREEN} />
              </Pressable>
            </View>
          </View>

          <SectionTitle title="Danh mục" action="Xem tất cả" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {categories.map((category) => (
              <Pressable key={category.label} style={styles.categoryItem}>
                <View
                  style={[
                    styles.categoryIconBox,
                    { backgroundColor: category.color },
                  ]}
                >
                  <Ionicons name={category.icon} size={25} color={DARK_GREEN} />
                </View>
                <Text style={styles.categoryLabel} numberOfLines={1}>
                  {category.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <SectionTitle
            icon="sparkles-outline"
            title="Gợi ý dành cho bạn"
            action="Xem thêm"
          />
          <View style={styles.productGrid}>
            {products.slice(0, 2).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                added={product.id === 'rau-cai'}
                onAdd={() => onAddProduct(product)}
              />
            ))}
          </View>

          <SectionTitle title="Đang giảm giá" action="Xem thêm" />
          <View style={styles.productGrid}>
            {products.slice(1, 5).map((product) => (
              <ProductCard
                key={`sale-${product.id}`}
                product={product}
                added={product.id === 'nuoc-cam' || product.id === 'ca-chua'}
                onAdd={() => onAddProduct(product)}
              />
            ))}
          </View>

          <View style={styles.budgetCard}>
            <View style={styles.budgetTitleRow}>
              <View style={styles.budgetIconCircle}>
                <Ionicons name="pricetag-outline" size={18} color={GREEN} />
              </View>
              <Text style={styles.budgetTitle}>Theo dõi ngân sách</Text>
              <View style={styles.todayPill}>
                <Text style={styles.todayPillText}>Hôm nay</Text>
              </View>
            </View>

            <View style={styles.budgetValuesRow}>
              <BudgetValue label="Ngân sách" value={money(budget)} />
              <BudgetValue label="Đã dùng" value={money(totalPrice)} danger />
              <BudgetValue label="Còn lại" value={money(remaining)} success />
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>0đ</Text>
              <Text style={styles.progressPercent}>{Math.round(progress)}% đã dùng</Text>
              <Text style={styles.progressLabel}>{money(budget)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionTitle({
  title,
  action,
  icon,
}: {
  title: string;
  action: string;
  icon?: IconName;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleLeft}>
        {icon ? <Ionicons name={icon} size={18} color={GREEN} /> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Pressable style={styles.sectionActionWrap}>
        <Text style={styles.sectionAction}>{action}</Text>
        <Ionicons name="chevron-forward" size={13} color={DARK_GREEN} />
      </Pressable>
    </View>
  );
}

function ProductCard({
  product,
  added,
  onAdd,
}: {
  product: Product;
  added: boolean;
  onAdd: () => void;
}) {
  return (
    <View style={styles.productCard}>
      <View style={styles.productImagePlaceholder}>
        {/* Thay View này bằng <Image /> khi bạn thêm ảnh sản phẩm. */}
      </View>

      {product.discount ? (
        <View style={styles.discountBadge}>
          <Text style={styles.discountBadgeText}>-{product.discount}%</Text>
        </View>
      ) : null}

      {product.badge ? (
        <View style={styles.productBadge}>
          <Text style={styles.productBadgeText}>{product.badge}</Text>
        </View>
      ) : null}

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.productMetaRow}>
          <Ionicons name="star" size={12} color="#F2C94C" />
          <Text style={styles.productMeta}>{product.rating}</Text>
        </View>
        <View style={styles.productMetaRow}>
          <Ionicons name="location-outline" size={12} color="#63A975" />
          <Text style={styles.productMeta}>{product.location}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{money(product.price)}</Text>
          {product.oldPrice ? (
            <Text style={styles.oldPrice}>{money(product.oldPrice)}</Text>
          ) : null}
        </View>

        <Pressable
          style={[styles.addButton, added && styles.addedButton]}
          onPress={onAdd}
        >
          <Ionicons
            name={added ? 'checkmark-circle-outline' : 'add'}
            size={15}
            color={added ? DARK_GREEN : '#FFFFFF'}
          />
          <Text style={[styles.addButtonText, added && styles.addedButtonText]}>
            {added ? 'Đã thêm' : 'Thêm vào giỏ'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function BudgetValue({
  label,
  value,
  danger,
  success,
}: {
  label: string;
  value: string;
  danger?: boolean;
  success?: boolean;
}) {
  return (
    <View style={styles.budgetValueBox}>
      <Text style={styles.budgetValueLabel}>{label}</Text>
      <Text
        style={[
          styles.budgetValue,
          danger && styles.budgetDanger,
          success && styles.budgetSuccess,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function CartScreen({
  items,
  totalPrice,
  totalQuantity,
  budget,
  onBack,
  onChangeQuantity,
  onRemove,
}: {
  items: CartItem[];
  totalPrice: number;
  totalQuantity: number;
  budget: number;
  onBack: () => void;
  onChangeQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}) {
  const savings = items.reduce(
    (sum, item) =>
      sum + (item.oldPrice ? (item.oldPrice - item.price) * item.quantity : 0),
    0,
  );
  const remaining = budget - totalPrice;

  return (
    <View style={styles.screen}>
      <View style={styles.cartHeader}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={23} color="#FFFFFF" />
        </Pressable>
        <View style={styles.cartHeaderTextWrap}>
          <Text style={styles.cartHeaderTitle}>Giỏ hàng của bạn</Text>
          <Text style={styles.cartHeaderSub}>CART-038 • Đã kết nối</Text>
        </View>
        <View style={styles.cartCountBadge}>
          <Text style={styles.cartCountBadgeText}>{totalQuantity} SP</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cartScrollContent}
      >
        {items.length === 0 ? (
          <View style={styles.emptyCart}>
            <Ionicons name="cart-outline" size={54} color={MUTED} />
            <Text style={styles.emptyCartTitle}>Giỏ hàng đang trống</Text>
            <Text style={styles.emptyCartSub}>Quay lại trang chủ để thêm sản phẩm.</Text>
          </View>
        ) : (
          items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onDecrease={() => onChangeQuantity(item.id, -1)}
              onIncrease={() => onChangeQuantity(item.id, 1)}
              onRemove={() => onRemove(item.id)}
            />
          ))
        )}

        <View style={styles.cartBudgetCard}>
          <View style={styles.cartBudgetTitleRow}>
            <Ionicons name="pricetag-outline" size={17} color={GREEN} />
            <Text style={styles.cartBudgetTitle}>Kiểm tra ngân sách</Text>
          </View>
          <View style={styles.cartBudgetBottomRow}>
            <Text style={styles.cartBudgetMuted}>Ngân sách: {money(budget)}</Text>
            <Text
              style={[
                styles.cartBudgetRemaining,
                remaining < 0 && { color: RED },
              ]}
            >
              Còn lại: {money(Math.abs(remaining))}
              {remaining < 0 ? ' vượt' : ''}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.cartSummary}>
        <View>
          <Text style={styles.summaryLabel}>Tổng cộng ({totalQuantity} sản phẩm)</Text>
          <Text style={styles.summaryTotal}>{money(totalPrice)}</Text>
        </View>
        <View style={styles.summarySavingsWrap}>
          <Text style={styles.summaryLabel}>Tiết kiệm được</Text>
          <Text style={styles.summarySavings}>{money(savings)}</Text>
        </View>
        <Pressable
          style={styles.checkoutButton}
          onPress={() => Alert.alert('Thanh toán', 'Bạn tự làm tiếp màn hình thanh toán nhé.')}
        >
          <Text style={styles.checkoutButtonText}>Thanh toán</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

function CartItemCard({
  item,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  item: CartItem;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.cartItemCard}>
      <View style={styles.cartImagePlaceholder}>
        {/* Thay View này bằng <Image /> khi bạn thêm ảnh sản phẩm. */}
      </View>

      <View style={styles.cartItemInfo}>
        <View style={styles.cartItemTopRow}>
          <Text style={styles.cartItemName} numberOfLines={2}>
            {item.name}
          </Text>
          <Pressable style={styles.deleteButton} onPress={onRemove}>
            <Ionicons name="trash-outline" size={17} color="#FF6B7B" />
          </Pressable>
        </View>

        <View style={styles.cartLocationRow}>
          <Ionicons name="location-outline" size={12} color="#63A975" />
          <Text style={styles.cartLocation}>{item.location}</Text>
        </View>

        <View style={styles.cartPriceControlRow}>
          <Text style={styles.cartItemPrice}>{money(item.price)}</Text>
          <View style={styles.quantityControl}>
            <Pressable style={styles.quantityButtonMuted} onPress={onDecrease}>
              <Ionicons name="remove" size={17} color={MUTED} />
            </Pressable>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <Pressable style={styles.quantityButtonGreen} onPress={onIncrease}>
              <Ionicons name="add" size={17} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.cartLineTotal}>
          Tổng: {money(item.price * item.quantity)}
        </Text>
      </View>
    </View>
  );
}

function ComingSoonScreen({
  tab,
  onBack,
}: {
  tab: Exclude<TabKey, 'home' | 'cart'>;
  onBack: () => void;
}) {
  const config: Record<
    Exclude<TabKey, 'home' | 'cart'>,
    { title: string; icon: IconName }
  > = {
    search: { title: 'Tìm kiếm sản phẩm', icon: 'search-outline' },
    scan: { title: 'Quét sản phẩm', icon: 'scan-outline' },
    ai: { title: 'Gợi ý AI', icon: 'sparkles-outline' },
  };

  return (
    <SafeAreaView style={styles.comingSoonScreen}>
      <View style={styles.comingSoonIcon}>
        <Ionicons name={config[tab].icon} size={42} color={GREEN} />
      </View>
      <Text style={styles.comingSoonTitle}>{config[tab].title}</Text>
      <Text style={styles.comingSoonText}>
        Khung trang đã được nối sẵn. Bạn có thể tự phát triển phần này.
      </Text>
      <Pressable style={styles.returnHomeButton} onPress={onBack}>
        <Text style={styles.returnHomeText}>Về trang chủ</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function BottomNavigation({
  activeTab,
  cartCount,
  onChange,
}: {
  activeTab: TabKey;
  cartCount: number;
  onChange: (tab: TabKey) => void;
}) {
  const tabs: { key: TabKey; label: string; icon: IconName }[] = [
    { key: 'home', label: 'Trang chủ', icon: 'home-outline' },
    { key: 'search', label: 'Tìm kiếm', icon: 'search-outline' },
    { key: 'scan', label: 'Quét SP', icon: 'scan-outline' },
    { key: 'ai', label: 'Gợi ý AI', icon: 'sparkles-outline' },
    { key: 'cart', label: 'Giỏ hàng', icon: 'cart-outline' },
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        const isScan = tab.key === 'scan';
        return (
          <Pressable
            key={tab.key}
            style={styles.navItem}
            onPress={() => onChange(tab.key)}
          >
            <View
              style={[
                styles.navIconWrap,
                active && !isScan && styles.navIconWrapActive,
                isScan && styles.scanNavButton,
              ]}
            >
              <Ionicons
                name={tab.icon}
                size={isScan ? 25 : 21}
                color={isScan ? '#FFFFFF' : active ? GREEN : '#607366'}
              />
              {tab.key === 'cart' && cartCount > 0 ? (
                <View style={styles.navCartBadge}>
                  <Text style={styles.navCartBadgeText}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[
                styles.navLabel,
                active && styles.navLabelActive,
                isScan && styles.scanNavLabel,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const shadow = Platform.select({
  ios: {
    shadowColor: '#132A18',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  android: { elevation: 3 },
  default: {},
});

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 10;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;
const TOP_INSET = Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 24 : 0;

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  homeScrollContent: {
    paddingBottom: 112,
  },
  homeHeader: {
    backgroundColor: GREEN,
    paddingTop: TOP_INSET + 18,
    paddingHorizontal: 18,
    paddingBottom: 38,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeSmall: {
    color: '#E8F6EA',
    fontSize: 12,
    fontWeight: '600',
  },
  welcomeName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  notificationButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    right: 6,
    top: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6672',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  cartStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 6,
  },
  connectedWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  connectedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#74E49C',
    marginRight: 7,
  },
  connectedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  connectedMuted: {
    color: '#DFF1E2',
    fontSize: 11,
    marginLeft: 5,
  },
  headerCartPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  headerCartText: {
    color: DARK_GREEN,
    fontSize: 11,
    fontWeight: '800',
  },
  homeBody: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: -20,
  },
  searchBar: {
    height: 51,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10,
    ...shadow,
  },
  searchPlaceholder: {
    flex: 1,
    color: '#8A968D',
    fontSize: 14,
  },
  promoBanner: {
    minHeight: 132,
    borderRadius: 18,
    marginTop: 10,
    padding: 16,
    backgroundColor: '#3A9A45',
    overflow: 'hidden',
  },
  todayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFD43B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  todayBadgeText: {
    color: '#7A5B00',
    fontSize: 9,
    fontWeight: '900',
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 25,
    fontWeight: '900',
    marginTop: 8,
  },
  promoHighlight: {
    color: '#FFE75D',
    fontSize: 20,
    lineHeight: 23,
    fontWeight: '900',
  },
  promoBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 9,
  },
  promoSub: {
    color: '#E5F5E7',
    fontSize: 11,
    fontWeight: '600',
  },
  buyNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  buyNowText: {
    color: DARK_GREEN,
    fontWeight: '800',
    fontSize: 11,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  sectionTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '900',
  },
  sectionActionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionAction: {
    color: DARK_GREEN,
    fontSize: 11,
    fontWeight: '700',
  },
  categoryRow: {
    gap: 10,
    paddingRight: 8,
  },
  categoryItem: {
    width: 61,
    alignItems: 'center',
  },
  categoryIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(26,95,44,0.08)',
  },
  categoryLabel: {
    marginTop: 6,
    color: '#243C29',
    fontSize: 9,
    fontWeight: '700',
    width: 66,
    textAlign: 'center',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  productCard: {
    width: CARD_WIDTH,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    ...shadow,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#E8ECE9',
  },
  discountBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    backgroundColor: '#FF3E52',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  productBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    backgroundColor: GREEN,
    borderRadius: 11,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  productBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    color: TEXT,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    minHeight: 32,
  },
  productMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  productMeta: {
    color: MUTED,
    fontSize: 9,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    marginTop: 8,
  },
  productPrice: {
    color: DARK_GREEN,
    fontSize: 14,
    fontWeight: '900',
  },
  oldPrice: {
    color: '#929D95',
    fontSize: 8,
    textDecorationLine: 'line-through',
  },
  addButton: {
    height: 30,
    borderRadius: 15,
    backgroundColor: GREEN,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  addedButton: {
    backgroundColor: '#F0FAF2',
    borderWidth: 1,
    borderColor: GREEN,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  addedButtonText: {
    color: DARK_GREEN,
  },
  budgetCard: {
    marginTop: 14,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    ...shadow,
  },
  budgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 8,
    flex: 1,
  },
  todayPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#F2FAF3',
  },
  todayPillText: {
    color: '#70A87B',
    fontSize: 9,
  },
  budgetValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  budgetValueBox: {
    flex: 1,
  },
  budgetValueLabel: {
    color: MUTED,
    fontSize: 9,
    marginBottom: 4,
  },
  budgetValue: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '900',
  },
  budgetDanger: {
    color: RED,
  },
  budgetSuccess: {
    color: DARK_GREEN,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E7ECE8',
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: GREEN,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  progressLabel: {
    color: MUTED,
    fontSize: 8,
  },
  progressPercent: {
    color: DARK_GREEN,
    fontSize: 8,
    fontWeight: '700',
  },
  cartHeader: {
    backgroundColor: GREEN,
    paddingTop: TOP_INSET + 14,
    paddingBottom: 18,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  cartHeaderTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  cartHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  cartHeaderSub: {
    color: '#DDF2E1',
    fontSize: 10,
    marginTop: 4,
  },
  cartCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cartCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  cartScrollContent: {
    padding: 8,
    paddingBottom: 236,
  },
  cartItemCard: {
    minHeight: 113,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    padding: 9,
    flexDirection: 'row',
    marginBottom: 9,
    ...shadow,
  },
  cartImagePlaceholder: {
    width: 82,
    height: 82,
    borderRadius: 11,
    backgroundColor: '#E8ECE9',
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  cartItemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cartItemName: {
    flex: 1,
    color: TEXT,
    fontSize: 13,
    fontWeight: '800',
    paddingRight: 6,
  },
  deleteButton: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#FFF0F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  cartLocation: {
    color: MUTED,
    fontSize: 9,
  },
  cartPriceControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  cartItemPrice: {
    color: DARK_GREEN,
    fontSize: 14,
    fontWeight: '900',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  quantityButtonMuted: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#EDF1EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonGreen: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '900',
  },
  cartLineTotal: {
    marginTop: 5,
    color: MUTED,
    fontSize: 9,
  },
  cartBudgetCard: {
    backgroundColor: '#F1FBF3',
    borderWidth: 1,
    borderColor: '#BDE3C5',
    borderRadius: 13,
    padding: 12,
    marginTop: 2,
  },
  cartBudgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cartBudgetTitle: {
    color: DARK_GREEN,
    fontWeight: '800',
    fontSize: 12,
  },
  cartBudgetBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  cartBudgetMuted: {
    color: MUTED,
    fontSize: 9,
  },
  cartBudgetRemaining: {
    color: DARK_GREEN,
    fontSize: 10,
    fontWeight: '800',
  },
  emptyCart: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyCartTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 12,
  },
  emptyCartSub: {
    color: MUTED,
    fontSize: 12,
    marginTop: 6,
  },
  cartSummary: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 74,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    color: MUTED,
    fontSize: 9,
  },
  summaryTotal: {
    color: DARK_GREEN,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  summarySavingsWrap: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
    marginRight: 10,
  },
  summarySavings: {
    color: GREEN,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  checkoutButton: {
    display: 'none',
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 76,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E1E8E2',
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingBottom: Platform.OS === 'ios' ? 9 : 4,
    ...shadow,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrap: {
    width: 34,
    height: 31,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapActive: {
    backgroundColor: LIGHT_GREEN,
  },
  scanNavButton: {
    width: 52,
    height: 52,
    borderRadius: 27,
    backgroundColor: GREEN,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginTop: -27,
    ...shadow,
  },
  navLabel: {
    color: '#607366',
    fontSize: 9,
    marginTop: 2,
  },
  navLabelActive: {
    color: GREEN,
    fontWeight: '800',
  },
  scanNavLabel: {
    marginTop: -1,
  },
  navCartBadge: {
    position: 'absolute',
    right: -2,
    top: -3,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  navCartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  comingSoonScreen: {
    flex: 1,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 76,
  },
  comingSoonIcon: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonTitle: {
    color: TEXT,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 18,
  },
  comingSoonText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  returnHomeButton: {
    backgroundColor: GREEN,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
    marginTop: 18,
  },
  returnHomeText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
