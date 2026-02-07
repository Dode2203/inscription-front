import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Identite } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Définition des props du composant
interface IdentiteDisplayProps {
  identite: Identite;
  onNext: () => void;
}
interface DetailItemProps {
  label: string;
  value?: string | number | null; // Le '?' et 'null' permettent de gérer les données vides
}


const IdentiteDisplay = ({ identite, onNext }: IdentiteDisplayProps) => {
  const [nomPere, setNomPere] = useState(identite.contact?.nomPere || "");
  const [nomMere, setNomMere] = useState(identite.contact?.nomMere || "");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!nomPere || !nomMere) {
      toast.error("Veuillez remplir le nom du père et de la mère.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/etudiants/inscription/details-personnels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idEtudiant: identite.id,
          nomPere,
          nomMere
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Une erreur est survenue lors de la validation.");
      }

      onNext();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Informations Personnelles */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Informations Personnelles</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <DetailItem label="Nom" value={identite.nom} />
          <DetailItem label="Prénoms" value={identite.prenom} />
          <DetailItem label="Date de Naissance" value={formatDate(identite.dateNaissance)} />
          <DetailItem label="Lieu de Naissance" value={identite.lieuNaissance} />
          <DetailItem label="Sexe" value={identite.sexe} />
          <DetailItem label="Nationalité" value={identite.nationalite?.nom || "Non précisée"} />
        </div>
      </div>

      {/* Détails Parents - Nouvelle Section Interactive */}
      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
        <h3 className="text-lg font-semibold text-blue-900">Détails Parents</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nomPere" className="text-sm font-semibold">Nom du Père</Label>
            <Input
              id="nomPere"
              placeholder="Entrez le nom du père"
              value={nomPere}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNomPere(e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nomMere" className="text-sm font-semibold">Nom de la Mère</Label>
            <Input
              id="nomMere"
              placeholder="Entrez le nom de la mère"
              value={nomMere}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNomMere(e.target.value)}
              className="bg-white"
            />
          </div>
        </div>
      </div>

      {/* Section Contact */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Contact</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <DetailItem label="Téléphone" value={identite.contact.telephone || "Non précisé"} />
          <DetailItem label="Email" value={identite.contact?.email} />
          <div className="md:col-span-2">
            <DetailItem label="Adresse" value={identite.contact?.adresse} />
          </div>
        </div>
      </div>

      {/* Bouton de navigation */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={handleNext}
          disabled={loading}
          className="px-8 bg-blue-900 hover:bg-blue-800"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi...</>
          ) : (
            "Suivant"
          )}
        </Button>
      </div>
    </div>
  );
};

// Petit composant utilitaire pour uniformiser l'affichage des labels/valeurs
const DetailItem = ({ label, value }: DetailItemProps) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="p-2 bg-white rounded-md border border-gray-100 text-foreground">
      {value || "-"}
    </p>
  </div>
);

export default IdentiteDisplay;