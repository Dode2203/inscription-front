"use client";

import { useState } from "react";
import { Loader2, Save, X, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface PaymentData {
    id: number | string;
    montant: number;
    datePaiement: string;
    typeDroit: string;
    reference: string;
    idEtudiant: number | string;
    idNiveau: number | string;
}

interface ModifierPaiementFormProps {
    payment: PaymentData;
    onClose: () => void;
    onSuccess: () => void;
    onUpdateSuccess?: (idEtudiant: number | string) => void;
}

export default function ModifierPaiementForm({ payment, onClose, onSuccess, onUpdateSuccess }: ModifierPaiementFormProps) {
    const [loadingSave, setLoadingSave] = useState(false);
    const [montant, setMontant] = useState(payment.montant.toString());
    const [formData, setFormData] = useState({
        datePaiement: payment.datePaiement.split('T')[0],
        reference: payment.reference || "",
    });

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingSave(true);

        try {
            // Préparation des données selon le format attendu par l'API Symfony
            const dataToSend = {
                id: payment.id,
                idEtudiant: payment.idEtudiant,
                idNiveau: payment.idNiveau,
                montant: Number(montant), // Conversion string -> number
                datePaiement: formData.datePaiement,
                typeDroit: payment.typeDroit, // Envoyé en chaîne de caractères
                reference: formData.reference,
            };

            const response = await fetch('/api/ecolage/modifier-paiement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                toast.success('Paiement mis à jour avec succès !');
                // Appel du rafraîchissement ciblé si fourni
                if (onUpdateSuccess) {
                    onUpdateSuccess(payment.idEtudiant);
                }
                onSuccess(); // Ferme le formulaire
            } else {
                throw new Error(result.message || 'Erreur lors de la modification');
            }
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la modification du paiement');
        } finally {
            setLoadingSave(false);
        }
    };

    return (
        <Card className="border-none shadow-lg animate-in fade-in slide-in-from-bottom-2 bg-white">
            <CardHeader className="bg-blue-600 text-white py-3 rounded-t-lg">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-md flex items-center gap-2">
                        <CreditCard size={18} /> Modifier le paiement ({payment.typeDroit})
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700" onClick={onClose}>
                        <X size={16} />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Montant (Ar)</Label>
                            <Input
                                type="number"
                                value={montant}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMontant(e.target.value)}
                                onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.value === '0' && setMontant('')}
                                className="h-9 text-sm border-slate-200 bg-slate-50/50"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Date de paiement</Label>
                            <Input
                                type="date"
                                value={formData.datePaiement}
                                onChange={(e) => setFormData({ ...formData, datePaiement: e.target.value })}
                                className="h-9 text-sm border-slate-200 bg-slate-50/50"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Référence</Label>
                        <Input
                            value={formData.reference}
                            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                            className="h-9 text-sm border-slate-200 bg-slate-50/50"
                            placeholder="N° Bordereau / Référence"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="px-6 h-10"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={loadingSave}
                            className="bg-blue-600 hover:bg-blue-700 px-8 h-10 text-white"
                        >
                            {loadingSave ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                            Enregistrer les modifications
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
