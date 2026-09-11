import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldCheck, Lock, User, KeyRound, AlertTriangle, Power,
  CheckCircle2, XCircle, Search, DollarSign, Plus, Minus,
  RefreshCw, Users, CreditCard, Clock, Eye, EyeOff,
  Copy, Check, ArrowLeft, Trash2, Edit3, Smartphone,
  FileText, Calendar, ShieldAlert
} from 'lucide-react';
import { db, collection, getDocs, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from '../lib/firebase';
import { soundEngine } from '../utils/audio';

export interface UserProfile {
  id?: string;
  cpf: string;
  name: string;
  phone?: string;
  passwordHash?: string;
  balance: number;
  balanceBonus?: number;
  createdAt?: string;
  updatedAt?: string;
  email?: string;
  displayName?: string;
  referralCode?: string;
}

export interface DepositItem {
  id: string;
  transactionId: string;
  cpf: string;
  clientName: string;
  amount: number;
  bonusAmount: number;
  totalAmount: number;
  status: 'WAITING_PAYMENT' | 'PAID_PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  gatewayStatus?: string;
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
  pixCode?: string;
}

interface AdminPanelProps {
  onBackToCasino?: () => void;
}

export default function AdminPanel({ onBackToCasino }: AdminPanelProps) {
  // Admin Auth State
  const [adminToken, setAdminToken] = useState<string>(() => {
    return sessionStorage.getItem('futurobet_admin_token') || localStorage.getItem('futurobet_admin_token') || '';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    const token = sessionStorage.getItem('futurobet_admin_token') || localStorage.getItem('futurobet_admin_token');
    return Boolean(token) && localStorage.getItem('futurobet_admin_auth') === 'true';
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active view: 'users' (default) or 'deposits'
  const [activeTab, setActiveTab] = useState<'users' | 'deposits'>('users');

  // Users Data
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'ALL' | 'WITH_BALANCE' | 'ZERO_BALANCE'>('ALL');

  // Visibility map for passwords
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Modals for actions
  const [balanceModalUser, setBalanceModalUser] = useState<UserProfile | null>(null);
  const [balanceModalMode, setBalanceModalMode] = useState<'add' | 'subtract' | 'set'>('add');
  const [balanceInputAmount, setBalanceInputAmount] = useState('');
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);

  const [passwordModalUser, setPasswordModalUser] = useState<UserProfile | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserProfile | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Deposits State
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [depositFilter, setDepositFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [processingDepositId, setProcessingDepositId] = useState<string | null>(null);

  // Toast / Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    soundEngine.playCoinDrop();
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getAdminHeaders = useCallback(() => {
    const token = adminToken || sessionStorage.getItem('futurobet_admin_token') || localStorage.getItem('futurobet_admin_token') || '';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }, [adminToken]);

  const formatBRL = (val: number) => {
    return (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getUserKey = (u: UserProfile): string => {
    if (u.id) return u.id;
    const cleanCpf = u.cpf ? u.cpf.replace(/\D/g, '') : '';
    if (cleanCpf) return cleanCpf;
    const cleanPhone = u.phone ? u.phone.replace(/\D/g, '') : '';
    if (cleanPhone) return `tel_${cleanPhone}`;
    return `usr_${u.name}`;
  };

  // 1. Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const cleanUser = usernameInput.trim();
      const cleanPass = passwordInput.trim();
      const validUser = 'copywriter';
      const validPass = '3657';

      let loginSuccessful = false;
      let tokenToUse = '';

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUser, password: cleanPass }),
        });

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.token) {
            loginSuccessful = true;
            tokenToUse = data.token;
          } else if (data.error && res.status === 401) {
            setLoginError(data.error);
            soundEngine.playLockedSound();
            setIsLoggingIn(false);
            return;
          }
        }
      } catch (fetchErr) {
        console.warn('API login request notice, checking direct fallback:', fetchErr);
      }

      if (!loginSuccessful) {
        if (cleanUser === validUser && cleanPass === validPass) {
          loginSuccessful = true;
          tokenToUse = `adm_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        }
      }

      if (loginSuccessful && tokenToUse) {
        sessionStorage.setItem('futurobet_admin_token', tokenToUse);
        localStorage.setItem('futurobet_admin_token', tokenToUse);
        localStorage.setItem('futurobet_admin_auth', 'true');
        setAdminToken(tokenToUse);
        setIsAdminAuthenticated(true);
        soundEngine.playWinChime();
        showToast('Login realizado com sucesso! Painel Administrador Liberado.');
      } else {
        setLoginError('Usuário ou senha incorretos.');
        soundEngine.playLockedSound();
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Falha de conexão com o servidor.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('futurobet_admin_token');
    localStorage.removeItem('futurobet_admin_token');
    localStorage.removeItem('futurobet_admin_auth');
    setAdminToken('');
    setIsAdminAuthenticated(false);
    showToast('Sessão encerrada.', 'info');
  };

  // 2. Fetch Users from all sources (Firestore + Backend + Realtime)
  const fetchAllUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const map = new Map<string, UserProfile>();

      // A) Firestore getDocs
      try {
        const snap = await getDocs(collection(db, 'users'));
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          const docId = docSnap.id;
          const userObj: UserProfile = {
            id: docId,
            cpf: d.cpf || (docId.startsWith('tel_') ? '' : docId),
            name: d.name || d.displayName || 'Jogador FuturoBet',
            phone: d.phone || (docId.startsWith('tel_') ? docId.replace('tel_', '') : ''),
            passwordHash: d.passwordHash || '',
            balance: typeof d.balance === 'number' ? d.balance : 0,
            balanceBonus: typeof d.balanceBonus === 'number' ? d.balanceBonus : 0,
            createdAt: d.createdAt || '',
            updatedAt: d.updatedAt || '',
            email: d.email || '',
            referralCode: d.referralCode || '',
          };
          map.set(docId, userObj);
        });
      } catch (fsErr) {
        console.warn('Firestore getDocs notice:', fsErr);
      }

      // B) Backend API /api/admin/users
      try {
        const res = await fetch('/api/admin/users', { headers: getAdminHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (data.users && Array.isArray(data.users)) {
            data.users.forEach((u: any) => {
              const k = u.id || (u.cpf ? u.cpf.replace(/\D/g, '') : '') || (u.phone ? `tel_${u.phone.replace(/\D/g, '')}` : `usr_${u.name}`);
              if (k) {
                if (map.has(k)) {
                  map.set(k, { ...map.get(k), ...u });
                } else {
                  map.set(k, u);
                }
              }
            });
          }
        }
      } catch (srvErr) {
        console.warn('Backend users notice:', srvErr);
      }

      // C) Local Storage fallback
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('futurobet_user_')) {
            const raw = localStorage.getItem(k);
            if (raw) {
              const u = JSON.parse(raw);
              const key = u.id || (u.cpf ? u.cpf.replace(/\D/g, '') : '') || k.replace('futurobet_user_', '');
              if (key && !map.has(key)) {
                map.set(key, u);
              }
            }
          }
        }
      } catch (e) {}

      const list = Array.from(map.values()).sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });

      setUsers(list);

      // Sync back to backend so backend is always in sync
      if (list.length > 0) {
        fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ users: list }),
        }).catch(() => null);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [getAdminHeaders]);

  // 3. Realtime Firestore Users Listener
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    fetchAllUsers();

    let unsub: (() => void) | undefined;
    try {
      unsub = onSnapshot(collection(db, 'users'), (snap) => {
        setUsers((prev) => {
          const map = new Map<string, UserProfile>();
          prev.forEach((u) => {
            const k = getUserKey(u);
            map.set(k, u);
          });

          snap.forEach((docSnap) => {
            const d = docSnap.data();
            const docId = docSnap.id;
            const userObj: UserProfile = {
              id: docId,
              cpf: d.cpf || (docId.startsWith('tel_') ? '' : docId),
              name: d.name || d.displayName || 'Jogador FuturoBet',
              phone: d.phone || (docId.startsWith('tel_') ? docId.replace('tel_', '') : ''),
              passwordHash: d.passwordHash || '',
              balance: typeof d.balance === 'number' ? d.balance : 0,
              balanceBonus: typeof d.balanceBonus === 'number' ? d.balanceBonus : 0,
              createdAt: d.createdAt || '',
              updatedAt: d.updatedAt || '',
              email: d.email || '',
              referralCode: d.referralCode || '',
            };
            map.set(docId, { ...map.get(docId), ...userObj });
          });

          return Array.from(map.values()).sort((a, b) => {
            const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tB - tA;
          });
        });
      }, (err) => {
        console.warn('Realtime users listener notice:', err);
      });
    } catch (e) {}

    return () => {
      if (unsub) unsub();
    };
  }, [isAdminAuthenticated, fetchAllUsers]);

  // 4. Deposits Fetcher & Listener
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    const fetchDeposits = () => {
      fetch('/api/admin/deposits', { headers: getAdminHeaders() })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.deposits)) {
            setDeposits(data.deposits);
          }
        })
        .catch(() => null);
    };

    fetchDeposits();

    let unsubDeposits: (() => void) | undefined;
    try {
      unsubDeposits = onSnapshot(collection(db, 'deposits'), (snap) => {
        const list: DepositItem[] = [];
        snap.forEach((d) => {
          list.push(d.data() as DepositItem);
        });
        if (list.length > 0) {
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setDeposits(list);
        }
      }, () => {});
    } catch (e) {}

    return () => {
      if (unsubDeposits) unsubDeposits();
    };
  }, [isAdminAuthenticated, getAdminHeaders]);

  // Balance Update Handlers
  const handleQuickAddBalance = async (user: UserProfile, amount: number) => {
    await executeBalanceChange(user, 'add', amount);
  };

  const executeBalanceChange = async (user: UserProfile, mode: 'add' | 'subtract' | 'set' | 'zero', amount: number) => {
    const userKey = getUserKey(user);
    const cleanCpf = user.cpf ? user.cpf.replace(/\D/g, '') : '';
    const cleanPhone = user.phone ? user.phone.replace(/\D/g, '') : '';

    const currentBal = user.balance || 0;
    let newBal = currentBal;
    if (mode === 'add') newBal = parseFloat((currentBal + amount).toFixed(2));
    else if (mode === 'subtract') newBal = parseFloat((Math.max(0, currentBal - amount)).toFixed(2));
    else if (mode === 'set') newBal = parseFloat((Math.max(0, amount)).toFixed(2));
    else if (mode === 'zero') newBal = 0.00;

    setIsUpdatingBalance(true);
    try {
      // 1. Update Firestore
      const userRef = doc(db, 'users', userKey);
      await setDoc(userRef, {
        ...user,
        balance: newBal,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      if (cleanCpf && cleanCpf !== userKey) {
        setDoc(doc(db, 'users', cleanCpf), { balance: newBal, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => null);
      }

      // 2. Update Backend
      await fetch('/api/admin/users/update-balance', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          id: userKey,
          cpf: cleanCpf,
          phone: cleanPhone,
          amount: amount,
          type: mode,
          setBalance: mode === 'set' || mode === 'zero' ? newBal : undefined,
        }),
      }).catch(() => null);

      // 3. Update Local Storage cache if present
      const cacheKey = `futurobet_user_${userKey}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          parsed.balance = newBal;
          localStorage.setItem(cacheKey, JSON.stringify(parsed));
        } catch (e) {}
      }

      // 4. Update UI State
      setUsers((prev) =>
        prev.map((u) => (getUserKey(u) === userKey ? { ...u, balance: newBal, updatedAt: new Date().toISOString() } : u))
      );

      soundEngine.playCoinDrop();
      showToast(`Saldo de ${user.name} atualizado para R$ ${formatBRL(newBal)}!`);
      setBalanceModalUser(null);
      setBalanceInputAmount('');
    } catch (err: any) {
      console.error('Error updating balance:', err);
      showToast('Erro ao atualizar saldo: ' + err.message, 'error');
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  // Password Reset Handlers
  const handleExecutePasswordChange = async () => {
    if (!passwordModalUser) return;
    const newPass = newPasswordInput.trim();
    if (!newPass || newPass.length < 3) {
      showToast('A senha deve conter no mínimo 3 dígitos.', 'error');
      return;
    }

    const userKey = getUserKey(passwordModalUser);
    const cleanCpf = passwordModalUser.cpf ? passwordModalUser.cpf.replace(/\D/g, '') : '';
    const cleanPhone = passwordModalUser.phone ? passwordModalUser.phone.replace(/\D/g, '') : '';

    setIsUpdatingPassword(true);
    try {
      // 1. Update Firestore
      const userRef = doc(db, 'users', userKey);
      await setDoc(userRef, {
        passwordHash: newPass,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      if (cleanCpf && cleanCpf !== userKey) {
        setDoc(doc(db, 'users', cleanCpf), { passwordHash: newPass, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => null);
      }

      // 2. Update Backend
      await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          id: userKey,
          cpf: cleanCpf,
          phone: cleanPhone,
          newPassword: newPass,
        }),
      }).catch(() => null);

      // 3. Update Local Storage cache if present
      const cacheKey = `futurobet_user_${userKey}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          parsed.passwordHash = newPass;
          localStorage.setItem(cacheKey, JSON.stringify(parsed));
        } catch (e) {}
      }

      // 4. Update UI State
      setUsers((prev) =>
        prev.map((u) => (getUserKey(u) === userKey ? { ...u, passwordHash: newPass, updatedAt: new Date().toISOString() } : u))
      );

      soundEngine.playWinChime();
      showToast(`Senha de ${passwordModalUser.name} alterada para: ${newPass}`);
      setPasswordModalUser(null);
      setNewPasswordInput('');
    } catch (err: any) {
      console.error('Error changing password:', err);
      showToast('Erro ao redefinir senha: ' + err.message, 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Delete User Account
  const handleExecuteDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    const userKey = getUserKey(deleteConfirmUser);
    setIsDeletingUser(true);
    try {
      await deleteDoc(doc(db, 'users', userKey)).catch(() => null);
      if (deleteConfirmUser.cpf) {
        const cleanCpf = deleteConfirmUser.cpf.replace(/\D/g, '');
        if (cleanCpf && cleanCpf !== userKey) {
          await deleteDoc(doc(db, 'users', cleanCpf)).catch(() => null);
        }
      }

      setUsers((prev) => prev.filter((u) => getUserKey(u) !== userKey));
      soundEngine.playCoinDrop();
      showToast(`Conta de ${deleteConfirmUser.name} excluída com sucesso.`);
      setDeleteConfirmUser(null);
    } catch (err: any) {
      showToast('Erro ao excluir conta: ' + err.message, 'error');
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Approve Deposit Handler
  const handleApproveDeposit = async (dep: DepositItem) => {
    const txId = dep.transactionId || dep.id;
    setProcessingDepositId(txId);
    try {
      await fetch('/api/admin/deposits/approve', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ transactionId: txId }),
      });

      await setDoc(doc(db, 'deposits', txId), {
        ...dep,
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true }).catch(() => null);

      // Find user and credit balance
      const cleanCpf = (dep.cpf || '').replace(/\D/g, '');
      const user = users.find((u) => (u.cpf && u.cpf.replace(/\D/g, '') === cleanCpf) || u.id === cleanCpf);
      if (user) {
        await handleQuickAddBalance(user, dep.amount);
      }

      setDeposits((prev) =>
        prev.map((d) => (d.id === txId || d.transactionId === txId ? { ...d, status: 'APPROVED', approvedAt: new Date().toISOString() } : d))
      );

      soundEngine.playWinChime();
      showToast(`Depósito de R$ ${formatBRL(dep.amount)} aprovado com sucesso!`);
    } catch (err: any) {
      showToast('Erro ao aprovar: ' + err.message, 'error');
    } finally {
      setProcessingDepositId(null);
    }
  };

  // Reject Deposit Handler
  const handleRejectDeposit = async (dep: DepositItem) => {
    const txId = dep.transactionId || dep.id;
    setProcessingDepositId(txId);
    try {
      await fetch('/api/admin/deposits/reject', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ transactionId: txId, reason: 'Recusado pelo Administrador.' }),
      });

      await setDoc(doc(db, 'deposits', txId), {
        ...dep,
        status: 'REJECTED',
        rejectionReason: 'Recusado pelo Administrador.',
        updatedAt: new Date().toISOString(),
      }, { merge: true }).catch(() => null);

      setDeposits((prev) =>
        prev.map((d) => (d.id === txId || d.transactionId === txId ? { ...d, status: 'REJECTED' } : d))
      );

      showToast(`Depósito recusado.`, 'info');
    } catch (err: any) {
      showToast('Erro ao recusar: ' + err.message, 'error');
    } finally {
      setProcessingDepositId(null);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Balance filter
      if (userFilter === 'WITH_BALANCE' && (u.balance || 0) <= 0) return false;
      if (userFilter === 'ZERO_BALANCE' && (u.balance || 0) > 0) return false;

      // Search filter
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase().trim();
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').replace(/\D/g, '').includes(q.replace(/\D/g, '')) || (u.phone || '').includes(q);
      const matchCpf = (u.cpf || '').replace(/\D/g, '').includes(q.replace(/\D/g, '')) || (u.cpf || '').includes(q);
      const matchId = (u.id || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchCpf || matchId;
    });
  }, [users, userFilter, userSearch]);

  // Statistics
  const totalBalanceVolume = useMemo(() => {
    return users.reduce((sum, u) => sum + (u.balance || 0), 0);
  }, [users]);

  const pendingDepositsCount = useMemo(() => {
    return deposits.filter((d) => d.status === 'PAID_PENDING_APPROVAL' || d.status === 'WAITING_PAYMENT').length;
  }, [deposits]);

  // =========================================================================
  // VIEW: LOGIN SCREEN (if unauthenticated)
  // =========================================================================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07080b] text-white flex flex-col items-center justify-center p-4 relative font-sans select-none">
        <div className="max-w-md w-full bg-[#0d0f16] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center bg-zinc-900 px-3.5 py-1.5 rounded-2xl border border-zinc-800 shadow-inner mb-1">
              <ShieldCheck className="w-5 h-5 text-amber-400 mr-2" />
              <span className="text-xs font-black tracking-widest text-zinc-300 uppercase">
                Área Administrativa
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Painel de Controle
            </h1>
            <p className="text-xs text-zinc-400">
              Gerenciamento de contas, senhas e saldos dos jogadores
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Usuário ADM</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="copywriter"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Senha ADM</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black rounded-xl text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Acessando...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Entrar no Painel</span>
                </>
              )}
            </button>
          </form>

          {onBackToCasino && (
            <div className="text-center pt-2">
              <button
                onClick={onBackToCasino}
                className="text-xs text-zinc-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao Cassino</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: AUTHENTICATED STREAMLINED ADMIN PANEL
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#08090d] text-white font-sans flex flex-col">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border text-sm font-bold flex items-center gap-2.5 ${
            toastType === 'error'
              ? 'bg-rose-950 border-rose-500 text-rose-200'
              : toastType === 'info'
              ? 'bg-blue-950 border-blue-500 text-blue-200'
              : 'bg-emerald-950 border-emerald-500 text-emerald-200'
          }`}>
            {toastType === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-[#0e1017] border-b border-zinc-800/80 sticky top-0 z-30 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-zinc-900 px-3 py-1.5 rounded-2xl border border-zinc-800">
              <ShieldCheck className="w-5 h-5 text-amber-400 mr-2 shrink-0" />
              <div className="leading-tight">
                <span className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wide">
                  FuturoBet ADM
                </span>
                <span className="hidden sm:inline-block text-[11px] text-zinc-400 ml-2">
                  Gestão de Contas & Saldos
                </span>
              </div>
            </div>

            {/* Tab switchers: Jogadores & Depósitos */}
            <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-amber-400 text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Jogadores ({users.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('deposits')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'deposits'
                    ? 'bg-amber-400 text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Depósitos</span>
                {pendingDepositsCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-400 text-black rounded-full text-[10px] font-black">
                    {pendingDepositsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllUsers}
              disabled={isLoadingUsers}
              title="Atualizar lista agora"
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden md:inline">Atualizar</span>
            </button>

            {onBackToCasino && (
              <button
                onClick={onBackToCasino}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ir ao Cassino</span>
              </button>
            )}

            <button
              onClick={handleAdminLogout}
              className="p-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 rounded-xl transition-all cursor-pointer"
              title="Sair do painel"
            >
              <Power className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* QUICK METRICS BAR */}
      <div className="bg-[#0c0e15] border-b border-zinc-800/60 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-[#11131c] border border-zinc-800/90 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total de Jogadores</p>
              <p className="text-xl font-black text-amber-400 mt-0.5">{users.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#11131c] border border-zinc-800/90 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Saldo Total em Contas</p>
              <p className="text-xl font-black text-emerald-400 mt-0.5">R$ {formatBRL(totalBalanceVolume)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 bg-[#11131c] border border-zinc-800/90 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Fila de Depósitos PIX</p>
              <p className="text-xl font-black text-white mt-0.5">
                {pendingDepositsCount} <span className="text-xs text-amber-400 font-bold">pendente(s)</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* ===================================================================== */}
        {/* TAB: JOGADORES (Default, Primary & Ultra Practical) */}
        {/* ===================================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-[#11131c] border border-zinc-800 rounded-2xl p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="🔍 Buscar por Nome, Telefone, CPF ou ID do jogador..."
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900/90 border border-zinc-700/60 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto">
                <button
                  onClick={() => setUserFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userFilter === 'ALL'
                      ? 'bg-amber-400 text-black font-black shadow'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  Todos ({users.length})
                </button>
                <button
                  onClick={() => setUserFilter('WITH_BALANCE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userFilter === 'WITH_BALANCE'
                      ? 'bg-emerald-500 text-black font-black shadow'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  Com Saldo ({users.filter((u) => (u.balance || 0) > 0).length})
                </button>
                <button
                  onClick={() => setUserFilter('ZERO_BALANCE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userFilter === 'ZERO_BALANCE'
                      ? 'bg-zinc-300 text-black font-black shadow'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  Zerados ({users.filter((u) => (u.balance || 0) <= 0).length})
                </button>
              </div>
            </div>

            {/* Users List Table / Cards */}
            {filteredUsers.length === 0 ? (
              <div className="bg-[#11131c] border border-zinc-800 rounded-3xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 flex items-center justify-center mx-auto text-zinc-400">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-300">Nenhum jogador encontrado</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  {userSearch ? 'Nenhum jogador corresponde aos termos de busca digitados.' : 'Ainda não há jogadores registrados no banco de dados.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => {
                  const userKey = getUserKey(user);
                  const isPasswordVisible = visiblePasswords[userKey] || false;
                  const displayPass = user.passwordHash || 'Não cadastrada';
                  const cleanPhone = user.phone ? user.phone.trim() : '';
                  const cleanCpf = user.cpf ? user.cpf.trim() : '';

                  return (
                    <div
                      key={userKey}
                      className="bg-[#11131c] border border-zinc-800/90 hover:border-zinc-700/80 rounded-2xl p-4 transition-all shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      {/* Left: User Identity Info */}
                      <div className="flex items-start gap-3.5 min-w-[260px]">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-base shrink-0 mt-0.5">
                          {(user.name || 'J').charAt(0).toUpperCase()}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-black text-white">{user.name || 'Jogador FuturoBet'}</h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                              Ativo
                            </span>
                          </div>

                          {/* Phone / CPF / ID info */}
                          <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                            {cleanPhone && (
                              <span className="inline-flex items-center gap-1">
                                <Smartphone className="w-3 h-3 text-zinc-500" />
                                <strong className="text-zinc-300">{cleanPhone}</strong>
                                <button
                                  onClick={() => handleCopy(cleanPhone, `phone_${userKey}`)}
                                  className="text-zinc-500 hover:text-amber-400 cursor-pointer ml-0.5"
                                  title="Copiar telefone"
                                >
                                  {copiedKey === `phone_${userKey}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </span>
                            )}

                            {cleanCpf && (
                              <span className="inline-flex items-center gap-1">
                                <FileText className="w-3 h-3 text-zinc-500" />
                                <span>CPF: {cleanCpf}</span>
                              </span>
                            )}

                            {user.email && (
                              <span className="text-zinc-500 text-[11px] truncate max-w-[160px]">
                                {user.email}
                              </span>
                            )}

                            {user.createdAt && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
                                <Calendar className="w-3 h-3" />
                                {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Password Credentials */}
                      <div className="bg-[#0b0d13] border border-zinc-800/80 rounded-xl px-3 py-2 flex items-center justify-between gap-3 min-w-[220px]">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                            <KeyRound className="w-3 h-3 text-amber-400" />
                            Senha Cadastrada
                          </span>
                          <p className="text-xs font-mono font-bold text-amber-300">
                            {isPasswordVisible ? displayPass : '••••••••'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setVisiblePasswords((prev) => ({
                                ...prev,
                                [userKey]: !prev[userKey],
                              }))
                            }
                            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                            title={isPasswordVisible ? 'Ocultar senha' : 'Ver senha'}
                          >
                            {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopy(displayPass, `pass_${userKey}`)}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                            title="Copiar senha"
                          >
                            {copiedKey === `pass_${userKey}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPasswordModalUser(user);
                              setNewPasswordInput('');
                            }}
                            className="px-2 py-1 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="Alterar senha do jogador"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Alterar</span>
                          </button>
                        </div>
                      </div>

                      {/* Right: Balance & Actions */}
                      <div className="flex items-center justify-between lg:justify-end gap-3 flex-wrap">
                        {/* Current Balance Display */}
                        <div className="bg-[#0b0d13] border border-zinc-800/80 rounded-xl px-3.5 py-2 text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                            Saldo em Conta
                          </span>
                          <span className="text-base font-black text-emerald-400 font-mono">
                            R$ {formatBRL(user.balance || 0)}
                          </span>
                        </div>

                        {/* Quick Balance Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleQuickAddBalance(user, 10)}
                            className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-black transition-all cursor-pointer"
                            title="Adicionar R$ 10 instantâneo"
                          >
                            +R$10
                          </button>

                          <button
                            onClick={() => handleQuickAddBalance(user, 50)}
                            className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-black transition-all cursor-pointer"
                            title="Adicionar R$ 50 instantâneo"
                          >
                            +R$50
                          </button>

                          <button
                            onClick={() => handleQuickAddBalance(user, 100)}
                            className="hidden sm:inline-block px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-black transition-all cursor-pointer"
                            title="Adicionar R$ 100 instantâneo"
                          >
                            +R$100
                          </button>

                          <button
                            onClick={() => {
                              setBalanceModalUser(user);
                              setBalanceModalMode('add');
                              setBalanceInputAmount('');
                            }}
                            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black rounded-xl text-xs font-black transition-all shadow cursor-pointer flex items-center gap-1"
                            title="Personalizar ou Remover Saldo"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Gerenciar Saldo</span>
                          </button>

                          <button
                            onClick={() => setDeleteConfirmUser(user)}
                            className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                            title="Excluir Jogador"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB: DEPÓSITOS (Secondary compact queue) */}
        {/* ===================================================================== */}
        {activeTab === 'deposits' && (
          <div className="space-y-4">
            {/* Filter Pills */}
            <div className="bg-[#11131c] border border-zinc-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setDepositFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    depositFilter === 'PENDING' ? 'bg-amber-400 text-black font-black' : 'bg-zinc-800/80 text-zinc-300'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pendentes ({deposits.filter((d) => d.status === 'PAID_PENDING_APPROVAL' || d.status === 'WAITING_PAYMENT').length})</span>
                </button>

                <button
                  onClick={() => setDepositFilter('APPROVED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    depositFilter === 'APPROVED' ? 'bg-emerald-500 text-black font-black' : 'bg-zinc-800/80 text-zinc-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aprovados ({deposits.filter((d) => d.status === 'APPROVED').length})</span>
                </button>

                <button
                  onClick={() => setDepositFilter('REJECTED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    depositFilter === 'REJECTED' ? 'bg-rose-500 text-white font-black' : 'bg-zinc-800/80 text-zinc-300'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Recusados ({deposits.filter((d) => d.status === 'REJECTED').length})</span>
                </button>

                <button
                  onClick={() => setDepositFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    depositFilter === 'ALL' ? 'bg-zinc-200 text-black font-black' : 'bg-zinc-800/80 text-zinc-300'
                  }`}
                >
                  <span>Todos ({deposits.length})</span>
                </button>
              </div>
            </div>

            {/* Deposits List */}
            {deposits.filter((d) => {
              if (depositFilter === 'PENDING') return d.status === 'PAID_PENDING_APPROVAL' || d.status === 'WAITING_PAYMENT';
              if (depositFilter === 'APPROVED') return d.status === 'APPROVED';
              if (depositFilter === 'REJECTED') return d.status === 'REJECTED';
              return true;
            }).length === 0 ? (
              <div className="bg-[#11131c] border border-zinc-800 rounded-3xl p-12 text-center space-y-3">
                <CreditCard className="w-8 h-8 text-zinc-500 mx-auto" />
                <h3 className="text-base font-bold text-zinc-300">Nenhum depósito nesta categoria</h3>
              </div>
            ) : (
              <div className="space-y-3">
                {deposits
                  .filter((d) => {
                    if (depositFilter === 'PENDING') return d.status === 'PAID_PENDING_APPROVAL' || d.status === 'WAITING_PAYMENT';
                    if (depositFilter === 'APPROVED') return d.status === 'APPROVED';
                    if (depositFilter === 'REJECTED') return d.status === 'REJECTED';
                    return true;
                  })
                  .map((dep) => {
                    const txId = dep.transactionId || dep.id;
                    const isProcessing = processingDepositId === txId;
                    const isPending = dep.status === 'PAID_PENDING_APPROVAL' || dep.status === 'WAITING_PAYMENT';

                    return (
                      <div
                        key={txId}
                        className="bg-[#11131c] border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">{dep.clientName || 'Jogador'}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              dep.status === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : dep.status === 'REJECTED'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-400/10 text-amber-400 border border-amber-400/30 animate-pulse'
                            }`}>
                              {dep.status === 'APPROVED' ? 'Aprovado' : dep.status === 'REJECTED' ? 'Recusado' : 'Aguardando Aprovação'}
                            </span>
                          </div>

                          <div className="text-xs text-zinc-400 flex items-center gap-3">
                            <span>CPF: {dep.cpf || 'Não informado'}</span>
                            <span>•</span>
                            <span>{new Date(dep.createdAt).toLocaleString('pt-BR')}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <span className="text-base font-black text-amber-400 font-mono">
                            R$ {formatBRL(dep.amount)}
                          </span>

                          {isPending && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApproveDeposit(dep)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Aprovar (+R$)</span>
                              </button>

                              <button
                                onClick={() => handleRejectDeposit(dep)}
                                disabled={isProcessing}
                                className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-bold rounded-xl transition-all cursor-pointer"
                              >
                                Recusar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ===================================================================== */}
      {/* MODAL: GERENCIAR SALDO (Adicionar, Subtrair ou Definir) */}
      {/* ===================================================================== */}
      {balanceModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11131c] border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white">Gerenciar Saldo</h3>
                <p className="text-xs text-zinc-400">Jogador: {balanceModalUser.name}</p>
              </div>
              <button
                onClick={() => setBalanceModalUser(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Current Balance */}
            <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Saldo Atual:</span>
              <span className="text-sm font-black text-emerald-400 font-mono">
                R$ {formatBRL(balanceModalUser.balance || 0)}
              </span>
            </div>

            {/* Mode selection tabs */}
            <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setBalanceModalMode('add')}
                className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  balanceModalMode === 'add' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                + Adicionar
              </button>
              <button
                onClick={() => setBalanceModalMode('subtract')}
                className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  balanceModalMode === 'subtract' ? 'bg-rose-500 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                - Subtrair
              </button>
              <button
                onClick={() => setBalanceModalMode('set')}
                className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  balanceModalMode === 'set' ? 'bg-amber-400 text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                = Definir
              </button>
            </div>

            {/* Input amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">
                {balanceModalMode === 'add' ? 'Valor a adicionar (R$):' : balanceModalMode === 'subtract' ? 'Valor a remover (R$):' : 'Novo saldo exato (R$):'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={balanceInputAmount}
                  onChange={(e) => setBalanceInputAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-base font-bold text-white focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[10, 20, 50, 100, 200, 500].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setBalanceInputAmount(String(v))}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  R$ {v}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => executeBalanceChange(balanceModalUser, 'zero', 0)}
                disabled={isUpdatingBalance}
                className="px-3 py-2.5 bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Zerar Saldo (R$ 0)
              </button>

              <button
                onClick={() => {
                  const val = parseFloat(balanceInputAmount);
                  if (isNaN(val) || val < 0) {
                    showToast('Digite um valor numérico válido.', 'error');
                    return;
                  }
                  executeBalanceChange(balanceModalUser, balanceModalMode, val);
                }}
                disabled={isUpdatingBalance || !balanceInputAmount}
                className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer disabled:opacity-50"
              >
                {isUpdatingBalance ? 'Salvando...' : 'Confirmar Atualização'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ALTERAR SENHA DO JOGADOR */}
      {/* ===================================================================== */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11131c] border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Alterar Senha do Jogador</span>
                </h3>
                <p className="text-xs text-zinc-400">Jogador: {passwordModalUser.name}</p>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Senha Atual:</span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {passwordModalUser.passwordHash || 'Não cadastrada'}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Nova Senha de Acesso:</label>
              <input
                type="text"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="Ex: 123456 ou nova senha"
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-amber-400 font-mono"
                autoFocus
              />
              <p className="text-[11px] text-zinc-500">
                O jogador poderá entrar imediatamente com esta nova senha no celular ou computador.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setPasswordModalUser(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={handleExecutePasswordChange}
                disabled={isUpdatingPassword || !newPasswordInput.trim()}
                className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer disabled:opacity-50"
              >
                {isUpdatingPassword ? 'Salvando...' : 'Salvar Nova Senha'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CONFIRMAR EXCLUSÃO DE CONTA */}
      {/* ===================================================================== */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11131c] border border-rose-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-white">Excluir Conta do Jogador?</h3>
              <p className="text-xs text-zinc-400">
                Tem certeza que deseja remover a conta de <strong className="text-white">{deleteConfirmUser.name}</strong>? Esta ação removerá o acesso do jogador.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                disabled={isDeletingUser}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={handleExecuteDeleteUser}
                disabled={isDeletingUser}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer disabled:opacity-50"
              >
                {isDeletingUser ? 'Excluindo...' : 'Sim, Excluir Conta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
