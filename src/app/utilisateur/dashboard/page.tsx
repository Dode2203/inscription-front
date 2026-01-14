// src/app/utilisateur/dashboard/page.tsx
"use client"

import { useState, useEffect } from "react";
import { User, Student, StatsData } from "@/lib/db";
import Header from "@/components/static/Header";
import Menu from "@/components/static/Menu";
import { DashboardStats } from "@/components/utilisateur/dashboard/dashboard-stats";
import { QuickActions } from "@/components/utilisateur/dashboard/quick-actions";
import { StudentTable } from "@/components/utilisateur/dashboard/student-table";

export default function UtilisateurDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [statsData, setStatsData] = useState<StatsData | undefined>(undefined);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';
  const activeTab = "/utilisateur/dashboard";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Vérification de l'authentification
        const authResponse = await fetch('/api/auth/me');
        if (!authResponse.ok) {
          window.location.href = login;
          return;
        }
        
        const userData = await authResponse.json();
        setUser(userData.user);

        // Récupération des étudiants
        const currentYear = new Date().getFullYear();
        const studentsResponse = await fetch(`/api/etudiants/inscrits-par-annee?annee=${currentYear}`);
        
        if (!studentsResponse.ok) {
          throw new Error('Erreur lors de la récupération des étudiants');
        }
        
        const data = await studentsResponse.json();
        setStudents(data.data || []);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [login]);

  // 🆕 Nouveau useEffect pour les statistiques
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);

        const response = await fetch('/api/etudiants/statistiques');
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
          setStatsData(result.data);
        } else {
          throw new Error(result.message || 'Données non disponibles');
        }
      } catch (err) {
        console.error('❌ Erreur lors de la récupération des stats:', err);
        setStatsError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []); // Se déclenche une seule fois au montage du composant

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Menu user={user} activeTab={activeTab} />
        
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Tableau de bord</h2>
          <p className="text-muted-foreground">Vue d'ensemble de l'activité étudiante</p>
        </div>

        {/* 🆕 Utilisation du nouveau composant avec les vraies données de l'API */}
        <div className="mb-8">
          <DashboardStats 
            statsData={statsData}
            isLoading={statsLoading}
            error={statsError}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <StudentTable students={students} />
          </div>
          
          <div className="space-y-4">
            <QuickActions />
          </div>
        </div>
      </div>
    </main>
  );
}