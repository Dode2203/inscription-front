"use client";

import { useState, useEffect } from "react";
import { User, Formation, Mention } from "@/lib/db";
import Header from "@/components/static/Header";
import Menu from "@/components/static/Menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function InscriptionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formations, setFormations] = useState<Formation[]>([]);
  const [mentions, setMentions] = useState<Mention[]>([]);

  const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
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
    formationId: '',
    mentionId: ''
  });

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const [authRes, formRes, mentRes] = await Promise.all([
          fetch(`/api/auth/me`),
          fetch(`/api/etudiants/formations`),
          fetch(`/api/etudiants/mentions`)
        ]);

        if (!authRes.ok) {
          window.location.href = loginUrl;
          return;
        }

        const data = await authRes.json();
        setUser(data.user);

        if (formRes.ok) setFormations((await formRes.json()).data || []);
        if (mentRes.ok) setMentions((await mentRes.json()).data || []);

      } catch (err) {
        window.location.href = loginUrl;
      } finally {
        setLoading(false);
      }
    };
    checkAuthAndLoadData();
  }, [loginUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Format the data to match the API requirements
      const payload = {
        ...formData,
        dateNaissance: formData.dateNaissance ? `${formData.dateNaissance}T00:00:00+03:00` : '',
        dateCin: formData.dateCin ? `${formData.dateCin}T00:00:00+03:00` : '',
        baccAnnee: formData.baccAnnee ? parseInt(formData.baccAnnee, 10) : 0,
        sexeId: parseInt(formData.sexeId.toString(), 10)
      };

      const response = await fetch('/api/etudiants/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Candidat enregistré avec succès !");
        setFormData({
          nom: '',
          prenom: '',
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
          formationId: '',
          mentionId: ''
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Erreur lors de l'enregistrement");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 border-b-2 border-accent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Sexe</Label>
                      <select 
                        name="sexeId" 
                        value={formData.sexeId} 
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        required
                      >
                        <option value="0">Sélectionner M/F</option>
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
                    <div className="md:col-span-2">
                      <FormField label="Adresse" name="proposAdresse" value={formData.proposAdresse} onChange={handleChange} required />
                    </div>
                  </div>
                </section>

                {/* SECTION 3 : FORMATION (SANS NIVEAU) */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold border-l-4 border-accent pl-2">Parcours Académique</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Formation</Label>
                      <select 
                        name="formationId" 
                        value={formData.formationId} 
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        required
                      >
                        <option value="">Sélectionner une formation</option>
                        {formations.map((f) => (
                          <option key={f.id} value={f.id}>{f.nom}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Mention</Label>
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
                </section>

                <div className="flex justify-end pt-4">
                  <Button type="submit" size="lg" className="px-10" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
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

function FormField({ label, name, type = "text", value, onChange, placeholder, required = false }: any) {
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
        className="bg-white"
      />
    </div>
  );
}