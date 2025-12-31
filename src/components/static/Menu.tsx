"use client";

import Link from "next/link";
import { BarChart3,Users } from "lucide-react";
import { User } from "@/lib/db";
import { usePathname } from "next/navigation";
interface MenuProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Menu({ user }: MenuProps) {
  const pathname = usePathname(); // URL courante

  const tabs = [  
  ];
  if (user?.role === "Utilisateur") {
    tabs.push(
      {
        key: "/utilisateur/dashboard",
        label: "Dashboard",
        icon: <BarChart3 size={18} />,
      },
      {
        key: "/utilisateur/inscription",
        label: "Inscription",
        icon: <Users size={18} />,
      }
    );
  }

  // Ajouter les onglets admin seulement si Admin
  if (user?.role === "Admin") {
    tabs.push(
      {
        key: "/admin/dashboard",
        label: "Overview",
        icon: <BarChart3 size={18} />,
      },
      {
        key: "/admin/users",
        label: "Users",
        icon: <Users size={18} />,
      }
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
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              isActive
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