import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { AnimatedProgressBar } from '../components/ui/AnimatedProgressBar';
import { AnimatedPressable } from '../components/ui/AnimatedPressable';
import { PulseDot } from '../components/ui/PulseDot';
import { Reveal } from '../components/ui/Reveal';
import { CARD_SHADOW, COLORS, FLOAT_SHADOW, TOP_INSET, money } from '../components/Theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const categories: { label: string; icon: IconName; color: string }[] = [
  { label: 'Thực phẩm', icon: 'leaf-outline', color: '#E5F5CF' },
  { label: 'Đồ uống', icon: 'cafe-outline', color: '#E2F3FF' },
  { label: 'Chăm sóc', icon: 'sparkles-outline', color: '#FCE5ED' },
  { label: 'Gia dụng', icon: 'home-outline', color: '#FFF2D9' },
  { label: 'Khuyến mãi', icon: 'pricetag-outline', color: '#F2E8FF' },
];

export const HomeScreen: React.FC = () => {
  const { cart, session, navigate, addToCart, userRole, products, endSession, refreshProducts } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProducts();
    setRefreshing(false);
  };

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const totalQuantity = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const budget = session?.budget ?? 500000;
  const remaining = budget - totalPrice;
  const progress = Math.min(100, (totalPrice / budget) * 100);

  // Suggestions (non-discounted or high rating products)
  const suggestedProducts = useMemo(
    () => products.filter((p) => p.isActive !== false && !p.discount).slice(0, 4),
    [products]
  );

  // Discounted products
  const discountedProducts = useMemo(
    () => products.filter((p) => p.isActive !== false && p.discount !== undefined).slice(0, 4),
    [products]
  );

  const handleCategoryPress = (category: string) => {
    navigate('catalog', { category });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.homeScrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.GREEN]} />
        }
      >
        {/* Header */}
        <View style={styles.homeHeader}>
          <View style={styles.headerGlow} />
          <View style={styles.headerGlowSecondary} />
          <View style={styles.headerTopRow}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Text style={styles.welcomeSmall}>Xin chào,</Text>
                {userRole === 'vip' && (
                  <View style={styles.vipBadgeSmall}>
                    <Text style={styles.vipBadgeSmallText}>VIP HẠNG TÍM 👑</Text>
                  </View>
                )}
                {session?.userType === 'member' && (
                  <View style={[styles.vipBadgeSmall, { backgroundColor: COLORS.LIGHT_GREEN, borderColor: '#C3E6CB' }]}>
                    <Text style={[styles.vipBadgeSmallText, { color: COLORS.DARK_GREEN }]}>Hội viên: {session.loyaltyPoints}đ</Text>
                  </View>
                )}
              </View>
              <Text style={styles.welcomeName}>{session?.customerName || 'Khách hàng'}</Text>
            </View>
            <AnimatedPressable style={styles.notificationButton} onPress={() => endSession()}>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            </AnimatedPressable>
          </View>

          <View style={styles.cartStatusRow}>
            <View style={styles.connectedWrap}>
              <PulseDot size={9} color="#74E49C" />
              <Text style={styles.connectedText}>Xe {session?.cartCode || 'CART-038'}</Text>
              <Text style={styles.connectedMuted}>• Đã kết nối</Text>
            </View>
            <AnimatedPressable style={styles.headerCartPill} onPress={() => navigate('cart')}>
              <Ionicons name="cart" size={13} color={COLORS.DARK_GREEN} />
              <Text style={styles.headerCartText}>{totalQuantity} SP</Text>
            </AnimatedPressable>
          </View>
        </View>

        {/* Body */}
        <View style={styles.homeBody}>
          {/* Search bar mock */}
          <Reveal delay={120} distance={16}>
            <AnimatedPressable style={styles.searchBar} onPress={() => navigate('search')}>
              <View style={styles.searchIconCircle}>
                <Ionicons name="search" size={18} color={COLORS.DEEP_GREEN} />
              </View>
              <Text style={styles.searchPlaceholder}>Tìm kiếm rau quả, sữa, thịt bò...</Text>
              <View style={styles.searchKbd}>
                <Text style={styles.searchKbdText}>Tìm</Text>
              </View>
            </AnimatedPressable>
          </Reveal>

          {/* Banner with background image */}
          <Reveal delay={200} distance={22}>
            <ImageBackground
              source={require('../../image/background.png')}
              style={styles.promoBanner}
              imageStyle={styles.promoBannerImage}
            >
              {/* Translucent overlay to ensure maximum text legibility */}
              <View style={styles.promoBannerOverlay}>
                <View style={styles.todayBadge}>
                  <PulseDot size={7} color="#7A5B00" />
                  <Text style={styles.todayBadgeText}>SIÊU ƯU ĐÃI HÔM NAY</Text>
                </View>
                <Text style={styles.promoTitle}>
                  Giảm tới <Text style={styles.promoHighlight}>29%</Text>
                </Text>
                <View style={styles.promoBottomRow}>
                  <Text style={styles.promoSub}>Các sản phẩm tươi sống hữu cơ</Text>
                  <AnimatedPressable style={styles.buyNowButton} onPress={() => handleCategoryPress('Khuyến mãi')}>
                    <Text style={styles.buyNowText}>Mua ngay</Text>
                    <Ionicons name="chevron-forward" size={12} color={COLORS.DARK_GREEN} style={{ marginLeft: 2 }} />
                  </AnimatedPressable>
                </View>
              </View>
            </ImageBackground>
          </Reveal>

          {/* Categories */}
          <Reveal delay={280} distance={18}>
            <SectionTitle title="Danh mục sản phẩm" icon="grid-outline" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {categories.map((cat, idx) => (
                <AnimatedPressable
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
                </AnimatedPressable>
              ))}
            </ScrollView>
          </Reveal>

          {/* Suggested Products */}
          <Reveal delay={340} distance={20}>
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
                  <Reveal key={p.id} delay={360} distance={18}>
                    <ProductCard
                      product={p}
                      quantityInCart={inCart?.quantity || 0}
                      onAdd={() => addToCart(p)}
                      onPress={() => navigate('product_detail', { product: p })}
                    />
                  </Reveal>
                );
              })}
            </View>
          </Reveal>

          {/* Sales / Promo Products */}
          <Reveal delay={420} distance={20}>
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
                  <Reveal key={p.id} delay={440} distance={18}>
                    <ProductCard
                      product={p}
                      quantityInCart={inCart?.quantity || 0}
                      onAdd={() => addToCart(p)}
                      onPress={() => navigate('product_detail', { product: p })}
                    />
                  </Reveal>
                );
              })}
            </View>
          </Reveal>

          {/* Budget Card */}
          <Reveal delay={500} distance={22}>
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
            <AnimatedProgressBar progress={progress} danger={remaining < 0} />
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>0đ</Text>
              <Text style={styles.progressPercent}>{Math.round(progress)}% đã dùng</Text>
              <Text style={styles.progressLabel}>{money(budget)}</Text>
            </View>
          </View>
          </Reveal>
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
  const content = (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleLeft}>
        <View style={styles.sectionIconCircle}>
          <Ionicons name={icon} size={15} color={COLORS.DEEP_GREEN} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {onAction && (
        <View style={styles.sectionActionWrap}>
          <Text style={styles.sectionAction}>{actionText}</Text>
          <Ionicons name="chevron-forward" size={11} color={COLORS.DARK_GREEN} />
        </View>
      )}
    </View>
  );

  if (onAction) {
    return <AnimatedPressable onPress={onAction}>{content}</AnimatedPressable>;
  }

  return content;
};

// ProductCard is imported from components/ProductCard

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  homeScrollContent: {
    paddingBottom: 112,
  },
  headerGlow: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(163, 255, 190, 0.24)',
  },
  headerGlowSecondary: {
    position: 'absolute',
    left: -70,
    bottom: -90,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
  },
  homeHeader: {
    position: 'relative',
    backgroundColor: COLORS.DEEP_GREEN,
    paddingTop: TOP_INSET + 18,
    paddingHorizontal: 18,
    paddingBottom: 42,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
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
  vipBadgeSmall: {
    backgroundColor: '#7E22CE', // Purple VIP badge
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  vipBadgeSmallText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  welcomeName: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
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
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 18,
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  connectedWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 7,
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
    paddingHorizontal: 16,
    marginTop: -20,
  },
  searchBar: {
    height: 56,
    borderRadius: 20,
    backgroundColor: COLORS.CARD,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 10,
    ...CARD_SHADOW,
    borderWidth: 1,
    borderColor: COLORS.SOFT_BORDER,
  },
  searchIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.MINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchPlaceholder: {
    flex: 1,
    color: '#8A968D',
    fontSize: 14,
    fontWeight: '600',
  },
  searchKbd: {
    backgroundColor: COLORS.DEEP_GREEN,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  searchKbdText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  promoBanner: {
    minHeight: 148,
    borderRadius: 24,
    marginTop: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    ...CARD_SHADOW,
  },
  promoBannerImage: {
    resizeMode: 'cover',
  },
  promoBannerOverlay: {
    flex: 1,
    padding: 18,
    backgroundColor: 'rgba(13, 55, 24, 0.58)', // Translucent brand overlay for maximum legibility and harmony
  },
  todayBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.GOLD,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  todayBadgeText: {
    color: '#7A5B00',
    fontSize: 9,
    fontWeight: '900',
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    lineHeight: 28,
    fontWeight: '900',
    marginTop: 10,
    letterSpacing: 0.2,
  },
  promoHighlight: {
    color: '#FFE75D',
    fontSize: 23,
    lineHeight: 26,
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
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 10,
    ...FLOAT_SHADOW,
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
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.MINT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(47,145,67,0.18)',
  },
  sectionTitle: {
    color: COLORS.TEXT,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.15,
  },
  sectionActionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.MINT,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 2,
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
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(26,95,44,0.08)',
    ...CARD_SHADOW,
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
    gap: 10,
  },
  budgetCard: {
    marginTop: 18,
    marginBottom: 12,
    backgroundColor: COLORS.CARD,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.SOFT_BORDER,
    padding: 18,
    ...CARD_SHADOW,
  },
  budgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.MINT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(47,145,67,0.22)',
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
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
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
