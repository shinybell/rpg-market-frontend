import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（トークン自動付与）
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('認証エラー: トークンが無効です');
    }
    return Promise.reject(error);
  }
);

// API エンドポイント
export const userApi = {
  login: (nickname: string) =>
    apiClient.post('/api/auth/login', { nickname }),

  getMe: () =>
    apiClient.get('/api/auth/me'),

  updateProfile: (data: { nickname?: string; bio?: string; avatar_url?: string }) =>
    apiClient.put('/api/users/profile', data),

  deleteUser: () =>
    apiClient.delete('/api/users'),
};
