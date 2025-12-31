"use client"

import { useState, useEffect, useMemo } from "react" // <-- Ajout de useMemo
// import { BarChart3, BookOpen, Calendar, Settings, Users } from "lucide-react"

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
  
  // 1. NOUVEL ÉTAT POUR LE FILTRE
  const [filterStatus, setFilterStatus] = useState<"Tous" | "Actif" | "Inactif">("Tous");

  const router = useRouter();
    const login= process.env.NEXT_PUBLIC_LOGIN_URL || '/login';

  // [LE CODE useEffect D'AUTHENTIFICATION RESTE INCHANGÉ]
  useEffect(() => {
    // Check authentication and fetch user info
    const checkAuth = async () => {
      try {
        const response = await fetch(`/api/auth/me`);
        if (!response.ok) {
          window.location.href = login;
          return
        }
        const data = await response.json()
        setUser(data.user)
      } catch (err: unknown) 
      {
        // console.error("Réponse réussie mais données manquantes:",err);
        window.location.href = login
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])


  // [LE CODE useEffect DE RÉCUPÉRATION DES UTILISATEURS RESTE INCHANGÉ]
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (res.status === 401 || res.status === 403) {
            setLoading(false); 
            
            // Redirection immédiate
            await fetch("/api/auth/logout", { method: "POST" })
            router.push(login);
            return; // ⬅️ Arrêter l'exécution de la fonction ici
        }
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        
        const data = await res.json();
        const users : User[] = data.data;
        setUsers(users);
      } catch (err: unknown) {
        console.error("erreur de recuperation donne user",err)
        // setError(err.message);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // 2. LOGIQUE DE FILTRAGE UTILISANT useMemo
  const filteredUsers = useMemo(() => {
    if (filterStatus === "Tous") {
      return users; // Afficher tous les utilisateurs
    }
    // Filtrer les utilisateurs dont le statut correspond au filtre sélectionné
    return users.filter(user => user.status === filterStatus);
  }, [users, filterStatus]); // Recalculer uniquement si 'users' ou 'filterStatus' change


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
      {/* Header */}
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Menu user={user} activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* CONTENU DES TABS */}
        </div>

          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Liste des Utilisateurs</h2>
              <button
                onClick={() => router.push("/admin/users/create")} // ← redirection ici
                className="bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Creer un Utilisateur
              </button>
            </div>
            
            {/* 3. INTERFACE DE FILTRE AJOUTÉE ICI */}
            <div className="mb-6 flex space-x-3">
              {["Tous", "Actif", "Inactif"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as "Tous" | "Actif" | "Inactif")}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm
                    ${filterStatus === status 
                      ? "bg-primary text-primary-foreground shadow-md" // Style Actif
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300" // Style Inactif
                    }`
                  }
                >
                  {status}
                </button>
              ))}
            </div>
            {/* FIN INTERFACE DE FILTRE */}

            {/* LOADING TABLEAU */}
            {loadingUsers ? (
                // [...] Chargement
              <div className="flex justify-center py-10">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
                  <p className="mt-3 text-muted-foreground">Chargement des utilisateurs...</p>
                </div>
              </div>
            ) : (
                // 4. UTILISATION DE LA LISTE FILTRÉE
              <div className="space-y-4">
                {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    // CARD/ITEM DE LISTE PAR UTILISATEUR
                    <div 
                      key={user.id} 
                      className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        
                        {/* Informations de l'utilisateur (alignées verticalement ou horizontalement) */}
                        <div className="flex-grow space-y-2 md:space-y-0 md:flex md:gap-8">
                          
                          {/* Nom complet */}
                          <div className="flex flex-col w-full md:w-1/4">
                            <span className="text-xs font-semibold uppercase text-gray-500">Nom Complet</span>
                            <span className="text-base font-medium text-gray-900">{user.nom} {user.prenom}</span>
                          </div>
                          
                          {/* Email */}
                          <div className="flex flex-col w-full md:w-1/4">
                            <span className="text-xs font-semibold uppercase text-gray-500">Email</span>
                            <span className="text-sm text-gray-700">{user.email}</span>
                          </div>

                          {/* Rôle et Statut (alignés si espace) */}
                          <div className="flex gap-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold uppercase text-gray-500">Rôle</span>
                                <span className="text-sm text-indigo-600">{user.role}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold uppercase text-gray-500">Status</span>
                                <span className={`text-sm font-semibold ${user.status === 'Actif' ? 'text-green-600' : 'text-red-600'}`}>
                                  {user.status}
                                </span>
                              </div>
                          </div>

                        </div>

                        {/* Bouton d'Action (aligné à droite sur grand écran) */}
                        <div className="mt-4 md:mt-0 flex-shrink-0">
                          <button
                            onClick={() => router.push(`/admin/users/edit?id=${user.id}`)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
                          >
                            Modifier
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // AUCUN UTILISATEUR TROUVÉ
                  <div className="text-center py-10 border border-gray-200 rounded-lg bg-white">
                    <p className="text-lg text-gray-500">
                      {filterStatus === "Tous" 
                        ? "Aucun utilisateur trouvé" 
                        : `Aucun utilisateur avec le statut "${filterStatus}" trouvé`
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