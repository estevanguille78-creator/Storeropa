export type UserRole = 'programador' | 'admin' | 'revendedor' | 'cliente';

export interface StoreSettings {
  id: string;
  store_name: string;
  tagline: string;
  logo_url: string;
  logo_dark_url: string;
  favicon_url: string;
  color_primary: string;
  color_secondary: string;
  color_bg: string;
  color_text: string;
  font_family: string;
  button_radius: string;
  brand_bio: string;
  brand_story: string;
  brand_profile_img: string;
  brand_video_url: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  copyright_text: string;
  terms_content: string;
  privacy_content: string;
  shipping_content: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  banner_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface AttributeValue {
  id: number;
  group_id: number;
  label: string;
  value: string;
  sort_order: number;
}

export interface AttributeGroup {
  id: number;
  name: string;
  type: 'text' | 'color' | 'badge';
  values?: AttributeValue[];
}

export interface ProductAttributeColor {
  label: string;
  hex: string;
}

export interface ProductAttributes {
  tallas?: string[];
  colores?: ProductAttributeColor[];
  [key: string]: unknown;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  price: number;
  reseller_price?: number | null;
  compare_at_price?: number | null;
  images: string[];
  badge?: string | null;
  is_featured: boolean;
  is_active: boolean;
  stock: number;
  attributes: ProductAttributes;
  created_at?: string;
}

export interface Currency {
  id: string;
  symbol: string;
  name: string;
  rate: number;
  is_default: boolean;
  is_active: boolean;
}

export interface PaymentMethod {
  id: string;
  title: string;
  type: 'manual' | 'gateway';
  is_active: boolean;
  details: Record<string, string>;
  instructions: string;
  api_keys?: Record<string, string>;
  sort_order: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface OrderItem {
  id?: number;
  name: string;
  slug?: string;
  quantity: number;
  price: number;
  talla?: string;
  color?: string;
  image?: string;
}

export type OrderStatus = 'nuevo' | 'confirmado' | 'rechazado' | 'entregado';

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  currency: string;
  currency_rate: number;
  total_in_currency: number;
  payment_method_id: string;
  payment_method_title?: string;
  payment_reference?: string;
  payment_receipt_url?: string;
  status: OrderStatus;
  user_id?: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  country?: string;
  age?: number;
  created_at?: string;
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
}

