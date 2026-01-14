// src/components/utilisateur/dashboard/dashboard-stats.tsx
'use client';

import { Card } from "@/components/ui/card";
import { Users, CreditCard, FileText } from "lucide-react";
import { Student } from "@/lib/db";

interface DashboardStatsProps {
  students: Student[];
}

export function DashboardStats({ students }: DashboardStatsProps) {
  const totalStudents = students.length;
  
  const totalPayments = students.reduce((total, student) => 
    total + (student.droitsPayes?.reduce((sum, payment) => sum + payment.montant, 0) || 0), 
  0);
  
  const recentInscriptions = students.filter(student => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return student.droitsPayes?.some(payment => 
      new Date(payment.datePaiement) >= oneWeekAgo
    ) || false;
  }).length;

  const stats = [
    {
      title: "Étudiants Inscrits",
      value: totalStudents.toLocaleString('fr-MG'),
      change: "Total des étudiants inscrits",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Paiements Reçus",
      value: `${totalPayments.toLocaleString('fr-MG')} MGA`,
      change: "Total des paiements reçus",
      icon: CreditCard,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Nouvelles Inscriptions",
      value: recentInscriptions,
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