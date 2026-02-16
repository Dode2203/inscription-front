"use client";

import { useState, useEffect } from "react";
import { Formation, Mention, Niveau } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "next/navigation"
interface QuickPreFormProps {
    formations: Formation[];
    mentions: Mention[];
    onSuccess?: () => void;
}

export default function QuickPreForm({ formations, mentions, onSuccess }: QuickPreFormProps) {
    
  const router = useRouter();
  const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [niveaux, setNiveaux] = useState<Niveau[]>([]);
    const [loadingNiveaux, setLoadingNiveaux] = useState(true);

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        formationId: '',
        niveauId: '',
        mentionId: ''
    });

    useEffect(() => {
        const fetchNiveaux = async () => {
            try {
                const response = await fetch("/api/etudiants/niveaux");
                const data = await response.json();
                setNiveaux(data.data || data || []);
            } catch (error) {
                console.error("Erreur lors de la récupération des niveaux:", error);
                toast.error("Impossible de charger les niveaux");
            } finally {
                setLoadingNiveaux(false);
            }
        };

        fetchNiveaux();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                nom: (formData.nom || "").toUpperCase().trim(),
                prenom: (formData.prenom || "").trim(),
                formationId: formData.formationId ? Number(formData.formationId) : null,
                niveauId: formData.niveauId ? Number(formData.niveauId) : null,
                mentionId: formData.mentionId ? Number(formData.mentionId) : null,
            };

            const response = await fetch('/api/etudiants/pre-inscription/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (response.status === 401 || response.status === 403) {
                toast.error("Session expirée. Redirection...");
                await fetch("/api/auth/logout", { method: "POST" });
                router.push(login);
                return;
            }
            if (response.ok && result.status === "success") {
                toast.success("Pré-inscription enregistrée avec succès !");
                // Réinitialisation du formulaire
                setFormData({
                    nom: '',
                    prenom: '',
                    formationId: '',
                    niveauId: '',
                    mentionId: ''
                });
                onSuccess?.();
            } else {
                throw new Error(result.message || result.error || "Erreur lors de l'enregistrement");
            }
        } catch (error: any) {
            toast.error(error.message || "Une erreur est survenue lors de l'enregistrement");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Saisie Rapide - Pré-inscription</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="nom" className="text-sm font-semibold">Nom *</Label>
                            <Input
                                id="nom"
                                name="nom"
                                value={formData.nom}
                                onChange={handleChange}
                                required
                                className="bg-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="prenom" className="text-sm font-semibold">Prénoms *</Label>
                            <Input
                                id="prenom"
                                name="prenom"
                                value={formData.prenom}
                                onChange={handleChange}
                                required
                                className="bg-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Formation *</Label>
                            <select
                                name="formationId"
                                value={formData.formationId}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                required
                            >
                                <option value="">Sélectionner une formation</option>
                                {formations
                                .map((f) => (
                                    <option key={f.id} value={f.id}>{f.nom}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Niveau *</Label>
                            <select
                                name="niveauId"
                                value={formData.niveauId}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                required
                                disabled={loadingNiveaux}
                            >
                                <option value="">{loadingNiveaux ? "Chargement..." : "Sélectionner un niveau"}</option>
                                {niveaux
                                .filter((n: Niveau) =>
                                                Number(formData.formationId) === n.type 
                                              )
                                .map((n) => (
                                    <option key={n.id} value={n.id}>{n.nom}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <Label className="text-sm font-semibold">Mention *</Label>
                            <select
                                name="mentionId"
                                value={formData.mentionId}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                required
                            >
                                <option value="">Sélectionner une mention</option>
                                {mentions.map((m) => (
                                    <option key={m.id} value={m.id}>{m.nom}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" size="lg" className="px-10" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                            Enregistrer la pré-inscription
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
