"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Users, Filter, Loader2, FileText, Hash } from "lucide-react";
import { getInitialData } from "@/lib/appConfig";
import { Mention, Niveau } from "@/lib/db";
import { toast } from "sonner";
import { generateStudentPDF } from "@/lib/generateliste";

interface EtudiantFiltre {
  id: number;
  matricule?: string;
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

  const [selectedMention, setSelectedMention] = useState("");
  const [selectedNiveau, setSelectedNiveau] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [resultats, setResultats] = useState<EtudiantFiltre[]>([]);

  // Chargement des mentions/niveaux pour les menus déroulants
  useEffect(() => {
    getInitialData().then((data) => {
      setMentions(data.mentions || []);
      setNiveaux(data.niveaux || []);
    });
  }, []);

  const fetchEtudiants = useCallback(async () => {
    setLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!baseUrl) {
      toast.error("URL Backend manquante dans .env");
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (selectedMention) params.append("idMention", selectedMention);
      if (selectedNiveau) params.append("idNiveau", selectedNiveau);

      const response = await fetch(`${baseUrl}/filtres/etudiant?${params.toString()}`);

      if (!response.ok) throw new Error("Erreur réseau");

      const result = await response.json();
      if (result.status === 'success') {
        setResultats(result.data);
      } else {
        setResultats([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Impossible de joindre le serveur Symfony");
    } finally {
      setLoading(false);
    }
  }, [selectedMention, selectedNiveau]);

  useEffect(() => {
    fetchEtudiants();
  }, [fetchEtudiants]);

  // Filtrage local pour la recherche
  const filteredData = resultats.filter(et =>
    et.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    et.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (et.matricule && et.matricule.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleExportPDF = () => {
    const mentionLabel = mentions.find(m => m.id.toString() === selectedMention)?.nom || "";
    const niveauLabel = niveaux.find(n => n.id.toString() === selectedNiveau)?.nom || "";
    generateStudentPDF(filteredData, mentionLabel, niveauLabel);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-900 rounded-lg">
          <Filter className="w-6 h-6 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-blue-900">Gestion des Étudiants</h1>
      </div>

      <Card className="p-6 border-t-4 border-blue-900 shadow-md">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-blue-900 font-bold">1. Mention</Label>
            <select
              className="w-full h-10 px-3 rounded-md border border-slate-300 outline-none focus:ring-2 focus:ring-blue-900"
              value={selectedMention}
              onChange={(e) => setSelectedMention(e.target.value)}
            >
              <option value="">Toutes les mentions</option>
              {mentions.map(m => <option key={m.id} value={m.id.toString()}>{m.nom}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-blue-900 font-bold">2. Niveau</Label>
            <select
              className="w-full h-10 px-3 rounded-md border border-slate-300 outline-none focus:ring-2 focus:ring-blue-900"
              value={selectedNiveau}
              onChange={(e) => setSelectedNiveau(e.target.value)}
            >
              <option value="">Tous les niveaux</option>
              {niveaux.map(n => <option key={n.id} value={n.id.toString()}>{n.nom}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-blue-900 font-bold">3. Recherche par nom</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Ex: RAKOTO..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden shadow-xl">
        <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-900" />
              <span className="font-bold text-blue-900">{filteredData.length} Étudiants</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white flex gap-2"
            >
              <FileText className="w-4 h-4" /> Imprimer Liste
            </Button>
            {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-900" />}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-blue-900 text-white text-xs uppercase">
                <th className="px-6 py-4 flex items-center gap-1"><Hash className="w-3 h-3" /> Matricule</th>
                <th className="px-6 py-4">Nom & Prénoms</th>
                <th className="px-6 py-4">Mention</th>
                <th className="px-6 py-4">Niveau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? (
                filteredData.map((et) => (
                  <tr key={et.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-800">{et.matricule || "-"}</td>
                    <td className="px-6 py-4 font-semibold">{et.nom.toUpperCase()} {et.prenom}</td>
                    <td className="px-6 py-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">{et.mentionAbr}</span></td>
                    <td className="px-6 py-4"><span className="bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold">{et.niveau}</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Aucun résultat.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}