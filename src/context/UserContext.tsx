"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/lib/db"; // Assure-toi que le chemin est correct

// Définir la structure du contexte
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

// Créer le contexte
const UserContext = createContext<UserContextType | undefined>(undefined);

// Créer le Provider qui va envelopper tes enfants
export function UserProvider({ children, initialUser = null }: { children: React.ReactNode, initialUser?: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser);
    useEffect(() => {
        if (initialUser) setUser(initialUser);
    }, [initialUser]);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte facilement
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser doit être utilisé à l'intérieur d'un UserProvider");
  }
  return context;
}