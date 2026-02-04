import { EcolageFormInput, PaiementEcolage, EtudiantEcolageDetail, EcolageHistoryResponse } from "@/types/ecolage";

export const ecolageService = {
    async searchEtudiant(query: { nom?: string; prenom?: string }): Promise<any[]> {
        const response = await fetch("/api/etudiants/recherche", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nom: query.nom, prenom: query.prenom })
        });

        if (!response.ok) {
            return [];
        }
        const result = await response.json();
        return result.data || [];
    },

    async getEtudiantDetails(idEtudiant: string | number): Promise<EtudiantEcolageDetail | null> {
        const response = await fetch(`/api/etudiants?idEtudiant=${idEtudiant}`);

        if (!response.ok) {
            return null;
        }
        const result = await response.json();
        return result.data;
    },

    async savePaiement(data: any): Promise<any> {
        const response = await fetch(`/api/ecolage/payment/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Erreur lors de l'enregistrement du paiement");
        }
        return result;
    },

    async fetchEcolageHistory(idEtudiant: string | number): Promise<EcolageHistoryResponse> {
        const response = await fetch(`/api/ecolage/history?id=${idEtudiant}`);

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Erreur lors de la récupération de l'historique");
        }
        return result;
    },

    async fetchStudentEcolageDetails(idEtudiant: string | number): Promise<any> {
        const response = await fetch(`/api/ecolage/details?id=${idEtudiant}`);

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Erreur lors de la récupération des détails");
        }
        return result;
    },

    async getHistoriquePaiements(): Promise<PaiementEcolage[]> {
        const response = await fetch(`/api/ecolage/list`);

        if (!response.ok) {
            return [];
        }
        const result = await response.json();
        return result.data || [];
    }
};
