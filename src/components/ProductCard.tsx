import React from 'react';
import { Pressable, View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { COLORS, SHADOW, money } from './Theme';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAdd: () => void;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onAdd,
  onPress,
}) => {
  return (
    <Pressable style={styles.productCard} onPress={onPress}>
      {product.image ? (
        <Image source={product.image} style={styles.productImage} />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="image-outline" size={32} color="#A6B3A9" />
          </View>
        </View>
      )}

      {product.discount ? (
        <View style={styles.discountBadge}>
          <Text style={styles.discountBadgeText}>-{product.discount}%</Text>
        </View>
      ) : product.badge ? (
        <View style={styles.productBadge}>
          <Text style={styles.productBadgeText}>{product.badge}</Text>
        </View>
      ) : null}

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.productMetaRow}>
          <Ionicons name="location-outline" size={10} color={COLORS.MUTED} />
          <Text style={styles.productMeta} numberOfLines={1}>
            {product.shelf.split(' - ')[1] || product.shelf}
          </Text>
        </View>

        <View style={styles.productMetaRow}>
          <Ionicons name="cube-outline" size={10} color={COLORS.MUTED} />
          <Text style={styles.productMeta}>Tồn: {product.stock}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{money(product.price)}</Text>
          {product.oldPrice && (
            <Text style={styles.oldPrice}>{money(product.oldPrice)}</Text>
          )}
        </View>

        {/* Double Actions Row: Chi tiết & Quét mã */}
        <View style={styles.buttonRow}>
          <Pressable style={styles.detailButton} onPress={onPress}>
            <Ionicons name="information-circle-outline" size={11} color={COLORS.GREEN} />
            <Text style={styles.detailButtonText} numberOfLines={1}>Chi tiết</Text>
          </Pressable>

          <Pressable
            style={[styles.scanButton, quantityInCart > 0 && styles.scannedButton]}
            onPress={(e) => {
              e.stopPropagation();
              onAdd();
            }}
          >
            <Ionicons
              name={quantityInCart > 0 ? 'checkmark' : 'scan-outline'}
              size={11}
              color={quantityInCart > 0 ? COLORS.DARK_GREEN : '#FFFFFF'}
            />
            <Text
              style={[styles.scanButtonText, quantityInCart > 0 && styles.scannedButtonText]}
              numberOfLines={1}
            >
              {quantityInCart > 0 ? `Đã quét (${quantityInCart})` : 'Quét mã'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 10;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

const styles = StyleSheet.create({
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
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 5,
  },
  detailButton: {
    flex: 1,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.GREEN,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  detailButtonText: {
    color: COLORS.GREEN,
    fontSize: 9,
    fontWeight: '800',
  },
  scanButton: {
    flex: 1.1,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  scannedButton: {
    backgroundColor: '#F0FAF2',
    borderWidth: 1,
    borderColor: COLORS.GREEN,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  scannedButtonText: {
    color: COLORS.DARK_GREEN,
  },
});
