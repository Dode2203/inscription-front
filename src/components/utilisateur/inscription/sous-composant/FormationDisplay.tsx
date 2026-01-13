import React from 'react';
import { Button } from "@/components/ui/button";
import { Formation } from '@/lib/db';
// Définition de l'interface pour les données de formation


interface FormationDisplayProps {
  data: Formation;
  onBack: () => void;
  onNext: () => void;
}

const FormationDisplay= ({ data, onBack, onNext }: FormationDisplayProps) => {
  return (
    <div className="space-y-6 mt-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Parcours Académique</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <DetailItem label="Formation" value={data.formation} />
          <DetailItem label="Type de Formation" value={data.formationType} />
          <DetailItem label="Niveau" value={data.niveau} />
          <DetailItem label="Mention / Filière" value={data.mention} />
          <DetailItem label="Statut Étudiant" value={data.statusEtudiant || 'Concour'} />
        </div>
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Précédent
        </Button>
        <Button onClick={onNext}>
          Suivant
        </Button>
      </div>
    </div>
  );
};

// Composant utilitaire pour l'affichage en lecture seule
const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="p-2 bg-gray-50 rounded-md border border-gray-100 text-foreground font-medium">
      {value}
    </p>
  </div>
);

export default FormationDisplay;