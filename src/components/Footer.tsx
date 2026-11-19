import { School } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-blue-950 text-blue-200 border-t border-blue-900 py-6 px-4 text-center text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <School className="w-4 h-4 text-orange-400" />
          <span className="font-bold text-white">Scuola Divini • Merchandising Ufficiale</span>
        </div>
        <div className="text-[11px] text-blue-300">
          A.S. 2025/2026 • Ordini e consegne gestiti dai Rappresentanti d'Istituto.
        </div>
      </div>
    </footer>
  );
}
