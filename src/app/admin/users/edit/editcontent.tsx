"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { User } from "@/lib/db"; 

type UserUpdatePayload = User & { password?: string };

export default function EditUserContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get("id");
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';
    
    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        email: "",
        status: "Actif" as "Actif" | "Inactif",
        role: "Utilisateur" as "Utilisateur" | "Admin",
        password: "",
    });

    useEffect(() => {
        if (!userId) {
            router.push("/admin/users");
            return;
        }

        async function fetchUser() {
            setLoading(true);
            try {
                const res = await fetch(`/api/users?id=${userId}`);
                
                if (res.status === 401 || res.status === 403) {
                    await fetch("/api/auth/logout", { method: "POST" });
                    router.push(login);
                    return;
                }

                if (!res.ok) throw new Error("Impossible de récupérer l'utilisateur");

                const data = await res.json();
                const user = data.data; 

                setFormData({
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    status: user.status,
                    role: user.role,
                    password: ""
                });

            } catch (err) {
                setError(err instanceof Error ? err.message : "Erreur inconnue lors du chargement");
            } finally {
                setLoading(false);
            }
        }
        
        fetchUser();
    }, [userId, router, login]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        const payload: UserUpdatePayload = {
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email,
            status: formData.status,
            role: formData.role
        };

        if (formData.password.trim() !== "") {
            payload.password = formData.password;
        }

        try {
            const res = await fetch(`/api/users?id=${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            
            if (res.status === 401 || res.status === 403) {
                await fetch("/api/auth/logout", { method: "POST" })
                router.push(login); 
                return;
            }

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Impossible de modifier l'utilisateur");
            }

            router.push("/admin/users");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inconnue lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    };

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
            <header className="bg-primary text-primary-foreground shadow-lg">
                <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
                    <Link href="/admin/users" className="hover:opacity-80 transition-opacity">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold">Modifier l&apos;utilisateur</h1>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-lg border">
                    
                    <div>
                        <label htmlFor="nom" className="block text-sm font-medium mb-2">Nom</label>
                        <input
                            id="nom"
                            type="text"
                            required
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg bg-input focus:ring-2"
                        />
                    </div>

                    <div>
                        <label htmlFor="prenom" className="block text-sm font-medium mb-2">Prénom</label>
                        <input
                            id="prenom"
                            type="text"
                            required
                            name="prenom"
                            value={formData.prenom}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg bg-input focus:ring-2"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg bg-input focus:ring-2"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-2">Mot de passe (optionnel)</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            placeholder="Laissez vide pour garder l'ancien"
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg bg-input focus:ring-2"
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium mb-2">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg bg-input focus:ring-2"
                        >
                            <option value="Actif">Actif</option>
                            <option value="Inactif">Inactif</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-sm font-medium mb-2">Rôle</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg bg-input focus:ring-2"
                        >
                            <option value="Utilisateur">Utilisateur</option>
                            <option value="Admin">Administrateur</option>
                        </select>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-accent text-accent-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {saving ? "Sauvegarde..." : "Modifier"}
                        </button>

                        <Link
                            href="/admin/users"
                            className="flex-1 bg-gray-200 text-black py-3 rounded-lg text-center hover:bg-gray-300"
                        >
                            Annuler
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}