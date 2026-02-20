"use client"

import { toast } from 'sonner';
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Loader2, CheckCircle, Info } from "lucide-react"
import DocumentsForm from "./sous-composant/DocumentsForm"
import IdentiteDisplay from "./sous-composant/IdentiteDisplay"
import FormationDisplay from "./sous-composant/FormationDisplay"
import { Formation, Identite, PaiementData, EtudiantRecherche, Inscription, Niveau } from '@/lib/db'
import PaiementForm from "./sous-composant/PayementForm"
import { useRouter } from "next/navigation"
import { generateReceiptPDF } from "@/lib/generateReceipt"
import { getInitialData } from '@/lib/appConfig';
import { Student } from '@/lib/db';
import { downloadReceipt } from '@/lib/receipt-helper';
import { sortStudentsAlphabetically } from '@/lib/utils';

export function InscriptionForm() {
  const [step, setStep] = useState("identite");
  const router = useRouter();
  const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';

  const [loadingInscription, setLoadingInscription] = useState(false);
  const [errorInscription, setErrorInscription] = useState("");
  const [successMessageInscription, setSuccessMessageInscription] = useState("");
  const [loadingEtudiant, setLoadingEtudiant] = useState(false);
  const [loadingRecherche, setLoadingRecherche] = useState(false);
  const [afficherListeEtudiants, setAfficherListeEtudiants] = useState(false);
  const [nomSearch, setNomSearch] = useState("")
  const [prenomSearch, setPrenomSearch] = useState("")
  const [etudiantsTrouves, setEtudiantsTrouves] = useState<EtudiantRecherche[]>([]);
  const [loading, setLoading] = useState(true);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);

  const [identite, setIdentite] = useState<Identite | null>(null)
  const [formation, setFormation] = useState<Formation | null>(null);
  const [parcoursType, setParcoursType] = useState<string>("");

  // ÉTAT EXONÉRATION
  const [isExonere, setIsExonere] = useState(false);

  const [paiementData, setPaiementData] = useState<PaiementData>({
    refAdmin: "", dateAdmin: "", montantAdmin: "",
    refPedag: "", datePedag: "", montantPedag: "",
    montantEcolage: "", refEcolage: "", dateEcolage: "",
    idNiveau: "", idFormation: "",
    estBoursier: 0
  });

  // INITIALISATION DES DOCUMENTS (Sans médical)
  const [validatedDocs, setValidatedDocs] = useState<Record<string, boolean>>({
    photo: false,
    acte: false,
    diplome: false,
    cni: false,
    exonere: false
  });

  // LOGIQUE DE VALIDATION CORRIGÉE : Photo + Diplome + (Acte OU CNI)
  const allDocsValidated =
    !!validatedDocs.photo &&
    (!!validatedDocs.acte || !!validatedDocs.cni);

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
    setStep("identite");
    setIsExonere(false);
    setPaiementData({
      refAdmin: "", dateAdmin: "", montantAdmin: "",
      refPedag: "", datePedag: "", montantPedag: "",
      montantEcolage: "", refEcolage: "", dateEcolage: "",
      idNiveau: "", idFormation: "",
      estBoursier: 0,
    });
    setValidatedDocs({
      photo: false,
      acte: false,
      diplome: false,
      cni: false,
      exonere: false
    });
    setErrorInscription("");
    setSuccessMessageInscription("");
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
        toast.error("Session expirée. Redirection...");
        await fetch("/api/auth/logout", { method: "POST" });
        router.push(login);
        return;
      }

      const response = await res.json();

      // 1. On vérifie si data existe, sinon on utilise un tableau vide par défaut []
      const etudiants = response.data || [];

      // 2. On trie le tableau via l'utilitaire centralisé
      const sortedStudents = sortStudentsAlphabetically<EtudiantRecherche>(etudiants);

      setEtudiantsTrouves(sortedStudents);
      setAfficherListeEtudiants(true);

      if (sortedStudents.length > 0) {
        const successAudio = new Audio("/sounds/successed-295058.mp3");
        successAudio.play();
        toast.success(`${sortedStudents.length} étudiant(s) trouvé(s)`);
      } else {
        toast.error("Aucun étudiant trouvé");
      }
    } catch (err) {
      const message = (err as Error).message || "Une erreur inattendue s'est produite";
      toast.error(message);
    } finally {
      setLoadingRecherche(false);
    }
  };

  const fetchEtudiant = async (idEtudiant: number | string) => {
    setLoadingEtudiant(true);
    try {
      const res = await fetch(`/api/etudiants?idEtudiant=${encodeURIComponent(idEtudiant)}`);
      if (res.status === 401 || res.status === 403) {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push(login);
        return;
      }

      const response = await res.json();
      // console.log(response.data)
      if (!res.ok) throw new Error(response.error || "Erreur");


      setIdentite(response.data.identite);
      setFormation(response.data.formation);
      setParcoursType(response.data.formation.formationType);
      setAfficherListeEtudiants(false);
    } catch (err: any) {
      toast.error(err.message);
      const errorAudio = new Audio("/sounds/error-011-352286.mp3");
      errorAudio.play();
    } finally {
      setLoadingEtudiant(false);
      setAfficherListeEtudiants(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identite || !formation) return;

    setLoadingInscription(true);
    setErrorInscription("");

    try {
      const res = await fetch("/api/etudiants/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paiementData,
          estBoursier: Number(paiementData.estBoursier),
          idEtudiant: identite.id.toString(),
          typeFormation: parcoursType,
          isExonere
        }),
      });
      if (res.status === 401 || res.status === 403) {
        toast.error("Session expirée. Redirection...");
        await fetch("/api/auth/logout", { method: "POST" });
        router.push(login);
        return;
      }
      const response = await res.json();

      if (!res.ok) throw new Error(response.error || "Erreur lors de l'inscription");

      setSuccessMessageInscription("Inscription réussie !");
      const fullStudent: Student = {
        ...response.data,
        typeFormation: response.data.formation?.type || "",
        droitsPayes: response.data.droitsPayes || [],
        ecolage: response.data.ecolage || null
      };

      // downloadReceipt(fullStudent);

      const successAudio = new Audio("/sounds/success-221935.mp3");
      successAudio.play();
      toast.success("Inscription réussie pour " + identite.nom);

      setTimeout(() => {
        router.push(`/admin/modification?nom=${identite.nom}&prenom=${identite.prenom}`);
      }, 2000);

    } catch (err: any) {
      setErrorInscription(err.message);
      toast.error(err.message);
      const errorAudio = new Audio("/sounds/error-011-352286.mp3");
      errorAudio.play();
      setLoadingInscription(false);
    }
  };

  useEffect(() => {
    getInitialData().then((data) => {
      setNiveaux(data.niveaux);
      setFormations(data.formations);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    <p className="mt-4 text-muted-foreground">Chargement...</p>
  </div>;

  return (
    <Card className="max-w-4xl mx-auto p-6 shadow-lg border-t-4 border-blue-900">
      <div className="mb-8 p-4 bg-slate-50 border rounded-xl">
        <Label className="text-slate-600 font-bold mb-4 block italic">Rechercher un étudiant</Label>
        <div className="grid md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="nom">Nom</Label>
            <Input id="nom" placeholder="Nom" value={nomSearch} onChange={(e) => setNomSearch(e.target.value)} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="prenom">Prénom</Label>
            <Input id="prenom" placeholder="Prénom" value={prenomSearch} onChange={(e) => setPrenomSearch(e.target.value)} />
          </div>
          <Button onClick={rechercheEtudiants} disabled={loadingRecherche} className="bg-blue-900 text-white">
            {loadingRecherche ? <Loader2 className="animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            Rechercher
          </Button>
        </div>
      </div>

      {etudiantsTrouves.length > 0 && afficherListeEtudiants && (
        <div className="mt-4 border rounded-lg divide-y bg-white shadow-sm overflow-hidden mb-6">
          {etudiantsTrouves.map((etudiant) => (
            <button key={etudiant.id} type="button" onClick={() => fetchEtudiant(etudiant.id)} className="w-full text-left px-4 py-3 hover:bg-slate-100 transition">
              <p className="font-semibold">{etudiant.nom} {etudiant.prenom}</p>
            </button>
          ))}
        </div>
      )}

      {identite && formation ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={step} onValueChange={setStep}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="identite">1. Identité</TabsTrigger>
              <TabsTrigger value="academique">2. Académique</TabsTrigger>
              <TabsTrigger value="documents">3. Documents</TabsTrigger>
              <TabsTrigger value="paiement">4. Bordereaux</TabsTrigger>
            </TabsList>

            <TabsContent value="identite" className="mt-6">
              <IdentiteDisplay identite={identite} onNext={() => setStep("academique")} />
            </TabsContent>

            <TabsContent value="academique" className="mt-6">
              <FormationDisplay data={formation} onBack={() => setStep("identite")} onNext={() => setStep("documents")} />
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <DocumentsForm
                validatedDocs={validatedDocs}
                onToggleDoc={toggleDoc}
                isExonere={isExonere}
                setIsExonere={setIsExonere}
                onBack={() => setStep("academique")}
                onNext={() => setStep("paiement")}
              />
            </TabsContent>

            <TabsContent value="paiement" className="mt-6">
              <PaiementForm
                formData={paiementData}
                updateData={updatePaiement}
                formation={formation}
                niveaux={niveaux}
                formations={formations ?? []}
                parcoursType={parcoursType}
                isExonere={isExonere}
                onBack={() => setStep("documents")}
                onNext={() => { }}
              />
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 pt-6 border-t">
            {step === "paiement" ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("documents")}
                >
                  Précédent
                </Button>

                {allDocsValidated ? (
                  <Button
                    type="submit"
                    disabled={loadingInscription || !!successMessageInscription}
                    className="flex-1 h-12 text-lg bg-green-700 hover:bg-green-800"
                  >
                    {loadingInscription ? <Loader2 className="animate-spin mr-2" /> : null}
                    {successMessageInscription ? (
                      <><CheckCircle className="mr-2" /> Inscription Terminée</>
                    ) : (
                      "Valider l'inscription & Générer Reçu"
                    )}
                  </Button>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 italic text-sm">
                    <Info className="w-4 h-4 mr-2" />
                    Documents manquants : Photo, Diplôme et (CNI ou Acte).
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center w-full p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 italic text-sm">
                <Info className="w-4 h-4 mr-2" />
                Terminez les étapes précédentes dans l'ordre.
              </div>
            )}
          </div>
        </form>
      ) : null}
    </Card>
  )
}