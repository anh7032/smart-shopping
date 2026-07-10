import React, { useMemo } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { mockProducts } from '../data/mockProducts';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const categories: { label: string; icon: IconName; color: string }[] = [
  { label: 'Thực phẩm', icon: 'leaf-outline', color: '#E5F5CF' },
  { label: 'Đồ uống', icon: 'cafe-outline', color: '#E2F3FF' },
  { label: 'Chăm sóc', icon: 'sparkles-outline', color: '#FCE5ED' },
  { label: 'Gia dụng', icon: 'home-outline', color: '#FFF2D9' },
  { label: 'Khuyến mãi', icon: 'pricetag-outline', color: '#F2E8FF' },
];

export const HomeScreen: React.FC = () => {
  const { cart, session, navigate, addToCart } = useApp();

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const totalQuantity = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const budget = session?.budget || 500000;
  const remaining = budget - totalPrice;
  const progress = Math.min(100, (totalPrice / budget) * 100);

  // Suggestions (non-discounted or high rating products)
  const suggestedProducts = useMemo(
    () => mockProducts.filter((p) => !p.discount).slice(0, 4),
    []
  );

  // Discounted products
  const discountedProducts = useMemo(
    () => mockProducts.filter((p) => p.discount !== undefined).slice(0, 4),
    []
  );

  const handleCategoryPress = (category: string) => {
    navigate('catalog', { category });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.homeScrollContent}
      >
        {/* Header */}
        <View style={styles.homeHeader}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.welcomeSmall}>Xin chào,</Text>
              <Text style={styles.welcomeName}>{session?.customerName || 'Khách hàng'}</Text>
            </View>
            <Pressable style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
              <View style={styles.notificationDot} />
            </Pressable>
          </View>

          <View style={styles.cartStatusRow}>
            <View style={styles.connectedWrap}>
              <View style={styles.connectedDot} />
              <Text style={styles.connectedText}>Xe {session?.cartCode || 'CART-038'}</Text>
              <Text style={styles.connectedMuted}>• Đã kết nối</Text>
            </View>
            <Pressable style={styles.headerCartPill} onPress={() => navigate('cart')}>
              <Ionicons name="cart" size={13} color={COLORS.DARK_GREEN} />
              <Text style={styles.headerCartText}>{totalQuantity} SP</Text>
            </Pressable>
          </View>
        </View>

        {/* Body */}
        <View style={styles.homeBody}>
          {/* Search bar mock */}
          <Pressable style={styles.searchBar} onPress={() => navigate('search')}>
            <Ionicons name="search" size={19} color="#7A8B7E" />
            <Text style={styles.searchPlaceholder}>Tìm kiếm rau quả, sữa, thịt bò...</Text>
          </Pressable>

          {/* Banner */}
          <View style={styles.promoBanner}>
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>SIÊU ƯU ĐÃI HÔM NAY</Text>
            </View>
            <Text style={styles.promoTitle}>
              Giảm tới <Text style={styles.promoHighlight}>29%</Text>
            </Text>
            <View style={styles.promoBottomRow}>
              <Text style={styles.promoSub}>Các sản phẩm tươi sống hữu cơ</Text>
              <Pressable style={styles.buyNowButton} onPress={() => handleCategoryPress('Khuyến mãi')}>
                <Text style={styles.buyNowText}>Mua ngay</Text>
                <Ionicons name="chevron-forward" size={12} color={COLORS.DARK_GREEN} style={{ marginLeft: 2 }} />
              </Pressable>
            </View>
          </View>

          {/* Categories */}
          <SectionTitle title="Danh mục sản phẩm" icon="grid-outline" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {categories.map((cat, idx) => (
              <Pressable
                key={idx}
                style={styles.categoryItem}
                onPress={() => handleCategoryPress(cat.label)}
              >
                <View style={[styles.categoryIconBox, { backgroundColor: cat.color }]}>
                  <Ionicons name={cat.icon} size={22} color={COLORS.DARK_GREEN} />
                </View>
                <Text style={styles.categoryLabel} numberOfLines={1}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Suggested Products */}
          <SectionTitle
            title="Sản phẩm gợi ý"
            icon="sparkles-outline"
            onAction={() => handleCategoryPress('Tất cả')}
            actionText="Xem tất cả"
          />
          <View style={styles.productGrid}>
            {suggestedProducts.map((p) => {
              const inCart = cart.find((item) => item.id === p.id);
              return (
                <ProductCard
                  key={p.id}
                  product={p}
                  quantityInCart={inCart?.quantity || 0}
                  onAdd={() => addToCart(p)}
                  onPress={() => navigate('product_detail', { product: p })}
                />
              );
            })}
          </View>

          {/* Sales / Promo Products */}
          <SectionTitle
            title="Đang khuyến mãi"
            icon="pricetag-outline"
            onAction={() => handleCategoryPress('Khuyến mãi')}
            actionText="Xem tất cả"
          />
          <View style={styles.productGrid}>
            {discountedProducts.map((p) => {
              const inCart = cart.find((item) => item.id === p.id);
              return (
                <ProductCard
                  key={p.id}
                  product={p}
                  quantityInCart={inCart?.quantity || 0}
                  onAdd={() => addToCart(p)}
                  onPress={() => navigate('product_detail', { product: p })}
                />
              );
            })}
          </View>

          {/* Budget Card */}
          <View style={styles.budgetCard}>
            <View style={styles.budgetTitleRow}>
              <View style={styles.budgetIconCircle}>
                <Ionicons name="wallet-outline" size={15} color={COLORS.GREEN} />
              </View>
              <Text style={styles.budgetTitle}>Kiểm soát ngân sách</Text>
              <View style={styles.todayPill}>
                <Text style={styles.todayPillText}>Hôm nay</Text>
              </View>
            </View>

            <View style={styles.budgetValuesRow}>
              <View style={styles.budgetValueBox}>
                <Text style={styles.budgetValueLabel}>ĐÃ TIÊU</Text>
                <Text style={[styles.budgetValue, totalPrice > budget && styles.budgetDanger]}>
                  {money(totalPrice)}
                </Text>
              </View>
              <View style={styles.budgetValueBox}>
                <Text style={styles.budgetValueLabel}>NGÂN SÁCH DỰ KIẾN</Text>
                <Text style={styles.budgetValue}>{money(budget)}</Text>
              </View>
              <View style={[styles.budgetValueBox, { alignItems: 'flex-end' }]}>
                <Text style={styles.budgetValueLabel}>
                  {remaining < 0 ? 'VƯỢT MỨC' : 'CÒN LẠI'}
                </Text>
                <Text
                  style={[
                    styles.budgetValue,
                    remaining < 0 ? styles.budgetDanger : styles.budgetSuccess,
                  ]}
                >
                  {money(Math.abs(remaining))}
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` },
                  remaining < 0 && { backgroundColor: COLORS.RED },
                ]}
              />
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
};

// Subcomponent: SectionTitle
interface SectionTitleProps {
  title: string;
  icon: IconName;
  onAction?: () => void;
  actionText?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  icon,
  onAction,
  actionText,
}) => {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleLeft}>
        <Ionicons name={icon} size={16} color={COLORS.GREEN} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {onAction && (
        <Pressable style={styles.sectionActionWrap} onPress={onAction}>
          <Text style={styles.sectionAction}>{actionText}</Text>
          <Ionicons name="chevron-forward" size={11} color={COLORS.DARK_GREEN} />
        </Pressable>
      )}
    </View>
  );
};

// ProductCard is imported from components/ProductCard

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 10;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  homeScrollContent: {
    paddingBottom: 112,
  },
  homeHeader: {
    backgroundColor: COLORS.GREEN,
    paddingTop: TOP_INSET + 18,
    paddingHorizontal: 18,
    paddingBottom: 38,
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
    color: COLORS.DARK_GREEN,
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
    ...SHADOW,
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
    color: COLORS.DARK_GREEN,
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
    color: COLORS.TEXT,
    fontSize: 16,
    fontWeight: '900',
  },
  sectionActionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionAction: {
    color: COLORS.DARK_GREEN,
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
    borderColor: COLORS.BORDER,
    ...SHADOW,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#E8ECE9',
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
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
    backgroundColor: COLORS.GREEN,
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
    color: COLORS.TEXT,
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
    color: COLORS.MUTED,
    fontSize: 9,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    marginTop: 8,
  },
  productPrice: {
    color: COLORS.DARK_GREEN,
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
    backgroundColor: COLORS.GREEN,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  addedButton: {
    backgroundColor: '#F0FAF2',
    borderWidth: 1,
    borderColor: COLORS.GREEN,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  addedButtonText: {
    color: COLORS.DARK_GREEN,
  },
  budgetCard: {
    marginTop: 14,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 14,
    ...SHADOW,
  },
  budgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetTitle: {
    color: COLORS.TEXT,
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
    color: COLORS.MUTED,
    fontSize: 9,
    marginBottom: 4,
  },
  budgetValue: {
    color: COLORS.TEXT,
    fontSize: 13,
    fontWeight: '900',
  },
  budgetDanger: {
    color: COLORS.RED,
  },
  budgetSuccess: {
    color: COLORS.DARK_GREEN,
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
    backgroundColor: COLORS.GREEN,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  progressLabel: {
    color: COLORS.MUTED,
    fontSize: 8,
  },
  progressPercent: {
    color: COLORS.DARK_GREEN,
    fontSize: 8,
    fontWeight: '700',
  },
});
