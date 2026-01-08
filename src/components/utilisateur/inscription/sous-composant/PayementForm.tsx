import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PaiementData } from '@/lib/db';

interface PaiementFormProps {
  formData: PaiementData;
  updateData: (fields: Partial<PaiementData>) => void;
  parcoursType: string;
  onBack: () => void;
  onNext: () => void;
}

const PaiementForm: React.FC<PaiementFormProps> = ({ 
  formData,
  updateData,
  parcoursType,
  onBack,
  onNext
}) => {
  
  // Fonction pour gérer les changements d'input dynamiquement
 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { id, type, value, checked } = e.target;

  updateData({
    [id]: type === "checkbox" ? checked : value,
  });
};

  return (
    <div className="space-y-6 mt-6">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground border-b pb-2">Bordereaux de versement</h3>
        
       <div className="space-y-2">
              <Label htmlFor="passant">Passant *</Label>
              <Input 
                id="passant" 
                type="checkbox"
                checked={formData.passant ?? false}
                onChange={handleChange} 
              />
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