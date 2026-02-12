import React, { useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { Formation, Niveau, PaiementData } from '@/lib/db';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { getByIdNiveau } from '@/lib/utils/grade-utils';
import { useSelectedLayoutSegment } from 'next/navigation';

interface PaiementFormProps {
  formData: PaiementData;
  updateData: (fields: Partial<PaiementData>) => void;
  parcoursType: string;
  formation: Formation;
  niveaux: Niveau[];
  formations: Formation[];
  isExonere: boolean;
  onBack: () => void;
  onNext: () => void;
}

const PaiementForm: React.FC<PaiementFormProps> = ({
  formData, updateData, formation, niveaux, formations, isExonere
}) => {

  const niveauActuel = getByIdNiveau(niveaux, formation.idNiveau);
  const niveauActuelGrade = niveauActuel?.grade ?? 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const id = target.id;
    const value = target.value;
    updateData({ [id]: value });
  };

  useEffect(() => {
    if (!formData.idFormation && formation.idFormation) {
      updateData({ idFormation: formation.idFormation , idNiveau: formation.idNiveau});
    }
  }, [formation.idFormation, updateData, formData.idFormation]);
  
  useEffect(() => {
    const montantDefautPedag = isExonere ? "0" : "50000";
    const montantDefaultAdmin = isExonere ? "2500" : "";
    updateData({ montantPedag: montantDefautPedag, montantAdmin: montantDefaultAdmin });
  }, [isExonere]);

    useEffect(() => {
    const niveauActuel = getByIdNiveau(niveaux, Number(formData.idNiveau));
    let montantAdmin = "61875";
    const grade = niveauActuel?.grade ?? 0;
    if (grade < 4) {
      montantAdmin = "41000";
    }

    const montantDefaultAdmin = isExonere ? "2500" : montantAdmin;
    updateData({ montantAdmin: montantDefaultAdmin });
  }, [formData.idNiveau]);
    useEffect(() => {
    let montantEcolage = "525000";
    if (formData.idFormation == 3) {
      montantEcolage = "900000";
    }
    updateData({ montantEcolage : montantEcolage });
  }, [formData.idFormation]);
  
  return (
    <div className="space-y-6 mt-6">
      <h3 className="text-lg font-semibold text-foreground border-b pb-2">Bordereaux de versement</h3>

      {isExonere && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm italic">
          <Info className="w-4 h-4" /> Mode Exonération : Saisissez les montants réduits.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="idFormation">Type de formation</Label>
          <select id="idFormation" onChange={handleChange} value={formData.idFormation || ""} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm">
            <option value="" disabled>Sélectionnez une formation</option>
            {formations.filter(f => [1, 2, 3, 4].includes(Number(f.id))).map((f: Formation) => (
              <option key={f.id} value={f.id}>{f.nom}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="idNiveau">Niveau actuel</Label>
          <select id="idNiveau" value={formData.idNiveau || ""} onChange={handleChange} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm">
            <option value=""  disabled>Sélectionnez un niveau</option>
            {niveaux.filter((n: Niveau) => Number(formData.idFormation) === n.type && (n.grade ?? 0) >= niveauActuelGrade).slice(0, 2).map((f: Niveau) => (
              <option key={f.id} value={f.id}>{f.nom} ({f.grade})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className={`space-y-4 p-4 border rounded-lg ${isExonere ? 'border-amber-300 bg-amber-50/20' : 'bg-card'}`}>
          <h4 className="font-medium text-blue-900">Droits Administratifs</h4>
          <div className="space-y-2">
            <Label htmlFor="refAdmin">Référence *</Label>
            <Input id="refAdmin" value={formData.refAdmin || ""} onChange={handleChange} placeholder="PAY-ADMIN-XXXX" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateAdmin">Date *</Label>
            <Input id="dateAdmin" type="date" value={formData.dateAdmin || ""} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="montantAdmin">Montant *</Label>
            <Input id="montantAdmin" type="number" value={formData.montantAdmin || ""} onChange={handleChange} />
          </div>
        </div>

        <div className={`space-y-4 p-4 border rounded-lg ${isExonere ? 'border-amber-300 bg-amber-50/20' : 'bg-card'}`}>
          <h4 className="font-medium text-blue-900">Droits Pédagogiques</h4>
          <div className="space-y-2">
            <Label htmlFor="refPedag">Référence *</Label>
            <Input id="refPedag" value={formData.refPedag || ""} onChange={handleChange} placeholder="PAY-PEDAG-XXXX" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="datePedag">Date *</Label>
            <Input id="datePedag" type="date" value={formData.datePedag || ""} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="montantPedag">Montant *</Label>
            <Input id="montantPedag" type="number" value={formData.montantPedag || ""} onChange={handleChange} />
          </div>
        </div>
      </div>

      {(formData.idFormation != 1) && (
        <div className={`mt-6 p-6 border-2 rounded-xl ${isExonere ? 'border-amber-300 bg-amber-50/40' : 'border-amber-200 bg-amber-50/30'}`}>
          <h4 className="text-lg font-bold text-amber-900 mb-4 flex items-center">
            <span className="bg-amber-100 p-2 rounded-full mr-2">💰</span> Formulaire d'Écolage
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="montantEcolage">Montant Total *</Label>
              <Input id="montantEcolage" type="number" value={formData.montantEcolage || ""} onChange={handleChange} placeholder="Ar" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refEcolage">Référence Acompte *</Label>
              <Input id="refEcolage" value={formData.refEcolage || ""} onChange={handleChange} placeholder="REF-ECO-XXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateEcolage">Date Paiement *</Label>
              <Input id="dateEcolage" type="date" value={formData.dateEcolage || ""} onChange={handleChange} />
            </div>
          </div>
        </div>
      )}

      {/* Groupement Boursier */}
      <div className="mt-6 p-4 bg-slate-50 border rounded-xl max-w-sm">
        <Label className="text-slate-600 font-bold mb-3 block">L'étudiant est-il boursier ? *</Label>
        <Select
          value={formData.estBoursier?.toString() ?? "0"}
          onValueChange={(val: string) => updateData({ estBoursier: parseInt(val) })}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Sélectionnez..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Non</SelectItem>
            <SelectItem value="1">Oui</SelectItem>
          </SelectContent>
        </Select>
      </div>


      {/* Les boutons Précédent/Suivant ont été supprimés ici car ils sont gérés par le parent InscriptionForm */}
    </div>
  );
};

export default PaiementForm;