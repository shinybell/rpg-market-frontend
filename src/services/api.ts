import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// トークンをキャッシュ
let cachedToken: string | null = null;

// Firebaseトークンの変更を監視
auth.onIdTokenChanged(async (user) => {
  if (user) {
    cachedToken = await user.getIdToken();
  } else {
    cachedToken = null;
  }
});

// Track if auth has been initialized
let authInitialized = false;
const ensureAuthInitialized = () => {
  if (authInitialized) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      authInitialized = true;
      unsubscribe();
      resolve();
    });
  });
};

// リクエストインターセプター（トークン自動付与）
apiClient.interceptors.request.use(async (config) => {
  // Firebase認証状態が初期化されるまで待機（初回のみ）
  await ensureAuthInitialized();

  if (cachedToken) {
    config.headers.Authorization = `Bearer ${cachedToken}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 401エラーの場合、認証状態をリセット
      auth.signOut();
    }
    return Promise.reject(error);
  }
);

// デフォルトエクスポート（useImageUploadで使用）
export const api = apiClient;

// API エンドポイント
export const userApi = {
  login: (nickname: string) => {
    console.log('userApi.login called with nickname:', nickname);
    return apiClient.post('/api/auth/login', { nickname });
  },

  getMe: () =>
    apiClient.get('/api/auth/me'),

  updateProfile: (data: { nickname?: string; bio?: string; avatar_url?: string }) =>
    apiClient.put('/api/users/profile', data),

  deleteUser: () =>
    apiClient.delete('/api/users'),
};

export const itemApi = {
  // アイテム一覧取得
  getItems: (limit = 20, offset = 0) =>
    apiClient.get('/api/items', { params: { limit, offset } }),

  // アイテム詳細取得
  getItem: (id: number) =>
    apiClient.get(`/api/items/${id}`),

  // 出品者のアイテム一覧取得
  getItemsBySeller: (sellerId: number, limit = 20, offset = 0) =>
    apiClient.get(`/api/items/seller/${sellerId}`, { params: { limit, offset } }),

  // カテゴリ別アイテム一覧取得
  getItemsByCategory: (categoryId: number, limit = 20, offset = 0) =>
    apiClient.get(`/api/items/category/${categoryId}`, { params: { limit, offset } }),

  // アイテム検索
  searchItems: (keyword: string, limit = 20, offset = 0) =>
    apiClient.get('/api/items/search', { params: { q: keyword, limit, offset } }),

  // アイテム作成（認証必須）
  createItem: (data: unknown) =>
    apiClient.post('/api/items', data),

  // アイテム更新（認証必須）
  updateItem: (id: number, data: unknown) =>
    apiClient.put(`/api/items/${id}`, data),

  // アイテム削除（認証必須）
  deleteItem: (id: number) =>
    apiClient.delete(`/api/items/${id}`),

  // アイテム購入（認証必須）
  purchaseItem: (id: number, data: { address_id: number; payment_method: string; points_used: number }) =>
    apiClient.post(`/api/items/${id}/purchase`, data),
};

export const likeApi = {
  addLike: (itemId: number) =>
    apiClient.post(`/api/items/${itemId}/likes`),

  removeLike: (itemId: number) =>
    apiClient.delete(`/api/items/${itemId}/likes`),

  getLikeStatus: (itemId: number) =>
    apiClient.get(`/api/items/${itemId}/likes/status`),
};

export const commentApi = {
  addComment: (itemId: number, comment: string) =>
    apiClient.post(`/api/items/${itemId}/comments`, { comment }),

  getComments: (itemId: number, limit = 10, offset = 0) =>
    apiClient.get(`/api/items/${itemId}/comments`, { params: { limit, offset } }),

  deleteComment: (commentId: number) =>
    apiClient.delete(`/api/comments/${commentId}`),
};

export const followApi = {
  addFollow: (userId: number) =>
    apiClient.post(`/api/users/${userId}/follow`),

  removeFollow: (userId: number) =>
    apiClient.delete(`/api/users/${userId}/follow`),
};

export const addressApi = {
  getAddresses: () =>
    apiClient.get('/api/addresses'),

  createAddress: (data: { name: string; postal_code: string; address: string; phone: string }) =>
    apiClient.post('/api/addresses', data),

  updateAddress: (id: number, data: Partial<{ name: string; postal_code: string; address: string; phone: string }>) =>
    apiClient.put(`/api/addresses/${id}`, data),

  deleteAddress: (id: number) =>
    apiClient.delete(`/api/addresses/${id}`),
};
