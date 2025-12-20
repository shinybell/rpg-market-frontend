// AI生成関連の型定義

export interface GenerateDescriptionRequest {
  item_name: string;
  category?: string;
  condition?: string;
  num_suggestions?: number;
}

export interface GenerateDescriptionResponse {
  suggestions: string[];
}

export interface AppraiseItemRequest {
  item_name: string;
  description?: string;
  category?: string;
  condition?: string;
}

export interface AppraiseItemResponse {
  rpg_name: string;
  rpg_description: string;
}

export interface ConvertSearchQueryRequest {
  query: string;
}

export interface ConvertSearchQueryResponse {
  keywords: string[];
}
