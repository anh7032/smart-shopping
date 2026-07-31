-- Smart Shopping Demo — bảng products trên Supabase
-- Chạy toàn bộ file này trong Supabase Dashboard > SQL Editor > New query > Run.
-- Dữ liệu seed bên dưới PHẢI khớp với src/data/mockProducts.ts (nguồn dùng làm fallback cục bộ
-- và cho nút "Khôi phục dữ liệu mặc định" trong Demo Launcher).

create table if not exists public.products (
  id text primary key,
  sku text,
  barcode text not null,
  name text not null,
  price integer not null,
  old_price integer,
  discount integer,
  category text not null,
  shelf text not null,
  stock integer not null default 0,
  description text not null default '',
  rating numeric(2, 1),
  badge text,
  is_active boolean not null default true,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_barcode_idx on public.products (barcode);

-- Tự động cập nhật updated_at mỗi khi có UPDATE
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- RLS: bật lên nhưng cho phép anon key đọc/ghi tự do — phù hợp cho app demo không có xác thực người dùng.
-- Nếu triển khai thật (có dữ liệu nhạy cảm/khách hàng thật), hãy thắt chặt các policy này lại.
alter table public.products enable row level security;

drop policy if exists "Public read access" on public.products;
create policy "Public read access" on public.products
  for select using (true);

drop policy if exists "Public write access (demo only)" on public.products;
create policy "Public write access (demo only)" on public.products
  for all using (true) with check (true);

-- ============================================================
-- Seed dữ liệu: 15 sản phẩm gốc + 50 sản phẩm bổ sung (tổng 65)
-- ============================================================
insert into public.products
  (id, sku, barcode, name, price, old_price, discount, category, shelf, stock, description, rating, badge, is_active)
values
  ('rau-cai-organic', 'SKU-VEG-001', '8930000000010', 'Rau cải xanh organic', 18000, null, null, 'Thực phẩm', 'Khu thực phẩm tươi - Dãy A3 - Kệ số 2', 25, 'Rau cải xanh được trồng theo phương pháp hữu cơ hoàn toàn tự nhiên, không chứa thuốc trừ sâu, giàu vitamin và chất xơ.', 4.8, 'Organic', true),
  ('nuoc-cam-ep', 'SKU-BEV-002', '8930000000027', 'Nước cam ép tươi', 35000, 45000, 22, 'Đồ uống', 'Khu đồ uống - Dãy B1 - Kệ số 4', 15, 'Nước cam tươi nguyên chất 100% được vắt trực tiếp trong ngày, không đường hóa học, cung cấp vitamin C dồi dào.', 4.6, null, true),
  ('thit-bo-uc', 'SKU-MEAT-003', '8930000000034', 'Thịt bò Úc nhập khẩu', 185000, 220000, 16, 'Thực phẩm', 'Khu thực phẩm tươi - Tủ đông C1', 8, 'Thịt ba chỉ bò Úc nhập khẩu chất lượng cao, giữ lạnh tươi ngon, thái lát phù hợp cho lẩu hoặc nướng.', 4.7, 'Bán chạy', true),
  ('dau-goi-pantene', 'SKU-COS-004', '8930000000041', 'Dầu gội Pantene', 75000, 95000, 21, 'Chăm sóc cá nhân', 'Khu mỹ phẩm - Dãy D2 - Kệ số 3', 20, 'Dầu gội dưỡng tóc Pantene ngăn ngừa hư tổn, đem lại mái tóc suôn mượt óng ả suốt cả ngày dài.', 4.5, null, true),
  ('ca-chua-bi', 'SKU-VEG-005', '8930000000058', 'Cà chua bi đỏ', 25000, 35000, 29, 'Thực phẩm', 'Khu thực phẩm tươi - Dãy A1 - Kệ số 5', 12, 'Cà chua bi đỏ ngọt mát, quả mọng chứa nhiều chất chống oxy hóa tự nhiên, thích hợp ăn sống hoặc làm salad.', 4.4, null, true),
  ('sua-tuoi-th', 'SKU-BEV-006', '8930000000065', 'Sữa tươi TH True Milk', 28000, null, null, 'Đồ uống', 'Khu sữa - Dãy B2 - Kệ số 1', 30, 'Sữa tươi tiệt trùng TH True Milk nguyên chất ít đường, bổ sung dưỡng chất thiết yếu cho xương khớp khỏe mạnh.', 4.7, null, true),
  ('banh-mi-sandwich', 'SKU-BAK-007', '8930000000072', 'Bánh mì gối thơm bơ', 25000, null, null, 'Thực phẩm', 'Khu bánh mì - Dãy A4 - Kệ số 1', 10, 'Bánh mì sandwich gối nướng bơ sữa thơm ngon mềm mại, thích hợp làm bữa sáng nhanh chóng tiện lợi.', 4.3, null, true),
  ('ngu-coc-an-sang', 'SKU-DRY-008', '8930000000089', 'Ngũ cốc ăn sáng dinh dưỡng', 42000, null, null, 'Thực phẩm', 'Khu đồ khô - Dãy C2 - Kệ số 1', 14, 'Ngũ cốc bắp nướng giòn rụm, giàu vitamin nhóm B và khoáng chất, hoàn hảo khi kết hợp cùng sữa tươi TH True Milk.', 4.2, null, true),
  ('nuoc-tuong-chinsu', 'SKU-CND-009', '8930000000096', 'Nước tương Chinsu tỏi ớt', 16000, null, null, 'Thực phẩm', 'Khu gia vị - Dãy C3 - Kệ số 2', 40, 'Nước tương Chin-su hảo hạng thơm cay tỏi ớt tự nhiên, nâng tầm mọi món chiên xào chấm.', 4.5, null, true),
  ('kem-dan-rang-ps', 'SKU-COS-010', '8930000000102', 'Kem đánh răng P/S bảo vệ', 32000, null, null, 'Chăm sóc cá nhân', 'Khu cá nhân - Dãy D1 - Kệ số 2', 18, 'Kem đánh răng P/S Ngừa Sâu Răng Vượt Trội giúp bổ sung canxi siêu nhỏ bảo vệ nướu và giúp hơi thở thơm mát.', 4.4, null, true),
  ('giay-ve-sink-silkwell', 'SKU-HOM-011', '8930000000119', 'Giấy vệ sinh Silkwell 10 cuộn', 65000, 80000, 18, 'Gia dụng', 'Khu gia dụng - Dãy E1 - Kệ số 1', 15, 'Giấy vệ sinh Silkwell 3 lớp cao cấp làm từ bột giấy tự nhiên siêu mềm mịn, thấm hút tốt.', 4.6, null, true),
  ('nuoc-rua-chen-sunlight', 'SKU-HOM-012', '8930000000126', 'Nước rửa chén Sunlight chanh', 29000, null, null, 'Gia dụng', 'Khu hóa chất - Dãy E2 - Kệ số 4', 25, 'Nước rửa chén Sunlight hương chanh tự nhiên giúp làm sạch dầu mỡ nhanh chóng, dịu nhẹ với da tay.', 4.8, null, true),
  ('khoai-tay-ong-pringles', 'SKU-SNK-013', '8930000000133', 'Khoai tây chiên Pringles', 38000, 45000, 15, 'Thực phẩm', 'Khu ăn vặt - Dãy C4 - Kệ số 3', 22, 'Snack khoai tây Pringles vị tự nhiên lát mỏng giòn ngon, đóng hộp tiện lợi giữ trọn hương vị.', 4.5, null, true),
  ('tra-xanh-c2', 'SKU-BEV-014', '8930000000140', 'Trà xanh C2 hương chanh', 10000, null, null, 'Đồ uống', 'Khu nước giải khát - Dãy B2 - Kệ số 3', 50, 'Trà xanh C2 thanh mát giải nhiệt cuộc sống chiết xuất từ lá trà tự nhiên kết hợp hương chanh tươi mát.', 4.2, null, true),
  ('xa-phong-lifebuoy', 'SKU-COS-015', '8930000000157', 'Xà bông Lifebuoy bảo vệ', 15000, 20000, 25, 'Chăm sóc cá nhân', 'Khu cá nhân - Dãy D1 - Kệ số 1', 35, 'Xà bông cục Lifebuoy diệt khuẩn bảo vệ vượt trội khỏi các loại vi khuẩn gây bệnh thông thường.', 4.7, null, true),

  ('trung-ga-ta', 'SKU-VEG-016', '8930000000200', 'Trứng gà ta (10 quả)', 32000, null, null, 'Thực phẩm', 'Khu thực phẩm tươi - Dãy A2 - Kệ số 1', 40, 'Trứng gà ta tươi, vỏ hồng, lòng đỏ đậm màu, giàu dinh dưỡng cho bữa ăn gia đình.', 4.6, null, true),
  ('gao-st25', 'SKU-VEG-017', '8930000000201', 'Gạo ST25 túi 5kg', 150000, null, null, 'Thực phẩm', 'Khu đồ khô - Dãy C1 - Kệ số 1', 30, 'Gạo ST25 hạt dài, dẻo thơm đặc trưng, top gạo ngon nhất thế giới.', 4.9, 'Bán chạy', true),
  ('ca-basa-phi-le', 'SKU-MEAT-018', '8930000000202', 'Cá basa phi lê đông lạnh', 65000, null, null, 'Thực phẩm', 'Khu thực phẩm tươi - Tủ đông C2', 20, 'Cá basa phi lê làm sạch, cấp đông nhanh giữ trọn độ tươi ngon, tiện chế biến.', 4.3, null, true),
  ('tom-su-tuoi', 'SKU-MEAT-019', '8930000000203', 'Tôm sú tươi (500g)', 145000, 165000, 12, 'Thực phẩm', 'Khu thực phẩm tươi - Tủ đông C2', 15, 'Tôm sú size vừa, thịt chắc ngọt, thích hợp hấp, nướng hoặc nấu lẩu.', 4.5, null, true),
  ('dui-ga-goc-tu', 'SKU-MEAT-020', '8930000000204', 'Đùi gà góc tư đông lạnh (1kg)', 68000, null, null, 'Thực phẩm', 'Khu thực phẩm tươi - Tủ đông C1', 25, 'Đùi gà góc tư nhập khẩu, thịt mềm, phù hợp chiên, nướng, kho.', 4.2, null, true),
  ('xuc-xich-duc-viet', 'SKU-MEAT-021', '8930000000205', 'Xúc xích Đức Việt', 45000, null, null, 'Thực phẩm', 'Khu thực phẩm tươi - Tủ mát C3', 28, 'Xúc xích tiệt trùng Đức Việt vị truyền thống, tiện lợi cho bữa sáng.', 4.4, null, true),
  ('gio-lua-vissan', 'SKU-MEAT-022', '8930000000206', 'Giò lụa Vissan (500g)', 75000, null, null, 'Thực phẩm', 'Khu thực phẩm tươi - Tủ mát C3', 18, 'Giò lụa Vissan thơm ngon truyền thống, dai giòn tự nhiên.', 4.5, null, true),
  ('nam-kim-cham', 'SKU-VEG-023', '8930000000207', 'Nấm kim châm', 12000, null, null, 'Thực phẩm', 'Khu thực phẩm tươi - Dãy A3 - Kệ số 3', 35, 'Nấm kim châm tươi giòn ngọt, thích hợp lẩu, xào hoặc nướng.', 4.3, null, true),
  ('khoai-tay-cu-tuoi', 'SKU-VEG-024', '8930000000208', 'Khoai tây củ tươi (1kg)', 22000, null, null, 'Thực phẩm', 'Khu thực phẩm tươi - Dãy A1 - Kệ số 2', 45, 'Khoai tây củ to đều, bở ngọt, dùng chiên, hầm hoặc nướng đều ngon.', 4.4, null, true),
  ('hanh-tay-cu', 'SKU-VEG-025', '8930000000209', 'Hành tây củ (1kg)', 18000, null, null, 'Thực phẩm', 'Khu thực phẩm tươi - Dãy A1 - Kệ số 3', 50, 'Hành tây củ tươi, vị ngọt dịu, nguyên liệu không thể thiếu cho món xào.', 4.2, null, true),
  ('chuoi-gia-nam-my', 'SKU-VEG-026', '8930000000210', 'Chuối già Nam Mỹ (1kg)', 25000, 30000, 17, 'Thực phẩm', 'Khu trái cây - Dãy A5 - Kệ số 1', 32, 'Chuối già nhập khẩu quả to, ngọt đậm, giàu kali tốt cho sức khỏe.', 4.5, null, true),
  ('tao-envy', 'SKU-VEG-027', '8930000000211', 'Táo Envy nhập khẩu (1kg)', 89000, null, null, 'Thực phẩm', 'Khu trái cây - Dãy A5 - Kệ số 2', 24, 'Táo Envy New Zealand giòn ngọt, vỏ đỏ bóng bắt mắt.', 4.7, 'Nhập khẩu', true),
  ('bo-sap-dak-lak', 'SKU-VEG-028', '8930000000212', 'Bơ sáp Đắk Lắk (1kg)', 55000, null, null, 'Thực phẩm', 'Khu trái cây - Dãy A5 - Kệ số 3', 20, 'Bơ sáp Đắk Lắk béo dẻo, thịt vàng óng, giàu chất béo tốt.', 4.6, null, true),
  ('mi-hao-hao', 'SKU-DRY-029', '8930000000213', 'Mì tôm Hảo Hảo (thùng 30 gói)', 125000, 140000, 11, 'Thực phẩm', 'Khu đồ khô - Dãy C2 - Kệ số 2', 22, 'Mì Hảo Hảo vị tôm chua cay quen thuộc, tiện lợi dự trữ cả thùng.', 4.5, 'Bán chạy', true),
  ('pho-an-lien-vifon', 'SKU-DRY-030', '8930000000214', 'Phở ăn liền Vifon (bịch 5 gói)', 38000, null, null, 'Thực phẩm', 'Khu đồ khô - Dãy C2 - Kệ số 3', 26, 'Phở bò ăn liền Vifon nước dùng đậm đà, tiện lợi cho bữa ăn nhanh.', 4.3, null, true),
  ('nuoc-suoi-aquafina', 'SKU-BEV-031', '8930000000215', 'Nước suối Aquafina 500ml (lốc 12 chai)', 48000, null, null, 'Đồ uống', 'Khu đồ uống - Dãy B1 - Kệ số 1', 40, 'Nước tinh khiết Aquafina qua quy trình lọc 7 bước, an toàn cho cả gia đình.', 4.5, null, true),
  ('coca-cola-lon', 'SKU-BEV-032', '8930000000216', 'Coca Cola lon (lốc 6 lon)', 65000, null, null, 'Đồ uống', 'Khu nước giải khát - Dãy B2 - Kệ số 1', 35, 'Nước ngọt có gas Coca Cola sảng khoái, hương vị truyền thống.', 4.4, null, true),
  ('bia-tiger', 'SKU-BEV-033', '8930000000217', 'Bia Tiger lon (lốc 6 lon)', 155000, null, null, 'Đồ uống', 'Khu đồ uống - Dãy B1 - Kệ số 5', 30, 'Bia Tiger bản lĩnh đàn ông đích thực, vị đậm đà sảng khoái.', 4.6, null, true),
  ('cafe-nescafe', 'SKU-BEV-034', '8930000000218', 'Cà phê sữa đá Nescafe (hộp 20 gói)', 62000, null, null, 'Đồ uống', 'Khu đồ uống - Dãy B1 - Kệ số 2', 24, 'Cà phê hòa tan Nescafe 3in1 đậm vị, tiện pha nhanh mỗi sáng.', 4.3, null, true),
  ('sua-dau-nanh-fami', 'SKU-BEV-035', '8930000000219', 'Sữa đậu nành Fami (lốc 6 hộp)', 54000, null, null, 'Đồ uống', 'Khu sữa - Dãy B2 - Kệ số 2', 30, 'Sữa đậu nành Fami nguyên chất, thơm béo tự nhiên, bổ sung dinh dưỡng.', 4.4, null, true),
  ('nuoc-yen-sanest', 'SKU-BEV-036', '8930000000220', 'Nước yến sào Sanest (lốc 6 chai)', 195000, 220000, 11, 'Đồ uống', 'Khu đồ uống - Dãy B1 - Kệ số 6', 16, 'Nước yến sào Sanest bồi bổ sức khỏe, vị ngọt thanh dễ uống.', 4.7, null, true),
  ('tra-sua-toco', 'SKU-BEV-037', '8930000000221', 'Trà sữa TocoToco đóng chai', 32000, null, null, 'Đồ uống', 'Khu nước giải khát - Dãy B2 - Kệ số 4', 28, 'Trà sữa đóng chai tiện lợi, vị béo thơm đặc trưng TocoToco.', 4.2, null, true),
  ('redbull', 'SKU-BEV-038', '8930000000222', 'Nước tăng lực Redbull (lốc 6 lon)', 78000, null, null, 'Đồ uống', 'Khu nước giải khát - Dãy B2 - Kệ số 5', 22, 'Redbull tiếp thêm năng lượng tức thì, tỉnh táo làm việc và học tập.', 4.3, null, true),
  ('sinh-to-xoai', 'SKU-BEV-039', '8930000000223', 'Sinh tố xoài đóng hộp', 15000, null, null, 'Đồ uống', 'Khu nước giải khát - Dãy B2 - Kệ số 6', 34, 'Sinh tố xoài đóng hộp thơm ngon, giải khát tiện lợi mọi lúc.', 4.1, null, true),
  ('yakult', 'SKU-BEV-040', '8930000000224', 'Sữa chua uống Yakult (vỉ 5 chai)', 28000, null, null, 'Đồ uống', 'Khu sữa - Dãy B2 - Kệ số 3', 38, 'Men vi sinh Yakult hỗ trợ tiêu hóa khỏe mạnh mỗi ngày.', 4.6, null, true),
  ('sua-tam-dove', 'SKU-COS-041', '8930000000225', 'Sữa tắm Dove (chai 500ml)', 92000, 110000, 16, 'Chăm sóc cá nhân', 'Khu mỹ phẩm - Dãy D2 - Kệ số 1', 26, 'Sữa tắm Dove dưỡng ẩm 1/4 kem dưỡng, cho làn da mềm mịn.', 4.6, null, true),
  ('nuoc-suc-mieng-listerine', 'SKU-COS-042', '8930000000226', 'Nước súc miệng Listerine (500ml)', 85000, null, null, 'Chăm sóc cá nhân', 'Khu cá nhân - Dãy D1 - Kệ số 3', 20, 'Nước súc miệng Listerine diệt khuẩn, mang lại hơi thở thơm mát.', 4.5, null, true),
  ('ban-chai-colgate', 'SKU-COS-043', '8930000000227', 'Bàn chải đánh răng Colgate (combo 3 cái)', 45000, null, null, 'Chăm sóc cá nhân', 'Khu cá nhân - Dãy D1 - Kệ số 4', 32, 'Bàn chải Colgate lông mềm mảnh, làm sạch sâu không hại nướu.', 4.4, null, true),
  ('khan-giay-uot-bobby', 'SKU-COS-044', '8930000000228', 'Khăn giấy ướt Bobby (gói 100 miếng)', 35000, null, null, 'Chăm sóc cá nhân', 'Khu mẹ và bé - Dãy D3 - Kệ số 1', 30, 'Khăn ướt Bobby dịu nhẹ cho da bé, không cồn không hương liệu.', 4.5, null, true),
  ('bang-ve-sinh-kotex', 'SKU-COS-045', '8930000000229', 'Băng vệ sinh Kotex (gói 16 miếng)', 42000, null, null, 'Chăm sóc cá nhân', 'Khu cá nhân - Dãy D1 - Kệ số 5', 28, 'Băng vệ sinh Kotex siêu thấm, bề mặt êm mềm thoải mái cả ngày.', 4.5, null, true),
  ('dao-cao-rau-gillette', 'SKU-COS-046', '8930000000230', 'Dao cạo râu Gillette (combo 2 cái)', 68000, null, null, 'Chăm sóc cá nhân', 'Khu cá nhân - Dãy D1 - Kệ số 6', 18, 'Dao cạo Gillette lưỡi kép sắc bén, cạo êm không gây rát da.', 4.3, null, true),
  ('kem-duong-da-nivea', 'SKU-COS-047', '8930000000231', 'Kem dưỡng da Nivea (hộp 150ml)', 78000, null, null, 'Chăm sóc cá nhân', 'Khu mỹ phẩm - Dãy D2 - Kệ số 2', 24, 'Kem dưỡng ẩm Nivea công thức cổ điển, phù hợp mọi loại da.', 4.6, null, true),
  ('nuoc-hoa-hong-hada', 'SKU-COS-048', '8930000000232', 'Nước hoa hồng Hada Labo (chai 170ml)', 195000, null, null, 'Chăm sóc cá nhân', 'Khu mỹ phẩm - Dãy D2 - Kệ số 3', 14, 'Nước hoa hồng Hada Labo cấp ẩm chuyên sâu với Hyaluronic Acid.', 4.7, 'Nhập khẩu', true),
  ('dau-xa-sunsilk', 'SKU-COS-049', '8930000000233', 'Dầu xả Sunsilk (chai 650ml)', 65000, 75000, 13, 'Chăm sóc cá nhân', 'Khu mỹ phẩm - Dãy D2 - Kệ số 4', 26, 'Dầu xả Sunsilk mềm mượt óng ả, phục hồi tóc hư tổn.', 4.4, null, true),
  ('ta-em-be-bobby', 'SKU-COS-050', '8930000000234', 'Tã em bé Bobby size M (gói 62 miếng)', 215000, null, null, 'Chăm sóc cá nhân', 'Khu mẹ và bé - Dãy D3 - Kệ số 2', 20, 'Tã dán Bobby siêu mỏng, thấm hút vượt trội, chống tràn ban đêm.', 4.6, null, true),
  ('sua-rua-mat-cetaphil', 'SKU-COS-051', '8930000000235', 'Sữa rửa mặt Cetaphil (chai 236ml)', 245000, null, null, 'Chăm sóc cá nhân', 'Khu mỹ phẩm - Dãy D2 - Kệ số 5', 12, 'Sữa rửa mặt Cetaphil dịu nhẹ, không xà phòng, phù hợp da nhạy cảm.', 4.8, 'Nhập khẩu', true),
  ('lan-khu-mui-nivea', 'SKU-COS-052', '8930000000236', 'Lăn khử mùi Nivea (chai 50ml)', 55000, null, null, 'Chăm sóc cá nhân', 'Khu mỹ phẩm - Dãy D2 - Kệ số 6', 22, 'Lăn khử mùi Nivea kiểm soát mồ hôi 48h, hương thơm dịu nhẹ.', 4.3, null, true),
  ('kem-chong-nang-anessa', 'SKU-COS-053', '8930000000237', 'Kem chống nắng Anessa (tuýp 60ml)', 385000, null, null, 'Chăm sóc cá nhân', 'Khu mỹ phẩm - Dãy D2 - Kệ số 7', 10, 'Kem chống nắng Anessa SPF50+ chống nước, bảo vệ da vượt trội.', 4.9, 'Nhập khẩu', true),
  ('nuoc-lau-san-gift', 'SKU-HOM-054', '8930000000238', 'Nước lau sàn Gift (chai 1L)', 38000, null, null, 'Gia dụng', 'Khu hóa chất - Dãy E2 - Kệ số 1', 30, 'Nước lau sàn Gift hương oải hương, làm sạch và lưu hương lâu.', 4.3, null, true),
  ('bot-giat-omo', 'SKU-HOM-055', '8930000000239', 'Bột giặt Omo (túi 3kg)', 145000, 165000, 12, 'Gia dụng', 'Khu hóa chất - Dãy E2 - Kệ số 2', 24, 'Bột giặt Omo đánh bay vết bẩn cứng đầu, hương thơm mát lâu phai.', 4.6, 'Bán chạy', true),
  ('nuoc-xa-vai-comfort', 'SKU-HOM-056', '8930000000240', 'Nước xả vải Comfort (túi 1.5L)', 68000, null, null, 'Gia dụng', 'Khu hóa chất - Dãy E2 - Kệ số 3', 26, 'Nước xả vải Comfort mềm mại, hương thơm quyến rũ lưu lâu trên vải.', 4.5, null, true),
  ('tui-rac-tu-huy', 'SKU-HOM-057', '8930000000241', 'Túi rác tự phân hủy (cuộn 30 túi)', 25000, null, null, 'Gia dụng', 'Khu gia dụng - Dãy E1 - Kệ số 2', 40, 'Túi rác tự phân hủy sinh học, thân thiện với môi trường.', 4.4, null, true),
  ('mang-boc-thuc-pham', 'SKU-HOM-058', '8930000000242', 'Màng bọc thực phẩm (hộp 30m)', 22000, null, null, 'Gia dụng', 'Khu gia dụng - Dãy E1 - Kệ số 3', 35, 'Màng bọc thực phẩm an toàn, giữ tươi ngon và bảo quản thức ăn.', 4.3, null, true),
  ('pin-con-o', 'SKU-HOM-059', '8930000000243', 'Pin tiểu Con Ó (vỉ 4 viên)', 18000, null, null, 'Gia dụng', 'Khu gia dụng - Dãy E1 - Kệ số 4', 45, 'Pin tiểu Con Ó bền bỉ, dùng cho các thiết bị điện tử gia dụng.', 4.2, null, true),
  ('bong-den-led-dien-quang', 'SKU-HOM-060', '8930000000244', 'Bóng đèn LED Điện Quang (bộ 3 bóng)', 95000, null, null, 'Gia dụng', 'Khu gia dụng - Dãy E1 - Kệ số 5', 22, 'Bóng đèn LED Điện Quang tiết kiệm điện, ánh sáng trắng dịu mắt.', 4.5, null, true),
  ('nen-thom-sap-ong', 'SKU-HOM-061', '8930000000245', 'Nến thơm sáp ong', 45000, null, null, 'Gia dụng', 'Khu gia dụng - Dãy E1 - Kệ số 6', 18, 'Nến thơm làm từ sáp ong tự nhiên, tạo hương thư giãn cho không gian.', 4.4, null, true),
  ('binh-xit-raid', 'SKU-HOM-062', '8930000000246', 'Bình xịt côn trùng Raid (chai 600ml)', 55000, null, null, 'Gia dụng', 'Khu hóa chất - Dãy E2 - Kệ số 4', 20, 'Bình xịt Raid diệt côn trùng nhanh chóng, hiệu quả tức thì.', 4.3, null, true),
  ('moc-treo-quan-ao', 'SKU-HOM-063', '8930000000247', 'Móc treo quần áo inox (bộ 10 cái)', 32000, null, null, 'Gia dụng', 'Khu gia dụng - Dãy E1 - Kệ số 7', 30, 'Móc treo quần áo inox chắc chắn, chống gỉ, bền đẹp lâu dài.', 4.2, null, true),
  ('chao-chong-dinh-sunhouse', 'SKU-HOM-064', '8930000000248', 'Chảo chống dính Sunhouse (size 24cm)', 185000, 220000, 16, 'Gia dụng', 'Khu gia dụng - Dãy E1 - Kệ số 8', 16, 'Chảo chống dính Sunhouse đáy dày, chống dính bền bỉ, chiên xào không lo cháy.', 4.6, 'Bán chạy', true),
  ('thot-nhua-khang-khuan', 'SKU-HOM-065', '8930000000249', 'Thớt nhựa kháng khuẩn (bộ 2 cái)', 65000, null, null, 'Gia dụng', 'Khu gia dụng - Dãy E1 - Kệ số 9', 24, 'Thớt nhựa kháng khuẩn an toàn thực phẩm, dễ vệ sinh.', 4.3, null, true)
on conflict (id) do update set
  sku = excluded.sku,
  barcode = excluded.barcode,
  name = excluded.name,
  price = excluded.price,
  old_price = excluded.old_price,
  discount = excluded.discount,
  category = excluded.category,
  shelf = excluded.shelf,
  stock = excluded.stock,
  description = excluded.description,
  rating = excluded.rating,
  badge = excluded.badge,
  is_active = excluded.is_active;
