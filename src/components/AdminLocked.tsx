import { Lock } from 'lucide-react';

interface AdminLockedProps {
  handleOpenAdmin: () => void;
}

export default function AdminLocked({ handleOpenAdmin }: AdminLockedProps) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-slate-200 text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-black text-slate-900 mb-2">Accesso Riservato Divini</h2>
      <p className="text-xs text-slate-500 mb-6">
        Devi inserire le credenziali da amministratore per accedere a questa sezione.
      </p>
      <button
        onClick={handleOpenAdmin}
        className="bg-blue-950 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all"
      >
        Accedi al Pannello Admin
      </button>
    </div>
  );
}
