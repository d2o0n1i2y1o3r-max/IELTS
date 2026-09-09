'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Edit2, Save, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

interface UserData {
  name: string;
  email: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
}

export default function AuthPage() {
  const [userData, setUserData] = useState<UserData>({ name: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserData>({ name: '', email: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('registered_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.name && parsed.email) {
            setUserData(parsed);
            setEditForm(parsed);
          }
        } catch (_) {}
      }
    }
  }, []);

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!editForm.name.trim() || editForm.name.trim().length < 2) {
      errors.name = "Ism kamida 2 ta belgidan iborat bo'lishi kerak.";
    }
    if (!editForm.email.trim()) {
      errors.email = 'Email kiritilishi shart.';
    } else if (!EMAIL_REGEX.test(editForm.email.trim())) {
      errors.email = "Email formati noto'g'ri. Masalan: user@example.com";
    }
    return errors;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setServerError(null);
    setSuccessMessage(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

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
        body: JSON.stringify({ name: editForm.name.trim(), email: editForm.email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? 'Xato yuz berdi. Qayta urinib ko\'ring.');
        return;
      }

      const updatedData: UserData = { name: editForm.name.trim(), email: editForm.email.trim() };
      if (typeof window !== 'undefined') {
        localStorage.setItem('registered_user', JSON.stringify(updatedData));
        window.dispatchEvent(new Event('storage'));
      }
      setUserData(updatedData);
      setSuccessMessage('Ma\'lumotlar muvaffaqiyatli yangilandi!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setServerError("Tarmoq xatosi. Internet aloqangizni tekshiring.");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setEditForm(userData);
    setFieldErrors({});
    setServerError(null);
    setSuccessMessage(null);
    setIsEditing(false);
  }

  function handleEdit() {
    setEditForm(userData);
    setFieldErrors({});
    setServerError(null);
    setSuccessMessage(null);
    setIsEditing(true);
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center shadow-xs">
              <User className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Profil</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Shaxsiy ma'lumotlaringizni boshqaring
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <p className="text-xs text-emerald-600 dark:text-emerald-400">{successMessage}</p>
          </div>
        )}

        {/* Server Error */}
        {serverError && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 dark:text-red-400">{serverError}</p>
          </div>
        )}

        {/* View Mode */}
        {!isEditing ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Ismingiz
              </label>
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <User className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">{userData.name || 'Kiritilmagan'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email manzil
              </label>
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">{userData.email || 'Kiritilmagan'}</span>
              </div>
            </div>

            <button
              onClick={handleEdit}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
            >
              <Edit2 className="w-4 h-4" />
              Tahrirlash
            </button>
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSave} noValidate className="space-y-5">
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
                  value={editForm.name}
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
                  value={editForm.email}
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

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Saqlash
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}