export type ItemCondition = 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable';
export type ShippingPayer = 'buyer' | 'seller';
export type ShippingDays = '1-2' | '2-3' | '4-7';
export type ItemStatus = 'draft' | 'on_sale' | 'trading' | 'sold_out' | 'suspended';

export interface ItemImage {
  id: number;
  image_url: string;
  display_order: number;
}

export interface UserProfile {
  nickname: string;
  bio: string;
  avatar_url: string;
}

export interface Seller {
  id: number;
  firebase_uid: string;
  email: string;
  profile?: UserProfile;
}

export interface Item {
  id: number;
  seller_id: number;
  seller?: Seller;
  category_id: number;
  brand_id?: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  condition: ItemCondition;
  shipping_payer: ShippingPayer;
  shipping_method_id?: number;
  shipping_days: ShippingDays;
  prefecture_id?: number;
  status: ItemStatus;
  likes_count: number;
  comments_count?: number;
  view_count: number;
  images?: ItemImage[];
  created_at: string;
  updated_at: string;
}

export interface CreateItemRequest {
  category_id: number;
  brand_id?: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  condition: ItemCondition;
  shipping_payer: ShippingPayer;
  shipping_method_id?: number;
  shipping_days: ShippingDays;
  prefecture_id?: number;
  status: ItemStatus;
  images?: Array<{
    image_url: string;
    display_order: number;
  }>;
}

export interface UpdateItemRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  condition?: ItemCondition;
  shipping_payer?: ShippingPayer;
  shipping_method_id?: number;
  shipping_days?: ShippingDays;
  prefecture_id?: number;
  status?: ItemStatus;
}
