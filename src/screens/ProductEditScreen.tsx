import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, Switch, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

export const ProductEditScreen: React.FC = () => {
  const { selectedProduct, products, updateProduct, navigate, logAuditAction } = useApp();

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [priceStr, setPriceStr] = useState('0');
  const [promoPriceStr, setPromoPriceStr] = useState('');
  const [stockStr, setStockStr] = useState('0');
  const [shelfLocation, setShelfLocation] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Populate form with selectedProduct on mount
  useEffect(() => {
    if (selectedProduct) {
      setName(selectedProduct.name);
      setSku(selectedProduct.sku || '');
      setCategory(selectedProduct.category);
      setPriceStr(selectedProduct.price.toString());
      setPromoPriceStr(selectedProduct.oldPrice ? selectedProduct.price.toString() : '');
      // Wait, let's look at how oldPrice and discount are handled in mockProducts:
      // In mockProducts: price is the ACTIVE selling price (e.g. 35000), and oldPrice is original (e.g. 45000) when there is a discount.
      // So price is the selling price, and oldPrice is the original price.
      // Let's support editing both: original selling price and promotional price (if any).
      // Let's map oldPrice and price clearly:
      // If there is a discount: p.oldPrice is original price, p.price is promotional price.
      // If no discount: p.price is regular price, oldPrice is undefined.
      // So let's ask the user for "Regular Price" and "Discounted Price (optional)".
      // If "Discounted Price" is provided, we set price = discounted price, oldPrice = regular price, discount = percentage.
      // If not, we set price = regular price, oldPrice = undefined, discount = undefined. This is extremely clear and correct!
      const isPromo = selectedProduct.oldPrice !== undefined;
      const regularPrice = (isPromo ? selectedProduct.oldPrice : selectedProduct.price) ?? selectedProduct.price;
      const promoPrice = isPromo ? selectedProduct.price : undefined;

      setPriceStr(regularPrice.toString());
      setPromoPriceStr(promoPrice ? promoPrice.toString() : '');
      setStockStr(selectedProduct.stock.toString());
      setShelfLocation(selectedProduct.shelf);
      setIsActive(selectedProduct.isActive !== false);
    }
  }, [selectedProduct]);

  if (!selectedProduct) {
    return (
      <SafeAreaView style={styles.errorScreen}>
        <Ionicons name="warning-outline" size={48} color={COLORS.RED} />
        <Text style={styles.errorText}>Không tìm thấy sản phẩm cần chỉnh sửa.</Text>
        <Pressable style={styles.backBtnLarge} onPress={() => navigate('product_management')}>
          <Text style={styles.backBtnLargeText}>Quay lại quản lý</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    // 1. Validations
    if (name.trim() === '') {
      Alert.alert('Lỗi nhập liệu', 'Tên sản phẩm không được để trống.');
      return;
    }

    const regPrice = parseInt(priceStr);
    if (isNaN(regPrice) || regPrice < 0) {
      Alert.alert('Lỗi nhập liệu', 'Giá gốc phải lớn hơn hoặc bằng 0đ.');
      return;
    }

    let finalPrice = regPrice;
    let finalOldPrice: number | undefined = undefined;
    let finalDiscount: number | undefined = undefined;

    if (promoPriceStr.trim() !== '') {
      const pPrice = parseInt(promoPriceStr);
      if (isNaN(pPrice) || pPrice < 0) {
        Alert.alert('Lỗi nhập liệu', 'Giá khuyến mãi phải là số hợp lệ.');
        return;
      }
      if (pPrice > regPrice) {
        Alert.alert('Lỗi nhập liệu', 'Giá khuyến mãi không được lớn hơn giá gốc.');
        return;
      }
      // Set promo prices
      finalPrice = pPrice;
      finalOldPrice = regPrice;
      finalDiscount = Math.round(((regPrice - pPrice) / regPrice) * 100);
    }

    const stockVal = parseInt(stockStr);
    if (isNaN(stockVal) || stockVal < 0) {
      Alert.alert('Lỗi nhập liệu', 'Tồn kho không được nhỏ hơn 0.');
      return;
    }

    if (sku.trim() === '') {
      Alert.alert('Lỗi nhập liệu', 'Mã SKU không được để trống.');
      return;
    }

    // Check SKU uniqueness
    const skuDuplicate = products.find((p) => p.sku === sku.trim() && p.id !== selectedProduct.id);
    if (skuDuplicate) {
      Alert.alert('Lỗi nhập liệu', `Mã SKU "${sku}" đã trùng với sản phẩm "${skuDuplicate.name}". Vui lòng chọn SKU khác.`);
      return;
    }

    if (shelfLocation.trim() === '') {
      Alert.alert('Lỗi nhập liệu', 'Vị trí kệ hàng không được để trống.');
      return;
    }

    // 2. Save product updates
    const updatedProduct: Product = {
      ...selectedProduct,
      name: name.trim(),
      sku: sku.trim(),
      category: category.trim(),
      price: finalPrice,
      oldPrice: finalOldPrice,
      discount: finalDiscount,
      stock: stockVal,
      shelf: shelfLocation.trim(),
      isActive,
    };

    await updateProduct(updatedProduct);

    // 3. Log Audit log
    await logAuditAction(
      'PRODUCT_UPDATED',
      selectedProduct.id,
      `Đã cập nhật thông tin chi tiết sản phẩm "${updatedProduct.name}" (SKU: ${updatedProduct.sku})`
    );

    Alert.alert('Thành công 🎉', 'Đã lưu thay đổi thông tin sản phẩm!', [
      {
        text: 'OK',
        onPress: () => navigate('product_management'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('product_management')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Chỉnh sửa sản phẩm</Text>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Lưu</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.formSectionTitle}>Thông tin cơ bản</Text>

          {/* Product Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tên sản phẩm *</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Ví dụ: Rau cải xanh organic..."
              placeholderTextColor="#A1AEA5"
            />
          </View>

          {/* SKU & Category */}
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Mã SKU *</Text>
              <TextInput
                style={styles.textInput}
                value={sku}
                onChangeText={setSku}
                placeholder="SKU-VEG-001"
                placeholderTextColor="#A1AEA5"
                autoCapitalize="characters"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Danh mục *</Text>
              <TextInput
                style={styles.textInput}
                value={category}
                onChangeText={setCategory}
                placeholder="Thực phẩm"
                placeholderTextColor="#A1AEA5"
              />
            </View>
          </View>

          {/* Regular Price & Promo Price */}
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Giá gốc (VND) *</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={priceStr}
                onChangeText={setPriceStr}
                placeholder="18000"
                placeholderTextColor="#A1AEA5"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Giá khuyến mãi (VND)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={promoPriceStr}
                onChangeText={setPromoPriceStr}
                placeholder="Không có"
                placeholderTextColor="#A1AEA5"
              />
            </View>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formSectionTitle}>Kho & Quản lý kệ hàng</Text>

          {/* Stock & Location */}
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Số lượng tồn kho *</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={stockStr}
                onChangeText={setStockStr}
                placeholder="25"
                placeholderTextColor="#A1AEA5"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1.5 }]}>
              <Text style={styles.inputLabel}>Vị trí kệ hàng (Shelf) *</Text>
              <TextInput
                style={styles.textInput}
                value={shelfLocation}
                onChangeText={setShelfLocation}
                placeholder="Khu thực phẩm tươi - Dãy A3 - Kệ số 2"
                placeholderTextColor="#A1AEA5"
              />
            </View>
          </View>

          {/* Status switch */}
          <View style={styles.switchRow}>
            <View style={styles.switchTextWrap}>
              <Text style={styles.switchLabel}>Trạng thái kinh doanh</Text>
              <Text style={styles.switchSub}>Vô hiệu hóa sản phẩm để ẩn khỏi Customer Search/Cart</Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#ECECEC', true: COLORS.GREEN }}
              thumbColor={isActive ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Informative info */}
        <Text style={styles.infoMutedText}>* Các thay đổi sẽ có hiệu lực ngay lập tức trong cơ sở dữ liệu giả lập và đồng bộ với giỏ hàng của khách hàng.</Text>
      </ScrollView>
    </SafeAreaView>
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
    ...SHADOW,
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
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  saveBtn: {
    backgroundColor: COLORS.GREEN,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 16,
    marginBottom: 14,
    ...SHADOW,
  },
  formSectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.GREEN,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 12,
    gap: 6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  textInput: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.TEXT,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
    marginTop: 10,
    paddingTop: 12,
  },
  switchTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  switchSub: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 14,
  },
  infoMutedText: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '600',
    lineHeight: 16,
    paddingHorizontal: 10,
    textAlign: 'center',
  },

  /* Errors */
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
  backBtnLarge: {
    backgroundColor: COLORS.GREEN,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  backBtnLargeText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
