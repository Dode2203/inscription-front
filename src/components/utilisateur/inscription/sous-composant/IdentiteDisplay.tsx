import React from 'react';
import { Button } from "@/components/ui/button"; // Ajustez selon votre bibliothèque
import { Identite } from '@/lib/db';
import { formatDate } from '@/lib/utils';
// Définition des props du composant
interface IdentiteDisplayProps {
  identite: Identite;
  onNext: () => void;
}
interface DetailItemProps {
  label: string;
  value?: string | number | null; // Le '?' et 'null' permettent de gérer les données vides
}


const IdentiteDisplay = ({ identite,  onNext }: IdentiteDisplayProps) => {
  return (
    <div className="space-y-6 mt-6">
      {/* Message de succès */}

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
      <div className="flex justify-end">
        <Button onClick={onNext}>Suivant</Button>
      </div>
    </div>
  );
};

// Petit composant utilitaire pour uniformiser l'affichage des labels/valeurs
const DetailItem = ({ label, value }:DetailItemProps) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="p-2 bg-gray-50 rounded-md border border-gray-100 text-foreground">
      {value || "-"}
    </p>
  </div>
);

export default IdentiteDisplay;