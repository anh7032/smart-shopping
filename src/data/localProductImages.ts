import { Product } from '../types';
import { mockProducts } from './mockProducts';

// Ảnh bundle cục bộ (require) không thể lưu trong Supabase, nên ta giữ một bảng tra cứu
// id -> ảnh cục bộ ở client, và gắn lại ảnh này sau khi tải sản phẩm từ Supabase.
export const LOCAL_PRODUCT_IMAGES: Record<string, any> = mockProducts.reduce(
  (acc, product) => {
    if (product.image) acc[product.id] = product.image;
    return acc;
  },
  {} as Record<string, any>
);

export function attachLocalImage(product: Product): Product {
  // Ưu tiên ảnh do người dùng tự cập nhật qua cột image_url trên Supabase,
  // để đổi/thêm ảnh không cần sửa code hay build lại app.
  if (product.imageUrl) return { ...product, image: { uri: product.imageUrl } };
  const localImage = LOCAL_PRODUCT_IMAGES[product.id];
  if (localImage) return { ...product, image: localImage };
  return product;
}
