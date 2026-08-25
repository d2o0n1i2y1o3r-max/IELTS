'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Frontend email validatsiyasi uchun regex (backend bilan bir xil)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

interface FormState {
  name: string;
  email: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ name: '', email: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // ─── Frontend validatsiyasi ───
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
    // Foydalanuvchi yozayotganda xatoni tozalash
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

      setSuccess(true);
      setTimeout(() => router.push('/'), 2500);
    } catch {
      setServerError("Tarmoq xatosi. Internet aloqangizni tekshiring.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-10 max-w-sm w-full text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Muvaffaqiyatli!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Ro'yxatdan muvaffaqiyatli o'tdingiz. Asosiy sahifaga yo'naltirilmoqda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center">
              <UserPlus className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Ro'yxatdan o'tish</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            IELTS CEFR platformasiga qo'shiling — bepul va tez!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Ism */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Ismingiz
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <User className="w-4 h-4" />
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

          {/* Email */}
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

          {/* Server xatosi */}
          {serverError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400">{serverError}</p>
            </div>
          )}

          {/* Submit */}
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
