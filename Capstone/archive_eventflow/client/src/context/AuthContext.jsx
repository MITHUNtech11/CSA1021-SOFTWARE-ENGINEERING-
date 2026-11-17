import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS, DEFAULT_USER, getMockUserById, getMockUserByEmail } from '../data/mockUsers.js';

const STORAGE_KEY = 'eventflow_auth_user';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize user from localStorage, fallback to DEFAULT_USER (Aditya Nair) if empty
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'guest') {
        return null;
      }
      if (stored) {
        return JSON.parse(stored);
      }
      // Default to Aditya Nair on first boot
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    } catch (err) {
      console.warn('Failed to parse stored auth user:', err);
      return DEFAULT_USER;
    }
  });

  // Modal display states for seamless global accessibility
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('student'); // 'student' | 'admin' | 'signup'
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sync state changes with localStorage
  const saveUserSession = (newUser) => {
    if (newUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
    } else {
      localStorage.setItem(STORAGE_KEY, 'guest');
      setUser(null);
    }
  };

  /**
   * Log in using email and optional password / roleHint
   */
  const login = async (email, password, roleHint = 'student') => {
    if (!email || !email.trim()) {
      throw new Error('Please enter a valid email address.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = getMockUserByEmail(cleanEmail);

    if (existing) {
      saveUserSession(existing);
      return { success: true, user: existing };
    }

    // Allow custom campus logins seamlessly
    const customUser = {
      id: `user_${Date.now()}`,
      name: cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      email: cleanEmail,
      role: roleHint === 'admin' ? 'admin' : 'student',
      roleTitle: roleHint === 'admin' ? 'Event Coordinator' : 'Student Attendee',
      department: 'Computer Science & Engineering',
      year: roleHint === 'admin' ? 'Faculty / Staff' : '3rd Year',
      roll: roleHint === 'admin' ? 'FAC-GEN-01' : 'CS23B1999',
      college: 'Campus University of Technology',
      phone: '+91 98765 00000',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: 'Campus Community Member',
      statusBadge: roleHint === 'admin' ? 'Organizer' : 'Verified Student ID'
    };

    saveUserSession(customUser);
    return { success: true, user: customUser };
  };

  /**
   * Quick 1-Click login as demo persona
   */
  const loginAsDemo = (userId) => {
    const demo = getMockUserById(userId);
    if (!demo) {
      throw new Error(`Demo persona with ID "${userId}" not found.`);
    }
    saveUserSession(demo);
    return { success: true, user: demo };
  };

  /**
   * Register a new user
   */
  const signup = async (userData) => {
    if (!userData.email || !userData.name) {
      throw new Error('Name and email are required to create an account.');
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      role: userData.role || 'student',
      roleTitle: userData.role === 'admin' ? (userData.roleTitle || 'Event Organizer') : 'Student Attendee',
      department: userData.department || 'Computer Science & Engineering',
      year: userData.year || '1st Year',
      roll: userData.roll || `STU${Math.floor(1000 + Math.random() * 9000)}`,
      college: userData.college || 'Campus University of Technology',
      phone: userData.phone || '+91 98765 00000',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: userData.bio || 'New Campus Community Member',
      statusBadge: userData.role === 'admin' ? 'Organizer' : 'Verified Student ID'
    };

    saveUserSession(newUser);
    return { success: true, user: newUser };
  };

  /**
   * Log out active user and transition to guest mode
   */
  const logout = () => {
    saveUserSession(null);
    setIsProfileModalOpen(false);
  };

  /**
   * Update profile details for current active user
   */
  const updateProfile = (data) => {
    if (!user) return;
    const updated = { ...user, ...data };
    saveUserSession(updated);
    return updated;
  };

  // Helper methods to trigger auth modals globally
  const openAuthModal = (tab = 'student') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  // Determine active role
  const role = user ? (user.role || 'student') : 'guest';
  const isAuthenticated = Boolean(user);

  const value = {
    user,
    role, // 'student' | 'admin' | 'guest'
    isAuthenticated,
    login,
    loginAsDemo,
    signup,
    logout,
    updateProfile,
    // Modal states
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    openAuthModal,
    closeAuthModal,
    isProfileModalOpen,
    setIsProfileModalOpen,
    openProfileModal,
    closeProfileModal
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
