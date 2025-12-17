import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  AuthError
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { userApi } from '../services/api';

export interface UserProfile {
  id: number;
  firebase_uid: string;
  email: string;
  profile?: {
    nickname: string;
    bio?: string;
    avatar_url?: string;
  };
  wallet?: {
    balance: number;
    points: number;
  };
}

export const useAuth = () => {
  // ユーザー情報の状態管理
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const response = await userApi.getMe();
          setProfile(response.data);
        } catch (err) {
          console.error('プロフィール取得エラー:', err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      throw err;
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      throw err;
    }
  };

  const registerBackend = async (nickname: string) => {
    try {
      setError(null);
      const response = await userApi.login(nickname);
      setProfile(response.data);
      return response.data;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setProfile(null);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      throw err;
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    registerBackend,
    logout,
  };
};
