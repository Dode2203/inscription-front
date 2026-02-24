"use client";

import React, { useState, useEffect } from 'react';
import { Identite, Formation, Mention, Niveau, StatusEtudiant } from '@/lib/db';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

interface Props {
  identite: Identite;
  formation: Formation;
  niveaux: Niveau[];
  mentions: Mention[];
  formations: Formation[];
  onSave: (data: any) => void;
  loading: boolean;
}

const ChangerNiveauEtudiantForm: React.FC<Props> = ({ 
  identite, 
  formation, 
  niveaux, 
  mentions,
  formations, 
  onSave,
  loading
}) => {
  const [formData, setFormData] = useState({
  idFormation: formation.idFormation?.toString() || "",
  idNiveau: formation.idNiveau?.toString() || "none",
  idMention: formation.idMention?.toString() || "",
  idStatusEtudiant: formation.idStatusEtudiant?.toString() || "none",
  nouvelleNiveau: "false",
  annee: formation.annee||"", // <-- Nouveau champ
  remarque: formation.remarque || "none",
});

  const status: StatusEtudiant[] = [
    { id: 1, nom: "Passant" },
    { id: 2, nom: "Redoublant" },
    { id: 3, nom: "Suspendu" }
  ];
  const remarques = ["R","M"];
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ idEtudiant: identite.id, ...formData });
  };

  return (
    <div className="p-6 bg-card rounded-lg border shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Modifier le cursus de {identite.nom} {identite.prenom}</h3>
        <p className="text-sm text-muted-foreground">ID Étudiant : {identite.id}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section Formation */}
        <div className="space-y-2">
          <Label htmlFor="idFormation">Formation</Label>
          <Select 
            value={formData.idFormation} 
            onValueChange={(value) => handleSelectChange("idFormation", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une formation" />
            </SelectTrigger>
            <SelectContent>
              {formations.map((f) => (
                <SelectItem key={f.id} value={f.id?.toString() || ""}>
                  {f.nom || f.formation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Section Mention */}
        <div className="space-y-2">
          <Label htmlFor="idMention">Mention</Label>
          <Select 
            value={formData.idMention} 
            onValueChange={(value) => handleSelectChange("idMention", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une mention" />
            </SelectTrigger>
            <SelectContent>
              {mentions.map((m) => (
                <SelectItem key={m.id} value={m.id?.toString() || ""}>
                  {m.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Section Niveau */}
        <div className="space-y-2">
          <Label htmlFor="idNiveau">Niveau (Grade)</Label>
          <Select 
            value={formData.idNiveau} 
            onValueChange={(value) => handleSelectChange("idNiveau", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun</SelectItem>

              {niveaux
                .filter((n: Niveau) =>
                  Number(formData.idFormation) === n.type 
                )
                .map((n: Niveau) => (
                  <SelectItem key={n.id} value={n.id?.toString() || ""}>
                    {n.nom} ({n.grade})
                  </SelectItem>
                ))}
                
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="idStatusEtudiant">Status</Label>
          <Select 
            value={formData.idStatusEtudiant} 
            onValueChange={(value) => handleSelectChange("idStatusEtudiant", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="none">Aucun</SelectItem>
              {status.map((n) => (
                <SelectItem key={n.id} value={n.id?.toString() || ""}>
                  {n.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Section Nouvelle Niveau */}
        <div className="space-y-2">
          <Label htmlFor="nouvelleNiveau">Nouvelle Niveau ?</Label>
          <Select
            value={formData.nouvelleNiveau}
            onValueChange={(value) => handleSelectChange("nouvelleNiveau", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Oui</SelectItem>
              <SelectItem value="false">Non</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {formData.nouvelleNiveau === "true" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
            <Label htmlFor="annee">Année Universitaire</Label>
            <Input
              id="annee"
              placeholder="Annee"
              value={formData.annee}
              onChange={(e) => handleSelectChange("annee", e.target.value)}
              required={formData.nouvelleNiveau === "true"}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="remarque">Remarque</Label>
          <Select 
            value={formData.remarque} 
            onValueChange={(value) => handleSelectChange("remarque", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une remarque" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="none">Aucun</SelectItem>
              {remarques.map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>


        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangerNiveauEtudiantForm;