"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Users, Filter, Loader2, FileSpreadsheet } from "lucide-react";
import { getInitialData } from "@/lib/appConfig";
import { Mention, Niveau } from "@/lib/db";
import { toast } from "sonner";

interface EtudiantFiltre {
  id: number;
  nom: string;
  prenom: string;
  mention: string;
  mentionAbr: string;
  idMention: number;
  niveau: string;
  idNiveau: number;
}

export function FiltrageEtudiants() {
  const [loading, setLoading] = useState(false);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  
  // États pour les filtres
  const [selectedMention, setSelectedMention] = useState("");
  const [selectedNiveau, setSelectedNiveau] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [resultats, setResultats] = useState<EtudiantFiltre[]>([]);

  // 1. Charger les données des menus (Mentions et Niveaux)
  useEffect(() => {
    getInitialData().then((data) => {
      setMentions(data.mentions || []);
      setNiveaux(data.niveaux || []);
    });
  }, []);

  // 2. Fonction pour appeler l'API Symfony avec les filtres
  const fetchEtudiants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedMention) params.append("idMention", selectedMention);
      if (selectedNiveau) params.append("idNiveau", selectedNiveau);

      const response = await fetch(`http://localhost:8000/filtres/etudiant?${params.toString()}`);
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        setResultats(result.data);
      } else {
        setResultats([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }, [selectedMention, selectedNiveau]);

  // Déclencher la recherche dès qu'un filtre change
  useEffect(() => {
    fetchEtudiants();
  }, [fetchEtudiants]);

  // 3. Filtrage local par nom/prénom sur les résultats obtenus
  const filteredData = resultats.filter(et => 
    et.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
    et.prenom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Titre */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-900 rounded-lg">
          <Filter className="w-6 h-6 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-blue-900">Gestion des Étudiants</h1>
      </div>

      {/* Barre de Filtres */}
      <Card className="p-6 border-t-4 border-blue-900 shadow-md">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Sélection Mention */}
          <div className="space-y-2">
            <Label className="text-blue-900 font-bold">1. Choisir la Mention</Label>
            <select 
              className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-900 outline-none"
              value={selectedMention}
              onChange={(e) => setSelectedMention(e.target.value)}
            >
              <option value="">Toutes les mentions</option>
              {mentions.map(m => (
                <option key={m.id} value={m.id.toString()}>{m.nom}</option>
              ))}
            </select>
          </div>

          {/* Sélection Niveau */}
          <div className="space-y-2">
            <Label className="text-blue-900 font-bold">2. Choisir le Niveau</Label>
            <select 
              className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-900 outline-none"
              value={selectedNiveau}
              onChange={(e) => setSelectedNiveau(e.target.value)}
            >
              <option value="">Tous les niveaux</option>
              {niveaux.map(n => (
                <option key={n.id} value={n.id.toString()}>{n.nom}</option>
              ))}
            </select>
          </div>

          {/* Recherche rapide */}
          <div className="space-y-2">
            <Label className="text-blue-900 font-bold">3. Rechercher un nom</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                className="pl-9" 
                placeholder="Ex: Rakoto..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Table des résultats */}
      <Card className="overflow-hidden shadow-xl">
        <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-900" />
            <span className="font-bold text-blue-900">
              {filteredData.length} étudiant(s) affiché(s)
            </span>
          </div>
          {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-900" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-blue-900 text-white text-xs uppercase">
                <th className="px-6 py-4">Nom & Prénoms</th>
                <th className="px-6 py-4">Mention</th>
                <th className="px-6 py-4">Niveau</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? (
                filteredData.map((et) => (
                  <tr key={et.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {et.nom.toUpperCase()} {et.prenom}
                    </td>
                    <td className="px-6 py-4 text-sm">
                       <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
                         {et.mentionAbr}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold">
                        {et.niveau}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" className="hover:bg-blue-900 hover:text-white">
                        Détails
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic">
                    {loading ? "Chargement des données..." : "Aucun étudiant trouvé pour ces critères."}
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