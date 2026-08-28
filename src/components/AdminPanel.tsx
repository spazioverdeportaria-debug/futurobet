import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Lock, User, KeyRound, AlertTriangle, Power,
  CheckCircle2, XCircle, Search, DollarSign, Plus, Minus,
  RefreshCw, Users, CreditCard, Clock, MessageSquare,
  ExternalLink, Copy, Check, Filter, ShieldAlert, ArrowLeft,
  ChevronRight, Sparkles, SlidersHorizontal, Eye, EyeOff
} from 'lucide-react';
import { db, collection, getDocs, doc, setDoc, updateDoc, onSnapshot, query, orderBy } from '../lib/firebase';
import { soundEngine } from '../utils/audio';

interface DepositItem {
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

interface UserProfile {
  cpf: string;
  name: string;
  phone?: string;
  passwordHash?: string;
  balance: number;
  balanceBonus?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface AdminPanelProps {
  onBackToCasino?: () => void;
}

export default function AdminPanel({ onBackToCasino }: AdminPanelProps) {
  // Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('futurobet_admin_auth') === 'true';
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'deposits' | 'users' | 'system' | 'support'>('deposits');

  // Maintenance & System State
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>(
    'Sistema em Manutenção para Melhorias. Voltamos em instantes!'
  );
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);

  // Moderated Deposits State
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [depositFilter, setDepositFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [depositSearch, setDepositSearch] = useState('');
  const [processingDepositId, setProcessingDepositId] = useState<string | null>(null);

  // Users State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // User Actions Modals State
  const [balanceActionModal, setBalanceActionModal] = useState<{
    user: UserProfile;
    type: 'add' | 'subtract';
  } | null>(null);
  const [balanceAmountInput, setBalanceAmountInput] = useState('');
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);

  const [passwordResetModal, setPasswordResetModal] = useState<UserProfile | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordResetSuccess, setPasswordResetSuccess] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Quick Support Lookup
  const [supportLookupCpf, setSupportLookupCpf] = useState('');
  const [supportLookupResult, setSupportLookupResult] = useState<UserProfile | null>(null);
  const [supportLookupError, setSupportLookupError] = useState<string | null>(null);

  // Copied helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Toast / Status banner
  const [statusNotification, setStatusNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setStatusNotification({ type, message });
    setTimeout(() => setStatusNotification(null), 4000);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    soundEngine.playCoinDrop();
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Format currency in BRL (pt-BR)
  const formatBRL = (val: number) => {
    return (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const cleanUser = usernameInput.trim();
      const cleanPass = passwordInput.trim();

      if (cleanUser === 'copywriter' && cleanPass === '3657') {
        localStorage.setItem('futurobet_admin_auth', 'true');
        setIsAdminAuthenticated(true);
        soundEngine.playWinChime();
        showToast('Bem-vindo ao Painel Administrativo do FuturoBet!');
      } else {
        // Also verify with backend endpoint
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUser, password: cleanPass }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('futurobet_admin_auth', 'true');
          setIsAdminAuthenticated(true);
          soundEngine.playWinChime();
          showToast('Bem-vindo ao Painel Administrativo do FuturoBet!');
        } else {
          setLoginError('Usuário ou senha de administrador incorretos.');
          soundEngine.playLockedSound();
        }
      }
    } catch (err) {
      if (usernameInput.trim() === 'copywriter' && passwordInput.trim() === '3657') {
        localStorage.setItem('futurobet_admin_auth', 'true');
        setIsAdminAuthenticated(true);
      } else {
        setLoginError('Credenciais incorretas.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('futurobet_admin_auth');
    setIsAdminAuthenticated(false);
    showToast('Sessão encerrada com sucesso.', 'info');
  };

  // 1. Listen to System Settings & Maintenance Mode
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    // Load from backend
    fetch('/api/system/status')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.maintenanceMode === 'boolean') {
          setMaintenanceMode(data.maintenanceMode);
        }
        if (data.maintenanceMessage) {
          setMaintenanceMessage(data.maintenanceMessage);
        }
      })
      .catch(() => null);

    // Firestore real-time listener for system_settings
    try {
      const unsub = onSnapshot(doc(db, 'system_settings', 'config'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (typeof data.maintenanceMode === 'boolean') {
            setMaintenanceMode(data.maintenanceMode);
          }
          if (data.maintenanceMessage) {
            setMaintenanceMessage(data.maintenanceMessage);
          }
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn('System settings listener notice:', e);
    }
  }, [isAdminAuthenticated]);

  // 2. Listen to Moderated Deposits Queue (Real-time Firestore + Backend Sync)
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    const fetchServerDeposits = () => {
      fetch('/api/admin/deposits')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.deposits)) {
            setDeposits((prev) => {
              const map = new Map<string, DepositItem>();
              prev.forEach((d) => map.set(d.id || d.transactionId, d));
              data.deposits.forEach((d: DepositItem) => map.set(d.id || d.transactionId, d));
              return Array.from(map.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            });
          }
        })
        .catch(() => null);
    };

    fetchServerDeposits();
    const interval = setInterval(fetchServerDeposits, 3000);

    // Real-time Firestore snapshot
    try {
      const unsub = onSnapshot(collection(db, 'deposits'), (snapshot) => {
        const list: DepositItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as DepositItem);
        });
        if (list.length > 0) {
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setDeposits(list);
        }
      });

      return () => {
        clearInterval(interval);
        unsub();
      };
    } catch (e) {
      return () => clearInterval(interval);
    }
  }, [isAdminAuthenticated]);

  // 3. Listen to Users List (Real-time Firestore + Backend API + Local Storage Aggregation)
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    // A) Scan and auto-sync any existing accounts stored in local browser cache to Firestore & Backend
    try {
      const localUsers: UserProfile[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('futurobet_user_') || key.startsWith('vegasbet_user_') || key === 'futurobet_auth_session')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const u = JSON.parse(raw);
              if (u && u.cpf) {
                const cleanCpf = String(u.cpf).replace(/\D/g, '');
                localUsers.push({
                  cpf: cleanCpf,
                  name: u.name || 'Jogador FuturoBet',
                  phone: u.phone || '',
                  passwordHash: u.passwordHash || '',
                  balance: typeof u.balance === 'number' ? u.balance : 50.00,
                  balanceBonus: typeof u.balanceBonus === 'number' ? u.balanceBonus : 0.00,
                  createdAt: u.createdAt || new Date().toISOString(),
                  updatedAt: u.updatedAt || new Date().toISOString(),
                });
              }
            } catch (e) {
              // ignore
            }
          }
        }
      }

      if (localUsers.length > 0) {
        // Sync to backend
        fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ users: localUsers }),
        }).catch(() => null);

        // Sync to Firestore
        localUsers.forEach(async (u) => {
          if (u.cpf) {
            try {
              await setDoc(doc(db, 'users', u.cpf), u, { merge: true });
            } catch (e) {
              // ignore
            }
          }
        });
      }
    } catch (e) {
      console.warn('Local users discovery note:', e);
    }

    // B) Fetch from Backend periodically
    const fetchServerUsers = () => {
      fetch('/api/admin/users')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.users)) {
            setUsers((prev) => {
              const map = new Map<string, UserProfile>();
              prev.forEach((u) => map.set(u.cpf.replace(/\D/g, ''), u));
              data.users.forEach((u: UserProfile) => {
                const clean = u.cpf.replace(/\D/g, '');
                if (clean) map.set(clean, { ...map.get(clean), ...u, cpf: clean });
              });
              const list = Array.from(map.values());
              list.sort((a, b) => {
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return timeB - timeA;
              });
              return list;
            });
          }
        })
        .catch(() => null);
    };

    fetchServerUsers();
    const interval = setInterval(fetchServerUsers, 3000);

    // C) Real-time Firestore Snapshot
    try {
      const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ cpf: docSnap.id, ...docSnap.data() } as UserProfile);
        });

        // Also sync snapshot users to backend
        if (list.length > 0) {
          fetch('/api/users/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ users: list }),
          }).catch(() => null);
        }

        setUsers((prev) => {
          const map = new Map<string, UserProfile>();
          prev.forEach((u) => map.set(u.cpf.replace(/\D/g, ''), u));
          list.forEach((u) => {
            const clean = u.cpf.replace(/\D/g, '');
            if (clean) map.set(clean, { ...map.get(clean), ...u, cpf: clean });
          });
          const merged = Array.from(map.values());
          merged.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          });
          return merged;
        });
      });

      return () => {
        clearInterval(interval);
        unsub();
      };
    } catch (e) {
      console.warn('Users listener notice:', e);
      return () => clearInterval(interval);
    }
  }, [isAdminAuthenticated]);

  // Toggle Maintenance Mode
  const handleToggleMaintenance = async () => {
    const nextState = !maintenanceMode;
    setIsSavingMaintenance(true);

    try {
      // 1. Update Backend
      await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenanceMode: nextState,
          maintenanceMessage: maintenanceMessage,
        }),
      });

      // 2. Update Firestore
      await setDoc(doc(db, 'system_settings', 'config'), {
        maintenanceMode: nextState,
        maintenanceMessage: maintenanceMessage,
        updatedAt: new Date().toISOString(),
      });

      setMaintenanceMode(nextState);
      soundEngine.playCoinDrop();
      showToast(
        nextState
          ? '🔴 CASSINO PAUSADO! Os jogadores verão a tela de manutenção.'
          : '🟢 CASSINO NO AR! Sistema reaberto para os jogadores.'
      );
    } catch (err: any) {
      showToast('Erro ao atualizar modo manutenção: ' + err.message, 'error');
    } finally {
      setIsSavingMaintenance(false);
    }
  };

  // Save Custom Maintenance Message
  const handleSaveMaintenanceMessage = async () => {
    setIsSavingMaintenance(true);
    try {
      await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenanceMode,
          maintenanceMessage,
        }),
      });

      await setDoc(doc(db, 'system_settings', 'config'), {
        maintenanceMode,
        maintenanceMessage,
        updatedAt: new Date().toISOString(),
      });

      showToast('Mensagem de manutenção salva com sucesso!');
    } catch (err: any) {
      showToast('Erro ao salvar mensagem: ' + err.message, 'error');
    } finally {
      setIsSavingMaintenance(false);
    }
  };

  // Approve Deposit (Manual Action requested by User)
  const handleApproveDeposit = async (dep: DepositItem) => {
    const txId = dep.transactionId || dep.id;
    setProcessingDepositId(txId);

    try {
      // 1. Notify Backend
      await fetch('/api/admin/deposits/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txId }),
      });

      // 2. Update Deposit in Firestore
      await updateDoc(doc(db, 'deposits', txId), {
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).catch(async () => {
        await setDoc(
          doc(db, 'deposits', txId),
          {
            ...dep,
            status: 'APPROVED',
            approvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      });

      // 3. Credit user balance directly in Firestore if CPF is known
      const cleanCpf = (dep.cpf || '').replace(/\D/g, '');
      if (cleanCpf) {
        const userDocRef = doc(db, 'users', cleanCpf);
        const existingUser = users.find((u) => u.cpf.replace(/\D/g, '') === cleanCpf);

        const currentBal = existingUser?.balance || 0;
        const currentBonus = existingUser?.balanceBonus || 0;
        const addAmount = dep.amount || 0;
        const addBonus = dep.bonusAmount || dep.amount || 0;

        await setDoc(
          userDocRef,
          {
            balance: currentBal + addAmount,
            balanceBonus: currentBonus + addBonus,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      // Update local state
      setDeposits((prev) =>
        prev.map((d) =>
          (d.id === txId || d.transactionId === txId)
            ? { ...d, status: 'APPROVED', approvedAt: new Date().toISOString() }
            : d
        )
      );

      soundEngine.playWinChime();
      showToast(`Depósito de R$ ${formatBRL(dep.amount)} APROVADO com sucesso para ${dep.clientName}!`);
    } catch (err: any) {
      console.error('Erro ao aprovar depósito:', err);
      showToast('Erro ao aprovar: ' + err.message, 'error');
    } finally {
      setProcessingDepositId(null);
    }
  };

  // Reject Deposit
  const handleRejectDeposit = async (dep: DepositItem) => {
    const txId = dep.transactionId || dep.id;
    const reason = prompt('Motivo da recusa (opcional):', 'Pagamento não confirmado na conta bancária.');
    if (reason === null) return;

    setProcessingDepositId(txId);
    try {
      await fetch('/api/admin/deposits/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txId, reason }),
      });

      await updateDoc(doc(db, 'deposits', txId), {
        status: 'REJECTED',
        rejectionReason: reason,
        updatedAt: new Date().toISOString(),
      }).catch(async () => {
        await setDoc(
          doc(db, 'deposits', txId),
          { ...dep, status: 'REJECTED', rejectionReason: reason, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      });

      setDeposits((prev) =>
        prev.map((d) =>
          (d.id === txId || d.transactionId === txId)
            ? { ...d, status: 'REJECTED', rejectionReason: reason }
            : d
        )
      );

      showToast('Depósito marcado como RECUSADO.', 'info');
    } catch (err: any) {
      showToast('Erro ao recusar depósito: ' + err.message, 'error');
    } finally {
      setProcessingDepositId(null);
    }
  };

  // Update User Balance (Add or Subtract)
  const handleExecuteBalanceUpdate = async () => {
    if (!balanceActionModal) return;
    const { user, type } = balanceActionModal;
    const amount = parseFloat(balanceAmountInput.replace(',', '.'));

    if (isNaN(amount) || amount <= 0) {
      showToast('Digite um valor válido maior que zero.', 'error');
      return;
    }

    setIsUpdatingBalance(true);
    try {
      const cleanCpf = user.cpf.replace(/\D/g, '');
      const userRef = doc(db, 'users', cleanCpf);

      const currentBalance = user.balance || 0;
      const newBalance = type === 'add' ? currentBalance + amount : Math.max(0, currentBalance - amount);

      await setDoc(
        userRef,
        {
          balance: newBalance,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Also notify backend
      fetch('/api/admin/users/update-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cleanCpf, amount, type }),
      }).catch(() => null);

      soundEngine.playCoinDrop();
      showToast(
        `Saldo de ${user.name} atualizado: R$ ${formatBRL(currentBalance)} ➔ R$ ${formatBRL(newBalance)}`
      );
      setBalanceActionModal(null);
      setBalanceAmountInput('');
    } catch (err: any) {
      showToast('Erro ao atualizar saldo: ' + err.message, 'error');
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  // Reset User Password
  const handleExecutePasswordReset = async () => {
    if (!passwordResetModal) return;
    const newPass = newPasswordInput.trim();

    if (!newPass || newPass.length < 4) {
      showToast('A senha deve conter no mínimo 4 dígitos.', 'error');
      return;
    }

    setIsResettingPassword(true);
    try {
      const cleanCpf = passwordResetModal.cpf.replace(/\D/g, '');
      const userRef = doc(db, 'users', cleanCpf);

      await setDoc(
        userRef,
        {
          passwordHash: newPass,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Also notify backend
      fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cleanCpf, newPassword: newPass }),
      }).catch(() => null);

      const readyMessage = `Olá ${passwordResetModal.name}, sua nova senha de acesso ao FuturoBet é: ${newPass}\nAcesse: https://futurobet.com.br`;
      setPasswordResetSuccess(readyMessage);
      soundEngine.playWinChime();
      showToast('Senha redefinida com sucesso!');
    } catch (err: any) {
      showToast('Erro ao redefinir senha: ' + err.message, 'error');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Quick Support Lookup by CPF
  const handleSupportLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setSupportLookupError(null);
    setSupportLookupResult(null);

    const cleanCpf = supportLookupCpf.replace(/\D/g, '');
    if (!cleanCpf) {
      setSupportLookupError('Digite um CPF válido.');
      return;
    }

    const found = users.find((u) => u.cpf.replace(/\D/g, '') === cleanCpf);
    if (found) {
      setSupportLookupResult(found);
      soundEngine.playCoinDrop();
    } else {
      setSupportLookupError(`Nenhum jogador encontrado com o CPF ${supportLookupCpf}.`);
      soundEngine.playLockedSound();
    }
  };

  // Filtered lists
  const filteredDeposits = deposits.filter((d) => {
    const matchesFilter =
      depositFilter === 'ALL'
        ? true
        : depositFilter === 'PENDING'
        ? d.status === 'PAID_PENDING_APPROVAL' || d.status === 'WAITING_PAYMENT'
        : d.status === depositFilter;

    const query = depositSearch.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (d.clientName || '').toLowerCase().includes(query) ||
      (d.cpf || '').includes(query) ||
      (d.transactionId || '').toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const filteredUsers = users.filter((u) => {
    const query = userSearch.toLowerCase().trim();
    if (!query) return true;
    return (
      (u.name || '').toLowerCase().includes(query) ||
      (u.cpf || '').includes(query) ||
      (u.phone || '').includes(query)
    );
  });

  const totalPendingDepositsCount = deposits.filter(
    (d) => d.status === 'PAID_PENDING_APPROVAL' || d.status === 'WAITING_PAYMENT'
  ).length;

  const totalApprovedAmountToday = deposits
    .filter((d) => d.status === 'APPROVED')
    .reduce((acc, d) => acc + (d.amount || 0), 0);

  // =========================================================================
  // LOGIN SCREEN (If not authenticated)
  // =========================================================================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07080b] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none">
        
        {/* Glow Effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md w-full bg-[#0d0f16] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95)] space-y-6">
          
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center bg-zinc-900/90 px-3.5 py-1.5 rounded-2xl border border-zinc-800 shadow-inner mb-1">
              <span className="text-white font-black text-lg tracking-tight">FUTURO</span>
              <span className="text-amber-400 font-black text-lg tracking-tight ml-1">BET</span>
              <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                ADM
              </span>
            </div>
            
            <h2 className="text-xl font-black text-white tracking-tight uppercase">
              Painel de Controle
            </h2>
            <p className="text-xs text-zinc-400">
              Acesso exclusivo para gerenciamento de cassino, aprovação de depósitos e suporte.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-black text-zinc-300 uppercase tracking-wider">
                USUÁRIO
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Digite seu usuário de acesso"
                  className="w-full pl-10 pr-3.5 py-3 bg-[#13151f] border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-zinc-300 uppercase tracking-wider">
                SENHA DE ACESSO
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Digite sua senha de acesso"
                  className="w-full pl-10 pr-10 py-3 bg-[#13151f] border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoggingIn ? 'AUTENTICANDO...' : 'ENTRAR NO PAINEL ADM'}</span>
            </button>
          </form>

          {/* Back to normal casino button */}
          <div className="pt-2 text-center">
            <button
              onClick={onBackToCasino || (() => { window.location.pathname = '/'; })}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition cursor-pointer flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para o Cassino</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#08090d] text-white font-sans flex flex-col">
      
      {/* Toast Notification */}
      {statusNotification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-4 duration-200 ${
            statusNotification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
              : statusNotification.type === 'error'
              ? 'bg-red-950/90 border-red-500/60 text-red-200'
              : 'bg-zinc-900/90 border-zinc-700 text-zinc-200'
          }`}
        >
          {statusNotification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {statusNotification.type === 'error' && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
          {statusNotification.type === 'info' && <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />}
          <span>{statusNotification.message}</span>
        </div>
      )}

      {/* TOP ADMIN HEADER BAR */}
      <header className="bg-[#0e1017] border-b border-zinc-800/80 px-4 sm:px-6 py-3.5 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-zinc-900/90 px-3 py-1.5 rounded-2xl border border-zinc-800">
              <span className="text-white font-black text-sm sm:text-base tracking-tight">FUTURO</span>
              <span className="text-amber-400 font-black text-sm sm:text-base tracking-tight ml-1">BET</span>
              <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                ADM
              </span>
            </div>

            <div className="hidden sm:block leading-tight">
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Painel Online (Tempo Real)
              </span>
              <span className="text-[11px] text-zinc-400 font-medium">Sessão Segura • Administrador</span>
            </div>
          </div>

          {/* Quick System Maintenance Badge / Toggle & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Maintenance Toggle Button */}
            <button
              onClick={handleToggleMaintenance}
              disabled={isSavingMaintenance}
              className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
                maintenanceMode
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              <Power className={`w-3.5 h-3.5 ${maintenanceMode ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
              <span className="hidden sm:inline">
                {maintenanceMode ? 'CASSINO PAUSADO (MANUTENÇÃO)' : 'CASSINO NO AR (ATIVO)'}
              </span>
              <span className="sm:hidden">
                {maintenanceMode ? 'PAUSADO' : 'ATIVO'}
              </span>
            </button>

            {/* Back to Public Casino */}
            <button
              onClick={onBackToCasino || (() => { window.location.pathname = '/'; })}
              className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ver Cassino</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleAdminLogout}
              className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-red-950/60 hover:text-red-300 text-zinc-400 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>

          </div>

        </div>
      </header>

      {/* METRIC OVERVIEW CARDS */}
      <div className="bg-[#0a0c12] border-b border-zinc-800/50 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Card 1: Fila de Depósitos Pendentes */}
          <div 
            onClick={() => { setActiveTab('deposits'); setDepositFilter('PENDING'); }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              totalPendingDepositsCount > 0
                ? 'bg-amber-950/30 border-amber-500/50 hover:bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                : 'bg-[#11131c] border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider">Aprovação Manual</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400 font-mono">
                {totalPendingDepositsCount}
              </span>
              <span className="text-xs text-zinc-400 font-medium">aguardando liberação</span>
            </div>
          </div>

          {/* Card 2: Total Aprovado */}
          <div className="bg-[#11131c] border border-zinc-800 rounded-2xl p-3.5">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider">Total Aprovado</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-emerald-400 font-bold">R$</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                {formatBRL(totalApprovedAmountToday)}
              </span>
            </div>
          </div>

          {/* Card 3: Jogadores Cadastrados */}
          <div 
            onClick={() => setActiveTab('users')}
            className="bg-[#11131c] border border-zinc-800 hover:border-zinc-700 rounded-2xl p-3.5 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider">Jogadores Cadastrados</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {users.length}
              </span>
              <span className="text-xs text-zinc-400 font-medium">contas no banco</span>
            </div>
          </div>

          {/* Card 4: Status do Cassino */}
          <div 
            onClick={() => setActiveTab('system')}
            className="bg-[#11131c] border border-zinc-800 hover:border-zinc-700 rounded-2xl p-3.5 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider">Status do Cassino</span>
              <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2.5 h-2.5 rounded-full ${maintenanceMode ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
              <span className={`text-sm sm:text-base font-black uppercase ${maintenanceMode ? 'text-rose-400' : 'text-emerald-400'}`}>
                {maintenanceMode ? 'EM MANUTENÇÃO' : 'ONLINE / ATIVO'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="bg-[#0e1017] border-b border-zinc-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2">
          
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'deposits'
                ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Fila de Depósitos PIX</span>
            {totalPendingDepositsCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'deposits' ? 'bg-black text-amber-400' : 'bg-amber-400 text-black'
              }`}>
                {totalPendingDepositsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gerenciar Jogadores & Saldos</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'support'
                ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Central de Suporte & Senhas</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'system'
                ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Controle do Sistema & Manutenção</span>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* ----------------------------------------------------------------------- */}
        {/* TAB 1: FILA DE DEPÓSITOS (Aprovação Manual do Usuário) */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 'deposits' && (
          <div className="space-y-4">
            
            {/* Filter and Search Bar */}
            <div className="bg-[#11131c] border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setDepositFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    depositFilter === 'PENDING'
                      ? 'bg-amber-400 text-black font-black shadow'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Aguardando Aprovação ({deposits.filter((d) => d.status === 'PAID_PENDING_APPROVAL' || d.status === 'WAITING_PAYMENT').length})</span>
                </button>

                <button
                  onClick={() => setDepositFilter('APPROVED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    depositFilter === 'APPROVED'
                      ? 'bg-emerald-500 text-black font-black shadow'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aprovados ({deposits.filter((d) => d.status === 'APPROVED').length})</span>
                </button>

                <button
                  onClick={() => setDepositFilter('REJECTED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    depositFilter === 'REJECTED'
                      ? 'bg-rose-500 text-white font-black shadow'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Recusados ({deposits.filter((d) => d.status === 'REJECTED').length})</span>
                </button>

                <button
                  onClick={() => setDepositFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    depositFilter === 'ALL'
                      ? 'bg-zinc-200 text-black font-black'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <span>Todos ({deposits.length})</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por Nome, CPF ou ID..."
                  value={depositSearch}
                  onChange={(e) => setDepositSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-[#171924] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

            </div>

            {/* Deposits List */}
            {filteredDeposits.length === 0 ? (
              <div className="bg-[#11131c] border border-zinc-800 rounded-2xl p-10 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-70" />
                <h3 className="text-base font-bold text-white">Nenhum depósito nesta categoria</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Quando os jogadores gerarem e pagarem depósitos via PIX SyncPay, eles aparecerão aqui instantaneamente em tempo real.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredDeposits.map((dep) => {
                  const txId = dep.transactionId || dep.id;
                  const isPending = dep.status === 'PAID_PENDING_APPROVAL' || dep.status === 'WAITING_PAYMENT';
                  const isApproved = dep.status === 'APPROVED';
                  const isRejected = dep.status === 'REJECTED';
                  const isProcessingThis = processingDepositId === txId;

                  return (
                    <div
                      key={txId}
                      className={`bg-[#11131c] border rounded-2xl p-4.5 space-y-3 transition-all relative overflow-hidden ${
                        isPending
                          ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.12)]'
                          : isApproved
                          ? 'border-emerald-500/30'
                          : 'border-zinc-800 opacity-75'
                      }`}
                    >
                      {/* Top Row: User & Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-black text-white leading-snug">
                            {dep.clientName || 'Jogador FuturoBet'}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                            <span>CPF: {dep.cpf || 'Não informado'}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {isPending && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3" />
                              <span>Aguardando ADM</span>
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Aprovado</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>Recusado</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Values Grid */}
                      <div className="grid grid-cols-2 gap-2 bg-[#171924] p-2.5 rounded-xl border border-zinc-800/80">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                            VALOR PAGO
                          </span>
                          <span className="text-sm font-black text-white font-mono">
                            R$ {formatBRL(dep.amount)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                            TOTAL C/ BÔNUS (100%)
                          </span>
                          <span className="text-sm font-black text-emerald-400 font-mono">
                            R$ {formatBRL(dep.totalAmount || dep.amount * 2)}
                          </span>
                        </div>
                      </div>

                      {/* Details & Timestamp */}
                      <div className="text-[11px] text-zinc-400 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Data do Pedido:</span>
                          <span className="font-mono text-zinc-300">
                            {new Date(dep.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Gateway:</span>
                          <span className="text-zinc-300 font-bold">API da Sync (SyncPay)</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                          <span className="truncate max-w-[200px]">ID: {txId}</span>
                          <button
                            onClick={() => handleCopy(txId, txId)}
                            className="hover:text-amber-400 cursor-pointer ml-1"
                          >
                            {copiedKey === txId ? 'Copiado!' : 'Copiar'}
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons for Pending Deposits */}
                      {isPending && (
                        <div className="pt-1 space-y-1.5">
                          <button
                            onClick={() => handleApproveDeposit(dep)}
                            disabled={isProcessingThis}
                            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                          >
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                            <span>{isProcessingThis ? 'APROVANDO...' : 'APROVAR & CREDITAR SALDO'}</span>
                          </button>

                          <button
                            onClick={() => handleRejectDeposit(dep)}
                            disabled={isProcessingThis}
                            className="w-full py-1.5 bg-zinc-800/80 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 font-bold text-xs uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Recusar</span>
                          </button>
                        </div>
                      )}

                      {/* Approved Info */}
                      {isApproved && (
                        <div className="p-2 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-300 font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Saldo liberado na conta do jogador</span>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* TAB 2: GERENCIAR JOGADORES & SALDOS */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            
            {/* Header & Search */}
            <div className="bg-[#11131c] border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-white uppercase tracking-wide">
                  Lista de Jogadores Cadastrados ({users.length})
                </h3>
                <p className="text-xs text-zinc-400">
                  Gerencie saldos em tempo real, adicione bônus e altere senhas de acesso.
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar por Nome, CPF ou WhatsApp..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-[#171924] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Users Table / Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredUsers.map((u) => {
                const cleanPhone = (u.phone || '').replace(/\D/g, '');
                const whatsappUrl = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;

                return (
                  <div
                    key={u.cpf}
                    className="bg-[#11131c] border border-zinc-800 rounded-2xl p-4.5 space-y-3.5 hover:border-zinc-700 transition"
                  >
                    {/* User Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-black text-white">
                          {u.name || 'Jogador Sem Nome'}
                        </h4>
                        <p className="text-xs text-zinc-400 font-mono">
                          CPF: {u.cpf}
                        </p>
                      </div>

                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60 text-xs font-bold flex items-center gap-1 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>

                    {/* Balances */}
                    <div className="grid grid-cols-2 gap-2 bg-[#171924] p-3 rounded-xl border border-zinc-800/80">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                          SALDO REAL
                        </span>
                        <span className="text-base font-black text-emerald-400 font-mono">
                          R$ {formatBRL(u.balance || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                          SALDO BÔNUS
                        </span>
                        <span className="text-base font-black text-amber-400 font-mono">
                          R$ {formatBRL(u.balanceBonus || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      
                      {/* Add Balance */}
                      <button
                        onClick={() => {
                          setBalanceActionModal({ user: u, type: 'add' });
                          setBalanceAmountInput('50');
                        }}
                        className="py-2 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar</span>
                      </button>

                      {/* Subtract Balance */}
                      <button
                        onClick={() => {
                          setBalanceActionModal({ user: u, type: 'subtract' });
                          setBalanceAmountInput('20');
                        }}
                        className="py-2 px-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-bold text-[11px] uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Minus className="w-3.5 h-3.5" />
                        <span>Deduzir</span>
                      </button>

                      {/* Reset Password */}
                      <button
                        onClick={() => {
                          setPasswordResetModal(u);
                          setNewPasswordInput('123456');
                          setPasswordResetSuccess(null);
                        }}
                        className="py-2 px-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[11px] uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Senha</span>
                      </button>

                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* TAB 3: CENTRAL DE SUPORTE & REDEFINIÇÃO DE SENHAS */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 'support' && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Fast CPF Support Lookup */}
            <div className="bg-[#11131c] border border-zinc-800 rounded-3xl p-6 space-y-5 shadow-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-black uppercase">
                  <KeyRound className="w-4 h-4" />
                  <span>Atendimento Rápido por CPF</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Quando o jogador pedir suporte no WhatsApp (42) 99968-7965 para redefinir senha ou consultar saldo, digite o CPF dele abaixo:
                </p>
              </div>

              <form onSubmit={handleSupportLookup} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite o CPF do jogador (ex: 123.456.789-00)..."
                  value={supportLookupCpf}
                  onChange={(e) => setSupportLookupCpf(e.target.value)}
                  className="flex-1 px-4 py-3 bg-[#171924] border border-zinc-800 rounded-2xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow transition cursor-pointer flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Localizar</span>
                </button>
              </form>

              {supportLookupError && (
                <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{supportLookupError}</span>
                </div>
              )}

              {/* Found User Card */}
              {supportLookupResult && (
                <div className="bg-[#171924] border border-amber-500/40 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-black text-white">{supportLookupResult.name}</h4>
                      <p className="text-xs text-zinc-400 font-mono">CPF: {supportLookupResult.cpf}</p>
                      {supportLookupResult.phone && (
                        <p className="text-xs text-zinc-400">WhatsApp: {supportLookupResult.phone}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">SALDO ATUAL</span>
                      <span className="text-lg font-black text-emerald-400 font-mono">
                        R$ {formatBRL(supportLookupResult.balance || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                    <button
                      onClick={() => {
                        setPasswordResetModal(supportLookupResult);
                        setNewPasswordInput('123456');
                        setPasswordResetSuccess(null);
                      }}
                      className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Redefinir Senha Deste Jogador</span>
                    </button>

                    <button
                      onClick={() => {
                        setBalanceActionModal({ user: supportLookupResult, type: 'add' });
                        setBalanceAmountInput('50');
                      }}
                      className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajustar Saldo</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Official Support Number Info */}
            <div className="bg-[#11131c] border border-zinc-800 rounded-3xl p-6 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Canal Oficial de Atendimento ao Jogador
              </h4>
              <div className="flex items-center justify-between p-3.5 bg-[#171924] rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-white block">(42) 9 9968-7965</span>
                    <span className="text-[11px] text-zinc-400">WhatsApp Oficial de Suporte FuturoBet</span>
                  </div>
                </div>
                <a
                  href="https://wa.me/5542999687965"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase rounded-xl transition cursor-pointer flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir WhatsApp</span>
                </a>
              </div>
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* TAB 4: CONTROLE DO SISTEMA & MODO MANUTENÇÃO */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 'system' && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Maintenance Toggle Card */}
            <div className={`border rounded-3xl p-6 sm:p-7 space-y-5 transition-all ${
              maintenanceMode
                ? 'bg-rose-950/20 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
                : 'bg-[#11131c] border-zinc-800'
            }`}>
              
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Power className={`w-5 h-5 ${maintenanceMode ? 'text-rose-400' : 'text-emerald-400'}`} />
                    <h3 className="text-base font-black text-white uppercase tracking-wide">
                      Pausar Cassino no Ar / Modo Manutenção
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 max-w-lg">
                    Ao ativar este botão, todo o site será pausado para os jogadores e exibirá a tela oficial de manutenção, permitindo que você faça reparos e ajustes com total tranquilidade.
                  </p>
                </div>

                <button
                  onClick={handleToggleMaintenance}
                  disabled={isSavingMaintenance}
                  className={`relative w-14 h-8 rounded-full transition-colors cursor-pointer shrink-0 p-1 border ${
                    maintenanceMode
                      ? 'bg-rose-500 border-rose-400'
                      : 'bg-zinc-800 border-zinc-700'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white transition-transform ${
                      maintenanceMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-center gap-2.5 ${
                maintenanceMode
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              }`}>
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <div>
                  <strong>Status Atual: </strong>
                  {maintenanceMode ? (
                    <span>O CASSINO ESTÁ PAUSADO. Jogadores comuns veem a tela de manutenção.</span>
                  ) : (
                    <span>O CASSINO ESTÁ NO AR. Jogadores têm acesso normal a depósitos, saques e jogos.</span>
                  )}
                </div>
              </div>

              {/* Maintenance Message Editor */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="text-[11px] font-black text-zinc-300 uppercase tracking-wider block">
                  MENSAGEM EXIBIDA AOS JOGADORES NA TELA DE MANUTENÇÃO:
                </label>
                <textarea
                  rows={3}
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className="w-full p-3 bg-[#171924] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 resize-none"
                  placeholder="Digite a mensagem de manutenção..."
                />

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSaveMaintenanceMessage}
                    disabled={isSavingMaintenance}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow"
                  >
                    Salvar Mensagem
                  </button>
                </div>
              </div>

            </div>

            {/* Gateway & Environment Diagnostic */}
            <div className="bg-[#11131c] border border-zinc-800 rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Diagnóstico de Integração SyncPay & Banco de Dados
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#171924] rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 block text-[10.5px]">Banco de Dados:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Firebase Firestore Conectado
                  </span>
                </div>

                <div className="p-3 bg-[#171924] rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 block text-[10.5px]">Gateway de Pagamento:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> API da Sync (SyncPayments Produção)
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL: AJUSTAR SALDO DO JOGADOR */}
      {/* ========================================================================= */}
      {balanceActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#11131c] border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-black uppercase text-white">
                {balanceActionModal.type === 'add' ? '➕ Adicionar Saldo' : '➖ Deduzir Saldo'}
              </h3>
              <button
                onClick={() => setBalanceActionModal(null)}
                className="text-zinc-500 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-zinc-400">Jogador:</span>
              <p className="text-sm font-bold text-white">{balanceActionModal.user.name}</p>
              <p className="text-xs text-zinc-400 font-mono">CPF: {balanceActionModal.user.cpf}</p>
              <p className="text-xs text-emerald-400 font-mono">
                Saldo Atual: R$ {formatBRL(balanceActionModal.user.balance || 0)}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-zinc-300 uppercase">
                VALOR A {balanceActionModal.type === 'add' ? 'ADICIONAR' : 'DEDUZIR'} (R$):
              </label>
              <input
                type="number"
                step="any"
                value={balanceAmountInput}
                onChange={(e) => setBalanceAmountInput(e.target.value)}
                placeholder="Ex: 50.00"
                className="w-full px-3.5 py-3 bg-[#171924] border border-zinc-800 rounded-xl text-base font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setBalanceActionModal(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteBalanceUpdate}
                disabled={isUpdatingBalance}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 text-black font-black text-xs uppercase rounded-xl shadow transition"
              >
                {isUpdatingBalance ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REDEFINIR SENHA DO JOGADOR */}
      {/* ========================================================================= */}
      {passwordResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#11131c] border border-amber-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Redefinir Senha do Jogador</span>
              </h3>
              <button
                onClick={() => setPasswordResetModal(null)}
                className="text-zinc-500 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-zinc-400">Jogador:</span>
              <p className="text-sm font-bold text-white">{passwordResetModal.name}</p>
              <p className="text-xs text-zinc-400 font-mono">CPF: {passwordResetModal.cpf}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-zinc-300 uppercase">
                NOVA SENHA DE ACESSO:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Digite a nova senha..."
                  className="flex-1 px-3.5 py-2.5 bg-[#171924] border border-zinc-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setNewPasswordInput(String(Math.floor(100000 + Math.random() * 900000)))}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 rounded-xl transition"
                >
                  Gerar 6 dígitos
                </button>
              </div>
            </div>

            {passwordResetSuccess && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl space-y-2">
                <span className="text-xs text-emerald-300 font-bold block">
                  ✓ Senha alterada! Copie a mensagem pronta para enviar no WhatsApp do jogador:
                </span>
                <div className="p-2 bg-black/50 rounded-lg text-xs font-mono text-zinc-300 select-all break-words">
                  {passwordResetSuccess}
                </div>
                <button
                  onClick={() => handleCopy(passwordResetSuccess, 'readyMessage')}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'readyMessage' ? 'COPIADO COM SUCESSO!' : 'COPIAR MENSAGEM DO WHATSAPP'}</span>
                </button>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPasswordResetModal(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase rounded-xl transition"
              >
                Fechar
              </button>
              <button
                onClick={handleExecutePasswordReset}
                disabled={isResettingPassword}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 text-black font-black text-xs uppercase rounded-xl shadow transition"
              >
                {isResettingPassword ? 'Alterando...' : 'Salvar Nova Senha'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
