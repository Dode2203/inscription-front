"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/db";
import Header from "@/components/static/Header";
import Menu from "@/components/static/Menu";
import { FiltrageEtudiants } from "@/components/utilisateur/filtrage/filtrage";

export default function FiltragePage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("/utilisateur/filtrage");
  const [loading, setLoading] = useState(true);
  const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`/api/auth/me`);
        if (!response.ok) {
          window.location.href = login;
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        window.location.href = login;
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [login]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Menu user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <main className="container mx-auto px-6 py-8">
        {/* Appel du nouveau composant de filtrage ici */}
        <FiltrageEtudiants />
      </main>
    </main>
  );
}