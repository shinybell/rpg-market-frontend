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
