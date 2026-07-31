import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductImageProps {
  source: any;
  imageStyle: StyleProp<ImageStyle>;
  placeholderStyle: StyleProp<ViewStyle>;
  iconSize?: number;
  iconColor?: string;
}

// Ảnh sản phẩm có thể đến từ link Supabase/imageUrl do người dùng tự dán —
// nếu link hỏng (hotlink bị chặn, link hết hạn...), tự rơi về icon placeholder
// thay vì hiện khoảng trắng không rõ nguyên nhân.
export const ProductImage: React.FC<ProductImageProps> = ({
  source,
  imageStyle,
  placeholderStyle,
  iconSize = 32,
  iconColor = '#A6B3A9',
}) => {
  const [failed, setFailed] = useState(false);

  if (!source || failed) {
    return (
      <View style={placeholderStyle}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="image-outline" size={iconSize} color={iconColor} />
        </View>
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={imageStyle}
      onError={(e) => {
        const uri = typeof source === 'object' && source?.uri ? source.uri : '(ảnh cục bộ)';
        console.warn('[ProductImage] Tải ảnh thất bại:', uri, '-', e.nativeEvent?.error);
        setFailed(true);
      }}
    />
  );
};
