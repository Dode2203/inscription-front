'use client';

import React, { useEffect, useState } from 'react';
import { ecolageService } from '@/services/ecolageService';
import { EcolageHistoryResponse, EcolageHistoryItem } from '@/types/ecolage';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EcolageHistoryTableProps {
    idEtudiant: string | number;
    lastUpdated?: number;
    mention?: string;
}

export function EcolageHistoryTable({ idEtudiant, lastUpdated, mention }: EcolageHistoryTableProps) {
    const [data, setData] = useState<EcolageHistoryResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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

        fetchHistory();
    }, [idEtudiant, lastUpdated]);

    if (loading) {
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
                    <CardTitle className="flex justify-between items-center">
                        <span>Historique de : {data?.data.etudiant.nom} {data?.data.etudiant.prenom}</span>
                        {mention && <span className="text-sm font-medium bg-slate-100 text-slate-700 px-3 py-1 rounded-full uppercase">{mention}</span>}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground italic text-center py-4">
                        Aucun historique de paiement trouvé pour cet étudiant.
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.map((item: EcolageHistoryItem) => {
                            const renderField = (field: any) => {
                                if (!field) return 'N/A';
                                if (typeof field === 'object' && field.nom) return field.nom;
                                return field;
                            };

                            const displayDate = item.date_paiement || item.date || "";

                            return (
                                <TableRow key={item.id_paiement} className="hover:bg-slate-50/50">
                                    <TableCell className="font-medium">{item.reference || item.ref_bordereau || 'N/A'}</TableCell>
                                    <TableCell>
                                        {displayDate ? new Date(displayDate).toLocaleDateString('fr-FR') : 'N/A'}
                                    </TableCell>
                                    <TableCell>{item.annee || item.annee_universitaire || 'N/A'}</TableCell>
                                    <TableCell>{renderField(item.niveau)}</TableCell>
                                    <TableCell className="font-bold text-blue-900">
                                        {item.montant.toLocaleString('fr-FR')} Ar
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
