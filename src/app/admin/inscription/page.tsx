"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/db";
import Header from "@/components/static/Header";
import Menu from "@/components/static/Menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InscriptionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState(""); // Sera géré par le pathname dans Menu
  const [loading, setLoading] = useState(true);
  const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';

  // État du formulaire unique
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    lieuNaissance: '',
    sexe: '',
    nationalite: '',
    telephone: '',
    email: '',
    adresse: '',
    formation: '',
    formationType: '',
    niveau: '',
    mention: '',
    statusEtudiant: 'Concours'
  });

  // 1. Vérification de l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`/api/auth/me`);
        if (!response.ok) {
          window.location.href = loginUrl;
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        window.location.href = loginUrl;
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [loginUrl]);

  // 2. Gestion des changements d'input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Soumission du formulaire (POST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/inscription', { // Ajuste ton endpoint ici
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Candidat enregistré avec succès !");
        // Optionnel: reset du formulaire
      } else {
        alert("Erreur lors de l'enregistrement.");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ton composant Menu qui gère la navigation par onglets */}
        <Menu user={user} activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-6">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Nouveau Formulaire d'Ajout</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* SECTION 1 : IDENTITÉ */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold border-l-4 border-accent pl-2">Informations Personnelles</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="Nom" name="nom" value={formData.nom} onChange={handleChange} required />
                    <FormField label="Prénoms" name="prenom" value={formData.prenom} onChange={handleChange} />
                    <FormField label="Date de Naissance" name="dateNaissance" type="date" value={formData.dateNaissance} onChange={handleChange} />
                    <FormField label="Lieu de Naissance" name="lieuNaissance" value={formData.lieuNaissance} onChange={handleChange} />
                    <FormField label="Sexe" name="sexe" placeholder="M/F" value={formData.sexe} onChange={handleChange} />
                    <FormField label="Nationalité" name="nationalite" value={formData.nationalite} onChange={handleChange} />
                  </div>
                </section>

                {/* SECTION 2 : CONTACT */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold border-l-4 border-accent pl-2">Contact</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="Téléphone" name="telephone" value={formData.telephone} onChange={handleChange} />
                    <FormField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                    <div className="md:col-span-2">
                      <FormField label="Adresse" name="adresse" value={formData.adresse} onChange={handleChange} />
                    </div>
                  </div>
                </section>

                {/* SECTION 3 : FORMATION */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold border-l-4 border-accent pl-2">Parcours Académique</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="Formation" name="formation" value={formData.formation} onChange={handleChange} />
                    <FormField label="Niveau" name="niveau" value={formData.niveau} onChange={handleChange} />
                    <FormField label="Mention" name="mention" value={formData.mention} onChange={handleChange} />
                  </div>
                </section>

                <div className="flex justify-end pt-4">
                  <Button type="submit" size="lg" className="px-10">
                    Enregistrer l'inscription
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

// Petit composant helper pour les champs du formulaire
function FormField({ label, name, type = "text", value, onChange, placeholder, required = false }: any) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-sm font-semibold">{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="bg-white"
      />
    </div>
  );
}