import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { CartItem, Product } from '../types';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

export const CartScreen: React.FC = () => {
  const { cart, session, changeQuantity, removeFromCart, navigate, addToCart, products } = useApp();

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const savings = cart.reduce(
    (sum, item) =>
      sum + (item.oldPrice ? (item.oldPrice - item.price) * item.quantity : 0),
    0
  );

  const budget = session?.budget || 500000;
  const remaining = budget - totalPrice;

  const aiRecommendations = React.useMemo(() => {
    const recommendedList: { product: Product; reason: string; confidence: number }[] = [];
    const cartIds = cart.map((item) => item.id);

    // Helper to find an active product in products
    const getProduct = (id: string) => products.find((p) => p.id === id && p.isActive !== false);

    // Rule 1: Sữa tươi TH True Milk (sua-tuoi-th) -> suggest Ngũ cốc (ngu-coc-an-sang)
    if (cartIds.includes('sua-tuoi-th') && !cartIds.includes('ngu-coc-an-sang')) {
      const prod = getProduct('ngu-coc-an-sang');
      if (prod) {
        recommendedList.push({
          product: prod,
          reason: 'Thường mua cùng sữa tươi TH True Milk',
          confidence: 95,
        });
      }
    }

    // Rule 2: Thịt bò Úc (thit-bo-uc) -> suggest Rau cải organic (rau-cai-organic)
    if (cartIds.includes('thit-bo-uc') && !cartIds.includes('rau-cai-organic')) {
      const prod = getProduct('rau-cai-organic');
      if (prod) {
        recommendedList.push({
          product: prod,
          reason: 'Gợi ý kết hợp nấu món Bò xào rau cải xanh',
          confidence: 91,
        });
      }
    }

    // Rule 3: Khoai tây chiên (khoai-tay-ong-pringles) -> suggest Trà xanh C2 (tra-xanh-c2)
    if (cartIds.includes('khoai-tay-ong-pringles') && !cartIds.includes('tra-xanh-c2')) {
      const prod = getProduct('tra-xanh-c2');
      if (prod) {
        recommendedList.push({
          product: prod,
          reason: 'Combo ăn vặt giòn rụm & giải nhiệt cực đã',
          confidence: 88,
        });
      }
    }

    // Rule 4: Dựa trên lịch sử mua sắm của hội viên
    if (session?.userType === 'member' && session.shoppingHistory) {
      // If history has organic vegetables and soy sauce is not in cart
      if (session.shoppingHistory.includes('rau-cai-organic') && !cartIds.includes('nuoc-tuong-chinsu')) {
        const prod = getProduct('nuoc-tuong-chinsu');
        if (prod && !recommendedList.some((r) => r.product.id === prod.id)) {
          recommendedList.push({
            product: prod,
            reason: 'Dựa trên lịch sử mua rau cải xào của bạn',
            confidence: 89,
          });
        }
      }

      // If history has Sữa tươi and Sandwich is not in cart
      if (session.shoppingHistory.includes('sua-tuoi-th') && !cartIds.includes('banh-mi-sandwich')) {
        const prod = getProduct('banh-mi-sandwich');
        if (prod && !recommendedList.some((r) => r.product.id === prod.id)) {
          recommendedList.push({
            product: prod,
            reason: 'Gợi ý bữa sáng dinh dưỡng bơ sữa tuyệt ngon',
            confidence: 92,
          });
        }
      }
    }

    // Rule 5: Fallback promotions (Nếu giỏ hàng có ít gợi ý, thêm các sản phẩm đang có discount cao)
    if (recommendedList.length < 3) {
      const promos = products
        .filter((p: Product) => p.isActive !== false && p.discount !== undefined && !cartIds.includes(p.id) && !recommendedList.some((r) => r.product.id === p.id))
        .slice(0, 3 - recommendedList.length);
      
      promos.forEach((p: Product) => {
        recommendedList.push({
          product: p,
          reason: `Ưu đãi siêu sốc hôm nay giảm ${p.discount}%`,
          confidence: 82,
        });
      });
    }

    return recommendedList;
  }, [cart, session]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm vào giỏ trước khi thanh toán.');
      return;
    }
    // Chuyển tới màn hình Xác nhận đơn hàng (Sẽ xây dựng ở Giai đoạn tiếp theo)
    navigate('checkout_confirm');
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.cartHeader}>
        <Pressable style={styles.backButton} onPress={() => navigate('home')}>
          <Ionicons name="arrow-back" size={23} color="#FFFFFF" />
        </Pressable>
        <View style={styles.cartHeaderTextWrap}>
          <Text style={styles.cartHeaderTitle}>Giỏ hàng của bạn</Text>
          <Text style={styles.cartHeaderSub}>
            {session?.cartCode || 'CART-038'} • Đã kết nối
          </Text>
        </View>
        <View style={styles.cartCountBadge}>
          <Text style={styles.cartCountBadgeText}>{totalQuantity} SP</Text>
        </View>
      </View>

      {/* Item list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cartScrollContent}
      >
        {cart.length === 0 ? (
          <View style={styles.emptyCart}>
            <Ionicons name="cart-outline" size={54} color={COLORS.MUTED} />
            <Text style={styles.emptyCartTitle}>Giỏ hàng đang trống</Text>
            <Text style={styles.emptyCartSub}>Quay lại trang chủ để thêm sản phẩm.</Text>
            <Pressable style={styles.shopNowButton} onPress={() => navigate('home')}>
              <Text style={styles.shopNowButtonText}>Mua sắm ngay</Text>
            </Pressable>
          </View>
        ) : (
          cart.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onDecrease={() => changeQuantity(item.id, -1)}
              onIncrease={() => changeQuantity(item.id, 1)}
              onRemove={() => {
                Alert.alert(
                  'Xóa sản phẩm',
                  `Bạn muốn xóa "${item.name}" khỏi giỏ hàng?`,
                  [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Xóa', style: 'destructive', onPress: () => removeFromCart(item.id) },
                  ]
                );
              }}
            />
          ))
        )}

        {/* Budget Status in Cart */}
        {cart.length > 0 && (
          <View style={styles.cartBudgetCard}>
            <View style={styles.cartBudgetTitleRow}>
              <Ionicons name="wallet-outline" size={17} color={COLORS.GREEN} />
              <Text style={styles.cartBudgetTitle}>Kiểm tra ngân sách</Text>
            </View>
            <View style={styles.cartBudgetBottomRow}>
              <Text style={styles.cartBudgetMuted}>Ngân sách ban đầu: {money(budget)}</Text>
              <Text
                style={[
                  styles.cartBudgetRemaining,
                  remaining < 0 && { color: COLORS.RED },
                ]}
              >
                Còn lại: {money(Math.abs(remaining))}
                {remaining < 0 ? ' (vượt mức)' : ''}
              </Text>
            </View>
          </View>
        )}

        {/* AI Smart Recommendation Panel */}
        {aiRecommendations.length > 0 && (
          <View style={styles.aiPanel}>
            <View style={styles.aiPanelHeader}>
              <View style={styles.aiPanelTitleRow}>
                <Ionicons name="sparkles" size={16} color="#7E22CE" />
                <Text style={styles.aiPanelTitle}>Gợi ý mua kèm từ AI</Text>
              </View>
              <Text style={styles.aiPanelSub}>Dựa trên giỏ hàng & lịch sử thành viên</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.aiPanelScroll}>
              {aiRecommendations.map(({ product, reason, confidence }) => (
                <View key={product.id} style={styles.aiCard}>
                  <View style={styles.aiMatchBadge}>
                    <Text style={styles.aiMatchText}>🔥 {confidence}% Match</Text>
                  </View>

                  {product.image ? (
                    <Image source={product.image} style={styles.aiProductImage} />
                  ) : (
                    <View style={styles.aiProductImagePlaceholder}>
                      <Ionicons name="image-outline" size={24} color="#A6B3A9" />
                    </View>
                  )}

                  <View style={styles.aiProductInfo}>
                    <Text style={styles.aiProductName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.aiProductPrice}>{money(product.price)}</Text>
                    <Text style={styles.aiProductReason} numberOfLines={2}>
                      {reason}
                    </Text>
                  </View>

                  <Pressable
                    style={styles.aiNavBtn}
                    onPress={() => {
                      navigate('shelf_map', { product });
                    }}
                  >
                    <Ionicons name="compass-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.aiNavBtnText}>Xem vị trí</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Summary Bottom Bar */}
      {cart.length > 0 && (
        <View style={styles.cartSummary}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel}>Tổng cộng ({totalQuantity} sản phẩm)</Text>
            <Text style={styles.summaryTotal}>{money(totalPrice)}</Text>
            {savings > 0 && (
              <View style={styles.summarySavingsWrap}>
                <Text style={styles.summarySavingsLabel}>Tiết kiệm: </Text>
                <Text style={styles.summarySavings}>{money(savings)}</Text>
              </View>
            )}
          </View>
          <Pressable style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Thanh toán</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 4 }} />
          </Pressable>
        </View>
      )}
    </View>
  );
};

// Subcomponent: CartItemCard
interface CartItemCardProps {
  item: CartItem;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onDecrease,
  onIncrease,
  onRemove,
}) => {
  return (
    <View style={styles.cartItemCard}>
      {item.image ? (
        <Image source={item.image} style={styles.cartItemImage} />
      ) : (
        <View style={styles.cartImagePlaceholder}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="image-outline" size={24} color="#A6B3A9" />
          </View>
        </View>
      )}

      <View style={styles.cartItemInfo}>
        <View style={styles.cartItemTopRow}>
          <Text style={styles.cartItemName} numberOfLines={2}>
            {item.name}
          </Text>
          <Pressable style={styles.deleteButton} onPress={onRemove}>
            <Ionicons name="trash-outline" size={15} color="#FF6B7B" />
          </Pressable>
        </View>

        <View style={styles.cartLocationRow}>
          <Ionicons name="location-outline" size={11} color="#63A975" />
          <Text style={styles.cartLocation}>
            {item.shelf.split(' - ')[1] || item.shelf}
          </Text>
        </View>

        <View style={styles.cartPriceControlRow}>
          <Text style={styles.cartItemPrice}>{money(item.price)}</Text>
          <View style={styles.quantityControl}>
            <Pressable style={styles.quantityButtonMuted} onPress={onDecrease}>
              <Ionicons name="remove" size={15} color={COLORS.MUTED} />
            </Pressable>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <Pressable style={styles.quantityButtonGreen} onPress={onIncrease}>
              <Ionicons name="add" size={15} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.cartLineTotal}>
          Thành tiền: {money(item.price * item.quantity)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  cartHeader: {
    backgroundColor: COLORS.GREEN,
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
    padding: 12,
    paddingBottom: 160,
  },
  cartItemCard: {
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 10,
    flexDirection: 'row',
    marginBottom: 10,
    ...SHADOW,
  },
  cartImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 11,
    backgroundColor: '#E8ECE9',
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 11,
    resizeMode: 'cover',
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
    color: COLORS.TEXT,
    fontSize: 13,
    fontWeight: '800',
    paddingRight: 6,
  },
  deleteButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
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
    color: COLORS.MUTED,
    fontSize: 10,
  },
  cartPriceControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  cartItemPrice: {
    color: COLORS.DARK_GREEN,
    fontSize: 14,
    fontWeight: '900',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityButtonMuted: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EDF1EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonGreen: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: COLORS.TEXT,
    fontSize: 13,
    fontWeight: '900',
  },
  cartLineTotal: {
    marginTop: 6,
    color: COLORS.MUTED,
    fontSize: 10,
  },
  cartBudgetCard: {
    backgroundColor: '#F1FBF3',
    borderWidth: 1,
    borderColor: '#BDE3C5',
    borderRadius: 13,
    padding: 12,
    marginTop: 4,
  },
  cartBudgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cartBudgetTitle: {
    color: COLORS.DARK_GREEN,
    fontWeight: '800',
    fontSize: 13,
  },
  cartBudgetBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  cartBudgetMuted: {
    color: COLORS.MUTED,
    fontSize: 10,
  },
  cartBudgetRemaining: {
    color: COLORS.DARK_GREEN,
    fontSize: 11,
    fontWeight: '800',
  },
  emptyCart: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyCartTitle: {
    color: COLORS.TEXT,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 12,
  },
  emptyCartSub: {
    color: COLORS.MUTED,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  shopNowButton: {
    backgroundColor: COLORS.GREEN,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 20,
  },
  shopNowButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  cartSummary: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 76,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOW,
  },
  summaryLabel: {
    color: COLORS.MUTED,
    fontSize: 10,
  },
  summaryTotal: {
    color: COLORS.DARK_GREEN,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  summarySavingsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  summarySavingsLabel: {
    color: COLORS.MUTED,
    fontSize: 10,
  },
  summarySavings: {
    color: COLORS.GREEN,
    fontSize: 11,
    fontWeight: '800',
  },
  checkoutButton: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: COLORS.GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  aiPanel: {
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6E6FA',
    ...SHADOW,
  },
  aiPanelHeader: {
    marginBottom: 12,
  },
  aiPanelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiPanelTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  aiPanelSub: {
    fontSize: 11,
    color: COLORS.MUTED,
    marginTop: 2,
  },
  aiPanelScroll: {
    gap: 12,
    paddingRight: 10,
    paddingBottom: 4,
  },
  aiCard: {
    width: 150,
    backgroundColor: '#FCFCFF',
    borderWidth: 1,
    borderColor: '#EFEFFF',
    borderRadius: 14,
    padding: 8,
    position: 'relative',
    ...SHADOW,
  },
  aiMatchBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(126, 34, 206, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 10,
  },
  aiMatchText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  aiProductImage: {
    width: '100%',
    height: 90,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  aiProductImagePlaceholder: {
    width: '100%',
    height: 90,
    borderRadius: 10,
    backgroundColor: '#EDF1EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiProductInfo: {
    marginTop: 6,
    flex: 1,
    minHeight: 65,
  },
  aiProductName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  aiProductPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
    marginTop: 2,
  },
  aiProductReason: {
    fontSize: 9,
    fontWeight: '600',
    color: '#6B21A8',
    marginTop: 4,
    lineHeight: 12,
  },
  aiNavBtn: {
    backgroundColor: '#7E22CE',
    borderRadius: 8,
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
    ...SHADOW,
  },
  aiNavBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
