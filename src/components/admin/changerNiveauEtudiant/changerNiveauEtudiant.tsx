"use client"

import { toast } from 'sonner';
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Loader2, CheckCircle, Info } from "lucide-react"

import { Formation, Identite, EtudiantRecherche, Niveau, Mention } from '@/lib/db'

import { useRouter } from "next/navigation"
import { getInitialData } from '@/lib/appConfig';
import ChangerNiveauEtudiantForm from './sousComposant/changerNiveauEtudiantForm'
export function ChangerNiveauEtudiant() {
  const router = useRouter();
  const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';

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
  const [mentions, setMentions] = useState<Mention[]>([]);
  const[loadingSauvegarde, setLoadingSauvegarde] = useState(false);

  const resetForm = () => {
    setEtudiantsTrouves([]);
    setIdentite(null);
    setFormation(null);
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

      // 2. On trie le tableau (qui est maintenant garanti d'exister, même s'il est vide)
      const sortedStudents = [...etudiants].sort((a: EtudiantRecherche, b: EtudiantRecherche) => {
        const nomA = a.nom ?? "";
        const nomB = b.nom ?? "";
        const compareNom = nomA.localeCompare(nomB);
        if (compareNom !== 0) return compareNom;
        return (a.prenom ?? "").localeCompare(b.prenom ?? "");
      });

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
      const res = await fetch(`/api/etudiants/all?idEtudiant=${encodeURIComponent(idEtudiant)}`);
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
  const handleUpdateNiveau = async (data: any) => {
  // 1. Préparation de l'URL
  const url = 'api/etudiant/changerNiveau';

  try {
    // 2. Appel Fetch
    // console.log(data)
    setLoadingSauvegarde(true);
    const dataToSend = {
                idEtudiant: Number(data.idEtudiant), 
                idNiveau: Number(data.idNiveau),
                idMention: Number(data.idMention),
                idFormation: Number(data.idFormation),
                idStatus: Number(data.idStatusEtudiant),
                nouvelleNiveau: data.nouvelleNiveau === "true"
            };
      const response = await fetch("/api/etudiants/changerNiveauEtudiant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });
      if (response.status === 401 || response.status === 403) {
        toast.error("Session expirée. Redirection...");
        await fetch("/api/auth/logout", { method: "POST" });
        router.push(login);
        return;
      }
    // 3. Vérification du statut HTTP (200-299)
    if (!response.ok) {
      const errorData = await response.json();
        
      const erreurMessage = errorData.error||errorData.message || "Une erreur inattendue s'est produite.";
      toast.error(erreurMessage);
      const errorAudio = new Audio("/sounds/error-011-352286.mp3");
      errorAudio.play();
      // throw new Error(errorData.message||errorData.error || `Erreur serveur : ${response.status}`);
    }

    // 4. Lecture du résultat
    const result = await response.json();
    
    // Succès !
    // console.log("Mise à jour réussie :", result);
    // alert("Le niveau a été modifié avec succès.");
    const successAudio = new Audio("/sounds/success-221935.mp3");
    successAudio.play();
    toast.success("Niveau modifié avec succès pour " + identite?.nom + " " + identite?.prenom);

    // Optionnel : Rafraîchir les données ici pour que l'interface soit à jour
    // window.location.reload(); 

  } catch (error: any) {
    // 5. Gestion des erreurs (Réseau ou API)
    const erreurMessage = error.error||error.message || "Une erreur inattendue s'est produite.";
    toast.error(erreurMessage);
    const errorAudio = new Audio("/sounds/error-011-352286.mp3");
    errorAudio.play();
    
  } finally {
    setLoadingSauvegarde(false);
  }
};

  useEffect(() => {
    getInitialData().then((data) => {
      setNiveaux(data.niveaux);
      setFormations(data.formations);
      setMentions(data.mentions);
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
        <ChangerNiveauEtudiantForm 
        identite={identite}
        formation={formation}
        niveaux={niveaux}       // Doit être peuplé par une API
        formations={formations} // Doit être peuplé par une API
        mentions={mentions}
        loading={loadingSauvegarde}
        onSave={handleUpdateNiveau}
      />
      ) : null}
    </Card>
  )
}