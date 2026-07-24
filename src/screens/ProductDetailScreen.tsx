import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

export const ProductDetailScreen: React.FC = () => {
  const { selectedProduct, navigate, cart, addToCart, changeQuantity, selectedCategory } = useApp();

  const product = selectedProduct;

  const itemInCart = useMemo(() => {
    if (!product) return null;
    return cart.find((item) => item.id === product.id) || null;
  }, [cart, product]);

  if (!product) {
    return (
      <View style={styles.errorScreen}>
        <Ionicons name="warning-outline" size={48} color={COLORS.RED} />
        <Text style={styles.errorText}>Không tìm thấy thông tin sản phẩm.</Text>
        <Pressable style={styles.backButtonLarge} onPress={() => navigate('home')}>
          <Text style={styles.backButtonLargeText}>Quay về trang chủ</Text>
        </Pressable>
      </View>
    );
  }

  const handleBack = () => {
    // Smart back destination
    if (selectedCategory) {
      navigate('catalog', { category: selectedCategory });
    } else {
      navigate('home');
    }
  };

  const handleAddOne = () => {
    addToCart(product, 1);
  };

  // Splitting shelf string: "Khu thực phẩm tươi - Dãy A3 - Kệ số 2"
  const shelfDetails = useMemo(() => {
    const parts = product.shelf.split(' - ');
    return {
      zone: parts[0] || 'Chưa xác định',
      row: parts[1] || 'Chưa xác định',
      shelfNo: parts[2] || 'Chưa xác định',
    };
  }, [product.shelf]);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>Chi tiết sản phẩm</Text>
        <Pressable style={styles.cartButton} onPress={() => navigate('cart')}>
          <Ionicons name="cart-outline" size={22} color={COLORS.TEXT} />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Image Card */}
        <View style={styles.imageContainer}>
          {product.image ? (
            <Image source={product.image} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={80} color="#A6B3A9" />
            </View>
          )}

          {!!product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>GIẢM {product.discount}%</Text>
            </View>
          )}
        </View>

        {/* Product Info Block */}
        <View style={styles.infoBlock}>
          {product.badge && (
            <View style={styles.badgeRow}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagBadgeText}>{product.badge}</Text>
              </View>
            </View>
          )}

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>

          {/* Pricing */}
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>{money(product.price)}</Text>
            {product.oldPrice && (
              <View style={styles.oldPriceWrapper}>
                <Text style={styles.oldPrice}>{money(product.oldPrice)}</Text>
                <Text style={styles.savingsText}>
                  Tiết kiệm {money(product.oldPrice - product.price)}
                </Text>
              </View>
            )}
          </View>

          {/* Stock status */}
          <View style={styles.stockRow}>
            <View style={[styles.stockDot, product.stock > 0 ? styles.stockDotIn : styles.stockDotOut]} />
            <Text style={[styles.stockText, product.stock > 0 ? styles.stockInText : styles.stockOutText]}>
              {product.stock > 0 ? `Còn hàng (Còn lại ${product.stock} sản phẩm)` : 'Hết hàng'}
            </Text>
          </View>
        </View>

        {/* Shelf location block */}
        <View style={styles.shelfBlock}>
          <View style={styles.shelfBlockHeader}>
            <Ionicons name="location-outline" size={20} color={COLORS.GREEN} />
            <Text style={styles.shelfBlockTitle}>Vị trí sản phẩm trên kệ</Text>
          </View>

          <View style={styles.shelfInfoGrid}>
            <View style={styles.shelfInfoItem}>
              <Text style={styles.shelfInfoLabel}>KHU VỰC</Text>
              <Text style={styles.shelfInfoValue}>{shelfDetails.zone}</Text>
            </View>
            <View style={styles.shelfInfoItem}>
              <Text style={styles.shelfInfoLabel}>DÃY HÀNG</Text>
              <Text style={styles.shelfInfoValue}>{shelfDetails.row}</Text>
            </View>
            <View style={styles.shelfInfoItem}>
              <Text style={styles.shelfInfoLabel}>SỐ KỆ</Text>
              <Text style={styles.shelfInfoValue}>{shelfDetails.shelfNo}</Text>
            </View>
          </View>

          <Pressable
            style={styles.mapButton}
            onPress={() => navigate('shelf_map', { product })}
          >
            <Ionicons name="map-outline" size={18} color="#FFFFFF" />
            <Text style={styles.mapButtonText}>Bắt đầu chỉ đường (Xem vị trí)</Text>
          </Pressable>
        </View>

        {/* Description block */}
        <View style={styles.descBlock}>
          <Text style={styles.descBlockTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.descText}>{product.description}</Text>
        </View>
      </ScrollView>

      {/* Bottom Fixed Action Bar */}
      <View style={styles.bottomBar}>
        {product.stock <= 0 ? (
          <View style={styles.outOfStockBtn}>
            <Text style={styles.outOfStockBtnText}>Đã hết hàng</Text>
          </View>
        ) : itemInCart ? (
          // Quantity changer if in cart
          <View style={styles.cartActionWrapper}>
            <View style={styles.inCartIndicator}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.DARK_GREEN} />
              <Text style={styles.inCartIndicatorText}>Đã có trong giỏ hàng</Text>
            </View>
            <View style={styles.quantityControl}>
              <Pressable
                style={styles.quantityBtn}
                onPress={() => changeQuantity(product.id, -1)}
              >
                <Ionicons name="remove" size={18} color={COLORS.GREEN} />
              </Pressable>
              <Text style={styles.quantityText}>{itemInCart.quantity}</Text>
              <Pressable
                style={styles.quantityBtnGreen}
                onPress={() => changeQuantity(product.id, 1)}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        ) : (
          // Big button if not in cart
          <Pressable style={styles.addToCartBtn} onPress={handleAddOne}>
            <Ionicons name="cart" size={20} color="#FFFFFF" />
            <Text style={styles.addToCartBtnText}>Thêm vào giỏ hàng</Text>
          </Pressable>
        )}
      </View>
    </View>
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
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.TEXT,
    maxWidth: '60%',
  },
  cartButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF2EE',
  },
  cartBadge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: COLORS.RED,
    minWidth: 16,
    height: 17,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...SHADOW,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8ECE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    right: 20,
    top: 20,
    backgroundColor: '#FF3E52',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  infoBlock: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOW,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tagBadge: {
    backgroundColor: COLORS.LIGHT_GREEN,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagBadgeText: {
    color: COLORS.DARK_GREEN,
    fontSize: 11,
    fontWeight: '800',
  },
  productName: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  productCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.MUTED,
    marginTop: 4,
  },
  priceRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  oldPriceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  oldPrice: {
    fontSize: 14,
    color: COLORS.MUTED,
    textDecorationLine: 'line-through',
  },
  savingsText: {
    fontSize: 11,
    color: COLORS.GREEN,
    fontWeight: '800',
    backgroundColor: '#E8F6EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockDotIn: {
    backgroundColor: '#40C057',
  },
  stockDotOut: {
    backgroundColor: COLORS.RED,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stockInText: {
    color: '#349e49',
  },
  stockOutText: {
    color: COLORS.RED,
  },
  shelfBlock: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOW,
  },
  shelfBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shelfBlockTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  shelfInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 12,
  },
  shelfInfoItem: {
    flex: 1,
  },
  shelfInfoLabel: {
    fontSize: 9,
    color: COLORS.MUTED,
    fontWeight: '800',
    marginBottom: 4,
  },
  shelfInfoValue: {
    fontSize: 13,
    color: COLORS.TEXT,
    fontWeight: '800',
  },
  mapButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    ...SHADOW,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  descBlock: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOW,
  },
  descBlockTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  descText: {
    fontSize: 13,
    color: COLORS.TEXT,
    lineHeight: 20,
    opacity: 0.85,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingHorizontal: 16,
    paddingBottom: 10,
    justifyContent: 'center',
    ...SHADOW,
  },
  addToCartBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOW,
  },
  addToCartBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  outOfStockBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EDF2EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockBtnText: {
    color: COLORS.MUTED,
    fontSize: 15,
    fontWeight: '700',
  },
  cartActionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inCartIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inCartIndicatorText: {
    fontSize: 12,
    color: COLORS.DARK_GREEN,
    fontWeight: '800',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: 20,
    padding: 2,
    backgroundColor: '#FAFCFA',
    gap: 12,
  },
  quantityBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  quantityBtnGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.GREEN,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  errorScreen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 14,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.MUTED,
    textAlign: 'center',
    fontWeight: '700',
  },
  backButtonLarge: {
    backgroundColor: COLORS.GREEN,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  backButtonLargeText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
