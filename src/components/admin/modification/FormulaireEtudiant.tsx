"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, User as UserIcon, X, Fingerprint, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Nationalite } from "@/lib/db";

// 1. Définition précise de la structure des données du formulaire
interface FormDataState {
  id: number | string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexeId: number | string;
  cinNumero: string;
  cinLieu: string;
  dateCin: string;
  baccNumero: string;
  baccAnnee: number | string;
  proposEmail: string;
  proposTelephone: string;
  proposAdresse: string;
  nationaliteId: number | string;
  baccSerie: string; // <-- AJOUTER CECI
  nomPere: string; // <-- AJOUTÉ
  nomMere: string; // <-- AJOUTÉ
}

interface FormulaireEtudiantProps {
  idEtudiant: number | string;
  nationalites: Nationalite[];
  onClose: () => void;
  onSuccess: () => void;
}

// 2. Interface pour le sous-composant CompactField
interface CompactFieldProps {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}

export default function FormulaireEtudiant({ idEtudiant, nationalites, onClose, onSuccess }: FormulaireEtudiantProps) {
  const [loading, setLoading] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [formData, setFormData] = useState<FormDataState | null>(null);

  const toIsoString = (dateStr: string | null) => {
    if (!dateStr || dateStr === "") return null;
    return `${dateStr}T00:00:00+00:00`;
  };

  useEffect(() => {
    const fetchEtudiant = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/etudiants/modifier/formulaire?id=${idEtudiant}`);
        const result = await response.json();
        if (result.status === "success") {
          const d = result.data;
          
          setFormData({
            ...d,
            nationaliteId: d.nationaliteId ,
            baccSerie: d.baccSerie || "", // <
            dateNaissance: d.dateNaissance?.split('T')[0] || "",
            dateCin: d.dateCin?.split('T')[0] || "",
          });
        } else {
          toast.error(result.message || "Erreur de récupération");
        }
      } catch (e) {
        toast.error("Erreur technique lors du chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchEtudiant();
  }, [idEtudiant]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setLoadingSave(true);
    try {
      const dataToSend = {
        ...formData,
        nationaliteId: Number(formData.nationaliteId),
        id: Number(formData.id),
        nom: formData.nom.toUpperCase(),
        dateNaissance: toIsoString(formData.dateNaissance),
        dateCin: toIsoString(formData.dateCin),
        sexeId: Number(formData.sexeId),
        baccAnnee: Number(formData.baccAnnee),
      };

      const response = await fetch('/api/etudiants/modifier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();
      if (response.ok && result.status === 'success') {
        toast.success('Modifications enregistrées !');
        onSuccess();
      } else {
        throw new Error(result.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingSave(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (!formData) return null;

  return (
    <Card className="border-none shadow-lg animate-in fade-in slide-in-from-bottom-2">
      <CardHeader className="bg-blue-900 text-white py-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md flex items-center gap-2">
            <UserIcon size={18} /> Dossier N° {idEtudiant}
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-white hover:bg-blue-800" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 bg-white">
        
        <form onSubmit={handleUpdate} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Colonne 1 : État Civil */}
            <div className="space-y-4">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-1">Etat Civil</h4>
                <div className="bg-slate-50 p-2 rounded border">
                  <p className="text-xs text-slate-500">ID Étudiant</p>
                  <p className="font-medium">{formData.id}</p>
                </div>
              </div>
              <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-1">Etat Civil</h4>
              <CompactField label="Nom" value={formData.nom} onChange={(v: string) => setFormData({ ...formData, nom: v })} required />
              <CompactField label="Prénom" value={formData.prenom} onChange={(v: string) => setFormData({ ...formData, prenom: v })} />
              <CompactField label="Date de naissance" type="date" value={formData.dateNaissance} onChange={(v: string) => setFormData({ ...formData, dateNaissance: v })} required />
              <CompactField label="Lieu de naissance" value={formData.lieuNaissance} onChange={(v: string) => setFormData({ ...formData, lieuNaissance: v })} required />
              <CompactField label="Nom du Père" value={formData.nomPere} onChange={(v) => setFormData({ ...formData, nomPere: v })} />
              <CompactField label="Nom de la Mère" value={formData.nomMere} onChange={(v) => setFormData({ ...formData, nomMere: v })} />
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Sexe</Label>
                <select 
                  value={formData.sexeId} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, sexeId: e.target.value })} 
                  className="h-9 w-full text-sm border-slate-200 bg-slate-50/50 rounded-md px-3"
                >
                  <option value="1">Masculin</option>
                  <option value="2">Féminin</option>
                </select>
              </div>
            </div>

            {/* Colonne 2 : CIN & BACC */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-1 flex items-center gap-1">
                  <Fingerprint size={12} /> CIN
                </h4>
                <CompactField label="Numéro CIN" value={formData.cinNumero} onChange={(v: string) => setFormData({ ...formData, cinNumero: v })} required />
                <CompactField label="Lieu de délivrance" value={formData.cinLieu} onChange={(v: string) => setFormData({ ...formData, cinLieu: v })} required />
                <CompactField label="Date" type="date" value={formData.dateCin} onChange={(v: string) => setFormData({ ...formData, dateCin: v })} required />
              </div>
              <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-1 flex items-center gap-1">
                        <GraduationCap size={12} /> Baccalauréat
                    </h4>
                    <CompactField label="Numéro BACC" value={formData.baccNumero} onChange={(v: string) => setFormData({ ...formData, baccNumero: v })} required />
                    <CompactField label="Année" type="number" value={formData.baccAnnee} onChange={(v: string) => setFormData({ ...formData, baccAnnee: v })} required />
                    
                    {/* AJOUTER LE CHAMP SÉRIE ICI */}
                    <CompactField 
                        label="Série" 
                        value={formData.baccSerie} 
                        onChange={(v: string) => setFormData({ ...formData, baccSerie: v })} 
                        required 
                    />
                </div>
            </div>

            {/* Colonne 3 : Contact */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-1">Coordonnées</h4>
              <CompactField label="Email" type="email" value={formData.proposEmail} onChange={(v: string) => setFormData({ ...formData, proposEmail: v })} required />
              <CompactField label="Téléphone" value={formData.proposTelephone} onChange={(v: string) => setFormData({ ...formData, proposTelephone: v })} required />
              
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Adresse</Label>
                <textarea 
                  value={formData.proposAdresse ?? ""} 
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, proposAdresse: e.target.value })} 
                  className="min-h-[80px] w-full text-sm border-slate-200 bg-slate-50/50 rounded-md p-2" 
                  required 
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nationalité</Label>
                <select 
                  value={formData.nationaliteId ?? ""} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, nationaliteId: e.target.value })} 
                  className="h-9 w-full text-sm border-slate-200 bg-slate-50/50 rounded-md px-3"
                >
                  <option value="" disabled>Sélectionnez une nationalité</option>
                  {nationalites.map(n => (
                    <option key={n.id} value={n.id}>{n.nom}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={loadingSave} className="bg-green-700 hover:bg-green-800 px-12 h-11 text-white">
              {loadingSave ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />}
              Enregistrer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// 3. Typage strict du sous-composant CompactField
function CompactField({ label, value, onChange, type = "text", required = false }: CompactFieldProps) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
        {label} {required && "*"}
      </Label>
      <Input 
        type={type} 
        value={value ?? ""} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} 
        className="h-9 text-sm border-slate-200 bg-slate-50/50" 
        required={required} 
      />
    </div>
  );
}