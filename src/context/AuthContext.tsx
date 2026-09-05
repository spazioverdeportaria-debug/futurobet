import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { db, doc, getDoc, setDoc, updateDoc, onSnapshot, handleFirestoreError, OperationType } from '../lib/firebase';
import { validateCPF } from '../utils/cpfValidator';
import { hashPassword, verifyPassword } from '../utils/security';

export interface UserAccount {
  id?: string;
  cpf?: string;
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
  login: (identifier: string, password: string, remember?: boolean) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    phone: string;
    password: string;
    termsAccepted: boolean;
    cpf?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  updateUserCpf: (cpf: string) => Promise<{ success: boolean; message?: string }>;
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
  updateUserCpf: async () => ({ success: false }),
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
              balance: typeof sessionData.balance === 'number' ? (sessionData.balance === 50 ? 0.00 : sessionData.balance) : 0.00,
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
    const uKey = (account?.cpf ? account.cpf.replace(/\D/g, '') : '') || account?.id || (account?.phone ? `tel_${account.phone.replace(/\D/g, '')}` : '');
    if (!uKey) return;
    const userDocRef = doc(db, 'users', uKey);

    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const liveData = snapshot.data() as UserAccount;
          setAccount(liveData);
          localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(liveData));
        }
      },
      (error) => {
        console.warn('Firestore snapshot listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [account?.cpf, account?.id, account?.phone]);

  // LOGIN com Telefone, Nome ou CPF + Senha
  const login = useCallback(async (identifierInput: string, passwordInput: string, remember: boolean = true) => {
    const cleanIdent = (identifierInput || '').trim();
    if (!cleanIdent || cleanIdent.length < 2) {
      return { success: false, message: 'Informe seu número de telefone ou seu nome.' };
    }
    if (!passwordInput || passwordInput.length < 4) {
      return { success: false, message: 'A senha deve conter no mínimo 4 dígitos.' };
    }

    const cleanDigits = cleanIdent.replace(/\D/g, '');
    const nameSearch = cleanIdent.toLowerCase();

    try {
      // 1. Procurar em contas salvas no aparelho (localStorage)
      let localMatchedUser: UserAccount | null = null;
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('futurobet_user_') || key.startsWith('vegasbet_user_') || key === STORAGE_SESSION_KEY)) {
            const raw = localStorage.getItem(key);
            if (raw) {
              try {
                const parsed = JSON.parse(raw) as UserAccount;
                if (parsed) {
                  const uPhone = (parsed.phone || '').replace(/\D/g, '');
                  const uCpf = (parsed.cpf || '').replace(/\D/g, '');
                  const uName = (parsed.name || '').trim().toLowerCase();

                  const phoneMatches = cleanDigits.length >= 8 && (uPhone.includes(cleanDigits) || cleanDigits.includes(uPhone));
                  const cpfMatches = cleanDigits.length >= 10 && uCpf === cleanDigits;
                  const nameMatches = nameSearch.length >= 3 && (uName === nameSearch || uName.includes(nameSearch) || nameSearch.includes(uName));

                  if (phoneMatches || cpfMatches || nameMatches) {
                    localMatchedUser = parsed;
                    break;
                  }
                }
              } catch {
                // ignore
              }
            }
          }
        }
      } catch {
        // ignore
      }

      if (localMatchedUser) {
        const isPassValid = await verifyPassword(passwordInput, localMatchedUser.passwordHash);
        if (!isPassValid) {
          return { success: false, message: 'Senha incorreta. Confira a senha digitada.' };
        }

        const updatedUser = {
          ...localMatchedUser,
          updatedAt: new Date().toISOString(),
        };

        const uKey = updatedUser.cpf?.replace(/\D/g, '') || updatedUser.id || (updatedUser.phone ? `tel_${updatedUser.phone.replace(/\D/g, '')}` : '');
        if (uKey) {
          try {
            setDoc(doc(db, 'users', uKey), updatedUser, { merge: true }).catch(() => null);
          } catch {}
          localStorage.setItem(`futurobet_user_${uKey}`, JSON.stringify(updatedUser));
        }

        fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: updatedUser }),
        }).catch(() => null);

        setAccount(updatedUser);
        if (remember) {
          localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updatedUser));
        }
        return { success: true };
      }

      // 2. Procurar no Servidor Backend (/api/users/login)
      try {
        const res = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: cleanIdent, password: passwordInput }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          const serverUser: UserAccount = {
            id: data.user.id,
            cpf: data.user.cpf || '',
            name: data.user.name || 'Jogador FuturoBet',
            phone: data.user.phone || '',
            passwordHash: data.user.passwordHash || passwordInput,
            balance: typeof data.user.balance === 'number' ? (data.user.balance === 50 ? 0.00 : data.user.balance) : 0.00,
            balanceBonus: data.user.balanceBonus || 0.00,
            termsAccepted: true,
            createdAt: data.user.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            referralCode: data.user.referralCode,
          };

          const uKey = serverUser.cpf?.replace(/\D/g, '') || serverUser.id || (serverUser.phone ? `tel_${serverUser.phone.replace(/\D/g, '')}` : '');
          if (uKey) {
            localStorage.setItem(`futurobet_user_${uKey}`, JSON.stringify(serverUser));
          }
          if (remember) {
            localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(serverUser));
          }
          setAccount(serverUser);
          return { success: true };
        } else if (data.error && !data.notFound) {
          return { success: false, message: data.error };
        }
      } catch (backendErr) {
        console.warn('Backend login fallback:', backendErr);
      }

      // 3. Fallback no Firestore por número
      if (cleanDigits.length >= 8) {
        try {
          const docDirect = await getDoc(doc(db, 'users', cleanDigits)).catch(() => null);
          const docTel = !docDirect?.exists() ? await getDoc(doc(db, 'users', `tel_${cleanDigits}`)).catch(() => null) : null;
          const matchedSnap = (docDirect && docDirect.exists()) ? docDirect : (docTel && docTel.exists() ? docTel : null);

          if (matchedSnap) {
            const firestoreUser = matchedSnap.data() as UserAccount;
            const isPassValid = await verifyPassword(passwordInput, firestoreUser.passwordHash);
            if (!isPassValid) {
              return { success: false, message: 'Senha incorreta. Confira a senha digitada.' };
            }

            setAccount(firestoreUser);
            if (remember) {
              localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(firestoreUser));
            }
            return { success: true };
          }
        } catch {
          // ignore
        }
      }

      return { 
        success: false, 
        message: 'Não encontramos uma conta com este telefone ou nome. Cadastre-se em segundos!' 
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Erro ao realizar login. Tente novamente.' };
    }
  }, []);

  // CADASTRO DE NOVO JOGADOR (Simples e Prático para idosos: Nome, Celular e Senha)
  const register = useCallback(async (data: {
    name: string;
    phone: string;
    password: string;
    termsAccepted: boolean;
    cpf?: string;
  }) => {
    if (!data.name || data.name.trim().length < 3) {
      return { success: false, message: 'Por favor, informe seu nome completo.' };
    }
    const cleanPhone = (data.phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return { success: false, message: 'Informe seu WhatsApp ou Telefone com DDD (ex: 11 99999-9999).' };
    }
    if (!data.password || data.password.length < 4) {
      return { success: false, message: 'Crie uma senha de no mínimo 4 caracteres.' };
    }
    if (!data.termsAccepted) {
      return { success: false, message: 'Você precisa confirmar que tem mais de 18 anos.' };
    }

    const cleanCpf = data.cpf ? data.cpf.replace(/\D/g, '') : '';
    if (cleanCpf && !validateCPF(cleanCpf)) {
      return { success: false, message: 'CPF inválido. Verifique os dígitos.' };
    }

    const userKey = cleanCpf || `tel_${cleanPhone}`;
    const hashedPassword = await hashPassword(data.password);

    const newUser: UserAccount = {
      id: userKey,
      cpf: cleanCpf,
      name: data.name.trim(),
      phone: data.phone.trim(),
      passwordHash: hashedPassword,
      balance: 0.00, // Saldo inicial zerado
      balanceBonus: 0.00,
      termsAccepted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      referralCode: 'FUTURO' + Math.floor(1000 + Math.random() * 9000),
    };

    try {
      // Salva no Firestore
      const userDocRef = doc(db, 'users', userKey);
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
      localStorage.setItem(`futurobet_user_${userKey}`, JSON.stringify(newUser));
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(newUser));
      setAccount(newUser);

      // Dispara evento no Meta Pixel
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'CompleteRegistration', {
          content_name: 'Cadastro FuturoBet',
          status: true,
        });
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Erro ao realizar cadastro.' };
    }
  }, []);

  // ATUALIZAR CPF DO USUÁRIO (Preenchido no primeiro Saque PIX)
  const updateUserCpf = useCallback(async (cpfInput: string) => {
    const cleanCpf = (cpfInput || '').replace(/\D/g, '');
    if (!validateCPF(cleanCpf)) {
      return { success: false, message: 'CPF inválido. Por favor, digite os 11 dígitos do seu CPF.' };
    }

    if (!account) {
      return { success: false, message: 'Nenhum jogador conectado.' };
    }

    const updated: UserAccount = {
      ...account,
      cpf: cleanCpf,
      updatedAt: new Date().toISOString(),
    };

    setAccount(updated);
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updated));
    localStorage.setItem(`futurobet_user_${cleanCpf}`, JSON.stringify(updated));

    try {
      await setDoc(doc(db, 'users', cleanCpf), updated, { merge: true });
      if (account.id && account.id !== cleanCpf) {
        await setDoc(doc(db, 'users', account.id), updated, { merge: true }).catch(() => null);
      }
    } catch (e) {
      console.warn('Erro ao salvar CPF no Firestore:', e);
    }

    fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: updated }),
    }).catch(() => null);

    return { success: true };
  }, [account]);

  // LOGOUT
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    setAccount(null);
  }, []);

  // ATUALIZAR SALDO
  const updateBalance = useCallback(async (newBalance: number) => {
    const cleanBal = parseFloat(Math.max(0, newBalance).toFixed(2));
    setAccount(prev => prev ? { ...prev, balance: cleanBal } : null);

    if (account) {
      const uKey = (account.cpf ? account.cpf.replace(/\D/g, '') : '') || account.id || (account.phone ? `tel_${account.phone.replace(/\D/g, '')}` : '');
      if (uKey) {
        const userDocRef = doc(db, 'users', uKey);
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
        localStorage.setItem(`futurobet_user_${uKey}`, JSON.stringify(updated));
      }
    }
  }, [account]);

  // REGISTRAR DATA DA ROLETA DIÁRIA
  const setLastSpinDate = useCallback(async (dateStr: string) => {
    setAccount(prev => prev ? { ...prev, lastDailySpin: dateStr } : null);
    if (account) {
      const uKey = (account.cpf ? account.cpf.replace(/\D/g, '') : '') || account.id || (account.phone ? `tel_${account.phone.replace(/\D/g, '')}` : '');
      if (uKey) {
        const userDocRef = doc(db, 'users', uKey);
        try {
          await updateDoc(userDocRef, {
            lastDailySpin: dateStr,
            updatedAt: new Date().toISOString(),
          });
        } catch (err) {
          // Fallback local
        }
      }
    }
  }, [account]);

  return (
    <AuthContext.Provider
      value={{
        account,
        isLoggedIn: !!account,
        isLoading,
        login,
        register,
        updateUserCpf,
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
