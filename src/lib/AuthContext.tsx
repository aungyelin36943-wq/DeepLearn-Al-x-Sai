import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  vipExpiresAt: number | null;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  checkVipStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  vipExpiresAt: null,
  isAdmin: false,
  signIn: async () => {},
  signOut: async () => {},
  checkVipStatus: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [vipExpiresAt, setVipExpiresAt] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserData = async (uid: string, email: string | null) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      const isOwner = email === 'aungyelin36943@gmail.com';
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        let role = data.role;
        
        // Auto-promote owner to admin if they are not already
        if (isOwner && role !== 'admin') {
          await setDoc(userRef, { role: 'admin' }, { merge: true });
          role = 'admin';
        }
        
        setVipExpiresAt(data.vipExpiresAt || null);
        setIsAdmin(role === 'admin');
      } else {
        // Create initial user doc
        const initialRole = isOwner ? 'admin' : 'user';
        const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
        const initialVipExpiresAt = initialRole === 'admin' ? null : Date.now() + twoDaysMs;
        
        await setDoc(userRef, {
          email: email,
          vipExpiresAt: initialVipExpiresAt,
          role: initialRole,
          createdAt: Date.now()
        });
        setVipExpiresAt(initialVipExpiresAt);
        setIsAdmin(initialRole === 'admin');
        
        if (initialRole !== 'admin') {
          toast.success('အကောင့်စတင်ဖွင့်လိုက်တဲ့အတွက် အခမဲ့ (၂) ရက် VIP ရရှိသွားပါပြီ!', {
            duration: 6000,
            icon: '🎉'
          });
        }
      }
    } catch (e: any) {
      console.error("Error fetching user data", e);
      // Graceful fallback for offline error or permission error
      if (e.message?.includes('offline') || e.code === 'unavailable') {
        toast.error('Network error connecting to database. Please refresh or try again later.', { duration: 5000 });
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserData(currentUser.uid, currentUser.email);
      } else {
        setVipExpiresAt(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign in error', error);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const checkVipStatus = async () => {
    if (user) {
      await fetchUserData(user.uid, user.email);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, vipExpiresAt, isAdmin, signIn, signOut, checkVipStatus }}>
      {children}
    </AuthContext.Provider>
  );
}
