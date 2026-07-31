import { Product } from '../types';
import { attachLocalImage } from '../data/localProductImages';
import { supabase } from './supabase';

type ProductRow = {
  id: string;
  sku: string | null;
  barcode: string;
  name: string;
  price: number;
  old_price: number | null;
  discount: number | null;
  category: string;
  shelf: string;
  stock: number;
  description: string;
  rating: number | null;
  badge: string | null;
  is_active: boolean;
  image_url: string | null;
};

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku ?? undefined,
    barcode: row.barcode,
    name: row.name,
    price: row.price,
    oldPrice: row.old_price ?? undefined,
    discount: row.discount ?? undefined,
    category: row.category,
    shelf: row.shelf,
    stock: row.stock,
    description: row.description,
    rating: row.rating ?? undefined,
    badge: row.badge ?? undefined,
    isActive: row.is_active,
    imageUrl: row.image_url ?? undefined,
  };
}

function productToRow(product: Product): ProductRow {
  return {
    id: product.id,
    sku: product.sku ?? null,
    barcode: product.barcode,
    name: product.name,
    price: product.price,
    old_price: product.oldPrice ?? null,
    discount: product.discount ?? null,
    category: product.category,
    shelf: product.shelf,
    stock: product.stock,
    description: product.description,
    rating: product.rating ?? null,
    badge: product.badge ?? null,
    is_active: product.isActive ?? true,
    image_url: product.imageUrl ?? null,
  };
}

export async function fetchProductsFromSupabase(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => attachLocalImage(rowToProduct(row as ProductRow)));
}

export async function upsertProductToSupabase(product: Product): Promise<void> {
  const { error } = await supabase.from('products').upsert(productToRow(product));
  if (error) throw error;
}

export async function upsertProductsToSupabase(products: Product[]): Promise<void> {
  const { error } = await supabase.from('products').upsert(products.map(productToRow));
  if (error) throw error;
}
