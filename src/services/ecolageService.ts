import { EcolageFormInput, PaiementEcolage, EtudiantEcolageDetail, EcolageHistoryResponse } from "@/types/ecolage";

export const ecolageService = {
    async searchEtudiant(query: { nom?: string; prenom?: string }): Promise<any[]> {
        const response = await fetch("/api/etudiants/recherche", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(query)
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

    async savePaiement(data: EcolageFormInput): Promise<any> {
        // Updated to use the new flat /api/ecolage/save route
        const response = await fetch(`/api/ecolage/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = '/login';
            return null;
        }

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Erreur lors de l'enregistrement du paiement");
        }
        return result;
    },

    async fetchEcolageHistory(idEtudiant: string | number): Promise<EcolageHistoryResponse> {
        // Updated to use the flat route with query param 'id'
        const response = await fetch(`/api/ecolage/history?id=${idEtudiant}`);

        if (response.status === 401 || response.status === 403) {
            window.location.href = '/login';
            throw new Error("SÉSSION EXPIRÉE");
        }

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Erreur lors de la récupération de l'historique");
        }
        return result;
    },

    async fetchStudentEcolageDetails(idEtudiant: string | number): Promise<any> {
        // Updated to use the flat route with query param 'id'
        const response = await fetch(`/api/ecolage/details?id=${idEtudiant}`);

        if (response.status === 401 || response.status === 403) {
            window.location.href = '/login';
            throw new Error("SÉSSION EXPIRÉE");
        }

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
