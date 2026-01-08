"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Loader2, CheckCircle } from "lucide-react"
import DocumentsForm from "./sous-composant/DocumentsForm"
import IdentiteDisplay from "./sous-composant/IdentiteDisplay"
import FormationDisplay from "./sous-composant/FormationDisplay"
import { Formation, Identite, PaiementData, EtudiantRecherche } from '@/lib/db'
import PaiementForm from "./sous-composant/PayementForm"
import { useRouter } from "next/navigation"
import { generateReceiptPDF } from "@/lib/generateReceipt" // Import de l'utilitaire

export function InscriptionForm() {
  const [step, setStep] = useState("identite");
  const router = useRouter();
  const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';
  
  const [loadingInscription, setLoadingInscription] = useState(false);
  const [errorInscription, setErrorInscription] = useState("");
  const [successMessageInscription, setSuccessMessageInscription] = useState("");
  const [loadingRecherche, setLoadingRecherche] = useState(false);
  const [loadingEtudiant, setLoadingEtudiant] = useState(false);
  const [afficherListeEtudiants, setAfficherListeEtudiants] = useState(false);

  const [nomSearch, setNomSearch] = useState("")
  const [prenomSearch, setPrenomSearch] = useState("")
  const [etudiantsTrouves, setEtudiantsTrouves] = useState<EtudiantRecherche[]>([]);

  // États pour les données
  const [identite, setIdentite] = useState<Identite | null>(null)
  const [formation, setFormation] = useState<Formation | null>(null)
  const [parcoursType, setParcoursType] = useState<string>("");
  const [paiementData, setPaiementData] = useState<PaiementData>({
    refAdmin: "",
    dateAdmin: "",
    montantAdmin: "",
    refPedag: "",
    datePedag: "",
    montantPedag: "",
    montantEcolage: "",
    refEcolage: "",
    dateEcolage: "",
    passant: false
  });

  const [validatedDocs, setValidatedDocs] = useState<Record<string, boolean>>({
    photo: false, acte: false, diplome: false, cni: false, medical: false,
  });

  const updatePaiement = (fields: Partial<PaiementData>) => {
    setPaiementData(prev => ({ ...prev, ...fields }));
  };

  const toggleDoc = (docId: string) => {
    setValidatedDocs((prev) => ({ ...prev, [docId]: !prev[docId] }))
  }

  const resetForm = () => {
    setEtudiantsTrouves([]);
    setIdentite(null);
    setFormation(null);
    setPaiementData({
      refAdmin: "", dateAdmin: "", montantAdmin: "",
      refPedag: "", datePedag: "", montantPedag: "",
      montantEcolage: "", refEcolage: "", dateEcolage: "",
      passant: false
    });
  };

  const rechercheEtudiants = async () => {
    setLoadingRecherche(true);
    resetForm();
    try {
      const res = await fetch("/api/etudiants/recherche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nomSearch, prenom: prenomSearch })
      });

      if (res.status === 401 || res.status === 403) {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push(login);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Erreur de recherche");
        return;
      }

      const response = await res.json();
      setEtudiantsTrouves(response.data);
      setAfficherListeEtudiants(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecherche(false);
    }
  };

  const fetchEtudiant = async (idEtudiant: number | string) => {
    setLoadingEtudiant(true);
    try {
      const res = await fetch(`/api/etudiants?idEtudiant=${encodeURIComponent(idEtudiant)}`);
      
      if (res.status === 401 || res.status === 403) {
        router.push(login);
        return;
      }
      console.log("mandalorian fetchEtudiant");

      const response = await res.json();
      const data = response.data;
      setIdentite(data.identite);
      setFormation(data.formation);
      setParcoursType(data.formation.formationType);
      setAfficherListeEtudiants(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEtudiant(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identite || !formation) return;

    setLoadingInscription(true);
    setErrorInscription("");

    const inscriptionData = {
      ...paiementData,
      idEtudiant: identite.id.toString(),
      typeFormation: parcoursType,
    };

    try {
      const res = await fetch("/api/etudiants/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inscriptionData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      setSuccessMessageInscription("Inscription réussie !");
      
      // GÉNÉRATION DU PDF
      generateReceiptPDF(identite, formation, paiementData);

      setTimeout(() => {
        router.push('/utilisateur/dashboard');
      }, 2000);

    } catch (err: any) {
      setErrorInscription(err.message);
      setLoadingInscription(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto p-6 shadow-lg border-t-4 border-blue-900">
      {/* Barre de Recherche */}
      <div className="mb-8 p-4 bg-slate-50 border rounded-xl">
        <Label className="text-blue-900 font-bold mb-4 block italic">Rechercher un étudiant</Label>
        <div className="grid md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2 space-y-2">
            <Label>Nom</Label>
            <Input placeholder="Nom" value={nomSearch} onChange={(e) => setNomSearch(e.target.value)} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Prénom</Label>
            <Input placeholder="Prénom" value={prenomSearch} onChange={(e) => setPrenomSearch(e.target.value)} />
          </div>
          <Button onClick={rechercheEtudiants} disabled={loadingRecherche} className="bg-blue-900 text-amber-400 hover:bg-blue-800">
            {loadingRecherche ? <Loader2 className="animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            Chercher
          </Button>
        </div>
      </div>

      {/* Liste des résultats */}
      {etudiantsTrouves.length > 0 && afficherListeEtudiants && (
        <div className="mt-4 border rounded-lg divide-y bg-white shadow-sm overflow-hidden">
          {etudiantsTrouves.map((etudiant) => (
            <button key={etudiant.id} type="button" onClick={() => fetchEtudiant(etudiant.id)} className="w-full text-left px-4 py-3 hover:bg-blue-50 transition flex justify-between items-center">
              <span className="font-medium">{etudiant.nom} {etudiant.prenom}</span>
              <span className="text-xs text-slate-400">ID: {etudiant.id}</span>
            </button>
          ))}
        </div>
      )}

      {/* Formulaire Multi-étapes */}
      {identite && formation ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={step} onValueChange={setStep}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="identite">1. Identité</TabsTrigger>
              <TabsTrigger value="academique">2. Académique</TabsTrigger>
              <TabsTrigger value="paiement">3. Paiements</TabsTrigger>
              <TabsTrigger value="documents">4. Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="identite" className="mt-6">
              <IdentiteDisplay identite={identite} onNext={() => setStep("academique")} />
            </TabsContent>

            <TabsContent value="academique" className="mt-6">
              <FormationDisplay data={formation} onBack={() => setStep("identite")} onNext={() => setStep("paiement")} />
            </TabsContent>

            <TabsContent value="paiement" className="mt-6">
              <PaiementForm formData={paiementData} updateData={updatePaiement} parcoursType={parcoursType} onBack={() => setStep("academique")} onNext={() => setStep("documents")} />
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <DocumentsForm validatedDocs={validatedDocs} onToggleDoc={toggleDoc} onBack={() => setStep("paiement")} onNext={() => {}} />
            </TabsContent>
          </Tabs>

          {errorInscription && <p className="text-red-500 text-sm font-medium">{errorInscription}</p>}

          <div className="flex gap-4 pt-6">
            <Button 
              type="submit" 
              disabled={loadingInscription || !!successMessageInscription} 
              className="flex-1 h-12 text-lg"
              variant={successMessageInscription ? "secondary" : "default"}
            >
              {loadingInscription ? <Loader2 className="animate-spin mr-2" /> : null}
              {successMessageInscription ? (
                <><CheckCircle className="mr-2 text-green-600" /> Inscription Terminée</>
              ) : "Valider l'inscription & Générer Reçu"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="py-20 text-center border-2 border-dashed rounded-xl bg-slate-50/50">
          <p className="text-slate-500">Aucun dossier chargé. Utilisez la recherche ci-dessus.</p>
        </div>
      )}
    </Card>
  )
}