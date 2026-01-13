"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Users, Filter, Loader2, FileSpreadsheet } from "lucide-react";
import { getInitialData } from "@/lib/appConfig";
import { Formation, Niveau } from "@/lib/db";
import { toast } from "sonner";

interface EtudiantFiltre {
  id: string;
  nom: string;
  prenom: string;
  formation: string;
  niveau: string;
  matricule: string;
}

export function FiltrageEtudiants() {
  const [loading, setLoading] = useState(false);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  
  const [selectedFormation, setSelectedFormation] = useState("");
  const [selectedNiveau, setSelectedNiveau] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [resultats, setResultats] = useState<EtudiantFiltre[]>([]);

  // 1. Charger les données initiales
  useEffect(() => {
    getInitialData().then((data) => {
      setFormations(data.formations);
      setNiveaux(data.niveaux);
    });
  }, []);

  // 2. Fonction de filtrage isolée pour être réutilisée
  const handleFilter = useCallback(async () => {
    // On ne lance le fetch que si au moins un critère est sélectionné
    if (!selectedFormation && !selectedNiveau) {
      setResultats([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedFormation) params.append("formation", selectedFormation);
      if (selectedNiveau) params.append("niveau", selectedNiveau);

      const res = await fetch(`/api/etudiants/filter?${params.toString()}`);
      const data = await res.json();
      
      if (res.ok) {
        setResultats(data.data);
      } else {
        toast.error("Erreur lors de la récupération des données");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur technique de connexion");
    } finally {
      setLoading(false);
    }
  }, [selectedFormation, selectedNiveau]);

  // 3. AUTOMATISATION : Déclenche le fetch quand les sélections changent
  useEffect(() => {
    handleFilter();
  }, [selectedFormation, selectedNiveau, handleFilter]);

  // Filtrage local supplémentaire pour la barre de recherche rapide (optionnel)
  const resultatsFiltrés = resultats.filter(et => 
    et.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
    et.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    et.matricule.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-900 rounded-lg">
          <Filter className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Filtrage des Étudiants</h1>
          <p className="text-slate-500 text-sm">Listes mises à jour automatiquement</p>
        </div>
      </div>

      <Card className="p-6 border-t-4 border-blue-900 shadow-md">
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label className="text-blue-900 font-semibold">Parcours / Formation</Label>
            <select 
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-blue-900 outline-none transition-all"
              value={selectedFormation}
              onChange={(e) => setSelectedFormation(e.target.value)}
            >
              <option value="">Toutes les formations</option>
              {formations.map(f => <option key={f.id} value={f.id.toString()}>{f.nom}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-blue-900 font-semibold">Niveau</Label>
            <select 
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-blue-900 outline-none transition-all"
              value={selectedNiveau}
              onChange={(e) => setSelectedNiveau(e.target.value)}
            >
              <option value="">Tous les niveaux</option>
              {niveaux.map(n => <option key={n.id} value={n.id.toString()}>{n.nom}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-blue-900 font-semibold">Recherche rapide (Nom/Matricule)</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                className="pl-9" 
                placeholder="Filtrer dans les résultats..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        {loading && (
          <div className="flex items-center gap-2 mt-4 text-xs text-blue-600 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Mise à jour de la liste...
          </div>
        )}
      </Card>

      <Card className="overflow-hidden border-none shadow-lg">
        <div className="bg-slate-100 px-6 py-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-900" />
            <span className="font-semibold text-blue-900">{resultatsFiltrés.length} Étudiants</span>
          </div>
          {resultatsFiltrés.length > 0 && (
            <Button variant="outline" size="sm" className="text-green-700 border-green-200 hover:bg-green-50">
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Exporter
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase text-xs font-bold">
                <th className="px-6 py-4">Matricule</th>
                <th className="px-6 py-4">Nom & Prénoms</th>
                <th className="px-6 py-4">Formation</th>
                <th className="px-6 py-4">Niveau</th>
                <th className="px-6 py-4 text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {resultatsFiltrés.length > 0 ? (
                resultatsFiltrés.map((etudiant) => (
                  <tr key={etudiant.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-blue-700 font-bold">{etudiant.matricule}</td>
                    <td className="px-6 py-4 font-medium">{etudiant.nom} {etudiant.prenom}</td>
                    <td className="px-6 py-4 text-xs">{etudiant.formation}</td>
                    <td className="px-6 py-4">
                       <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                        {etudiant.niveau}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-blue-900 hover:bg-blue-100">
                        Voir
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    {loading ? "Chargement..." : "Aucun étudiant trouvé pour cette sélection."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}