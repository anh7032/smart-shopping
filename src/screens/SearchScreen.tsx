import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { COLORS, SHADOW, TOP_INSET } from '../components/Theme';

export const SearchScreen: React.FC = () => {
  const { navigate, cart, addToCart, products } = useApp();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Auto-focus input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  // Handle mock typing delay for a premium feel
  useEffect(() => {
    if (query.trim() === '') {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const delayDebounce = setTimeout(() => {
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Case-insensitive search across name and description
  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed === '') return [];

    return products.filter((product) => {
      const matchesSearch = (
        product.name.toLowerCase().includes(trimmed) ||
        product.description.toLowerCase().includes(trimmed) ||
        product.category.toLowerCase().includes(trimmed) ||
        product.barcode.includes(trimmed)
      );
      return matchesSearch && product.isActive !== false;
    });
  }, [query, products]);

  const handleClearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <View style={styles.screen}>
      {/* Search Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('home')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>

        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={18} color={COLORS.MUTED} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Tìm kiếm rau quả, sữa, thịt bò..."
            placeholderTextColor="#A1AEA5"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.trim().length > 0 && (
            <Pressable style={styles.clearButton} onPress={handleClearQuery}>
              <Ionicons name="close-circle" size={18} color={COLORS.MUTED} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.GREEN} />
            <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
          </View>
        ) : query.trim() === '' ? (
          // Suggestions/Recent searches
          <View style={styles.introContainer}>
            <Text style={styles.introTitle}>Từ khóa tìm kiếm phổ biến</Text>
            <View style={styles.tagGrid}>
              {['sữa', 'rau', 'nước cam', 'thịt bò', 'dầu gội', 'bánh mì'].map((tag) => (
                <Pressable
                  key={tag}
                  style={styles.tagButton}
                  onPress={() => setQuery(tag)}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : searchResults.length === 0 ? (
          // Empty State
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color={COLORS.MUTED} />
            <Text style={styles.emptyTitle}>Không tìm thấy kết quả nào</Text>
            <Text style={styles.emptySub}>
              Chúng tôi không tìm thấy sản phẩm "{query}". Vui lòng thử lại bằng từ khóa khác.
            </Text>
            <Pressable style={styles.clearSearchBtn} onPress={handleClearQuery}>
              <Text style={styles.clearSearchText}>Xóa từ khóa</Text>
            </Pressable>
          </View>
        ) : (
          // Results list
          <View>
            <Text style={styles.resultTitle}>
              Kết quả tìm kiếm cho "{query}" ({searchResults.length} sản phẩm)
            </Text>
            <View style={styles.productGrid}>
              {searchResults.map((product) => {
                const inCart = cart.find((item) => item.id === product.id);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantityInCart={inCart?.quantity || 0}
                    onAdd={() => addToCart(product)}
                    onPress={() => navigate('product_detail', { product })}
                  />
                );
              })}
            </View>
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
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: TOP_INSET + 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    ...SHADOW,
  },
  backButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF2EE',
  },
  searchBarWrapper: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT,
    fontWeight: '600',
    height: '100%',
  },
  clearButton: {
    padding: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.MUTED,
    fontWeight: '600',
  },
  introContainer: {
    marginTop: 10,
  },
  introTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 12,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.MUTED,
    textAlign: 'center',
    lineHeight: 20,
  },
  clearSearchBtn: {
    backgroundColor: COLORS.GREEN,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 12,
  },
  clearSearchText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.MUTED,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
