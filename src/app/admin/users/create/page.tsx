"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react"
import { User } from "@/lib/db"

export default function CreateUser() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';
  
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    mdp: "",
    role: "2",
  })

  useEffect(() => {
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
      }
    }
    checkAuth()
  }, [login])

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
        await fetch("/api/auth/logout", { method: "POST" })
        router.push(login); 
        return;
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la création")
      }

      router.push("/admin/users")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header harmonisé */}
      <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/users" 
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
            >
              <ArrowLeft size={22} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Créer un utilisateur</h1>
              <p className="text-primary-foreground/80 text-sm">Ajoutez un nouveau membre à l'organisation</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-10">
          
          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium flex items-center gap-3">
              <span className="w-2 h-2 bg-rose-600 rounded-full animate-pulse"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Nom</label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Ex: Rakoto"
                />
              </div>

              {/* Prenom */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Prénom</label>
                <input
                  type="text"
                  required
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Ex: Jean"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Adresse Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="user@espa.mg"
              />
            </div>

            {/* Mot de Passe */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Mot de Passe</label>
              <input
                type="password"
                required
                value={formData.mdp}
                onChange={(e) => setFormData({ ...formData, mdp: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Rôle Système</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                <option value="2">Utilisateur Standard</option>
                <option value="1">Administrateur</option>
                <option value="3">Gestion Ecolage</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <UserPlus size={20} />
                )}
                {loading ? "Création..." : "Enregistrer l'utilisateur"}
              </button>
              
              <Link
                href="/admin/users"
                className="flex-1 bg-slate-100 text-slate-700 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-all text-center"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}