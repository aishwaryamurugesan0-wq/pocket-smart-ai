import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import db from '../services/localStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async (userId) => {
    const p = await db.profiles.get(userId);
    setProfile(p);
    return p;
  }, []);

  useEffect(() => {
    const session = db.auth.getSession();
    if (session) {
      setUser(session);
      refreshProfile(session.id).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshProfile]);

  const register = async ({ fullName, email, password }) => {
    const { user: u, profile: p } = await db.auth.register({ fullName, email, password });
    setUser(u);
    setProfile(p);
    return { user: u, profile: p };
  };

  const login = async ({ email, password }) => {
    const { user: u, profile: p } = await db.auth.login({ email, password });
    setUser(u);
    setProfile(p);
    return { user: u, profile: p };
  };

  const logout = () => {
    db.auth.logout();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (patch) => {
    const updated = await db.profiles.update(user.id, patch);
    setProfile(updated);
    return updated;
  };

  const resetPassword = async ({ email, newPassword }) => db.auth.resetPassword({ email, newPassword });

  return (
    <AuthContext.Provider value={{ user, profile, loading, register, login, logout, updateProfile, resetPassword, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
