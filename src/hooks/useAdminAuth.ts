import { useEffect, useState } from 'react';
import type React from 'react';
import {
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { View } from '../types';

// Token iniziale iniettato dall'ambiente (se presente)
declare const __initial_auth_token: string | undefined;

/** Un utente è admin solo se esiste il documento /admins/{uid} (vedi firestore.rules). */
async function checkIsAdmin(u: User | null): Promise<boolean> {
  if (!u || u.isAnonymous || !db) return false;
  try {
    const snap = await getDoc(doc(db, 'admins', u.uid));
    return snap.exists();
  } catch (err) {
    console.warn("Admin check error:", err);
    return false;
  }
}

/**
 * Gestisce utente Firebase, stato di autenticazione admin e il modal di login.
 * `setCurrentView` serve per portare l'utente nel pannello dopo il login
 * e riportarlo al negozio dopo il logout.
 */
export function useAdminAuth(setCurrentView: (view: View) => void) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
    } else {
      setAdminPasswordError('');
      setIsAdminPasswordModalOpen(true);
    }
  };

  const handleAdminPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setAdminPasswordError('Servizio Firebase non pronto. Riprova tra poco.');
      return;
    }

    setIsLoggingIn(true);
    setAdminPasswordError('');

    try {
      const cred = await signInWithEmailAndPassword(auth, adminEmailInput, adminPasswordInput);
      if (!(await checkIsAdmin(cred.user))) {
        await signOut(auth);
        setAdminPasswordError('Questo account non è autorizzato come admin.');
        return;
      }
      setIsAdminAuthenticated(true);
      setIsAdminPasswordModalOpen(false);
      setCurrentView('admin');
      setAdminPasswordInput('');
    } catch (err: any) {
      console.error("Login error:", err);
      setAdminPasswordError('Credenziali non valide! Verifica Email e Password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    if (auth) await signOut(auth);
    setIsAdminAuthenticated(false);
    setCurrentView('shop');
  };

  useEffect(() => {
    if (!auth) return;
    // I clienti NON fanno accesso: niente login anonimo. Firebase limita i nuovi
    // accessi anonimi per indirizzo IP, e a scuola tutti escono dallo stesso IP:
    // superato il limite, gli ordini venivano rifiutati. Solo gli admin fanno login.
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
      signInWithCustomToken(auth, __initial_auth_token).catch(err => console.error("Auth error:", err));
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      setUser(currentUser);
      setIsAdminAuthenticated(await checkIsAdmin(currentUser));
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    isAdminAuthenticated,
    isAdminPasswordModalOpen,
    setIsAdminPasswordModalOpen,
    adminEmailInput,
    setAdminEmailInput,
    adminPasswordInput,
    setAdminPasswordInput,
    adminPasswordError,
    setAdminPasswordError,
    showPassword,
    setShowPassword,
    isLoggingIn,
    handleOpenAdmin,
    handleAdminPasswordSubmit,
    handleAdminLogout,
  };
}
