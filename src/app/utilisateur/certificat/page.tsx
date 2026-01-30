"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, EtudiantRecherche } from "@/lib/db";
import Header from "@/components/static/Header";
import Menu from "@/components/static/Menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, FileText, X, Printer, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export default function CertificatPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // États recherche
  const [nomSearch, setNomSearch] = useState("");
  const [prenomSearch, setPrenomSearch] = useState("");
  const [loadingRecherche, setLoadingRecherche] = useState(false);
  const [etudiantsTrouves, setEtudiantsTrouves] = useState<EtudiantRecherche[]>([]);
  const [afficherListe, setAfficherListe] = useState(false);

  // État pour l'étudiant sélectionné
  const [selectedEtudiant, setSelectedEtudiant] = useState<any>(null);

  const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';

  // 1. Auth Check (Identique)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`/api/auth/me`);
        if (!response.ok) { router.push(login); return; }
        const data = await response.json();
        setUser(data.user);
      } catch (err) { router.push(login); }
      finally { setLoading(false); }
    };
    checkAuth();
  }, [login, router]);

  // 2. Recherche (Identique)
  const rechercheEtudiants = async () => {
    if (!nomSearch && !prenomSearch) return toast.error("Entrez au moins un nom");
    setLoadingRecherche(true);
    try {
      const res = await fetch("/api/etudiants/recherche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nomSearch, prenom: prenomSearch })
      });
      const response = await res.json();
      if (res.ok && response.data.length > 0) {
        setEtudiantsTrouves(response.data);
        setAfficherListe(true);
      } else { toast.error("Aucun résultat"); }
    } finally { setLoadingRecherche(false); }
  };

  // 3. Sélection (Récupération des données complètes)
  const selectEtudiant = async (id: number | string) => {
    setLoadingRecherche(true);
    try {
      const res = await fetch(`/api/etudiants?idEtudiant=${encodeURIComponent(id)}`);
      const response = await res.json();
      if (res.ok) {
        setSelectedEtudiant(response.data);
        setAfficherListe(false);
      }
    } finally { setLoadingRecherche(false); }
  };

  // 4. Action de génération (à lier au PDF plus tard)
  const handleGeneratePDF = () => {
    toast.info("Génération du certificat en cours...");
    // Ici on appellera la fonction PDF
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-900" /></div>;

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <Header user={user} />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Menu user={user} activeTab="" setActiveTab={() => {}} />

        <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-blue-900">Certificats de Scolarité</h1>
            <p className="text-slate-500 text-sm">Recherchez un étudiant pour générer son document officiel</p>
        </div>

        {/* BARRE DE RECHERCHE */}
        <div className="relative z-20 mb-10">
          <div className="bg-white p-3 rounded-xl shadow-md border flex items-center gap-3">
            <Search size={20} className="text-slate-400 ml-2" />
            <input className="flex-1 bg-transparent border-none focus:ring-0 text-md h-10" placeholder="Nom de l'étudiant..." value={nomSearch} onChange={(e)=>setNomSearch(e.target.value)} />
            <Button onClick={rechercheEtudiants} disabled={loadingRecherche} className="bg-blue-900 px-8">
              {loadingRecherche ? <Loader2 className="animate-spin" /> : "Rechercher"}
            </Button>
          </div>

          {afficherListe && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50">
              {etudiantsTrouves.map((e) => (
                <div key={e.id} onClick={() => selectEtudiant(e.id)} className="p-4 hover:bg-blue-50 cursor-pointer flex items-center justify-between border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold">{e.nom[0]}</div>
                    <div>
                        <p className="font-semibold text-slate-800">{e.nom} {e.prenom}</p>
                        <p className="text-xs text-slate-500">ID: {e.id}</p>
                    </div>
                  </div>
                  <FileText size={18} className="text-blue-600" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* APERÇU AVANT IMPRESSION */}
        {selectedEtudiant && (
          <Card className="border-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <CardHeader className="bg-slate-800 text-white flex-row justify-between items-center space-y-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText size={20} /> Aperçu des informations
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEtudiant(null)} className="hover:bg-slate-700 text-white">
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="p-8 bg-white">
              <div className="grid grid-cols-2 gap-8 mb-8 border-b pb-8">
                <div>
                  <h3 className="text-xs font-bold text-blue-600 uppercase mb-4 tracking-wider">Identité de l'étudiant</h3>
                  <p className="text-xl font-bold uppercase">{selectedEtudiant.identite.nom}</p>
                  <p className="text-lg text-slate-700">{selectedEtudiant.identite.prenom}</p>
                  <p className="text-sm text-slate-500 mt-2 italic">Né(e) le {new Date(selectedEtudiant.identite.dateNaissance).toLocaleDateString()} à {selectedEtudiant.identite.lieuNaissance}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-blue-600 uppercase mb-4 tracking-wider">Cursus Académique</h3>
                  <div className="space-y-1">
                    <p className="font-semibold">Niveau : <span className="text-blue-900">{selectedEtudiant.formation?.niveau}</span></p>
                    <p className="font-semibold">Mention : <span className="text-blue-900">{selectedEtudiant.formation?.mention}</span></p>
                    <p className="font-semibold">Parcours : <span className="text-blue-900">{selectedEtudiant.formation?.parcours || 'Standard'}</span></p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                    onClick={handleGeneratePDF}
                    className="bg-green-600 hover:bg-green-700 text-white px-10 h-12 gap-2 text-lg shadow-lg"
                >
                  <Printer size={20} />
                  Générer le Certificat (PDF)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}