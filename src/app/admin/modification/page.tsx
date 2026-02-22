"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, EtudiantRecherche } from "@/lib/db";
import Header from "@/components/static/Header";
import Menu from "@/components/static/Menu";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import FormulaireEtudiant from "@/components/admin/modification/FormulaireEtudiant";
import { sortStudentsAlphabetically } from "@/lib/utils";
import { useInitialData } from "@/context/DataContext";

function ModificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Utilisation sécurisée car enveloppée dans Suspense
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [nomSearch, setNomSearch] = useState("");
  const [prenomSearch, setPrenomSearch] = useState("");
  const [etudiantsTrouves, setEtudiantsTrouves] = useState<EtudiantRecherche[]>([]);
  const [loadingRecherche, setLoadingRecherche] = useState(false);
  const [afficherListe, setAfficherListe] = useState(false);
  const { nationalites } = useInitialData();

  const [selectedEtudiantId, setSelectedEtudiantId] = useState<number | string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Récupération des valeurs depuis l'URL
        const n = searchParams.get("nom");
        const p = searchParams.get("prenom");
        if (n) setNomSearch(n);
        if (p) setPrenomSearch(p);

        const authRes = await fetch(`/api/auth/me`);

        if (!authRes.ok) { 
          router.push('/login'); 
          return; 
        }

        const data = await authRes.json();
        setUser(data.user);

      } catch { 
        router.push('/login'); 
      } finally { 
        setLoading(false); 
      }
    };
    init();
  }, [router, searchParams]);

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
        const sortedResults = sortStudentsAlphabetically<EtudiantRecherche>(response.data);
        setEtudiantsTrouves(sortedResults);
        setAfficherListe(true);
      } else {
        toast.error("Aucun résultat");
        setEtudiantsTrouves([]);
        setAfficherListe(false);
      }
    } finally { 
        setLoadingRecherche(false); 
    }
  };

  if (loading) return (
     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
  );

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <Header user={user} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Menu user={user} activeTab="" setActiveTab={() => { }} />

        {/* BARRE DE RECHERCHE */}
        <div className="relative z-20 mb-6">
          <div className="bg-white p-2 rounded-lg shadow-sm border flex items-center gap-3">
            <Search size={18} className="text-slate-400 ml-2" />
            <input 
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm h-9" 
                placeholder="Nom..." 
                value={nomSearch} 
                onChange={(e) => setNomSearch(e.target.value)} 
            />
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
                <div 
                    key={e.id} 
                    onClick={() => { setSelectedEtudiantId(e.id); setAfficherListe(false); }} 
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b text-sm font-medium"
                >
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
            }}
          />
        )}
      </div>
    </main>
  );
}

// 2. Exportez la page principale enveloppée dans un Suspense Boundary
export default function ModificationPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader2 className="animate-spin h-10 w-10 text-slate-300" />
        </div>
    }>
      <ModificationContent />
    </Suspense>
  );
}