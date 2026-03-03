"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Hash, Loader2, Download } from "lucide-react";
import { ApiStudent } from "@/lib/db";

interface ExportTableProps {
    data: ApiStudent[];
    loading: boolean;
    isExporting: boolean;
    onExport: (format: 'pdf' | 'excel' | 'csv') => void;
}

export function ExportTable({
    data,
    loading,
    isExporting,
    onExport
}: ExportTableProps) {
    return (
        <Card className="overflow-hidden shadow-xl">
            <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-900" />
                    <span className="font-bold text-blue-900">{data.length} Étudiants</span>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => onExport('pdf')}
                        disabled={isExporting || data.length === 0}
                        variant="outline"
                        className="border-slate-300 text-slate-700 hover:bg-slate-100 flex gap-2"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        PDF
                    </Button>
                    <Button
                        onClick={() => onExport('excel')}
                        disabled={isExporting || data.length === 0}
                        className="bg-green-600 text-white hover:bg-green-700 flex gap-2 font-bold shadow-sm"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Excel
                    </Button>
                    <Button
                        onClick={() => onExport('csv')}
                        disabled={isExporting || data.length === 0}
                        variant="secondary"
                        className="flex gap-2 font-bold shadow-sm"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        CSV
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-blue-900 text-white text-xs uppercase">
                            <th className="px-6 py-4 flex items-center gap-1"><Hash className="w-3 h-3" /> Matricule</th>
                            <th className="px-6 py-4">Nom & Prénoms</th>
                            <th className="px-6 py-4">Mention</th>
                            <th className="px-6 py-4">Niveau</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center">
                                    <div className="flex flex-col justify-center items-center py-20 bg-white rounded-2xl border border-slate-200">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                        <p className="mt-4 text-slate-500">Chargement de la liste...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length > 0 ? (
                            data.map((et: any) => (
                                <tr key={et.id || et.identite?.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-blue-800">
                                        {et.formation?.matricule || et.matricule || "-"}
                                    </td>
                                    <td className="px-6 py-4 font-semibold">
                                        {(et.identite?.nom || et.nom || "").toUpperCase()} {et.identite?.prenom || et.prenom || ""}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold text-xs">
                                            {et.formation?.mention?.abr || et.mention?.abr || et.mention?.nom || "-"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold text-xs">
                                            {et.formation?.niveau?.nom || et.niveau?.nom || "-"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">Aucun résultat.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
