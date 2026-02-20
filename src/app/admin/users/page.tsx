"use client"

import { useState, useEffect, useMemo } from "react"
import { User } from "@/lib/db"
import Header from "@/components/static/Header"
import Menu from "@/components/static/Menu"
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("admin/users")
  const [loading, setLoading] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [users, setUsers] = useState<User[]>([]);
  const [filterStatus, setFilterStatus] = useState<"Tous" | "Actif" | "Inactif">("Tous");

  const router = useRouter();
  const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`/api/auth/me`);
        if (!response.ok) {
          window.location.href = login;
          return
        }
        const data = await response.json()
        setUser(data.user)
      } catch (err) {
        window.location.href = login
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [login])

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (res.status === 401 || res.status === 403) {
          await fetch("/api/auth/logout", { method: "POST" })
          router.push(login);
          return;
        }
        const data = await res.json();
        setUsers(data.data || []);
      } catch (err) {
        console.error("Erreur récupération:", err)
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [login, router]);

  const filteredUsers = useMemo(() => {
    if (filterStatus === "Tous") return users;
    return users.filter(u => u.status === filterStatus);
  }, [users, filterStatus]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600 font-medium">Chargement du profil...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Menu user={user} activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-8">
          {/* Header de la section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Gestion des Utilisateurs</h2>
              <p className="text-sm text-slate-500">Gérez les accès et les comptes de la plateforme</p>
            </div>
            <button
              onClick={() => router.push("/admin/users/create")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 font-medium flex items-center gap-2"
            >
              <span className="text-lg">+</span> Créer un Utilisateur
            </button>
          </div>

          {/* Filtres */}
          <div className="mb-6 flex p-1 bg-slate-200/50 rounded-xl w-fit">
            {["Tous", "Actif", "Inactif"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-6 py-2 rounded-lg transition-all duration-200 text-sm font-semibold ${
                  filterStatus === status
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Liste des Utilisateurs */}
          {loadingUsers ? (
            <div className="flex flex-col justify-center items-center py-20 bg-white rounded-2xl border border-slate-200">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-500">Chargement de la liste...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <div 
                    key={u.id} 
                    className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
                        {/* Identité */}
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Utilisateur</span>
                          <span className="text-base font-semibold text-slate-900">{u.nom} {u.prenom}</span>
                        </div>

                        {/* Contact */}
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email</span>
                          <span className="text-sm text-slate-600 truncate">{u.email}</span>
                        </div>

                        {/* Rôle & Statut */}
                        <div className="flex gap-8">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Rôle</span>
                            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit">
                              {u.role}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Statut</span>
                            <span className={`text-sm font-bold px-2 py-0.5 rounded w-fit ${
                              u.status === 'Actif' 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : 'bg-rose-50 text-rose-600'
                            }`}>
                              {u.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => router.push(`/admin/users/edit?id=${u.id}`)}
                          className="w-full lg:w-auto px-5 py-2 text-sm font-semibold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
                        >
                          Modifier
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                  <p className="text-slate-500 font-medium">
                    {filterStatus === "Tous" 
                      ? "Aucun utilisateur dans la base de données." 
                      : `Aucun utilisateur avec le statut "${filterStatus}".`
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}