import { useState, useEffect, useRef, createContext, useContext } from 'react';
import type { User as FirebaseUser, AuthError } from 'firebase/auth';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  onIdTokenChanged
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

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isNewUser: boolean;
  setIsNewUser: (value: boolean) => void;
  token: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  registerBackend: (nickname: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // ユーザー情報の状態管理
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const profileRef = useRef<UserProfile | null>(null);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // Helper function to handle user registration status
  const handleUserRegistrationStatus = async () => {
    try {
      const response = await userApi.getMe();
      if (response.data.registered === false) {
        setIsNewUser(true);
        setProfile(null);
      } else {
        setProfile(response.data);
        setIsNewUser(false);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // If profile is already set, don't call getMe again
        if (profileRef.current) {
          setUser(firebaseUser);
          setLoading(false);
          return;
        }

        let idTokenResult = await firebaseUser.getIdTokenResult();
        let registered = idTokenResult.claims.registered;

        // If registered claim is not set, refresh token to get updated claims
        if (registered === undefined) {
          await firebaseUser.getIdToken(true);
          idTokenResult = await firebaseUser.getIdTokenResult();
          registered = idTokenResult.claims.registered;
        }

        if (registered === true || registered === undefined) {
          // Call getMe to fetch user data
          await handleUserRegistrationStatus();
        } else {
          // registered === false
          setIsNewUser(true);
          setProfile(null);
        }
      } else {
        setProfile(null);
        setToken(null);
      }

      setUser(firebaseUser);
      setLoading(false);
    });

    const unsubscribeToken = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setToken(token);
      } else {
        setToken(null);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeToken();
    };
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
      // New user created, set flag
      setIsNewUser(true);
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

      // Update profile and isNewUser immediately
      setProfile(response.data);
      setIsNewUser(false);
      // Update profileRef immediately to prevent getMe from being called again
      profileRef.current = response.data;

      // Poll for custom claims to be set (max 5 seconds, check every 200ms)
      if (user) {
        const maxAttempts = 25;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await user.getIdToken(true);
          const idTokenResult = await user.getIdTokenResult();

          if (idTokenResult.claims.registered === true) {
            return response.data;
          }

          // Wait 200ms before next attempt
          if (attempt < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }

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

  const value = {
    user,
    profile,
    loading,
    error,
    isNewUser,
    setIsNewUser,
    token,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    registerBackend,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
