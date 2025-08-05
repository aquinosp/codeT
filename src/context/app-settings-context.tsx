
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AppSettings {
  appName: string;
  logoUrl: string | null;
}

interface AppSettingsContextType extends AppSettings {
  setAppName: (name: string) => void;
  setLogoUrl: (url: string | null) => void;
  loading: boolean;
}

const AppSettingsContext = createContext<AppSettingsContextType>({
  appName: 'ERP TAO',
  logoUrl: null,
  setAppName: () => {},
  setLogoUrl: () => {},
  loading: true,
});

export const useAppSettings = () => useContext(AppSettingsContext);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appName, setAppName] = useState<string>('ERP TAO');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'app-config'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setAppName(data.appName || 'ERP TAO');
        setLogoUrl(data.logoUrl || null);
      } else {
        setAppName('ERP TAO');
        setLogoUrl(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AppSettingsContext.Provider value={{ appName, logoUrl, setAppName, setLogoUrl, loading }}>
      {children}
    </AppSettingsContext.Provider>
  );
};
