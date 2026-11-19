import { X, Lock, Mail, Key, AlertCircle } from 'lucide-react';
import type React from 'react';

interface AdminLoginModalProps {
  setIsAdminPasswordModalOpen: (open: boolean) => void;
  handleAdminPasswordSubmit: (e: React.FormEvent) => void;
  adminEmailInput: string;
  setAdminEmailInput: (value: string) => void;
  setAdminPasswordError: (value: string) => void;
  adminPasswordInput: string;
  setAdminPasswordInput: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  adminPasswordError: string;
  isLoggingIn: boolean;
}

export default function AdminLoginModal({ setIsAdminPasswordModalOpen, handleAdminPasswordSubmit, adminEmailInput, setAdminEmailInput, setAdminPasswordError, adminPasswordInput, setAdminPasswordInput, showPassword, setShowPassword, adminPasswordError, isLoggingIn }: AdminLoginModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-blue-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto my-auto">
        <button
          onClick={() => setIsAdminPasswordModalOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-blue-100 text-blue-900 rounded-2xl flex items-center justify-center mb-4">
          <Lock className="w-6 h-6" />
        </div>

        <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
          Login Admin Divini
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Inserisci Email e Password configurate nella tua console Firebase.
        </p>

        <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Admin
            </label>
            <div className="relative">
              <input
                type="email"
                required
                autoFocus
                placeholder="admin@scuola.it"
                value={adminEmailInput}
                onChange={(e) => {
                  setAdminEmailInput(e.target.value);
                  setAdminPasswordError('');
                }}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password Admin
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={adminPasswordInput}
                onChange={(e) => {
                  setAdminPasswordInput(e.target.value);
                  setAdminPasswordError('');
                }}
                className={`w-full pl-9 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 ${
                  adminPasswordError
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-200 focus:ring-blue-900'
                }`}
              />
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <X className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </button>
            </div>

            {adminPasswordError && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold mt-2">
                <AlertCircle className="w-4 h-4" />
                <span>{adminPasswordError}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdminPasswordModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="flex-1 bg-blue-950 hover:bg-blue-900 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4 text-orange-400" />
              {isLoggingIn ? 'Verifica...' : 'Accedi'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
