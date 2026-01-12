import React from 'react';
import { CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const LISTE_DOCUMENTS = [
  { id: "photo", label: "Photo d'identité (x3)" },
  { id: "acte", label: "Extrait d'acte de naissance" },
  { id: "diplome", label: "Copie certifiée du diplôme" },
  { id: "cni", label: "Photocopie de la CNI / Passeport" },
  { id: "medical", label: "Certificat médical d'aptitude" },
];

interface DocumentsFormProps {
  validatedDocs: Record<string, boolean>;
  onToggleDoc: (docId: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const DocumentsForm: React.FC<DocumentsFormProps> = ({ 
  validatedDocs, 
  onToggleDoc, 
  onBack 
}) => {
  return (
    <div className="space-y-6 mt-6">
      <div className="bg-white p-2 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-900" />
          <h3 className="text-lg font-semibold text-foreground">
            Validation des Documents Physiques
          </h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          L'inscription ne peut être validée que si l'étudiant a fourni la totalité des pièces suivantes.
        </p>

        <div className="grid gap-3">
          {LISTE_DOCUMENTS.map((doc) => {
            const isValidated = !!validatedDocs[doc.id];
            
            return (
              <div
                key={doc.id}
                onClick={() => onToggleDoc(doc.id)}
                className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                  isValidated 
                    ? "bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500" 
                    : "bg-white hover:border-slate-400 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isValidated ? "bg-emerald-600 border-emerald-600" : "bg-slate-50 border-slate-300"
                  }`}>
                    {isValidated && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  
                  <span className={`font-medium transition-colors ${isValidated ? "text-emerald-900" : "text-slate-700"}`}>
                    {doc.label}
                  </span>
                </div>

                <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                  isValidated ? "bg-emerald-200 text-emerald-800" : "bg-slate-100 text-slate-400"
                }`}>
                  {isValidated ? "Reçu" : "Manquant"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Précédent
        </Button>
        <p className="text-xs text-slate-400 italic">
          Le bouton de validation finale apparaîtra une fois tout coché.
        </p>
      </div>
    </div>
  );
};

export default DocumentsForm;