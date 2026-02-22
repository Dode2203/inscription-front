"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
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
                setError(err instanceof Error ? err.message : "Erreur inconnue");
            } finally {
                setLoading(false);
            }
        }
        
        fetchUser();
    }, [userId, router, login]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                throw new Error(data.error || "Erreur lors de la modification");
            }

            router.push("/admin/users");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header Harmonisé */}
            <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
                    <Link 
                        href="/admin/users" 
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                    >
                        <ArrowLeft size={22} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Modifier le profil</h1>

                    </div>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-10">
                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium flex items-center gap-3">
                        <span className="w-2 h-2 bg-rose-600 rounded-full animate-pulse"></span>
                        {error}
                    </div>
                )}

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nom */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Nom</label>
                                <input
                                    name="nom"
                                    type="text"
                                    required
                                    value={formData.nom}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                />
                            </div>

                            {/* Prénom */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Prénom</label>
                                <input
                                    name="prenom"
                                    type="text"
                                    required
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Adresse Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Nouveau mot de passe</label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                placeholder="Laisser vide pour ne pas modifier"
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            {/* Status */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Statut du compte</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl border border-slate-200 font-bold transition-all outline-none appearance-none cursor-pointer ${
                                        formData.status === 'Actif' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                                    }`}
                                >
                                    <option value="Actif">Actif</option>
                                    <option value="Inactif">Inactif</option>
                                </select>
                            </div>

                            {/* Role */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Rôle</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white transition-all outline-none appearance-none cursor-pointer font-medium"
                                >
                                    <option value="Utilisateur">Utilisateur</option>
                                    <option value="Admin">Administrateur</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-10">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                {saving ? "Sauvegarde..." : "Enregistrer les modifications"}
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
    );
}