import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, OperatorAccount } from '../types';
import { OPERATOR_ACCOUNTS } from '../services/mockData';

interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  loginAsRole: (role: UserRole) => void;
  loginCustom: (email: string, role: UserRole, operatorId?: string, counterId?: string) => void;
  loginAsOperator: (operatorId: string) => boolean;
  loginWithCredentials: (email: string, password?: string) => { success: boolean; message: string };
  logout: () => void;
  availableTestProfiles: UserProfile[];
  operatorAccounts: OperatorAccount[];
}

export const TEST_PROFILES: UserProfile[] = [
  {
    id: 'usr-admin-01',
    email: 'admin@jatrasheba.com',
    phone: '+8801700000001',
    fullName: 'Farabi Rahman (Super Admin)',
    role: 'super_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
  },
  {
    id: 'usr-opr-01',
    email: 'greenline@operator.com',
    phone: '+8801711000001',
    fullName: 'Kamrul Hassan (Green Line Manager)',
    role: 'operator_owner',
    operatorId: 'op-01',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
  },
  {
    id: 'usr-cnt-01',
    email: 'pos.sayedabad@jatrasheba.com',
    phone: '+8801811223344',
    fullName: 'Md. Rafiqul Islam (Sayedabad POS)',
    role: 'counter_operator',
    operatorId: 'op-01',
    counterId: 'cnt-01',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop',
  },
  {
    id: 'usr-pass-01',
    email: 'passenger@example.com',
    phone: '+8801912345678',
    fullName: 'Tanvir Ahmed (Passenger)',
    role: 'passenger',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&h=120&fit=crop',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('jatrasheba_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return TEST_PROFILES[3]; // Default to passenger
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('jatrasheba_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('jatrasheba_user');
    }
  }, [currentUser]);

  const loginAsRole = (role: UserRole) => {
    const profile = TEST_PROFILES.find((p) => p.role === role) || TEST_PROFILES[3];
    setCurrentUser(profile);
  };

  const loginAsOperator = (operatorId: string): boolean => {
    const oprAcc = OPERATOR_ACCOUNTS.find((acc) => acc.operatorId === operatorId);
    if (!oprAcc) return false;
    setCurrentUser({
      id: oprAcc.id,
      email: oprAcc.email,
      phone: oprAcc.phone,
      fullName: oprAcc.fullName,
      role: 'operator_owner',
      operatorId: oprAcc.operatorId,
      avatarUrl: oprAcc.logoUrl,
    });
    return true;
  };

  const loginWithCredentials = (email: string, password?: string): { success: boolean; message: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    // Check if matches an operator account
    const matchedOperator = OPERATOR_ACCOUNTS.find((acc) => acc.email.toLowerCase() === trimmedEmail);
    if (matchedOperator) {
      if (password && password !== matchedOperator.passwordHint) {
        return { success: false, message: `Incorrect password! Hint for demo: ${matchedOperator.passwordHint}` };
      }
      loginAsOperator(matchedOperator.operatorId);
      return { success: true, message: `Signed in as ${matchedOperator.companyName} (${matchedOperator.fullName})` };
    }

    // Check test profiles
    const matchedProfile = TEST_PROFILES.find((p) => p.email.toLowerCase() === trimmedEmail);
    if (matchedProfile) {
      setCurrentUser(matchedProfile);
      return { success: true, message: `Signed in as ${matchedProfile.fullName}` };
    }

    return { success: false, message: 'Invalid email address. Please use one of the operator demo accounts.' };
  };

  const loginCustom = (email: string, role: UserRole, operatorId?: string, counterId?: string) => {
    setCurrentUser({
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      email,
      phone: '+8801700000000',
      fullName: email.split('@')[0],
      role,
      operatorId,
      counterId,
    });
  };

  const logout = () => {
    setCurrentUser(TEST_PROFILES[3]); // Revert to passenger
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || 'passenger',
        isAuthenticated: !!currentUser,
        loginAsRole,
        loginCustom,
        loginAsOperator,
        loginWithCredentials,
        logout,
        availableTestProfiles: TEST_PROFILES,
        operatorAccounts: OPERATOR_ACCOUNTS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
