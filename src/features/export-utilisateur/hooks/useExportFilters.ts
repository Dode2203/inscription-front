"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ApiStudent } from "@/lib/db";
import { exportService } from "../services/exportService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { generateStudentPDF } from "@/lib/generateliste";

export function useExportFilters() {
    const router = useRouter();

    // États pour les données
    const [resultats, setResultats] = useState<ApiStudent[]>([]);

    // États pour la sélection et le filtrage
    const [selectedMention, setSelectedMention] = useState("");
    const [selectedNiveau, setSelectedNiveau] = useState("");
    const [sortByDate, setSortByDate] = useState(false);
    const [sortDesc, setSortDesc] = useState(false);

    // États de chargement
    const [loading, setLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Récupération de la liste des étudiants
    const fetchEtudiants = useCallback(async () => {
        setLoading(true);
        try {
            const data = await exportService.fetchStudents({
                idMention: selectedMention,
                idNiveau: selectedNiveau
            });
            setResultats(data);
        } catch (error: any) {
            console.error(error);
            if (error.message === "Session expirée") {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push('/login');
            } else {
                toast.error(error.message || "Impossible de joindre le serveur");
            }
        } finally {
            setLoading(false);
        }
    }, [selectedMention, selectedNiveau, router]);

    useEffect(() => {
        fetchEtudiants();
    }, [fetchEtudiants]);

    // Tri sur la structure imbriquée (identite.nom, identite.dateNaissance)
    const filteredData = useMemo(() => {
        const data = [...resultats];

        data.sort((a, b) => {
            let comparison = 0;

            if (sortByDate) {
                // Tri par date de naissance (chemin profond)
                const dateA = new Date(a.identite?.dateNaissance || a.dateInsertion || 0).getTime();
                const dateB = new Date(b.identite?.dateNaissance || b.dateInsertion || 0).getTime();
                comparison = dateA - dateB;
            } else {
                // Tri par Nom puis Prénom (chemins profonds)
                const nameA = `${a.identite?.nom || ""} ${a.identite?.prenom || ""}`.toLowerCase();
                const nameB = `${b.identite?.nom || ""} ${b.identite?.prenom || ""}`.toLowerCase();
                comparison = nameA.localeCompare(nameB);
            }

            return sortDesc ? -comparison : comparison;
        });

        return data;
    }, [resultats, sortByDate, sortDesc]);

    /**
     * Fonction pour déclencher l'exportation
     */
    const handleExport = async (format: 'pdf' | 'excel' | 'csv' | 'xlsx', mentionLabel: string, niveauLabel: string) => {
        setIsExporting(true);
        try {
            const filename = `Export_Etudiants_${mentionLabel || 'Tous'}_${niveauLabel || 'Tous'}_${new Date().getTime()}`;

            if (format === 'xlsx') {
                // Canevas officiel .xlsx via ExcelJS
                await exportService.exportToXlsx(filteredData, filename);
                toast.success("Canevas Excel généré avec succès");
            } else if (format === 'csv') {
                // Export CSV brut
                exportService.exportToCsv(filteredData, filename + ".csv");
                toast.success("Export CSV terminé avec succès");
            } else {
                // PDF - génération locale
                generateStudentPDF(filteredData, mentionLabel, niveauLabel);
                toast.success("Export PDF généré");
            }
        } catch (error: any) {
            toast.error(error.message || "Une erreur est survenue lors de l'exportation");
        } finally {
            setIsExporting(false);
        }
    };

    return {
        filteredData,
        loading,
        isExporting,
        selectedMention,
        setSelectedMention,
        selectedNiveau,
        setSelectedNiveau,
        sortByDate,
        setSortByDate,
        sortDesc,
        setSortDesc,
        handleExport,
        fetchEtudiants
    };
}
