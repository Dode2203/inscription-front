// context/DataContext.tsx
'use client';
import { createContext, useContext } from 'react';
import { InitialData } from '@/lib/db'; // Importez votre interface

const DataContext = createContext<InitialData | null>(null);

export function DataProvider({ children, data }: { children: React.ReactNode, data: InitialData }) {
  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
}

export const useInitialData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useInitialData doit être utilisé dans un DataProvider");
  return context;
};