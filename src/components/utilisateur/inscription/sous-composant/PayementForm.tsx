import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Formation, Niveau, PaiementData } from '@/lib/db';

interface PaiementFormProps {
  formData: PaiementData;
  updateData: (fields: Partial<PaiementData>) => void;
  parcoursType: string;
  niveaux: Niveau[];
  formations: Formation[];
  onBack: () => void;
  onNext: () => void;
}

const PaiementForm: React.FC<PaiementFormProps> = ({ 
  formData,
  updateData,
  parcoursType,
  niveaux,
  formations,
  onBack,
  onNext
}) => {
  
  // Fonction pour gérer les changements d'input dynamiquement
//  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const { id, type, value, checked } = e.target;

//   updateData({
//     [id]: type === "checkbox" ? checked : value,
//   });
// };
// On ajoute HTMLSelectElement à l'union de types
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

  return (
    <div className="space-y-6 mt-6">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground border-b pb-2">Bordereaux de versement</h3>
        <div className="flex flex-col gap-2">
          <label htmlFor="formation-select" className="text-sm font-medium text-gray-700">
            Type de formation
          </label>
          <select
            id="idFormation"
            name="idFormation"
            onChange={handleChange}
            defaultValue={formData.idFormation}
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">-- Choisir une formation --</option>
            {formations.map((f: Formation) => (
              // CORRECTION : value doit être f.id, pas formData.idFormation
              <option key={f.id} value={f.id}>
                {f.nom} ({f.typeFormation})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="niveau-select" className="text-sm font-medium text-gray-700">
            Niveau
          </label>
          <select
            id="idNiveau"
            name="idNiveau"
            onChange={handleChange}
            defaultValue={formData.idNiveau}
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">-- Choisir une niveau --</option>
            {niveaux.map((f: Niveau) => (
              // CORRECTION : value doit être f.id, pas formData.idFormation
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
                value={formData.refAdmin} 
                onChange={handleChange} 
                placeholder="Ex: PAY-ADMIN-XXXX" 
              />

            </div>
            <div className="space-y-2">
              <Label htmlFor="dateAdmin">Date du Paiement *</Label>
              <Input 
                id="dateAdmin" 
                type="date" 
                value={formData.dateAdmin} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="montantAdmin">Montant administratifs *</Label>
              <Input 
                id="montantAdmin" 
                type="number" 
                value={formData.montantAdmin} 
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
                value={formData.refPedag} 
                onChange={handleChange} 
                placeholder="Ex: PAY-PEDAG-XXXX" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="datePedag">Date du Paiement *</Label>
              <Input
                id="datePedag"
                type="date" 
                value={formData.datePedag} 
                onChange={handleChange} 
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="montantPedag">Montant pedagogique *</Label>
              <Input
                id="montantPedag"
                type="number"
                value={formData.montantPedag} 
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Section Écolage Conditionnelle */}
        {parcoursType === "Professionnel" && (
          <div className="mt-6 p-6 border-2 border-amber-200 rounded-xl bg-amber-50/30">
            <h4 className="text-lg font-bold text-amber-900 mb-4 flex items-center">
              <span className="bg-amber-100 p-2 rounded-full mr-2">💰</span>
              Formulaire d&lsquo;Écolage
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="montantEcolage">Montant Total *</Label>
                <Input 
                  id="montantEcolage" 
                  type="number" 
                  value={formData.montantEcolage} 
                  onChange={handleChange} 
                  placeholder="FCFA" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refEcolage">Référence Acompte *</Label>
                <Input 
                  id="refEcolage" 
                  value={formData.refEcolage} 
                  onChange={handleChange} 
                  placeholder="REF-ECO-XXXX" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateEcolage">Date Paiement *</Label>
                <Input 
                  id="dateEcolage" 
                  type="date" 
                  value={formData.dateEcolage} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
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