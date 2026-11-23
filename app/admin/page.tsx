'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  UserCheck,
  Zap,
  Crown,
  DollarSign,
  Search,
  Filter,
  Eye,
  Trash2,
  LogOut,
  Lock,
  Mail,
  Key,
  BookOpen,
  Mic,
  MessageSquare,
  X,
  ChevronRight,
  TrendingUp,
  Cpu,
  RefreshCw
} from 'lucide-react';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'demo' | 'google' | 'pro' | 'plus'>('all');
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'essays' | 'speaking' | 'chats'>('essays');

  useEffect(() => {
    const session = localStorage.getItem('ieltsprep_admin_session');
    if (session) {
      setIsAdmin(true);
      fetchAdminData();
    }
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/data');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error('Fetch admin error:', e);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail.trim(), password: adminPassword })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('ieltsprep_admin_session', data.admin.token);
        setIsAdmin(true);
        fetchAdminData();
      } else {
        setLoginError(data.error || 'Kirish rad etildi');
      }
    } catch {
      setLoginError('Tarmoq xatosi');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ieltsprep_admin_session');
    setIsAdmin(false);
    setAdminEmail('');
    setAdminPassword('');
  };

  const handleUpdatePlan = async (userId: string, newPlan: string) => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_plan', userId, newPlan })
      });
      if (res.ok) {
        fetchAdminData();
        if (selectedUserDetail && selectedUserDetail.id === userId) {
          setSelectedUserDetail((prev: any) => ({ ...prev, plan: newPlan, isDemo: newPlan === 'demo' }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Foydalanuvchini o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', userId })
      });
      if (res.ok) {
        fetchAdminData();
        if (selectedUserDetail?.id === userId) {
          setSelectedUserDetail(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === 'demo') return u.isDemo || u.plan === 'demo';
    if (selectedFilter === 'google') return !u.isDemo && u.plan !== 'demo';
    if (selectedFilter === 'pro') return u.plan === 'pro';
    if (selectedFilter === 'plus') return u.plan === 'plus';
    return true;
  });

  // ─── LOGIN EKRANI ──────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Admin Panel</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Faqat vakolatli administratorlar uchun
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Admin Parol</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
            >
              {loading ? 'Tekshirilmoqda...' : 'Kirish'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── ADMIN DASHBOARD ───────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">IELTSPrep Boshqaruv Paneli</h1>
            <p className="text-xs text-slate-400">Admin: d2o0n1i2y1o3r@gmail.com</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Yangilash</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white transition flex items-center gap-1.5 text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>Chiqish</span>
          </button>
        </div>
      </div>

      {/* ─── STATISTIKA KARTALARI ────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Haqiqiy Foydalanuvchilar */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-brand-500">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Haqiqiy Foydalanuvchilar
              </span>
              <Users className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.totalUsers}
            </div>
            <div className="text-[11px] text-brand-600 dark:text-brand-400 font-medium">
              Barcha real foydalanuvchilar
            </div>
          </div>

          {/* Bepul Hisoblar */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-blue-500">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Bepul Hisoblar
              </span>
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.freeUsers}
            </div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              Free tarifdagi foydalanuvchilar
            </div>
          </div>

          {/* Pro Obunachilar */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-blue-600">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pro (12,000 so'm)
              </span>
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
              {stats.proUsers}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Claude & Gemini ({stats.proRevenue.toLocaleString()} so'm)
            </div>
          </div>

          {/* Plus Obunachilar */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-purple-600">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Plus (20,000 so'm)
              </span>
              <Crown className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
              {stats.plusUsers}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              ChatGPT + Claude ({stats.plusRevenue.toLocaleString()} so'm)
            </div>
          </div>

          {/* Jami Tushum */}
          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-5 rounded-2xl shadow-md space-y-2">
            <div className="flex items-center justify-between text-emerald-100">
              <span className="text-xs font-bold uppercase tracking-wider">Jami Daromad</span>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black">
              {stats.totalRevenue.toLocaleString()} <span className="text-sm font-semibold">so'm</span>
            </div>
            <div className="text-[11px] text-emerald-100 font-medium">
              Jami foydalanuvchilar: {stats.totalUsers} ta
            </div>
          </div>
        </div>
      )}

      {/* ─── FOYDALANUVCHILAR RO'YXATI VA FILTR ──────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ism yoki email bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'demo', label: 'Demo' },
              { id: 'google', label: 'Google Hisoblar' },
              { id: 'pro', label: 'Pro (12k)' },
              { id: 'plus', label: 'Plus (20k)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedFilter === f.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-y border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Foydalanuvchi</th>
                <th className="py-3.5 px-4">Turi</th>
                <th className="py-3.5 px-4">Tarif</th>
                <th className="py-3.5 px-4">Model</th>
                <th className="py-3.5 px-4 text-center">Insholar</th>
                <th className="py-3.5 px-4 text-center">Speaking</th>
                <th className="py-3.5 px-4 text-center">Chatlar</th>
                <th className="py-3.5 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Foydalanuvchi topilmadi
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition">
                    <td className="py-4 px-4 font-medium text-slate-900 dark:text-white">
                      <div>{user.name}</div>
                      <div className="text-xs text-slate-400 font-normal">{user.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      {user.isDemo ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                          Demo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          Google
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={user.plan}
                        onChange={(e) => handleUpdatePlan(user.id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition focus:outline-none ${
                          user.plan === 'plus'
                            ? 'bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-950/40'
                            : user.plan === 'pro'
                            ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950/40'
                            : 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <option value="demo">Demo</option>
                        <option value="free">Free (Google)</option>
                        <option value="pro">Pro (12k)</option>
                        <option value="plus">Plus (20k)</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 capitalize text-xs text-slate-600 dark:text-slate-400">
                      {user.activeModel || 'gemini'}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {user.writingEssays?.length || 0}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {user.speakingResponses?.length || 0}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {user.chats?.length || 0}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUserDetail(user)}
                          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 transition"
                          title="Barcha ma'lumotlarini ko'rish"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 transition"
                          title="Foydalanuvchini o'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── FOYDALANUVCHINING BARCHA MA'LUMOTLARINI KO'RISH MODAL ────────── */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {selectedUserDetail.name}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 uppercase">
                    {selectedUserDetail.plan}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedUserDetail.email} • Faol model: {selectedUserDetail.activeModel}
                </p>
              </div>

              <button
                onClick={() => setSelectedUserDetail(null)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 py-3">
              <button
                onClick={() => setActiveTab('essays')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'essays'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Yozgan insholari ({selectedUserDetail.writingEssays?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('speaking')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'speaking'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Speaking javoblari ({selectedUserDetail.speakingResponses?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('chats')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'chats'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>AI bilan chatlari ({selectedUserDetail.chats?.length || 0})</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {/* ESSAYS */}
              {activeTab === 'essays' && (
                <div className="space-y-4">
                  {(!selectedUserDetail.writingEssays || selectedUserDetail.writingEssays.length === 0) ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      Hali insho yozilmagan
                    </div>
                  ) : (
                    selectedUserDetail.writingEssays.map((essay: any) => (
                      <div key={essay.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            {essay.taskType} • {essay.topic}
                          </span>
                          <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-black">
                            Band: {essay.band}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          "{essay.essay}"
                        </p>
                        <div className="text-[10px] text-slate-400">
                          Sana: {new Date(essay.date).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* SPEAKING */}
              {activeTab === 'speaking' && (
                <div className="space-y-4">
                  {(!selectedUserDetail.speakingResponses || selectedUserDetail.speakingResponses.length === 0) ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      Hali speaking topshirilmagan
                    </div>
                  ) : (
                    selectedUserDetail.speakingResponses.map((sp: any) => (
                      <div key={sp.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-white">
                            Savol: {sp.question}
                          </span>
                          <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-black">
                            Band: {sp.band}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          Transkript: "{sp.transcript}"
                        </p>
                        <div className="text-[10px] text-slate-400">
                          Sana: {new Date(sp.date).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* CHATS */}
              {activeTab === 'chats' && (
                <div className="space-y-4">
                  {(!selectedUserDetail.chats || selectedUserDetail.chats.length === 0) ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      AI bilan chatlar mavjud emas
                    </div>
                  ) : (
                    selectedUserDetail.chats.map((chat: any) => (
                      <div key={chat.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                        <div className="text-xs font-bold text-slate-500 uppercase">Suhbat #{chat.id}</div>
                        <div className="space-y-2">
                          {chat.messages.map((m: any, idx: number) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl text-xs ${
                                m.role === 'user'
                                  ? 'bg-blue-600 text-white ml-8 rounded-tr-xs'
                                  : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 mr-8 rounded-tl-xs'
                              }`}
                            >
                              <div className="font-bold text-[10px] opacity-75 mb-0.5">
                                {m.role === 'user' ? 'Foydalanuvchi:' : 'AI Mascot:'}
                              </div>
                              {m.content}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
