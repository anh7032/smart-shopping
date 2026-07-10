import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { mockProducts } from '../data/mockProducts';
import { Product } from '../types';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

export const ScanScreen: React.FC = () => {
  const { addToCart, navigate } = useApp();
  const [manualCode, setManualCode] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [scanQty, setScanQty] = useState(1);

  // Search product by barcode
  const handleBarcodeSearch = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) {
      Alert.alert('Nhập mã', 'Vui lòng nhập mã barcode hoặc quét mã.');
      return;
    }

    const product = mockProducts.find((p) => p.barcode === trimmed);
    if (product) {
      setScannedProduct(product);
      setScanQty(1);
    } else {
      Alert.alert(
        'Lỗi quét mã',
        `Mã sản phẩm "${trimmed}" không tồn tại trong hệ thống siêu thị.`
      );
    }
  };

  const handleSimulateScan = (barcode: string) => {
    handleBarcodeSearch(barcode);
  };

  const handleConfirmAdd = () => {
    if (!scannedProduct) return;

    if (scanQty > scannedProduct.stock) {
      Alert.alert(
        'Vượt quá tồn kho',
        `Sản phẩm này chỉ còn ${scannedProduct.stock} cái trong kho.`
      );
      return;
    }

    addToCart(scannedProduct, scanQty);
    Alert.alert(
      'Đã thêm sản phẩm',
      `Đã thêm ${scanQty} x ${scannedProduct.name} vào giỏ hàng thành công!`,
      [
        {
          text: 'Tiếp tục quét',
          onPress: () => {
            setScannedProduct(null);
            setManualCode('');
          },
        },
        {
          text: 'Xem giỏ hàng',
          onPress: () => {
            setScannedProduct(null);
            setManualCode('');
            navigate('cart');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('home')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Quét sản phẩm</Text>
        <View style={{ width: 35 }} />
      </View>

      <View style={styles.content}>
        {scannedProduct ? (
          /* Scanned Product Modal/Detail View */
          <View style={styles.scannedCard}>
            <View style={styles.scannedHeader}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.GREEN} />
              <Text style={styles.scannedHeaderTitle}>Quét thành công!</Text>
            </View>

            <View style={styles.scannedProductRow}>
              {scannedProduct.image ? (
                <Image source={scannedProduct.image} style={styles.scannedImage} />
              ) : (
                <View style={styles.scannedImagePlaceholder}>
                  <Ionicons name="image-outline" size={32} color="#A6B3A9" />
                </View>
              )}
              <View style={styles.scannedInfo}>
                <Text style={styles.scannedProductName} numberOfLines={2}>
                  {scannedProduct.name}
                </Text>
                <Text style={styles.scannedProductShelf}>
                  Kệ: {scannedProduct.shelf.split(' - ')[1] || scannedProduct.shelf}
                </Text>
                <Text style={styles.scannedProductPrice}>
                  {money(scannedProduct.price)}
                </Text>
              </View>
            </View>

            {/* Quantity Selector */}
            <View style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>Chọn số lượng:</Text>
              <View style={styles.quantityControl}>
                <Pressable
                  style={styles.quantityBtn}
                  onPress={() => setScanQty(Math.max(1, scanQty - 1))}
                >
                  <Ionicons name="remove" size={16} color={COLORS.GREEN} />
                </Pressable>
                <Text style={styles.quantityText}>{scanQty}</Text>
                <Pressable
                  style={styles.quantityBtnGreen}
                  onPress={() => setScanQty(Math.min(scannedProduct.stock, scanQty + 1))}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>

            <View style={styles.scannedButtons}>
              <Pressable
                style={styles.scannedCancelBtn}
                onPress={() => {
                  setScannedProduct(null);
                  setManualCode('');
                }}
              >
                <Text style={styles.scannedCancelText}>Quét lại</Text>
              </Pressable>
              <Pressable style={styles.scannedAddBtn} onPress={handleConfirmAdd}>
                <Text style={styles.scannedAddText}>Thêm vào giỏ</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* Normal Scanner View */
          <View style={styles.scannerWrapper}>
            {/* Viewfinder area */}
            <View style={styles.viewfinder}>
              {/* Corner brackets */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              {/* Neon Green Laser Indicator */}
              <View style={styles.laserLine} />

              <Ionicons name="scan-outline" size={54} color="rgba(255,255,255,0.4)" />
              <Text style={styles.viewfinderText}>Đặt mã barcode vào giữa khung hình</Text>
            </View>

            {/* Manual input */}
            <View style={styles.manualInputCard}>
              <Text style={styles.manualTitle}>Nhập mã barcode thủ công</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập dãy số dưới barcode..."
                  placeholderTextColor="#A1AEA5"
                  keyboardType="number-pad"
                  value={manualCode}
                  onChangeText={setManualCode}
                />
                <Pressable
                  style={styles.searchBtn}
                  onPress={() => handleBarcodeSearch(manualCode)}
                >
                  <Text style={styles.searchBtnText}>Tìm</Text>
                </Pressable>
              </View>
            </View>

            {/* Quick simulation buttons */}
            <View style={styles.simulationCard}>
              <Text style={styles.simTitle}>Mô phỏng quét mã (Tất cả {mockProducts.length} sản phẩm)</Text>
              <ScrollView style={styles.simScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.simGrid}>
                  {mockProducts.map((p) => (
                    <Pressable
                      key={p.id}
                      style={styles.simButton}
                      onPress={() => handleSimulateScan(p.barcode)}
                    >
                      <Text style={styles.simButtonText} numberOfLines={1}>
                        Quét {p.name}
                      </Text>
                    </Pressable>
                  ))}
                  <Pressable
                    style={[styles.simButton, styles.simButtonError]}
                    onPress={() => handleSimulateScan('9999999999999')} // Mã lỗi
                  >
                    <Text style={[styles.simButtonText, styles.simButtonTextError]} numberOfLines={1}>
                      Mã lỗi (Không tồn tại)
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#1E2B21', // Darker background to simulate camera overlay context
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
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  scannerWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  viewfinder: {
    height: 220,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  laserLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: '#40C057',
    shadowColor: '#40C057',
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
    top: '40%', // Visual mockup sliding line
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#40C057',
    borderWidth: 4,
  },
  topLeft: {
    top: 15,
    left: 15,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 15,
    right: 15,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 15,
    left: 15,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 15,
    right: 15,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  viewfinderText: {
    color: '#D2DDD4',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 14,
  },
  manualInputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    ...SHADOW,
  },
  manualTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  inputWrapper: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT,
    fontWeight: '600',
    paddingHorizontal: 12,
  },
  searchBtn: {
    backgroundColor: COLORS.GREEN,
    height: '100%',
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  simulationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    ...SHADOW,
  },
  simTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  simScroll: {
    maxHeight: 185,
    marginTop: 4,
  },
  simGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  simButton: {
    flex: 1,
    minWidth: '45%',
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simButtonError: {
    borderColor: '#FFA8A8',
    backgroundColor: '#FFF5F5',
  },
  simButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  simButtonTextError: {
    color: COLORS.RED,
  },

  /* Scanned Product Detail View */
  scannedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOW,
  },
  scannedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
    paddingBottom: 14,
  },
  scannedHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  scannedProductRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 14,
  },
  scannedImage: {
    width: 90,
    height: 90,
    borderRadius: 14,
    resizeMode: 'cover',
  },
  scannedImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 14,
    backgroundColor: '#E8ECE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannedInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  scannedProductName: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  scannedProductShelf: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
    marginTop: 4,
  },
  scannedProductPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
    marginTop: 6,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
  },
  quantityLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.TEXT,
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
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  scannedButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  scannedCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: COLORS.GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannedCancelText: {
    color: COLORS.GREEN,
    fontWeight: '800',
    fontSize: 14,
  },
  scannedAddBtn: {
    flex: 1.2,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  scannedAddText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
