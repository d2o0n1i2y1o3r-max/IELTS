'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, User as UserIcon, CheckCircle, AlertCircle, Loader2, RefreshCw, Home } from 'lucide-react';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

interface FormState {
  name: string;
  email: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
}

interface RegisteredUser {
  id?: string;
  name: string;
  email: string;
  createdAt?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ name: '', email: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<RegisteredUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('registered_user');
      if (saved) {
        try {
          setRegisteredUser(JSON.parse(saved));
        } catch (_) {}
      }
    }
  }, []);

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errors.name = "Ism kamida 2 ta belgidan iborat bo'lishi kerak.";
    }
    if (!form.email.trim()) {
      errors.email = 'Email kiritilishi shart.';
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errors.email = "Email formati noto'g'ri. Masalan: user@example.com";
    }
    return errors;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setServerError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? 'Xato yuz berdi. Qayta urinib ko\'ring.');
        return;
      }

      const userData: RegisteredUser = data.user || {
        name: form.name.trim(),
        email: form.email.trim(),
        createdAt: new Date().toISOString(),
      };

      setRegisteredUser(userData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('registered_user', JSON.stringify(userData));
      }
    } catch {
      setServerError("Tarmoq xatosi. Internet aloqangizni tekshiring.");
    } finally {
      setLoading(false);
    }
  }

  const handleNewRegistration = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('registered_user');
    }
    setRegisteredUser(null);
    setForm({ name: '', email: '' });
  };

  if (registeredUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-10 px-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-10 max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center border-4 border-emerald-500/20 shadow-inner">
              <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <span>Holat: Ro'yxatdan o'tildi ✅</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Ro'yxatdan o'tildi!</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Siz platformamizda muvaffaqiyatli ro'yxatdan o'tgansiz.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 text-left space-y-3 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">Foydalanuvchi:</span>
              <span className="font-bold text-slate-900 dark:text-white">{registeredUser.name}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">Email:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{registeredUser.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">Maqom:</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded">Faol (Ro'yxatdan o'tgan)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => router.push('/')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
            >
              <Home className="w-4 h-4" />
              <span>Asosiy sahifa</span>
            </button>
            <button
              onClick={handleNewRegistration}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-all border border-slate-200 dark:border-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Qayta o'tish</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-10 w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center">
              <UserPlus className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Ro'yxatdan o'tish joyi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            IELTS CEFR platformasiga qo'shiling — bepul va tez!
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Ismingiz
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ali Valiyev"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.name
                    ? 'border-red-400 dark:border-red-600 focus:ring-red-400/30'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/30 focus:border-brand-500 dark:focus:border-brand-400'
                }`}
              />
            </div>
            {fieldErrors.name && (
              <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Email manzil
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="user@example.com"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.email
                    ? 'border-red-400 dark:border-red-600 focus:ring-red-400/30'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/30 focus:border-brand-500 dark:focus:border-brand-400'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          {serverError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400">{serverError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saqlanmoqda...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Ro'yxatdan o'tish
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          Parol so'ralmasdan, faqat ism va email yetarli.
        </p>
      </div>
    </div>
  );
}

