import { useState, useCallback } from "react";
import { ecolageService } from "@/services/ecolageService";
import { EcolageFormInput, PaiementEcolage, EtudiantEcolageDetail } from "@/types/ecolage";
import { useToast } from "@/hooks/use-toast";

export const useEcolage = () => {
    const { toast } = useToast();
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [etudiantsTrouves, setEtudiantsTrouves] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<EtudiantEcolageDetail | null>(null);
    const [historique, setHistorique] = useState<PaiementEcolage[]>([]);

    const searchEtudiant = useCallback(async (query: { nom?: string; prenom?: string }) => {
        setLoadingSearch(true);
        try {
            const data = await ecolageService.searchEtudiant(query);
            setEtudiantsTrouves(data);
            if (data.length === 0) {
                toast({
                    title: "Aucun résultat",
                    description: "Aucun étudiant trouvé avec ces critères.",
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.response?.data?.message || "Erreur lors de la recherche",
                variant: "destructive"
            });
        } finally {
            setLoadingSearch(false);
        }
    }, [toast]);

    const selectEtudiant = useCallback(async (id: string | number) => {
        setLoadingDetails(true);
        try {
            // First get basic student info (we might already have it from search, but let's be sure)
            const studentInfo = await ecolageService.getEtudiantDetails(id);
            // Then get specific ecolage details (registrations)
            const response = await ecolageService.fetchStudentEcolageDetails(id);

            const registrations = response.data || [];

            setSelectedStudent({
                ...studentInfo,
                registrations: registrations.map((reg: any) => ({
                    ...reg,
                    // Map to both snake_case and camelCase for stability during transition
                    id_niveau_etudiant: reg.id_niveau_etudiant,
                    id: reg.id_niveau_etudiant,
                    annee_scolaire: reg.annee_scolaire,
                    anneeScolaire: reg.annee_scolaire,
                    reste_a_payer: reg.reste_a_payer,
                    resteAPayer: reg.reste_a_payer,
                }))
            });
            return response;
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.response?.data?.message || "Erreur lors de la récupération des détails",
                variant: "destructive"
            });
            return null;
        } finally {
            setLoadingDetails(false);
        }
    }, [toast]);

    const fetchHistory = useCallback(async () => {
        setLoadingHistory(true);
        try {
            const data = await ecolageService.getHistoriquePaiements();
            setHistorique(data);
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.response?.data?.message || "Erreur lors de la récupération de l'historique",
                variant: "destructive"
            });
        } finally {
            setLoadingHistory(false);
        }
    }, [toast]);

    const savePaiement = useCallback(async (data: EcolageFormInput) => {
        setLoadingSubmit(true);
        try {
            await ecolageService.savePaiement(data);
            toast({
                title: "Succès",
                description: "Le paiement a été enregistré avec succès.",
            });
            // Refresh history if needed
            fetchHistory();
            return true;
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.response?.data?.message || "Erreur lors de l'enregistrement du paiement",
                variant: "destructive"
            });
            return false;
        } finally {
            setLoadingSubmit(false);
        }
    }, [toast, fetchHistory]);

    const handleAnnulerPaiement = useCallback(async (paymentId: number | string) => {
        if (!window.confirm("Voulez-vous vraiment annuler ce paiement ?")) {
            return false;
        }

        try {
            await ecolageService.annulerPaiement(paymentId);
            toast({
                title: "Succès",
                description: "Le paiement a été annulé avec succès.",
            });
            return true;
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors de l'annulation du paiement",
                variant: "destructive"
            });
            return false;
        }
    }, [toast]);

    return {
        loadingSearch,
        loadingDetails,
        loadingSubmit,
        loadingHistory,
        etudiantsTrouves,
        selectedStudent,
        historique,
        searchEtudiant,
        selectEtudiant,
        savePaiement,
        fetchHistory,
        handleAnnulerPaiement,
        setSelectedStudent
    };
};
