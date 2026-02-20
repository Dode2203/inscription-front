"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, EtudiantRecherche, Nationalite } from "@/lib/db";
import Header from "@/components/static/Header";
import Menu from "@/components/static/Menu";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getInitialData } from "@/lib/appConfig";
import FormulaireEtudiant from "@/components/admin/modification/FormulaireEtudiant";
import { sortStudentsAlphabetically } from "@/lib/utils";

export default function ModificationPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [nationalites, setNationalites] = useState<Nationalite[]>([]);

  // États recherche
  const [nomSearch, setNomSearch] = useState("");
  const [prenomSearch, setPrenomSearch] = useState("");
  const [etudiantsTrouves, setEtudiantsTrouves] = useState<EtudiantRecherche[]>([]);
  const [loadingRecherche, setLoadingRecherche] = useState(false);
  const [afficherListe, setAfficherListe] = useState(false);

  // État de sélection
  const [selectedEtudiantId, setSelectedEtudiantId] = useState<number | string | null>(null);
  const searchParams = useSearchParams(); // 2. Initialisez searchParams
  useEffect(() => {
    const init = async () => {
      try {
        // --- AJOUT : Récupération des valeurs depuis l'URL ---
        const n = searchParams.get("nom");
        const p = searchParams.get("prenom");
        if (n) setNomSearch(n);
        if (p) setPrenomSearch(p);
        // ----------------------------------------------------

        const [authRes, initialData] = await Promise.all([fetch(`/api/auth/me`), getInitialData()]);
        if (!authRes.ok) { router.push('/login'); return; }
        const data = await authRes.json();
        setUser(data.user);
        setNationalites(initialData.nationalites || []);

        // OPTIONNEL : Lancer la recherche automatiquement si les paramètres existent
        if (n || p) {
          // Vous pouvez appeler rechercheEtudiants() ici si nécessaire
        }

      } catch { router.push('/login'); }
      finally { setLoading(false); }
    };
    init();
  }, [router, searchParams]); // Ajoutez searchParams aux dépendances

  const rechercheEtudiants = async () => {
    if (!nomSearch && !prenomSearch) return toast.error("Entrez un critère");
    setLoadingRecherche(true);
    try {
      const res = await fetch("/api/etudiants/recherche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nomSearch, prenom: prenomSearch })
      });
      const response = await res.json();
      if (res.ok && response.data.length > 0) {
        // On trie les données reçues avant de les mettre dans le state
        const sortedResults = sortStudentsAlphabetically(response.data);
        setEtudiantsTrouves(sortedResults);
        setAfficherListe(true);
      } else {
        toast.error("Aucun résultat");
        setEtudiantsTrouves([]); // On vide la liste précédente
        setAfficherListe(false);
      }
    } finally { setLoadingRecherche(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-900" /></div>;

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <Header user={user} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Menu user={user} activeTab="" setActiveTab={() => { }} />

        {/* BARRE DE RECHERCHE */}
        <div className="relative z-20 mb-6">
          <div className="bg-white p-2 rounded-lg shadow-sm border flex items-center gap-3">
            <Search size={18} className="text-slate-400 ml-2" />
            <input className="flex-1 bg-transparent border-none focus:ring-0 text-sm h-9" placeholder="Nom..." value={nomSearch} onChange={(e) => setNomSearch(e.target.value)} />
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm h-9 border-l pl-3"
              placeholder="Prénom..."
              value={prenomSearch}
              onChange={(e) => setPrenomSearch(e.target.value)}
            />
            <Button onClick={rechercheEtudiants} disabled={loadingRecherche} size="sm" className="bg-blue-900">
              {loadingRecherche ? <Loader2 className="animate-spin" /> : "Rechercher"}
            </Button>
          </div>

          {afficherListe && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
              {etudiantsTrouves.map((e) => (
                <div key={e.id} onClick={() => { setSelectedEtudiantId(e.id); setAfficherListe(false); }} className="p-3 hover:bg-blue-50 cursor-pointer border-b text-sm font-medium">
                  {e.nom} {e.prenom}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AFFICHAGE CONDITIONNEL DU SOUS-COMPOSANT */}
        {selectedEtudiantId && (
          <FormulaireEtudiant
            idEtudiant={selectedEtudiantId}
            nationalites={nationalites}
            onClose={() => setSelectedEtudiantId(null)}
            onSuccess={() => {
              setSelectedEtudiantId(null);
              // setNomSearch("");
              // setPrenomSearch("");
            }}
          />
        )}
      </div>
    </main>
  );
}