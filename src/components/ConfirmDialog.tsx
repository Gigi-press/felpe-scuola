import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';

/**
 * Finestra di conferma dentro il sito, al posto di window.confirm()
 * (che alcuni browser integrati nelle app bloccano senza mostrare niente).
 *
 * Uso:
 *   const [confirmDialog, ask] = useConfirm();
 *   const scelta = await ask({ title, message, actions: [{ value: 'ok', label: 'Elimina', tone: 'danger' }] });
 *   // scelta = value del pulsante premuto, oppure null se l'utente annulla
 *   ...
 *   return <>{confirmDialog} ...</>;
 */

export interface ConfirmAction {
  value: string;
  label: string;
  tone?: 'danger' | 'primary' | 'neutral';
}

export interface ConfirmOptions {
  title: string;
  message: React.ReactNode;
  actions: ConfirmAction[];
  cancelLabel?: string;
}

const toneClass: Record<NonNullable<ConfirmAction['tone']>, string> = {
  danger: 'bg-red-600 hover:bg-red-500 text-white border-red-700',
  primary: 'bg-blue-950 hover:bg-blue-900 text-white border-blue-950',
  neutral: 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300',
};

export function useConfirm(): [React.ReactNode, (opts: ConfirmOptions) => Promise<string | null>] {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: string | null) => void) | null>(null);
  const firstButton = useRef<HTMLButtonElement | null>(null);

  const ask = useCallback((o: ConfirmOptions) => {
    return new Promise<string | null>(resolve => {
      resolver.current = resolve;
      setOpts(o);
    });
  }, []);

  const close = (value: string | null) => {
    resolver.current?.(value);
    resolver.current = null;
    setOpts(null);
  };

  // Esc = annulla; focus sul primo pulsante
  useEffect(() => {
    if (!opts) return;
    firstButton.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts]);

  const dialog = opts && (
    <div
      className="fixed inset-0 z-[60] bg-blue-950/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => close(null)}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-5"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-base font-black text-slate-900 mb-2">{opts.title}</h2>
        <div className="text-sm text-slate-600 space-y-2 mb-5">{opts.message}</div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            onClick={() => close(null)}
            className="px-4 py-2 rounded-xl border text-sm font-bold bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
          >
            {opts.cancelLabel ?? 'Annulla'}
          </button>
          {opts.actions.map((a, i) => (
            <button
              key={a.value}
              ref={i === 0 ? firstButton : undefined}
              onClick={() => close(a.value)}
              className={`px-4 py-2 rounded-xl border text-sm font-bold ${toneClass[a.tone ?? 'primary']}`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return [dialog, ask];
}
