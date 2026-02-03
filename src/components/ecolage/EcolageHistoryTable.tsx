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
}

export function EcolageHistoryTable({ idEtudiant }: EcolageHistoryTableProps) {
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
    }, [idEtudiant]);

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
                    <CardTitle>
                        Historique de : {data?.data.etudiant.nom} {data?.data.etudiant.prenom}
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
                <CardTitle>
                    Historique de : {etudiant.nom} {etudiant.prenom}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date du paiement</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Niveau</TableHead>
                            <TableHead>Reste à payer global</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.map((item: EcolageHistoryItem) => (
                            <TableRow key={item.id_paiement}>
                                <TableCell>{new Date(item.date).toLocaleDateString('fr-FR')}</TableCell>
                                <TableCell>{item.montant.toLocaleString('fr-FR')} Ar</TableCell>
                                <TableCell>{item.niveau}</TableCell>
                                <TableCell
                                    className={item.reste_global > 0 ? "text-red-500 font-bold" : ""}
                                >
                                    {item.reste_global.toLocaleString('fr-FR')} Ar
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
