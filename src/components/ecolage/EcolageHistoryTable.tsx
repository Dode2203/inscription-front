'use client';

import React, { useEffect, useState } from 'react';
import { ecolageService } from '@/services/ecolageService';
import { EcolageHistoryResponse, EcolageHistoryItem } from '@/types/ecolage';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface EcolageHistoryTableProps {
    idEtudiant: string | number;
    lastUpdated?: number;
    mention?: string;
    onAnnulerSuccess?: () => void;
}

export function EcolageHistoryTable({ idEtudiant, lastUpdated, mention, onAnnulerSuccess }: EcolageHistoryTableProps) {
    const router = useRouter();
    const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';
    const [data, setData] = useState<EcolageHistoryResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = async () => {
        if (!idEtudiant) return;
        setLoading(true);
        setError(null);
        try {
            const result = await ecolageService.fetchEcolageHistory(idEtudiant);
            setData(result);
        } catch (err: any) {
            console.error("Error fetching ecolage history:", err);
            setError("Une erreur est survenue lors de la récupération de l'historique.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [idEtudiant, lastUpdated]);

    // --- LOGIQUE D'ANNULATION ---
    const handleAnnulerPaiement = async (paymentId: number) => {
        try {
            // Check auth first
            const authCheck = await fetch(`/api/etudiants?idEtudiant=${encodeURIComponent(idEtudiant)}`);
            if (authCheck.status === 401 || authCheck.status === 403) {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push(login);
                return;
            }

            await ecolageService.annulerPaiement(paymentId);
            toast.success("Le paiement a été annulé avec succès.");
            
            await fetchHistory();
            if (onAnnulerSuccess) onAnnulerSuccess();
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de l'annulation du paiement");
            throw error; // Re-throw pour que le dialogue sache s'il doit rester ouvert ou non
        }
    };

    if (loading && !data) {
        return (
            <div className="flex justify-center items-center p-8">
                <Spinner className="size-8" />
                <span className="ml-2">Chargement de l'historique...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
            </div>
        );
    }

    if (!data || !data.data.history || data.data.history.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Historique de paiement</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground italic text-center py-4">
                        Aucun historique de paiement trouvé.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const { etudiant, history } = data.data;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Historique de : {etudiant.nom} {etudiant.prenom}</span>
                    {(mention || etudiant.mention) && (
                        <span className="text-sm font-medium bg-slate-100 text-slate-700 px-3 py-1 rounded-full uppercase tracking-wide">
                            {mention || etudiant.mention}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="font-bold text-slate-700">Référence</TableHead>
                            <TableHead className="font-bold text-slate-700">Date</TableHead>
                            <TableHead className="font-bold text-slate-700">Année</TableHead>
                            <TableHead className="font-bold text-slate-700">Niveau</TableHead>
                            <TableHead className="font-bold text-slate-700">Montant</TableHead>
                            <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.map((item: EcolageHistoryItem) => (
                            <TableRow key={item.id_paiement} className={cn("hover:bg-slate-50/50", item.annule && "opacity-60 bg-slate-50")}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{item.reference || item.ref_bordereau || 'N/A'}</span>
                                        {item.annule && <span className="text-[10px] text-red-500 font-bold uppercase">Annulé</span>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {(item.date_paiement || item.date) ? new Date(item.date_paiement || item.date || "").toLocaleDateString('fr-FR') : 'N/A'}
                                </TableCell>
                                <TableCell>{item.annee || item.annee_universitaire || 'N/A'}</TableCell>
                                <TableCell>{typeof item.niveau === 'object' ? item.niveau.nom : item.niveau || 'N/A'}</TableCell>
                                <TableCell className={cn("font-bold", item.annule ? "text-slate-400 line-through" : "text-blue-900")}>
                                    {item.montant.toLocaleString('fr-FR')} Ar
                                </TableCell>
                                <TableCell className="text-right">
                                    {!item.annule ? (
                                        <AnnulerActionDialog 
                                            onConfirm={() => handleAnnulerPaiement(item.id_paiement)} 
                                        />
                                    ) : (
                                        <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">
                                            Annulé
                                        </Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

/**
 * Sous-composant pour gérer le bouton et le dialogue d'annulation
 */
function AnnulerActionDialog({ onConfirm }: { onConfirm: () => Promise<void> }) {
    const [isPending, setIsPending] = useState(false);
    const [open, setOpen] = useState(false);

    const handleAction = async (e: React.MouseEvent) => {
        e.preventDefault(); // Empêche la fermeture auto du dialogue avant la fin du traitement
        setIsPending(true);
        try {
            await onConfirm();
            setOpen(false); // Ferme seulement en cas de succès
        } catch (err) {
            // L'erreur est déjà gérée par le toast dans le parent
        } finally {
            setIsPending(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer l'annulation</AlertDialogTitle>
                    <AlertDialogDescription>
                        Voulez-vous vraiment annuler ce paiement ? Cette action mettra à jour le solde de l'étudiant.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Retour</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleAction}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Annulation...
                            </>
                        ) : (
                            "Confirmer l'annulation"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}