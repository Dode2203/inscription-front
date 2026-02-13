"use client";

import Link from "next/link";
import { BarChart3, Filter, Users, PlusCircle, Search, ShieldCheck } from "lucide-react";
import { User } from "@/lib/db";
import { usePathname } from "next/navigation";
import React from "react";

interface MenuProps {
  user: User | null;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

// Définition d'une interface pour les onglets pour sécuriser le typage
interface TabItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

export default function Menu({ user, activeTab, setActiveTab }: MenuProps) {
  const pathname = usePathname();

  // On initialise le tableau avec le type TabItem[]
  const tabs: TabItem[] = [];

  // Onglets pour le rôle Utilisateur
  if (user?.role === "Utilisateur") {
    tabs.push(
      {
        key: "/utilisateur/dashboard",
        label: "Dashboard",
        icon: <BarChart3 size={18} />,
      },
      {
        key: "/utilisateur/inscription",
        label: "Réinscription",
        icon: <Users size={18} />,
      },
      {
        key: "/utilisateur/filtrage", // Corrigé : minuscule
        label: "Filtrage",
        icon: <Filter size={18} />, // Corrigé : minuscule
      },
      {
        key: "/admin/modification",
        label: "Modification",
        icon: <Filter size={18} />,
      },
      {
        key: "/admin/inscription",
        label: "Ajout Etudiant",
        icon: <BarChart3 size={18} />,
      },
    );
  }

  // Onglets pour le rôle Admin
  if (user?.role === "Admin") {
    tabs.push(
      {
        key: "/admin/inscription",
        label: "Inscription",
        icon: <BarChart3 size={18} />,
      },
      {
        key: "/admin/users",
        label: "Users",
        icon: <Users size={18} />,
      },
      {
        key: "/utilisateur/inscription",
        label: "Réinscription",
        icon: <Users size={18} />,
      },
      {
        key: "/utilisateur/filtrage", // Corrigé : minuscule
        label: "Filtrage",
        icon: <Filter size={18} />, // Corrigé : minuscule
      },
      {
        key: "/admin/modification",
        label: "Modification",
        icon: <Filter size={18} />,
      }
      
    );
  }

  // Onglets pour le rôle Ecolage
  if (user?.role === "Ecolage") {
    tabs.push(
      {
        key: "/ecolage/insertion",
        label: "Insertion Paiement",
        icon: <PlusCircle size={18} />,
      },
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mb-8 border-b border-border">
      {tabs.map((tab) => {
        const isActive = pathname === tab.key;

        return (
          <Link
            key={tab.key}
            href={tab.key}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${isActive
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            {tab.icon}
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}