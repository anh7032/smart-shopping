import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { mockProducts } from '../data/mockProducts';
import { ProductCard } from '../components/ProductCard';
import { COLORS, SHADOW, TOP_INSET } from '../components/Theme';

const CATEGORIES_LIST = ['Tất cả', 'Thực phẩm', 'Đồ uống', 'Chăm sóc', 'Gia dụng', 'Khuyến mãi'];

export const CatalogScreen: React.FC = () => {
  const { selectedCategory, navigate, cart, addToCart } = useApp();

  const currentCategory = selectedCategory || 'Tất cả';

  const filteredProducts = useMemo(() => {
    if (currentCategory === 'Tất cả') {
      return mockProducts;
    }
    if (currentCategory === 'Khuyến mãi') {
      return mockProducts.filter((p) => p.discount !== undefined);
    }
    // Handle "Chăm sóc" matching "Chăm sóc cá nhân"
    return mockProducts.filter((p) => 
      p.category.toLowerCase().includes(currentCategory.toLowerCase())
    );
  }, [currentCategory]);

  const handleCategorySelect = (category: string) => {
    navigate('catalog', { category });
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('home')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>{currentCategory}</Text>
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

      {/* Horizontal Category Selector */}
      <View style={styles.selectorWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectorScroll}
        >
          {CATEGORIES_LIST.map((cat) => {
            const isActive = currentCategory === cat;
            return (
              <Pressable
                key={cat}
                style={[styles.catTab, isActive && styles.catTabActive]}
                onPress={() => handleCategorySelect(cat)}
              >
                <Text style={[styles.catTabText, isActive && styles.catTabTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Product Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.resultCount}>
          Hiển thị {filteredProducts.length} sản phẩm
        </Text>

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color={COLORS.MUTED} />
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào trong danh mục này.</Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {filteredProducts.map((p) => {
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
        )}
      </ScrollView>
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
  selectorWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  selectorScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  catTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
  },
  catTabActive: {
    borderColor: COLORS.GREEN,
    backgroundColor: COLORS.LIGHT_GREEN,
  },
  catTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  catTabTextActive: {
    color: COLORS.DARK_GREEN,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  resultCount: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.MUTED,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.MUTED,
    textAlign: 'center',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
