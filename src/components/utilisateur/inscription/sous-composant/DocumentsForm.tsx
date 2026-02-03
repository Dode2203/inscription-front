import React from 'react';
import { CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const LISTE_DOCUMENTS = [
  { id: "photo", label: "Photo d'identité (x3)" },
  { id: "acte", label: "Extrait d'acte de naissance" },
  // AJOUT COMMENTAIRE : Ce document est maintenant considéré comme facultatif dans la validation
  { id: "diplome", label: "Copie certifiée du diplôme (M2/MVR uniquement)" },
  { id: "cni", label: "Photocopie de la CNI / Passeport" },
  { id: "exonere", label: "Exonération Personnel / Professeur" },
];

interface DocumentsFormProps {
  validatedDocs: Record<string, boolean>;
  onToggleDoc: (docId: string) => void;
  isExonere: boolean;
  setIsExonere: (val: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

const DocumentsForm: React.FC<DocumentsFormProps> = ({ 
  validatedDocs, onToggleDoc, isExonere, setIsExonere, onBack, onNext 
}) => {

  const handleToggle = (id: string) => {
    // 1. Logique Exonération
    if (id === "exonere") {
      setIsExonere(!isExonere);
      onToggleDoc("exonere");
      return;
    }

    // 2. Logique d'exclusion mutuelle CNI / ACTE
    if (id === "cni" && !validatedDocs["cni"] && validatedDocs["acte"]) {
      onToggleDoc("acte"); 
    } else if (id === "acte" && !validatedDocs["acte"] && validatedDocs["cni"]) {
      onToggleDoc("cni"); 
    }
    
    onToggleDoc(id);
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="bg-white p-2 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-900" />
          <h3 className="text-lg font-semibold text-foreground">Validation des Documents</h3>
        </div>

        <div className="grid gap-3">
          {LISTE_DOCUMENTS.map((doc) => {
            const isValidated = !!validatedDocs[doc.id];
            const isExo = doc.id === "exonere";
            
            // AJOUT COMMENTAIRE : On identifie si c'est le diplôme pour changer la couleur ou le badge si besoin
            const isDiplome = doc.id === "diplome";

            return (
              <div
                key={doc.id}
                onClick={() => handleToggle(doc.id)}
                className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                  isValidated 
                    ? isExo ? "bg-amber-50 border-amber-500 ring-1 ring-amber-500" : "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500" 
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isValidated 
                      ? isExo ? "bg-amber-600 border-amber-600" : "bg-emerald-600 border-emerald-600" 
                      : "bg-slate-50 border-slate-300"
                  }`}>
                    {isValidated && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-medium ${isValidated ? (isExo ? "text-amber-900" : "text-emerald-900") : "text-slate-700"}`}>
                      {doc.label}
                    </span>
                    {/* AJOUT COMMENTAIRE : Petit texte pour indiquer que le diplôme est optionnel pour certains */}
                    {isDiplome && !isValidated && <span className="text-[10px] text-slate-400">Optionnel selon le niveau</span>}
                  </div>
                </div>
                <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                  isValidated ? (isExo ? "bg-amber-200 text-amber-800" : "bg-emerald-200 text-emerald-800") : "bg-slate-100 text-slate-400"
                }`}>
                  {isValidated ? (isExo ? "Activé" : "Reçu") : "Manquant"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 mt-2 italic">* Note: CNI et Acte de naissance sont exclusifs.</p>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button type="button" variant="outline" onClick={onBack}>Précédent</Button>
        <Button type="button" onClick={onNext} className="bg-blue-900 text-white">
          Suivant <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default DocumentsForm;