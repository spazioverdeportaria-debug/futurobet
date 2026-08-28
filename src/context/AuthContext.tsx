import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { db, doc, getDoc, setDoc, updateDoc, onSnapshot, handleFirestoreError, OperationType } from '../lib/firebase';
import { validateCPF } from '../utils/cpfValidator';

export interface UserAccount {
  cpf: string;
  name: string;
  phone: string;
  passwordHash: string;
  balance: number;
  balanceBonus: number;
  termsAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  lastDailySpin?: string;
  referralCode?: string;
}

interface AuthContextType {
  account: UserAccount | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (cpf: string, password: string, remember?: boolean) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    cpf: string;
    phone: string;
    password: string;
    termsAccepted: boolean;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateBalance: (newBalance: number) => Promise<void>;
  setLastSpinDate: (dateStr: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  account: null,
  isLoggedIn: false,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  updateBalance: async () => {},
  setLastSpinDate: async () => {},
});

const STORAGE_SESSION_KEY = 'futurobet_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Carrega a sessão salva no dispositivo (Remember Me)
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Collect all locally stored accounts across keys to sync to Firestore and Backend
        const localAccountsToSync: UserAccount[] = [];
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('futurobet_user_') || key.startsWith('vegasbet_user_') || key === STORAGE_SESSION_KEY)) {
              const raw = localStorage.getItem(key);
              if (raw) {
                try {
                  const parsed = JSON.parse(raw);
                  if (parsed && parsed.cpf) {
                    localAccountsToSync.push(parsed);
                  }
                } catch (e) {
                  // ignore
                }
              }
            }
          }
        } catch (e) {
          // ignore
        }

        // Sync local accounts to backend and Firestore
        if (localAccountsToSync.length > 0) {
          fetch('/api/users/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ users: localAccountsToSync }),
          }).catch(() => null);

          // Push each to Firestore
          localAccountsToSync.forEach(async (u) => {
            const clean = u.cpf.replace(/\D/g, '');
            if (clean) {
              try {
                await setDoc(doc(db, 'users', clean), u, { merge: true });
              } catch (e) {
                // ignore
              }
            }
          });
        }

        const savedSession = localStorage.getItem(STORAGE_SESSION_KEY);
        if (savedSession) {
          const sessionData = JSON.parse(savedSession);
          if (sessionData && sessionData.cpf) {
            const cleanCpf = sessionData.cpf.replace(/\D/g, '');
            const fallbackUser: UserAccount = {
              cpf: sessionData.cpf,
              name: sessionData.name || 'Jogador FuturoBet',
              phone: sessionData.phone || '',
              passwordHash: sessionData.passwordHash || '',
              balance: typeof sessionData.balance === 'number' ? sessionData.balance : 50.00,
              balanceBonus: sessionData.balanceBonus || 0.00,
              termsAccepted: true,
              createdAt: sessionData.createdAt || new Date().toISOString(),
              updatedAt: sessionData.updatedAt || new Date().toISOString(),
              lastDailySpin: sessionData.lastDailySpin,
              referralCode: sessionData.referralCode
            };

            try {
              const userDocRef = doc(db, 'users', cleanCpf);
              const snapshot = await getDoc(userDocRef);
              if (snapshot.exists()) {
                const userData = snapshot.data() as UserAccount;
                setAccount(userData);
              } else {
                // Save fallback to Firestore so it exists in DB
                setDoc(userDocRef, fallbackUser, { merge: true }).catch(() => null);
                setAccount(fallbackUser);
              }
            } catch (firestoreErr) {
              console.warn('Firestore offline ou restrito na inicialização, usando sessão local:', firestoreErr);
              setAccount(fallbackUser);
            }
          }
        }
      } catch (err) {
        console.warn('Sessão restaurada com fallback:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Escuta atualizações do Firestore em tempo real quando o usuário está logado
  useEffect(() => {
    if (!account?.cpf) return;
    const cleanCpf = account.cpf.replace(/\D/g, '');
    const userDocRef = doc(db, 'users', cleanCpf);

    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const liveData = snapshot.data() as UserAccount;
          setAccount(liveData);
          // Atualiza localStorage
          localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(liveData));
        }
      },
      (error) => {
        console.warn('Firestore snapshot listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [account?.cpf]);

  // LOGIN com CPF e Senha
  const login = useCallback(async (cpfInput: string, passwordInput: string, remember: boolean = true) => {
    const cleanCpf = cpfInput.replace(/\D/g, '');
    if (!validateCPF(cleanCpf)) {
      return { success: false, message: 'CPF inválido. Verifique os dígitos digitados.' };
    }
    if (!passwordInput || passwordInput.length < 4) {
      return { success: false, message: 'A senha deve conter no mínimo 4 dígitos.' };
    }

    try {
      const userDocRef = doc(db, 'users', cleanCpf);
      let userSnapshot;
      try {
        userSnapshot = await getDoc(userDocRef);
      } catch (e) {
        // Fallback local caso Firestore esteja offline
      }

      if (userSnapshot && userSnapshot.exists()) {
        const userData = userSnapshot.data() as UserAccount;
        if (userData.passwordHash && userData.passwordHash !== passwordInput) {
          return { success: false, message: 'Senha incorreta. Tente novamente.' };
        }

        setAccount(userData);
        if (remember) {
          localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userData));
        }
        return { success: true };
      } else {
        // Verifica se há cadastro em cache local
        const localSaved = localStorage.getItem(`futurobet_user_${cleanCpf}`);
        if (localSaved) {
          const localUser = JSON.parse(localSaved) as UserAccount;
          if (localUser.passwordHash && localUser.passwordHash !== passwordInput) {
            return { success: false, message: 'Senha incorreta. Tente novamente.' };
          }
          setAccount(localUser);
          if (remember) {
            localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(localUser));
          }
          return { success: true };
        }

        return { success: false, message: 'CPF não encontrado. Crie seu cadastro gratuitamente em 20 segundos.' };
      }
    } catch (err: any) {
      return { success: false, message: err?.message || 'Erro ao realizar login. Tente novamente.' };
    }
  }, []);

  // CADASTRO DE NOVO JOGADOR
  const register = useCallback(async (data: {
    name: string;
    cpf: string;
    phone: string;
    password: string;
    termsAccepted: boolean;
  }) => {
    const cleanCpf = data.cpf.replace(/\D/g, '');
    if (!data.name || data.name.trim().length < 3) {
      return { success: false, message: 'Informe seu nome completo.' };
    }
    if (!validateCPF(cleanCpf)) {
      return { success: false, message: 'CPF inválido. Digite um CPF válido.' };
    }
    const cleanPhone = data.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return { success: false, message: 'Informe um WhatsApp/Telefone válido com DDD.' };
    }
    if (!data.password || data.password.length < 4) {
      return { success: false, message: 'Crie uma senha de no mínimo 4 caracteres.' };
    }
    if (!data.termsAccepted) {
      return { success: false, message: 'Você precisa aceitar os Termos e ter mais de 18 anos.' };
    }

    const newUser: UserAccount = {
      cpf: cleanCpf,
      name: data.name.trim(),
      phone: data.phone.trim(),
      passwordHash: data.password,
      balance: 50.00, // Saldo inicial de boas-vindas
      balanceBonus: 0.00,
      termsAccepted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      referralCode: 'FUTURO' + Math.floor(1000 + Math.random() * 9000),
    };

    try {
      // Salva no Firestore
      const userDocRef = doc(db, 'users', cleanCpf);
      try {
        await setDoc(userDocRef, newUser, { merge: true });
      } catch (err) {
        console.warn('Erro ao salvar no Firestore (usando fallback offline):', err);
      }

      // Salva no backend
      fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: newUser }),
      }).catch(() => null);

      // Salva em cache do aparelho
      localStorage.setItem(`futurobet_user_${cleanCpf}`, JSON.stringify(newUser));
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(newUser));
      setAccount(newUser);

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Erro ao realizar cadastro.' };
    }
  }, []);

  // LOGOUT
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    setAccount(null);
  }, []);

  // ATUALIZAR SALDO
  const updateBalance = useCallback(async (newBalance: number) => {
    const cleanBal = parseFloat(Math.max(0, newBalance).toFixed(2));
    setAccount(prev => prev ? { ...prev, balance: cleanBal } : null);

    if (account?.cpf) {
      const cleanCpf = account.cpf.replace(/\D/g, '');
      const userDocRef = doc(db, 'users', cleanCpf);
      try {
        await updateDoc(userDocRef, {
          balance: cleanBal,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        // Fallback local
      }

      const updated = { ...account, balance: cleanBal, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updated));
      localStorage.setItem(`futurobet_user_${cleanCpf}`, JSON.stringify(updated));
    }
  }, [account]);

  // REGISTRAR DATA DA ROLETA DIÁRIA
  const setLastSpinDate = useCallback(async (dateStr: string) => {
    setAccount(prev => prev ? { ...prev, lastDailySpin: dateStr } : null);
    if (account?.cpf) {
      const cleanCpf = account.cpf.replace(/\D/g, '');
      const userDocRef = doc(db, 'users', cleanCpf);
      try {
        await updateDoc(userDocRef, {
          lastDailySpin: dateStr,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        // Fallback local
      }
    }
  }, [account?.cpf]);

  return (
    <AuthContext.Provider
      value={{
        account,
        isLoggedIn: !!account,
        isLoading,
        login,
        register,
        logout,
        updateBalance,
        setLastSpinDate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
