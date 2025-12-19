export interface Message {
  id: number;
  transaction_id: number;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: number;
    profile?: {
      nickname: string;
      avatar_url?: string;
    };
  };
}

export interface Transaction {
  id: number;
  item_id: number;
  buyer_id: number;
  seller_id: number;
  price: number;
  transaction_status: string;
  payment_status: string;
  created_at: string;
  item?: {
    id: number;
    name: string;
    images?: Array<{ image_url: string }>;
  };
}
