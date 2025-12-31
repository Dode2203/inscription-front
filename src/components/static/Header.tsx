"use client";

import { LogOut } from "lucide-react";
import { User } from "@/lib/db";

interface HeaderProps {
  user: User | null;
}

export default function Header({ user}: HeaderProps) {
      const logout = process.env.NEXT_PUBLIC_LOGOUT_URL;
      const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" })
        window.location.href = logout || "/login";
      };

    return (
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        
        {/* User Info */}
        <div>
          <h1 className="text-2xl font-bold">
            {user?.role} Dashboard
          </h1>
          <p className="text-primary-foreground/80 text-sm">
            Welcome, {user?.name}
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>
    </header>
  );
}
