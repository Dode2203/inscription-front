"use client"

import { useState, useEffect } from "react"
import { User } from "@/lib/db"
import Header from "@/components/static/Header"
import Menu from "@/components/static/Menu"

interface Student {
  id: number;
  matricule: string | null;
  nom: string;
  prenom: string;
  typeFormation: {
    id: number;
    nom: string;
  };
  dateNaissance: string;
  lieuNaissance: string;
  sexe: string;
  contact: {
    adresse: string;
    email: string;
  };
  droitsPayes: Array<{
    montant: number;
    datePaiement: string;
    typeDroit: string;
    reference: string;
  }>;
  ecolage: any; // Vous pouvez typer cela plus précisément si nécessaire
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';

  // Récupérer les informations de l'utilisateur
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

  // Récupérer les données des étudiants
  

  // Calculer les statistiques
  const totalStudents = students.length;
  const totalPayments = students.reduce((sum, student) => {
    return sum + (student.droitsPayes?.reduce((s, p) => s + p.montant, 0) || 0);
  }, 0);

  // Compter les inscriptions des 7 derniers jours
  const recentRegistrations = students.filter(student => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return student.droitsPayes?.some(payment => 
      new Date(payment.datePaiement) >= sevenDaysAgo
    ) || false;
  }).length;

  // Afficheur de chargement initial
  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Menu user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
        
        
        {statsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : (
          <>
            {/* <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-6">Tableau de bord</h1>
              <DashboardStats 
                totalStudents={totalStudents}
                totalPayments={totalPayments}
                recentRegistrations={recentRegistrations}
              />
            </div>
            
            <div className="mt-8">
              <RecentActivity students={students} />
            </div> */}
          </>
        )}
      </div>
    </main>
  );
}