import React, { useState, useMemo, Component, ReactNode } from 'react';
import {
  Wallet,
  Calendar as CalendarIcon,
  StickyNote,
  Home,
  Plus,
  CheckCircle2,
  Circle,
  TrendingDown,
  TrendingUp,
  Clock,
  Sparkles,
  Loader2,
  Wand2,
  X,
  Trash2,
  PieChart,
  Landmark,
  Receipt,
  Pencil,
  CalendarDays,
  Check,
  Target,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

// --- Error Boundary ---
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800 font-sans">
          <AlertTriangle className="w-16 h-16 text-rose-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Что-то пошло не так</h1>
          <p className="text-slate-500 text-center mb-6 max-w-xs">
            Приложение столкнулось с критической ошибкой.
          </p>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 w-full overflow-auto max-h-60 mb-6">
            <code className="text-xs text-rose-600 font-mono">
              {this.state.error?.toString()}
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold active:scale-95 transition-transform"
          >
            Перезагрузить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- LocalStorage helpers ---
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};

// --- Дизайн-система ---
const THEME = {
  background: 'bg-slate-50',
  card: 'bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
  text: {
    title: 'text-3xl font-extrabold text-slate-800 tracking-tight',
    header: 'text-lg font-bold text-slate-700',
    body: 'text-base font-medium text-slate-500',
    label: 'text-[11px] font-bold uppercase tracking-widest text-slate-400'
  }
};

// Design accents (available for future use)
// const ACCENTS = {
//   budget: { text: 'text-emerald-500', bg: 'bg-emerald-50', icon: 'bg-emerald-100' },
//   events: { text: 'text-violet-500', bg: 'bg-violet-50', icon: 'bg-violet-100' },
//   notes: { text: 'text-amber-500', bg: 'bg-amber-50', icon: 'bg-amber-100' },
//   home: { text: 'text-sky-500', bg: 'bg-sky-50', icon: 'bg-sky-100' },
//   danger: { text: 'text-rose-500', bg: 'bg-rose-50', icon: 'bg-rose-100' },
//   ai: { text: 'text-indigo-500', bg: 'bg-indigo-50', icon: 'bg-indigo-100' }
// };

// --- Вспомогательные компоненты ---
interface PressableScaleProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const PressableScale = ({ children, onClick, className = "", disabled = false }: PressableScaleProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`active:scale-90 transition-all duration-300 outline-none disabled:opacity-50 hover:scale-[1.02] cursor-pointer ${className}`}
  >
    {children}
  </button>
);

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

const BentoCard = ({ children, className = "", noPadding = false }: BentoCardProps) => (
  <div className={`${THEME.card} ${noPadding ? '' : 'p-6'} transition-shadow hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] duration-500 ${className}`}>
    {children}
  </div>
);

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

const SectionHeader = ({ title, actionLabel, onAction }: SectionHeaderProps) => (
  <div className="flex justify-between items-center mb-4 px-2">
    <h2 className={THEME.text.header}>{title}</h2>
    {actionLabel && (
      <button onClick={onAction} className="text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm">
        {actionLabel}
      </button>
    )}
  </div>
);

// --- Типы ---
interface Transaction {
  id: string;
  amount: number;
  title: string;
  type: 'expense' | 'income';
  category: string;
  date: number;
  createdAt: number;
}

interface Bill {
  id: string;
  title: string;
  amount: number;
  date: number;
  paid: boolean;
  createdAt: number;
}

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  date: string;
  icon: string;
  color: string;
  createdAt: number;
}

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: number;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  color: string;
  createdAt: number;
}

// --- Budget Tab ---
const BudgetTab = () => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDailyOpen, setDailyOpen] = useState(false);
  const [isBillsOpen, setBillsOpen] = useState(false);
  const [isEditBalanceOpen, setEditBalanceOpen] = useState(false);
  const [isEditLimitOpen, setEditLimitOpen] = useState(false);
  const [isAddTransOpen, setAddTransOpen] = useState(false);
  const [isAddBillOpen, setAddBillOpen] = useState(false);
  const [isStatsOpen, setStatsOpen] = useState(false);
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  const [totalBalance, setTotalBalance] = useLocalStorage('lifehub_balance', 125000);
  const [monthLimit, setMonthLimit] = useLocalStorage('lifehub_limit', 60000);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  const [categories, setCategories] = useState(['Еда', 'Транспорт', 'Дом', 'Развлечения', 'Здоровье', 'Шоппинг', 'Фриланс', 'Разное']);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('lifehub_transactions', [
    { id: '1', amount: 850, title: 'Продукты', type: 'expense', category: 'Еда', date: new Date().getDate(), createdAt: Date.now() },
    { id: '2', amount: 25000, title: 'Зарплата', type: 'income', category: 'Фриланс', date: new Date().getDate() - 1, createdAt: Date.now() - 86400000 },
  ]);
  const [bills, setBills] = useLocalStorage<Bill[]>('lifehub_bills', [
    { id: '1', title: 'Аренда квартиры', amount: 35000, date: 1, paid: false, createdAt: Date.now() },
    { id: '2', title: 'Интернет', amount: 750, date: 15, paid: true, createdAt: Date.now() },
  ]);
  const [goals, setGoals] = useLocalStorage<Goal[]>('lifehub_goals', [
    { id: '1', title: 'MacBook Pro', targetAmount: 200000, currentAmount: 85000, date: '2024-06-01', icon: 'Target', color: 'bg-emerald-500', createdAt: Date.now() },
  ]);

  const [newTrans, setNewTrans] = useState({ amount: '', title: '', type: 'expense' as 'expense' | 'income', category: 'Еда' });
  const [newBill, setNewBill] = useState({ title: '', amount: '', date: '' });
  const [goalForm, setGoalForm] = useState({ title: '', targetAmount: '', currentAmount: '', date: '' });
  const [manualBalanceInput, setManualBalanceInput] = useState('');
  const [manualLimitInput, setManualLimitInput] = useState('');

  const spentThisMonth = useMemo(() => {
    return transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const progress = useMemo(() => {
    if (monthLimit === 0) return 0;
    return Math.min((spentThisMonth / monthLimit) * 100, 100);
  }, [spentThisMonth, monthLimit]);

  const expensesByCategory = useMemo(() => {
    const stats: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      stats[t.category] = (stats[t.category] || 0) + t.amount;
    });
    return Object.entries(stats)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const getFinancialAdvice = async () => {
    setLoading(true);
    // Симуляция AI ответа
    await new Promise(resolve => setTimeout(resolve, 1500));
    const advices = [
      `При текущих расходах ${spentThisMonth.toLocaleString()} ₽ вы используете ${Math.round(progress)}% лимита. Попробуйте сократить расходы на категорию "${expensesByCategory[0]?.name || 'Разное'}" для экономии.`,
      `Ваш баланс ${totalBalance.toLocaleString()} ₽ позволяет откладывать по ${Math.round((totalBalance - spentThisMonth) / 30)} ₽ в день. Создайте автоматический перевод на накопления.`,
      `Совет: ведите учёт мелких расходов — они часто составляют до 30% бюджета. Ваш прогресс отличный!`
    ];
    setAdvice(advices[Math.floor(Math.random() * advices.length)]);
    setLoading(false);
  };

  const handleManualBalanceUpdate = () => {
    if (manualBalanceInput) {
      const newBal = Number(manualBalanceInput);
      setTotalBalance(newBal);
      setEditBalanceOpen(false);
    }
  };

  const handleManualLimitUpdate = () => {
    if (manualLimitInput) {
      const newLim = Number(manualLimitInput);
      setMonthLimit(newLim);
      setEditLimitOpen(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([...categories, newCategoryName.trim()]);
      setNewTrans({ ...newTrans, category: newCategoryName.trim() });
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleAddTransaction = () => {
    if (!newTrans.amount || !newTrans.title) return;
    const amount = Number(newTrans.amount);
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      ...newTrans,
      amount: amount,
      date: selectedDate,
      createdAt: Date.now()
    };
    setTransactions([newTransaction, ...transactions]);

    if (newTrans.type === 'expense') {
      setTotalBalance(totalBalance - amount);
    } else {
      setTotalBalance(totalBalance + amount);
    }

    setAddTransOpen(false);
    setNewTrans({ amount: '', title: '', type: 'expense', category: 'Еда' });
  };

  const handleAddBill = () => {
    if (!newBill.amount || !newBill.title) return;
    const newBillItem: Bill = {
      id: Date.now().toString(),
      title: newBill.title,
      amount: Number(newBill.amount),
      date: Number(newBill.date) || 1,
      paid: false,
      createdAt: Date.now()
    };
    setBills([newBillItem, ...bills]);
    setAddBillOpen(false);
    setNewBill({ title: '', amount: '', date: '' });
  };

  const toggleBillPaid = (billId: string) => {
    setBills(bills.map(b => b.id === billId ? { ...b, paid: !b.paid } : b));
  };

  const deleteBill = (billId: string) => {
    setBills(bills.filter(b => b.id !== billId));
  };

  const openAddGoalModal = () => {
    setEditingGoalId(null);
    setGoalForm({ title: '', targetAmount: '', currentAmount: '', date: '' });
    setGoalModalOpen(true);
  };

  const openEditGoalModal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setGoalForm({
      title: goal.title,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      date: goal.date
    });
    setGoalModalOpen(true);
  };

  const handleSaveGoal = () => {
    if (!goalForm.title || !goalForm.targetAmount || !goalForm.date) return;
    const target = Number(goalForm.targetAmount);
    const current = Number(goalForm.currentAmount) || 0;

    const goalData = {
      title: goalForm.title,
      targetAmount: target,
      currentAmount: current,
      date: goalForm.date,
      icon: 'Target',
      color: 'bg-emerald-500'
    };

    if (editingGoalId) {
      setGoals(goals.map(g => g.id === editingGoalId ? { ...g, ...goalData } : g));
    } else {
      const newGoal: Goal = {
        id: Date.now().toString(),
        ...goalData,
        createdAt: Date.now()
      };
      setGoals([newGoal, ...goals]);
    }
    setGoalModalOpen(false);
  };

  const handleDeleteGoal = () => {
    if (editingGoalId) {
      setGoals(goals.filter(g => g.id !== editingGoalId));
      setGoalModalOpen(false);
    }
  };

  const calculateDailySavings = (targetAmount: number, currentAmount: number, targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 0;
    const remaining = Math.max(0, targetAmount - currentAmount);
    return Math.ceil(remaining / diffDays);
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const filteredTransactions = transactions.filter(t => t.date === selectedDate);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <header className="pt-4 flex justify-between items-end">
        <div>
          <p className={THEME.text.label}>Текущий баланс</p>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-baseline gap-2">
              <h1 className="text-4xl font-extrabold text-slate-800 tracking-tighter">
                {totalBalance.toLocaleString('ru-RU')}
              </h1>
              <span className="text-2xl font-bold text-slate-400">₽</span>
            </div>
            <div className="flex gap-2">
              <PressableScale onClick={() => { setManualBalanceInput(String(totalBalance)); setEditBalanceOpen(true); }} className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm text-slate-400 hover:text-slate-600">
                <Pencil className="w-4 h-4" />
              </PressableScale>
              <PressableScale onClick={() => setStatsOpen(true)} className="bg-slate-800 p-2.5 rounded-2xl shadow-lg shadow-slate-200 text-white">
                <PieChart className="w-4 h-4" />
              </PressableScale>
            </div>
          </div>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Operations Card */}
        <PressableScale onClick={() => setDailyOpen(true)} className="bg-white rounded-[32px] p-6 flex flex-col justify-between h-44 shadow-lg shadow-slate-100 border border-white relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-[0.03] transition-transform group-hover:scale-110 duration-700">
            <Receipt className="w-32 h-32 text-slate-900 rotate-12" />
          </div>
          <div className="bg-emerald-50 w-14 h-14 rounded-[20px] flex items-center justify-center shadow-inner">
            <Receipt className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-slate-800 font-bold text-xl leading-tight">Операции</h3>
            <p className="text-slate-400 text-[11px] mt-1.5 font-bold tracking-widest uppercase">История операций</p>
          </div>
        </PressableScale>

        {/* Calendar Card */}
        <PressableScale onClick={() => setBillsOpen(true)} className="bg-white rounded-[32px] p-6 flex flex-col justify-between h-44 shadow-lg shadow-slate-100 border border-white relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-[0.03] transition-transform group-hover:scale-110 duration-700">
            <CalendarDays className="w-32 h-32 text-slate-900 rotate-12" />
          </div>
          <div className="bg-violet-50 w-14 h-14 rounded-[20px] flex items-center justify-center shadow-inner">
            <Landmark className="w-7 h-7 text-violet-500" />
          </div>
          <div>
            <h3 className="text-slate-800 font-bold text-xl leading-tight">Платежи</h3>
            <p className="text-slate-400 text-[11px] mt-1.5 font-bold tracking-widest uppercase">Кредиты и счета</p>
          </div>
        </PressableScale>
      </div>

      {/* Analytics & Limit */}
      <div className="space-y-4">
        <BentoCard className="bg-white/80 backdrop-blur-sm">
          <div className="flex justify-between items-end mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className={THEME.text.label}>Лимит расходов</p>
                <PressableScale onClick={() => { setManualLimitInput(String(monthLimit)); setEditLimitOpen(true); }} className="bg-slate-100 p-1 rounded-full text-slate-400 hover:text-slate-600">
                  <Pencil className="w-3 h-3" />
                </PressableScale>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {spentThisMonth.toLocaleString()} <span className="text-slate-300 text-lg font-medium">/ {monthLimit.toLocaleString()} ₽</span>
              </p>
            </div>
            <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${progress > 80 ? 'bg-rose-400' : progress > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </BentoCard>
      </div>

      {/* Goals Section */}
      <section>
        <SectionHeader title="Финансовые цели" actionLabel="+ Цель" onAction={openAddGoalModal} />
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-2 -mx-2">
          {goals.length > 0 ? goals.map((goal) => {
            const dailySave = calculateDailySavings(goal.targetAmount, goal.currentAmount, goal.date);
            const percent = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;

            return (
              <PressableScale
                key={goal.id}
                onClick={() => openEditGoalModal(goal)}
                className="min-w-[260px] bg-white p-6 rounded-[32px] border border-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-5">
                  <div className={`p-3.5 rounded-[20px] ${goal.color} bg-opacity-10`}>
                    <Target className={`w-7 h-7 ${goal.color.replace('bg-', 'text-')}`} />
                  </div>
                  <span className="bg-slate-50 px-3 py-1.5 rounded-xl text-[11px] font-black text-slate-400 uppercase tracking-wider">{percent}%</span>
                </div>

                <h3 className="font-bold text-slate-800 text-xl mb-1">{goal.title}</h3>
                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-base font-bold text-slate-600">{goal.currentAmount.toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-300">/ {goal.targetAmount.toLocaleString()} ₽</span>
                </div>

                <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden mb-4 border border-slate-100/50">
                  <div className={`h-full ${goal.color} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }} />
                </div>

                <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-medium text-slate-500">
                    По <span className="font-bold text-slate-800">{dailySave} ₽</span> в день
                  </p>
                </div>
              </PressableScale>
            );
          }) : (
            <div className="px-2">
              <p className="text-slate-400 text-sm">Нет целей. Создайте первую!</p>
            </div>
          )}

          <PressableScale onClick={openAddGoalModal} className="min-w-[100px] flex items-center justify-center bg-white rounded-[32px] border-2 border-dashed border-slate-200 text-slate-300 hover:bg-slate-50 hover:border-slate-300 transition-all hover:text-slate-400">
            <Plus className="w-8 h-8" />
          </PressableScale>
        </div>
      </section>

      {/* --- MODALS --- */}

      {/* 1. Add/Edit Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setGoalModalOpen(false)} />
          <div className="bg-white w-full max-w-md mx-auto rounded-t-[40px] p-8 space-y-6 shadow-2xl relative animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">{editingGoalId ? 'Редактирование' : 'Новая цель'}</h2>
              {editingGoalId && (
                <button onClick={handleDeleteGoal} className="bg-rose-50 p-3 rounded-full text-rose-500 hover:bg-rose-100 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className={THEME.text.label}>На что копим?</label>
                <input
                  value={goalForm.title}
                  onChange={e => setGoalForm({ ...goalForm, title: e.target.value })}
                  placeholder="Напр: MacBook Pro"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold text-slate-800 focus:ring-2 ring-emerald-100 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className={THEME.text.label}>Сумма цели</label>
                <input
                  type="number"
                  value={goalForm.targetAmount}
                  onChange={e => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                  placeholder="0"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-mono font-bold text-slate-800 focus:ring-2 ring-emerald-100 transition-all outline-none"
                />
              </div>
              {editingGoalId && (
                <div className="space-y-2">
                  <label className={THEME.text.label}>Накоплено</label>
                  <input
                    type="number"
                    value={goalForm.currentAmount}
                    onChange={e => setGoalForm({ ...goalForm, currentAmount: e.target.value })}
                    placeholder="0"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-mono font-bold text-slate-800 focus:ring-2 ring-emerald-100 transition-all outline-none"
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className={THEME.text.label}>Дата цели</label>
                <input
                  type="date"
                  value={goalForm.date}
                  onChange={e => setGoalForm({ ...goalForm, date: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold text-slate-800 focus:ring-2 ring-emerald-100 transition-all outline-none"
                />
              </div>
            </div>

            <PressableScale onClick={handleSaveGoal} className="w-full pt-2">
              <div className="bg-emerald-500 h-14 rounded-[28px] flex items-center justify-center shadow-xl shadow-emerald-200">
                <span className="text-white font-bold text-lg">{editingGoalId ? 'Сохранить' : 'Создать'}</span>
              </div>
            </PressableScale>
          </div>
        </div>
      )}

      {/* 2. Edit Balance Modal */}
      {isEditBalanceOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setEditBalanceOpen(false)} />
          <div className="bg-white w-full max-w-xs rounded-[32px] p-6 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <h2 className="text-lg font-bold text-center text-slate-800 mb-6">Баланс</h2>
            <input
              type="number"
              value={manualBalanceInput}
              onChange={(e) => setManualBalanceInput(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-mono text-2xl font-bold text-center text-slate-900 outline-none focus:ring-2 ring-slate-100 mb-6"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setEditBalanceOpen(false)} className="flex-1 h-12 bg-slate-50 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition-colors">Отмена</button>
              <button onClick={handleManualBalanceUpdate} className="flex-1 h-12 bg-slate-900 rounded-2xl font-bold text-white shadow-lg shadow-slate-200">OK</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Edit Limit Modal */}
      {isEditLimitOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setEditLimitOpen(false)} />
          <div className="bg-white w-full max-w-xs rounded-[32px] p-6 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <h2 className="text-lg font-bold text-center text-slate-800 mb-6">Лимит</h2>
            <input
              type="number"
              value={manualLimitInput}
              onChange={(e) => setManualLimitInput(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-mono text-2xl font-bold text-center text-slate-900 outline-none focus:ring-2 ring-slate-100 mb-6"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setEditLimitOpen(false)} className="flex-1 h-12 bg-slate-50 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition-colors">Отмена</button>
              <button onClick={handleManualLimitUpdate} className="flex-1 h-12 bg-slate-900 rounded-2xl font-bold text-white shadow-lg shadow-slate-200">OK</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Statistics Modal */}
      {isStatsOpen && (
        <div className="fixed inset-0 z-[100] flex items-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setStatsOpen(false)} />
          <div className="bg-white w-full max-w-md mx-auto rounded-t-[40px] h-[85vh] shadow-2xl relative animate-in slide-in-from-bottom duration-500 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 pb-2 shrink-0 z-10 bg-white">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Статистика</h2>
                <p className="text-slate-500 text-sm font-medium">Расходы по категориям</p>
              </div>
              <button onClick={() => setStatsOpen(false)} className="bg-slate-50 p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-8 pt-2">
              <div className="space-y-6">
                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-[28px] relative overflow-hidden">
                  <div className="flex justify-between items-center mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                      <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">AI Анализ</span>
                    </div>
                    <PressableScale onClick={getFinancialAdvice} disabled={loading}>
                      <div className="bg-white p-2 rounded-full shadow-sm text-indigo-500">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                      </div>
                    </PressableScale>
                  </div>
                  <p className="text-indigo-900 text-sm leading-relaxed font-semibold relative z-10">
                    {advice || "Нажмите на палочку, чтобы получить анализ ваших расходов от искусственного интеллекта ✨"}
                  </p>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-100 rounded-full blur-2xl opacity-50" />
                </div>
                <div className="space-y-5">
                  {expensesByCategory.length > 0 ? (
                    expensesByCategory.map((item, index) => {
                      const percentage = spentThisMonth > 0 ? Math.round((item.amount / spentThisMonth) * 100) : 0;
                      return (
                        <div key={index} className="space-y-2 animate-in slide-in-from-bottom fade-in duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                          <div className="flex justify-between items-end px-1">
                            <span className="font-bold text-slate-700">{item.name}</span>
                            <div className="text-right flex items-baseline gap-2">
                              <span className="font-bold text-slate-900">{item.amount.toLocaleString()} ₽</span>
                              <span className="text-xs text-slate-400 font-bold bg-slate-50 px-1.5 py-0.5 rounded-md">{percentage}%</span>
                            </div>
                          </div>
                          <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-20 text-center text-slate-300">
                      <PieChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Нет данных о расходах</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Daily Operations Modal */}
      {isDailyOpen && (
        <div className="fixed inset-0 z-[100] flex items-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setDailyOpen(false)} />
          <div className="bg-white w-full max-w-md mx-auto rounded-t-[40px] h-[90vh] shadow-2xl relative animate-in slide-in-from-bottom duration-500 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 pb-2 shrink-0 z-10 bg-white">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Операции</h2>
                <p className="text-slate-500 text-sm font-medium">История и Календарь</p>
              </div>
              <button onClick={() => setDailyOpen(false)} className="bg-slate-100 p-2 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-32 pt-2">
              <div className="bg-slate-50 rounded-[32px] p-5 mb-6">
                <div className="grid grid-cols-7 gap-1">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                    <div key={d} className="h-8 flex items-center justify-center text-[10px] font-black text-slate-300 uppercase">{d}</div>
                  ))}
                  {days.map(d => {
                    const dayTrans = transactions.filter(t => t.date === d);
                    const hasIncome = dayTrans.some(t => t.type === 'income');
                    const hasExpense = dayTrans.some(t => t.type === 'expense');
                    return (
                      <button key={d} onClick={() => setSelectedDate(d)} className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all relative ${selectedDate === d ? 'bg-slate-900 text-white shadow-lg z-10' : 'hover:bg-white text-slate-700'}`}>
                        <span className="text-sm font-bold">{d}</span>
                        <div className="flex gap-0.5 absolute bottom-1.5">
                          {hasIncome && <div className="w-1 h-1 rounded-full bg-emerald-400" />}
                          {hasExpense && <div className="w-1 h-1 rounded-full bg-rose-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-3 pb-4">
                <SectionHeader title={`Операции за ${selectedDate} число`} />
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map(t => (
                    <div key={t.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-[24px] shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${t.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                          {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{t.title}</p>
                          <p className="text-xs text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-lg w-fit mt-1">{t.category}</p>
                        </div>
                      </div>
                      <span className={`font-mono font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-900'}`}>
                        {t.type === 'income' ? '+' : '-'}{t.amount} ₽
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-300 border-2 border-dashed border-slate-100 rounded-[32px]">
                    <Receipt className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-sm font-medium">Нет операций</p>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-50">
              <PressableScale onClick={() => setAddTransOpen(true)} className="w-full">
                <div className="bg-slate-900 h-14 rounded-[28px] flex items-center justify-center shadow-xl shadow-slate-200">
                  <Plus className="w-6 h-6 text-white mr-2" />
                  <span className="text-white font-bold text-lg">Добавить операцию</span>
                </div>
              </PressableScale>
            </div>
          </div>
        </div>
      )}

      {/* 6. Add Transaction Modal */}
      {isAddTransOpen && (
        <div className="fixed inset-0 z-[110] flex items-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setAddTransOpen(false)} />
          <div className="bg-white w-full max-w-md mx-auto rounded-t-[40px] p-8 space-y-6 shadow-2xl relative animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Новая операция</h2>
              <button onClick={() => setAddTransOpen(false)} className="bg-slate-50 p-2 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
              <button onClick={() => setNewTrans({ ...newTrans, type: 'expense' })} className={`flex-1 py-3 rounded-xl font-bold transition-all ${newTrans.type === 'expense' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>Расход</button>
              <button onClick={() => setNewTrans({ ...newTrans, type: 'income' })} className={`flex-1 py-3 rounded-xl font-bold transition-all ${newTrans.type === 'income' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>Доход</button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className={THEME.text.label}>Сумма</label>
                <input
                  type="number"
                  value={newTrans.amount}
                  onChange={e => setNewTrans({ ...newTrans, amount: e.target.value })}
                  placeholder="0"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-mono text-2xl font-bold text-slate-800 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className={THEME.text.label}>Название</label>
                <input
                  value={newTrans.title}
                  onChange={e => setNewTrans({ ...newTrans, title: e.target.value })}
                  placeholder="Напр: Продукты"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold text-slate-800 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className={THEME.text.label}>Категория</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewTrans({ ...newTrans, category: cat })}
                      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${newTrans.category === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {cat}
                    </button>
                  ))}
                  {!isAddingCategory ? (
                    <button onClick={() => setIsAddingCategory(true)} className="px-4 py-2 rounded-xl font-bold text-sm bg-slate-100 text-slate-400 hover:bg-slate-200">
                      <Plus className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="Новая"
                        className="w-24 px-3 py-2 rounded-xl bg-slate-100 text-sm font-bold outline-none"
                        autoFocus
                      />
                      <button onClick={handleAddCategory} className="px-3 py-2 rounded-xl bg-emerald-500 text-white">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <PressableScale onClick={handleAddTransaction} className="w-full pt-2">
              <div className={`h-14 rounded-[28px] flex items-center justify-center shadow-xl ${newTrans.type === 'expense' ? 'bg-rose-500 shadow-rose-200' : 'bg-emerald-500 shadow-emerald-200'}`}>
                <span className="text-white font-bold text-lg">Добавить</span>
              </div>
            </PressableScale>
          </div>
        </div>
      )}

      {/* 7. Bills Modal */}
      {isBillsOpen && (
        <div className="fixed inset-0 z-[100] flex items-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setBillsOpen(false)} />
          <div className="bg-white w-full max-w-md mx-auto rounded-t-[40px] h-[85vh] shadow-2xl relative animate-in slide-in-from-bottom duration-500 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 pb-2 shrink-0 z-10 bg-white">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Платежи</h2>
                <p className="text-slate-500 text-sm font-medium">Регулярные счета</p>
              </div>
              <button onClick={() => setBillsOpen(false)} className="bg-slate-100 p-2 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-32 pt-4">
              <div className="space-y-3">
                {bills.length > 0 ? bills.map(bill => (
                  <div key={bill.id} className={`p-5 rounded-[24px] border transition-all ${bill.paid ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleBillPaid(bill.id)} className={`p-2 rounded-xl transition-all ${bill.paid ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          {bill.paid ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>
                        <div>
                          <h3 className={`font-bold ${bill.paid ? 'text-emerald-700 line-through' : 'text-slate-800'}`}>{bill.title}</h3>
                          <p className="text-xs text-slate-400 font-medium">Каждое {bill.date} число</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${bill.paid ? 'text-emerald-600' : 'text-slate-900'}`}>{bill.amount.toLocaleString()} ₽</span>
                        <button onClick={() => deleteBill(bill.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-300 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-300 border-2 border-dashed border-slate-100 rounded-[32px]">
                    <Landmark className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-sm font-medium">Нет платежей</p>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-50">
              <PressableScale onClick={() => setAddBillOpen(true)} className="w-full">
                <div className="bg-violet-500 h-14 rounded-[28px] flex items-center justify-center shadow-xl shadow-violet-200">
                  <Plus className="w-6 h-6 text-white mr-2" />
                  <span className="text-white font-bold text-lg">Добавить платёж</span>
                </div>
              </PressableScale>
            </div>
          </div>
        </div>
      )}

      {/* 8. Add Bill Modal */}
      {isAddBillOpen && (
        <div className="fixed inset-0 z-[110] flex items-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setAddBillOpen(false)} />
          <div className="bg-white w-full max-w-md mx-auto rounded-t-[40px] p-8 space-y-6 shadow-2xl relative animate-in slide-in-from-bottom duration-300">
            <h2 className="text-2xl font-bold text-slate-900">Новый платёж</h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className={THEME.text.label}>Название</label>
                <input
                  value={newBill.title}
                  onChange={e => setNewBill({ ...newBill, title: e.target.value })}
                  placeholder="Напр: Аренда"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold text-slate-800 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className={THEME.text.label}>Сумма</label>
                <input
                  type="number"
                  value={newBill.amount}
                  onChange={e => setNewBill({ ...newBill, amount: e.target.value })}
                  placeholder="0"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-mono text-2xl font-bold text-slate-800 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className={THEME.text.label}>День оплаты (1-31)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={newBill.date}
                  onChange={e => setNewBill({ ...newBill, date: e.target.value })}
                  placeholder="1"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold text-slate-800 outline-none"
                />
              </div>
            </div>
            <PressableScale onClick={handleAddBill} className="w-full pt-2">
              <div className="bg-violet-500 h-14 rounded-[28px] flex items-center justify-center shadow-xl shadow-violet-200">
                <span className="text-white font-bold text-lg">Добавить</span>
              </div>
            </PressableScale>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Notes Tab ---
const NotesTab = () => {
  const [notes, setNotes] = useLocalStorage<Note[]>('lifehub_notes', [
    { id: '1', title: 'Идеи для проекта', content: 'Разработать мобильное приложение для трекинга привычек', color: 'bg-amber-100', createdAt: Date.now() },
    { id: '2', title: 'Список покупок', content: 'Молоко, хлеб, яйца, сыр', color: 'bg-emerald-100', createdAt: Date.now() - 86400000 },
  ]);
  const [isAddOpen, setAddOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteForm, setNoteForm] = useState({ title: '', content: '', color: 'bg-amber-100' });

  const colors = ['bg-amber-100', 'bg-emerald-100', 'bg-violet-100', 'bg-rose-100', 'bg-sky-100'];

  const openAdd = () => {
    setEditingNote(null);
    setNoteForm({ title: '', content: '', color: 'bg-amber-100' });
    setAddOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setNoteForm({ title: note.title, content: note.content, color: note.color });
    setAddOpen(true);
  };

  const handleSave = () => {
    if (!noteForm.title) return;
    if (editingNote) {
      setNotes(notes.map(n => n.id === editingNote.id ? { ...n, ...noteForm } : n));
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        ...noteForm,
        createdAt: Date.now()
      };
      setNotes([newNote, ...notes]);
    }
    setAddOpen(false);
  };

  const handleDelete = () => {
    if (editingNote) {
      setNotes(notes.filter(n => n.id !== editingNote.id));
      setAddOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="pt-4 flex justify-between items-center">
        <div>
          <p className={THEME.text.label}>Заметки</p>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">Мои записи</h1>
        </div>
        <PressableScale onClick={openAdd} className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-200 text-white">
          <Plus className="w-6 h-6" />
        </PressableScale>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {notes.map(note => (
          <PressableScale key={note.id} onClick={() => openEdit(note)} className={`${note.color} p-5 rounded-[28px] min-h-[150px] flex flex-col justify-between`}>
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">{note.title}</h3>
              <p className="text-slate-600 text-sm line-clamp-4">{note.content}</p>
            </div>
            <p className="text-xs text-slate-400 mt-3">{new Date(note.createdAt).toLocaleDateString('ru-RU')}</p>
          </PressableScale>
        ))}
      </div>

      {notes.length === 0 && (
        <div className="flex flex-col items-center justify-center h-60 text-slate-300">
          <StickyNote className="w-16 h-16 mb-4 opacity-50" />
          <p className="font-medium">Нет заметок</p>
          <p className="text-sm">Создайте первую!</p>
        </div>
      )}

      {isAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setAddOpen(false)} />
          <div className="bg-white w-full max-w-md mx-auto rounded-t-[40px] p-8 space-y-6 shadow-2xl relative animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">{editingNote ? 'Редактирование' : 'Новая заметка'}</h2>
              {editingNote && (
                <button onClick={handleDelete} className="bg-rose-50 p-3 rounded-full text-rose-500 hover:bg-rose-100">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className={THEME.text.label}>Заголовок</label>
                <input
                  value={noteForm.title}
                  onChange={e => setNoteForm({ ...noteForm, title: e.target.value })}
                  placeholder="Название заметки"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold text-slate-800 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className={THEME.text.label}>Содержание</label>
                <textarea
                  value={noteForm.content}
                  onChange={e => setNoteForm({ ...noteForm, content: e.target.value })}
                  placeholder="Текст заметки..."
                  rows={4}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-medium text-slate-800 outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className={THEME.text.label}>Цвет</label>
                <div className="flex gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNoteForm({ ...noteForm, color })}
                      className={`w-10 h-10 rounded-xl ${color} ${noteForm.color === color ? 'ring-2 ring-slate-400 ring-offset-2' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <PressableScale onClick={handleSave} className="w-full pt-2">
              <div className="bg-amber-500 h-14 rounded-[28px] flex items-center justify-center shadow-xl shadow-amber-200">
                <span className="text-white font-bold text-lg">{editingNote ? 'Сохранить' : 'Создать'}</span>
              </div>
            </PressableScale>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Events Tab ---
const EventsTab = () => {
  const [events, setEvents] = useLocalStorage<Event[]>('lifehub_events', [
    { id: '1', title: 'Встреча с командой', date: '2024-12-20', time: '14:00', description: 'Обсуждение нового проекта', color: 'bg-violet-500', createdAt: Date.now() },
    { id: '2', title: 'Звонок с клиентом', date: '2024-12-22', time: '10:30', description: 'Презентация результатов', color: 'bg-emerald-500', createdAt: Date.now() },
  ]);
  const [isAddOpen, setAddOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', description: '', color: 'bg-violet-500' });

  const colors = ['bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500'];

  const openAdd = () => {
    setEditingEvent(null);
    setEventForm({ title: '', date: '', time: '', description: '', color: 'bg-violet-500' });
    setAddOpen(true);
  };

  const openEdit = (event: Event) => {
    setEditingEvent(event);
    setEventForm({ title: event.title, date: event.date, time: event.time, description: event.description, color: event.color });
    setAddOpen(true);
  };

  const handleSave = () => {
    if (!eventForm.title || !eventForm.date) return;
    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? { ...e, ...eventForm } : e));
    } else {
      const newEvent: Event = {
        id: Date.now().toString(),
        ...eventForm,
        createdAt: Date.now()
      };
      setEvents([newEvent, ...events]);
    }
    setAddOpen(false);
  };

  const handleDelete = () => {
    if (editingEvent) {
      setEvents(events.filter(e => e.id !== editingEvent.id));
      setAddOpen(false);
    }
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="pt-4 flex justify-between items-center">
        <div>
          <p className={THEME.text.label}>Календарь</p>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">События</h1>
        </div>
        <PressableScale onClick={openAdd} className="bg-violet-500 p-3 rounded-2xl shadow-lg shadow-violet-200 text-white">
          <Plus className="w-6 h-6" />
        </PressableScale>
      </header>

      <div className="space-y-4">
        {sortedEvents.map(event => (
          <PressableScale key={event.id} onClick={() => openEdit(event)} className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 flex gap-4">
            <div className={`w-1 rounded-full ${event.color}`} />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 text-lg">{event.title}</h3>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm mb-2">{event.description}</p>
              <div className="flex gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </span>
                {event.time && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {event.time}
                  </span>
                )}
              </div>
            </div>
          </PressableScale>
        ))}
      </div>

      {events.length === 0 && (
        <div className="flex flex-col items-center justify-center h-60 text-slate-300">
          <CalendarIcon className="w-16 h-16 mb-4 opacity-50" />
          <p className="font-medium">Нет событий</p>
          <p className="text-sm">Добавьте первое!</p>
        </div>
      )}

      {isAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setAddOpen(false)} />
          <div className="bg-white w-full max-w-md mx-auto rounded-t-[40px] p-8 space-y-6 shadow-2xl relative animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">{editingEvent ? 'Редактирование' : 'Новое событие'}</h2>
              {editingEvent && (
                <button onClick={handleDelete} className="bg-rose-50 p-3 rounded-full text-rose-500 hover:bg-rose-100">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className={THEME.text.label}>Название</label>
                <input
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Название события"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold text-slate-800 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={THEME.text.label}>Дата</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold text-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className={THEME.text.label}>Время</label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={THEME.text.label}>Описание</label>
                <textarea
                  value={eventForm.description}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Подробности..."
                  rows={3}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-medium text-slate-800 outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className={THEME.text.label}>Цвет</label>
                <div className="flex gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setEventForm({ ...eventForm, color })}
                      className={`w-10 h-10 rounded-xl ${color} ${eventForm.color === color ? 'ring-2 ring-slate-400 ring-offset-2' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <PressableScale onClick={handleSave} className="w-full pt-2">
              <div className="bg-violet-500 h-14 rounded-[28px] flex items-center justify-center shadow-xl shadow-violet-200">
                <span className="text-white font-bold text-lg">{editingEvent ? 'Сохранить' : 'Создать'}</span>
              </div>
            </PressableScale>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Home Tab ---
const HomeTab = () => {
  const [totalBalance] = useLocalStorage('lifehub_balance', 125000);
  const [transactions] = useLocalStorage<Transaction[]>('lifehub_transactions', []);
  const [events] = useLocalStorage<Event[]>('lifehub_events', []);
  const [goals] = useLocalStorage<Goal[]>('lifehub_goals', []);

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Доброе утро' : today.getHours() < 18 ? 'Добрый день' : 'Добрый вечер';

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const recentTransactions = [...transactions]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  const monthlySpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="pt-4">
        <p className={THEME.text.label}>{today.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">{greeting}! 👋</h1>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <BentoCard className="bg-gradient-to-br from-emerald-50 to-emerald-100/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-emerald-100 p-2.5 rounded-xl">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <span className={THEME.text.label}>Баланс</span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">{totalBalance.toLocaleString()} ₽</p>
        </BentoCard>

        <BentoCard className="bg-gradient-to-br from-rose-50 to-rose-100/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-rose-100 p-2.5 rounded-xl">
              <TrendingDown className="w-5 h-5 text-rose-600" />
            </div>
            <span className={THEME.text.label}>Расходы</span>
          </div>
          <p className="text-2xl font-extrabold text-rose-700">{monthlySpent.toLocaleString()} ₽</p>
        </BentoCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Receipt, label: 'Расход', color: 'bg-rose-50 text-rose-500' },
          { icon: TrendingUp, label: 'Доход', color: 'bg-emerald-50 text-emerald-500' },
          { icon: StickyNote, label: 'Заметка', color: 'bg-amber-50 text-amber-500' },
          { icon: CalendarIcon, label: 'Событие', color: 'bg-violet-50 text-violet-500' },
        ].map((action, i) => (
          <PressableScale key={i} className={`${action.color} p-4 rounded-2xl flex flex-col items-center gap-2`}>
            <action.icon className="w-6 h-6" />
            <span className="text-xs font-bold text-slate-600">{action.label}</span>
          </PressableScale>
        ))}
      </div>

      {/* Goals Progress */}
      {goals.length > 0 && (
        <section>
          <SectionHeader title="Цели" />
          <div className="space-y-3">
            {goals.slice(0, 2).map(goal => {
              const percent = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
              return (
                <BentoCard key={goal.id} className="!p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-800">{goal.title}</h3>
                    <span className="text-sm font-bold text-slate-500">{percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${goal.color} rounded-full`} style={{ width: `${percent}%` }} />
                  </div>
                </BentoCard>
              );
            })}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section>
          <SectionHeader title="Ближайшие события" />
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <BentoCard key={event.id} className="!p-4 flex gap-4 items-center">
                <div className={`w-1 h-12 rounded-full ${event.color}`} />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{event.title}</h3>
                  <p className="text-sm text-slate-400">
                    {new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    {event.time && ` в ${event.time}`}
                  </p>
                </div>
              </BentoCard>
            ))}
          </div>
        </section>
      )}

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <section>
          <SectionHeader title="Последние операции" />
          <BentoCard className="!p-4 space-y-3">
            {recentTransactions.map(t => (
              <div key={t.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${t.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    {t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{t.title}</p>
                    <p className="text-xs text-slate-400">{t.category}</p>
                  </div>
                </div>
                <span className={`font-mono font-bold text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-700'}`}>
                  {t.type === 'income' ? '+' : '-'}{t.amount} ₽
                </span>
              </div>
            ))}
          </BentoCard>
        </section>
      )}
    </div>
  );
};

// --- Main App ---
export function App() {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', icon: Home, label: 'Главная' },
    { id: 'budget', icon: Wallet, label: 'Бюджет' },
    { id: 'events', icon: CalendarIcon, label: 'События' },
    { id: 'notes', icon: StickyNote, label: 'Заметки' },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <HomeTab />;
      case 'budget': return <BudgetTab />;
      case 'events': return <EventsTab />;
      case 'notes': return <NotesTab />;
      default: return <HomeTab />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 font-sans">
        <main className="max-w-md mx-auto px-5 pb-28">
          {renderTab()}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 pt-2 pb-6 safe-bottom">
          <div className="max-w-md mx-auto flex justify-around">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <PressableScale
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex flex-col items-center gap-1 py-2 px-4"
                >
                  <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>
                    <tab.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                    {tab.label}
                  </span>
                </PressableScale>
              );
            })}
          </div>
        </nav>
      </div>
    </ErrorBoundary>
  );
}
