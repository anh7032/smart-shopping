# Smart Shopping Demo (Expo Go)

Bản khung React Native/Expo mô phỏng giao diện trong ảnh tham khảo:

- Trang chủ có header xanh, tìm kiếm, banner, danh mục, product grid và ngân sách.
- Trang giỏ hàng có tăng/giảm số lượng, xóa sản phẩm và tính tổng tiền.
- Thanh điều hướng dưới đã nối sẵn.
- Các tab Tìm kiếm, Quét SP và Gợi ý AI là khung trống để bạn làm tiếp.
- Tất cả vị trí ảnh sản phẩm đang dùng `View` màu xám nhạt để bạn tự thay bằng `<Image />`.

## Chạy bằng Expo Go

```bash
npm install
npx expo start
```

Sau đó mở Expo Go trên điện thoại và quét QR.

Project dùng Expo SDK 54 để phù hợp với Expo Go trên điện thoại trong giai đoạn chuyển phiên bản hiện tại.

## Thêm ảnh sản phẩm

Trong `App.tsx`, tìm:

```tsx
<View style={styles.productImagePlaceholder} />
```

hoặc:

```tsx
<View style={styles.cartImagePlaceholder} />
```

Thay bằng:

```tsx
<Image
  source={require('./assets/ten-anh.png')}
  style={styles.productImagePlaceholder}
  resizeMode="cover"
/>
```

Nhớ import `Image` từ `react-native`.
