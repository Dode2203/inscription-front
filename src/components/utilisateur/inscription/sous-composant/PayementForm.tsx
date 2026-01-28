import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Formation, Niveau, PaiementData } from '@/lib/db';
import { getNextGradeId, getByIdNiveau } from '@/lib/utils/grade-utils';

interface PaiementFormProps {
  formData: PaiementData;
  updateData: (fields: Partial<PaiementData>) => void;
  parcoursType: string;
  formation: Formation;
  niveaux: Niveau[];
  formations: Formation[];
  onBack: () => void;
  onNext: () => void;
}

const PaiementForm: React.FC<PaiementFormProps> = ({
  formData,
  updateData,
  parcoursType,
  formation,
  niveaux,
  formations,
  onBack,
  onNext
}) => {

  const [typeFormation, setTypeFormation] = useState(1);
  const niveauActuel = getByIdNiveau(niveaux, formation.idNiveau);
  const niveauActuelGrade = niveauActuel?.grade ?? 0;

  // Gestionnaire de changement générique
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const id = target.id;
    const value = target.value;

    const val = (target instanceof HTMLInputElement && target.type === "checkbox")
      ? target.checked
      : value;

    updateData({
      [id]: val,
    });
  };

  // Synchronisation des données initiales et calcul du niveau suivant
  useEffect(() => {
    if (formData.idFormation !== formation.idFormation) {
        updateData({ idFormation: formation.idFormation });
    }

    if (formation.idFormation != 1) {
      setTypeFormation(2);
    }

    if (formation.statusEtudiant === "Passant") {
      const nextNiveau = getNextGradeId(niveaux, typeFormation, niveauActuelGrade);
      if (nextNiveau && formData.idNiveau !== nextNiveau) {
        updateData({ idNiveau: nextNiveau });
      }
    }
  }, [formData.idFormation, formation.idFormation, typeFormation, niveaux, niveauActuelGrade, updateData]);

  return (
    <div className="space-y-6 mt-6">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground border-b pb-2">Bordereaux de versement</h3>
        
        {/* Sélecteur de Formation */}
        <div className="flex flex-col gap-2">
          <label htmlFor="idFormation" className="text-sm font-medium text-gray-700">
            Type de formation
          </label>
          <select
            id="idFormation"
            name="idFormation"
            onChange={handleChange}
            // Correction : Utilisation de || "" pour éviter l'erreur "value prop should not be null"
            value={formData.idFormation || ""} 
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="" disabled>Sélectionnez une formation</option>
            {formations.length > 0 ? (
              formations.map((f: Formation) => (
                <option key={f.id} value={f.id}>
                  {f.nom} ({f.typeFormation})
                </option>
              ))
            ) : (
              <option disabled>Aucune formation disponible</option>
            )}
          </select>
        </div>

        {/* Sélecteur de Niveau */}
        <div className="flex flex-col gap-2">
          <label htmlFor="idNiveau" className="text-sm font-medium text-gray-700">
            Niveau actuel 
          </label>
          <select
            id="idNiveau"
            name="idNiveau"
            // Correction : Utilisation de || "" pour éviter l'erreur "value prop should not be null"
            value={formData.idNiveau || ""} 
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="" disabled>Sélectionnez un niveau</option>
            {niveaux.map((f: Niveau) => (
              <option key={f.id} value={f.id}>
                {f.nom} ({f.grade})
              </option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Droits Administratifs */}
          <div className="space-y-4 p-4 border rounded-lg bg-card">
            <h4 className="font-medium text-blue-900">Droits Administratifs</h4>
            <div className="space-y-2">
              <Label htmlFor="refAdmin">Référence du Paiement *</Label>
              <Input 
                id="refAdmin" 
                value={formData.refAdmin || ""} 
                onChange={handleChange} 
                placeholder="Ex: PAY-ADMIN-XXXX" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateAdmin">Date du Paiement *</Label>
              <Input 
                id="dateAdmin" 
                type="date" 
                value={formData.dateAdmin || ""} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="montantAdmin">Montant administratifs *</Label>
              <Input 
                id="montantAdmin" 
                type="number" 
                value={formData.montantAdmin || ""} 
                onChange={handleChange} 
              />
            </div>
          </div>

          {/* Droits Pédagogiques */}
          <div className="space-y-4 p-4 border rounded-lg bg-card">
            <h4 className="font-medium text-blue-900">Droits Pédagogiques</h4>
            <div className="space-y-2">
              <Label htmlFor="refPedag">Référence du Paiement *</Label>
              <Input 
                id="refPedag" 
                value={formData.refPedag || ""} 
                onChange={handleChange} 
                placeholder="Ex: PAY-PEDAG-XXXX" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="datePedag">Date du Paiement *</Label>
              <Input
                id="datePedag"
                type="date" 
                value={formData.datePedag || ""} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="montantPedag">Montant pédagogique *</Label>
              <Input
                id="montantPedag"
                type="number"
                value={formData.montantPedag || ""} 
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Section Écolage Conditionnelle */}
        {parcoursType === "PROFESSIONNELLE" && (
          <div className="mt-6 p-6 border-2 border-amber-200 rounded-xl bg-amber-50/30">
            <h4 className="text-lg font-bold text-amber-900 mb-4 flex items-center">
              <span className="bg-amber-100 p-2 rounded-full mr-2">💰</span>
              Formulaire d'Écolage
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="montantEcolage">Montant Total *</Label>
                <Input 
                  id="montantEcolage" 
                  type="number" 
                  value={formData.montantEcolage || ""} 
                  onChange={handleChange} 
                  placeholder="Ar" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refEcolage">Référence Acompte *</Label>
                <Input 
                  id="refEcolage" 
                  value={formData.refEcolage || ""} 
                  onChange={handleChange} 
                  placeholder="REF-ECO-XXXX" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateEcolage">Date Paiement *</Label>
                <Input 
                  id="dateEcolage" 
                  type="date" 
                  value={formData.dateEcolage || ""} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
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

export default PaiementForm;