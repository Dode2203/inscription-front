// src/components/utilisateur/dashboard/dashboard-stats.tsx
'use client';

import { Card } from "@/components/ui/card";
import { Users, CreditCard, FileText } from "lucide-react";
import { StatsData } from "@/lib/db";

interface DashboardStatsProps {
  statsData?: StatsData;
  isLoading?: boolean;
  error?: string | null;
}

const defaultStats: StatsData = {
  total_etudiants: 0,
  total_paiements: 0,
  nouvelles_inscriptions: 0
};

export function DashboardStats({ statsData = defaultStats, isLoading = false, error = null }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        Erreur lors du chargement des statistiques: {error}
      </div>
    );
  }

  const { total_etudiants, total_paiements, nouvelles_inscriptions } = statsData;

  const stats = [
    {
      title: "Étudiants Inscrits",
      value: total_etudiants.toLocaleString('fr-MG'),
      change: "Total des étudiants inscrits",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Paiements Reçus",
      value: `${total_paiements.toLocaleString('fr-MG')} MGA`,
      change: "Total des paiements reçus",
      icon: CreditCard,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Nouvelles Inscriptions",
      value: nouvelles_inscriptions,
      change: "7 derniers jours",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
            </div>
            <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}