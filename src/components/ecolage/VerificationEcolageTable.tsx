"use client"

import { useState, useEffect, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ecolageService } from "@/services/ecolageService"
import { PaiementEcolage } from "@/types/ecolage"
import { toast } from "sonner"

export const VerificationEcolageTable = () => {
    const [historique, setHistorique] = useState<PaiementEcolage[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    const fetchHistory = useCallback(async () => {
        setLoadingHistory(true)
        try {
            const data = await ecolageService.getHistoriquePaiements()
            setHistorique(data)
        } catch (error: any) {
            toast.error("Erreur lors de la récupération de l'historique")
        } finally {
            setLoadingHistory(false)
        }
    }, [])

    useEffect(() => {
        fetchHistory()
    }, [fetchHistory])

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">Historique des Paiements</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchHistory}
                    disabled={loadingHistory}
                    className="flex items-center gap-2"
                >
                    {loadingHistory ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                    Actualiser
                </Button>
            </div>

            {loadingHistory && historique.length === 0 ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-900" />
                </div>
            ) : historique.length === 0 ? (
                <Card className="py-20 text-center border-2 border-dashed rounded-xl bg-slate-50/50">
                    <p className="text-slate-500">Aucun historique de paiement trouvé.</p>
                </Card>
            ) : (
                <div className="border rounded-lg overflow-hidden bg-white shadow-sm overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-bold">ID</TableHead>
                                <TableHead className="font-bold">REF BORDEREAU</TableHead>
                                <TableHead className="font-bold">Montant</TableHead>
                                <TableHead className="font-bold">Date</TableHead>
                                <TableHead className="font-bold">Année</TableHead>
                                <TableHead className="font-bold">Niveau</TableHead>
                                <TableHead className="font-bold">Mention</TableHead>
                                <TableHead className="font-bold">Nom & Prénoms</TableHead>
                                <TableHead className="font-bold">Type Droits</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {historique.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium text-slate-600">{p.id}</TableCell>
                                    <TableCell className="font-semibold text-blue-900">{p.refBordereau}</TableCell>
                                    <TableCell className="font-bold text-slate-800">{p.montant.toLocaleString()} Ar</TableCell>
                                    <TableCell>{new Date(p.datePaiement).toLocaleDateString()}</TableCell>
                                    <TableCell>{p.anneeUniversitaire}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                                            {p.niveau}
                                        </span>
                                    </TableCell>
                                    <TableCell>{p.mention}</TableCell>
                                    <TableCell className="whitespace-nowrap font-medium">{p.nomPrenom}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700">
                                            {p.typeDroits}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
