"use client";

import { useState, useEffect } from "react";
import { Formation, Mention, Nationalite } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation"
interface PreInscrit {
    id: number;
    nom: string;
    prenom: string;
    formationId: number;
    mentionId: number;
}

interface FinalConversionFormProps {
    selectedCandidate: PreInscrit;
    formations: Formation[];
    mentions: Mention[];
    nationalites: Nationalite[];
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function FinalConversionForm({
    selectedCandidate,
    formations,
    mentions,
    nationalites,
    onSuccess,
    onCancel
}: FinalConversionFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        preInscriptionId: selectedCandidate.id,
        nom: selectedCandidate.nom,
        prenom: selectedCandidate.prenom,
        dateNaissance: '',
        lieuNaissance: '',
        sexeId: 0,
        cinNumero: '',
        cinLieu: '',
        dateCin: '',
        baccNumero: '',
        baccAnnee: '',
        baccSerie: '',
        proposEmail: '',
        proposAdresse: '',
        formationId: selectedCandidate.formationId.toString(),
        mentionId: selectedCandidate.mentionId.toString(),
        nationaliteId: 0,
        proposTelephone: ''
    });
    
  const router = useRouter();
  const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                preInscriptionId: Number(formData.preInscriptionId),
                etudiantData: {
                    nom: (formData.nom || "").toUpperCase().trim(),
                    prenom: (formData.prenom || "").trim(),
                    dateNaissance: formData.dateNaissance ? `${formData.dateNaissance}T00:00:00+03:00` : "",
                    lieuNaissance: formData.lieuNaissance || "",
                    sexeId: Number(formData.sexeId) || 0,
                    cinNumero: formData.cinNumero || "",
                    cinLieu: formData.cinLieu || "",
                    dateCin: formData.dateCin ? `${formData.dateCin}T00:00:00+03:00` : "",
                    baccNumero: formData.baccNumero || "",
                    baccAnnee: formData.baccAnnee ? parseInt(formData.baccAnnee.toString(), 10) : 0,
                    baccSerie: formData.baccSerie || "",
                    proposEmail: formData.proposEmail || "",
                    proposAdresse: formData.proposAdresse || "",
                    formationId: formData.formationId ? Number(formData.formationId) : null,
                    mentionId: formData.mentionId ? Number(formData.mentionId) : null,
                    nationaliteId: formData.nationaliteId ? Number(formData.nationaliteId) : null,
                    proposTelephone: formData.proposTelephone || "",
                }
            };

            const response = await fetch('/api/etudiants/pre-inscription/convertir', {
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
                toast.success("Conversion réussie ! Étudiant inscrit avec succès.");
                onSuccess?.();
            } else {
                throw new Error(result.message || result.error || "Erreur lors de la conversion");
            }
        } catch (error: any) {
            toast.error(error.message || "Une erreur est survenue lors de la conversion");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="max-w-4xl mx-auto mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Complétion de l'Inscription</CardTitle>
                <Button variant="ghost" size="sm" onClick={onCancel}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="mb-4 p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm font-semibold">
                        Candidat sélectionné : {selectedCandidate.nom} {selectedCandidate.prenom}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* SECTION 1 : IDENTITÉ */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold border-l-4 border-accent pl-2">Informations Personnelles</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField label="Nom" name="nom" value={formData.nom} onChange={handleChange} required disabled />
                            <FormField label="Prénoms" name="prenom" value={formData.prenom} onChange={handleChange} required disabled />
                            <FormField label="Date de Naissance" name="dateNaissance" type="date" value={formData.dateNaissance} onChange={handleChange} required />
                            <FormField label="Lieu de Naissance" name="lieuNaissance" value={formData.lieuNaissance} onChange={handleChange} required />

                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold">Sexe *</Label>
                                <select
                                    name="sexeId"
                                    value={formData.sexeId}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                    required
                                >
                                    <option value="">Sélectionner M/F</option>
                                    <option value="1">Masculin</option>
                                    <option value="2">Féminin</option>
                                </select>
                            </div>

                            <FormField label="Numéro CIN" name="cinNumero" value={formData.cinNumero} onChange={handleChange} required />
                            <FormField label="Lieu de délivrance CIN" name="cinLieu" value={formData.cinLieu} onChange={handleChange} required />
                            <FormField label="Date de délivrance CIN" name="dateCin" type="date" value={formData.dateCin} onChange={handleChange} required />
                            <FormField label="Numéro BACC" name="baccNumero" value={formData.baccNumero} onChange={handleChange} required />
                            <FormField label="Année BACC" name="baccAnnee" type="number" value={formData.baccAnnee} onChange={handleChange} required />
                            <FormField label="Série BACC" name="baccSerie" value={formData.baccSerie} onChange={handleChange} required />
                        </div>
                    </section>

                    {/* SECTION 2 : CONTACT */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold border-l-4 border-accent pl-2">Contact</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField label="Email" name="proposEmail" type="email" value={formData.proposEmail} onChange={handleChange} required />
                            <FormField label="Téléphone" name="proposTelephone" value={formData.proposTelephone} onChange={handleChange} required />
                            <div className="md:col-span-2">
                                <FormField label="Adresse" name="proposAdresse" value={formData.proposAdresse} onChange={handleChange} required />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold">Nationalité *</Label>
                                <select
                                    name="nationaliteId"
                                    value={formData.nationaliteId}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                    required
                                >
                                    <option value="">Sélectionner une nationalité</option>
                                    {nationalites.map((n) => (
                                        <option key={n.id} value={n.id}>{n.nom}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3 : FORMATION (pré-remplie) */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold border-l-4 border-accent pl-2">Parcours Académique</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold">Formation *</Label>
                                <select
                                    name="formationId"
                                    value={formData.formationId}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                    required
                                    disabled
                                >
                                    <option value="">Sélectionner une formation</option>
                                    {formations.map((f) => (
                                        <option key={f.id} value={f.id}>{f.nom}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold">Mention *</Label>
                                <select
                                    name="mentionId"
                                    value={formData.mentionId}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                    required
                                    disabled
                                >
                                    <option value="">Sélectionner une mention</option>
                                    {mentions.map((m) => (
                                        <option key={m.id} value={m.id}>{m.nom}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Annuler
                        </Button>
                        <Button type="submit" size="lg" className="px-10" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                            Finaliser l'inscription
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function FormField({ label, name, type = "text", value, onChange, placeholder, required = false, disabled = false }: any) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={name} className="text-sm font-semibold">{label}</Label>
            <Input
                id={name}
                name={name}
                type={type}
                value={value || ""}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className="bg-white disabled:opacity-60"
            />
        </div>
    );
}
