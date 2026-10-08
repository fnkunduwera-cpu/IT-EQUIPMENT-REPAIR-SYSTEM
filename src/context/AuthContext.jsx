import { createContext, useContext, useMemo, useState } from 'react';
import {
  authenticate,
  changeOwnPassword as saveOwnPassword,
  changePassword as savePassword,
  clearSession,
  readSession,
  readUsers,
  registerUser,
  removeUser,
} from './auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession());
  const [accounts, setAccounts] = useState(() => readUsers());

  const api = useMemo(() => ({
    user,
    accounts,
    login: (email, password) => {
      const result = authenticate(email, password);
      if (typeof result === 'string') return result;
      setUser(result);
      return result;
    },
    signup: (payload) => {
      const result = registerUser(payload);
      if (typeof result !== 'string') setAccounts(readUsers());
      return result;
    },
    removeAccount: (email) => {
      const result = removeUser(email, user?.email);
      if (result === true) setAccounts(readUsers());
      return result;
    },
    changeAccountPassword: (email, password) => {
      return savePassword(email, password);
    },
    changeOwnPassword: (currentPassword, nextPassword) => {
      return saveOwnPassword(user?.email, currentPassword, nextPassword);
    },
    logout: () => {
      clearSession();
      setUser(null);
    },
  }), [user, accounts]);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}