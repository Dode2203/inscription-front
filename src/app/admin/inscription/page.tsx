"use client";

import { useState, useEffect } from "react";
import { User, Formation, Mention, Nationalite } from "@/lib/db";
import Header from "@/components/static/Header";
import Menu from "@/components/static/Menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getInitialData } from "@/lib/appConfig";
import { useRouter } from "next/navigation"

export default function InscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("/admin/inscription");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formations, setFormations] = useState<Formation[]>([]);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [nationalites, setNationalites] = useState<Nationalite[]>([]);

  const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';

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
    mentionId: '',
    nationaliteId: 0,
    proposTelephone:''
  });

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const [authRes, initialData] = await Promise.all([
          fetch(`/api/auth/me`),
          getInitialData()
        ]);

        if (!authRes.ok) {
          window.location.href = login;
          return;
        }

        const data = await authRes.json();
        setUser(data.user);
        if (data.user.role !== "Admin" && data.user.role !== "Utilisateur") {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push(login); 
        }
      
        if (initialData.formations) setFormations(initialData.formations);
        if (initialData.mentions) setMentions(initialData.mentions);
        if (initialData.nationalites) setNationalites(initialData.nationalites);

      } catch (err) {
        window.location.href = login;
      } finally {
        setLoading(false);
      }
    };
    checkAuthAndLoadData();
  }, [login]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Formatage strict pour Symfony
      const payload = {
        nom: (formData.nom || "").toUpperCase().trim(),
        prenom: (formData.prenom || "").trim(),
        // Format Date impératif : YYYY-MM-DD -> YYYY-MM-DDT00:00:00+03:00
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
        // Ajout des IDs de formation et mention
        formationId: formData.formationId ? Number(formData.formationId) : null,
        mentionId: formData.mentionId ? Number(formData.mentionId) : null,
        nationaliteId: formData.nationaliteId ? Number(formData.nationaliteId) : null,
        proposTelephone: formData.proposTelephone || "",
      };

      // console.log("Payload envoyé à l'API:", payload);

      const response = await fetch('/api/etudiants/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
              toast.error("Session expirée. Redirection... ");

            setLoading(false); 
            
            // Redirection immédiate
            await fetch("/api/auth/logout", { method: "POST" })
            router.push(login); 
            return; // ⬅️ Arrêter l'exécution de la fonction ici
        }

      if (response.ok && result.status === "success") {
        toast.success("Candidat enregistré avec succès !");
        // Réinitialisation du formulaire après une inscription réussie
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
          mentionId: '',
          nationaliteId: 0,
          proposTelephone: ''
        });
      } else {
        throw new Error(result.message || result.error || "Erreur lors de l'enregistrement");
      }
    } catch (error: any) {
      // console.log("Erreur lors de l'enregistrement:", error);
      toast.error(error.message || error.error|| "Une erreur est survenue lors de l'enregistrement");
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
                    <div className="md:col-span-2">
                      <FormField label="Adresse" name="proposAdresse" value={formData.proposAdresse} onChange={handleChange} required />
                    </div>
                    <div className="md:col-span-2">
                      <FormField label="Téléphone" name="proposTelephone" value={formData.proposTelephone} onChange={handleChange} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Nationalité</Label>
                      <select 
                        name="nationaliteId" 
                        value={formData.nationaliteId} 
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        required
                      >
                        <option value="">Sélectionner une nationalite</option>
                        {nationalites.map((m) => (
                          <option key={m.id} value={m.id}>{m.nom}</option>
                        ))}
                      </select>
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