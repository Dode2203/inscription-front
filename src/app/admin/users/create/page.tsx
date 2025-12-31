"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { User } from "@/lib/db"

export default function CreateUser() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
      const login= process.env.NEXT_PUBLIC_LOGIN_URL || '/login';
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    mdp: "",
    role: "2",
  })

  useEffect(() => {
      // Check authentication and fetch user info
      const checkAuth = async () => {
        try {
          const response = await fetch(`/api/auth/me`);
          if (!response.ok) {
            window.location.href = login
            return
          }
          const data = await response.json()
          setUser(data.user)
        } catch (err) {
          window.location.href = login;
        } finally {
          setLoading(false)
        }
      }
  
      checkAuth()
    }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.status === 401 || response.status === 403) {
            setLoading(false); 
            
            // Redirection immédiate
            await fetch("/api/auth/logout", { method: "POST" })
            router.push(login); 
            return; // ⬅️ Arrêter l'exécution de la fonction ici
        }
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create user")
      }

      router.push("/admin/users")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/users" className="hover:opacity-80 transition-opacity">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold">Creer Un Nouveau Utilisateur</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card border border-border rounded-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nom</label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="nom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Prenom</label>
              <input
                type="text"
                required
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="prenom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="user@espa.mg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mot de Passe</label>
              <input
                type="password"
                required
                value={formData.mdp}
                onChange={(e) => setFormData({ ...formData, mdp: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Entrez le mot de passe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value  })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="2">Utilisateur</option>
                <option value="1">Admin</option>
              </select>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-accent text-accent-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Creating..." : "Ajouter Un Utilisateur"}
              </button>
              <Link
                href="/admin/users"
                className="flex-1 bg-muted text-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity text-center"
              >
                Retour
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
