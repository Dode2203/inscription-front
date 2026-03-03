import { ApiStudent } from "@/lib/db";

export interface ExportParams {
    idMention?: string;
    idNiveau?: string;
    format?: 'pdf' | 'excel' | 'csv';
}

export const exportService = {
    /**
     * Récupère la liste des étudiants via l'endpoint EXPORT DÉDIÉ
     * qui renvoie les objets complets (identite, formation, cin, contact...)
     */
    async fetchStudents(params: ExportParams): Promise<ApiStudent[]> {
        const queryParams = new URLSearchParams();
        if (params.idMention) queryParams.append("idMention", params.idMention);
        if (params.idNiveau) queryParams.append("idNiveau", params.idNiveau);

        const response = await fetch(`/api/filtres/etudiant/export?${queryParams.toString()}`);

        if (response.status === 401 || response.status === 403) {
            throw new Error("Session expirée");
        }
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des données");
        }

        const result = await response.json();
        // L'API renvoie { "status": "success", "data": [...] }
        const data = result.status === 'success' ? result.data : (Array.isArray(result) ? result : []);

        // Debug : vérifier la structure du premier objet
        // if (data.length > 0) {
        //     console.log("[exportService] Premier étudiant reçu :", data[0]);
        // }

        return data;
    },

    /**
     * Génération locale d'un fichier CSV (Excel compatible)
     * Mapping PROFOND basé sur la structure imbriquée : item.identite.x, item.formation.x
     */
    exportToExcel(data: ApiStudent[], filename: string) {
        const formatStr = (val: any): string => {
            if (val === null || val === undefined || val === "null" || val === "undefined") return "";
            return String(val);
        };

        const formatDate = (dateStr: any): string => {
            if (!dateStr) return "";
            try {
                // L'API renvoie YYYY-MM-DD → on transforme en DD/MM/YYYY
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return formatStr(dateStr);
                const d = date.getDate().toString().padStart(2, '0');
                const m = (date.getMonth() + 1).toString().padStart(2, '0');
                const y = date.getFullYear();
                return `${d}/${m}/${y}`;
            } catch {
                return "";
            }
        };

        const headers = [
            // 1. Identification & État Civil
            "Numéro Fiche de Bourse", "Nom", "Prénoms", "Sexe", "Date de Naissance",
            "Nom et Prénom de la mère", "Nationalité",
            // 2. Pièce d'Identité (CIN)
            "CIN", "Date de Délivrance", "Lieu de Délivrance",
            // 3. Cursus Académique & Formation
            "Année d'obtention du Bacc", "Série du Bacc", "Institution", "Domaine",
            "Type de formation", "Semestre", "Code de redoublement",
            // 4. Statut Boursier & Coordonnées
            "Boursier", "Taux de bourse", "Adresse", "Numéro de téléphone", "Adresse mail"
        ];

        const rows = data.map(item => {
            // --- MAPPING PROFOND (chemins exacts) ---
            // Boursier : 1 → "Oui", autre → "Non" (strict)
            const isBoursierVal = item.formation?.isBoursier;
            const boursierLabel = (isBoursierVal === 1 || String(isBoursierVal) === "1") ? "Oui" : "Non";

            return [
                // 1. Identification & État Civil
                formatStr(item.formation?.matricule),
                formatStr(item.identite?.nom).toUpperCase(),
                formatStr(item.identite?.prenom),
                formatStr(item.identite?.sexe),
                formatDate(item.identite?.dateNaissance),
                formatStr(item.identite?.contact?.nomMere),
                formatStr(item.identite?.nationalite?.nom),

                // 2. Pièce d'Identité (CIN)
                formatStr(item.identite?.cin?.numero),
                formatDate(item.identite?.cin?.dateDelivrance),
                formatStr(item.identite?.cin?.lieuDelivrance),

                // 3. Cursus Académique & Formation
                formatStr(item.identite?.bacc?.anneeObtention),
                formatStr(item.identite?.bacc?.serie),
                formatStr(item.formation?.etablissement?.nom),
                formatStr(item.formation?.mention?.nom || item.formation?.label),
                formatStr(item.formation?.niveau?.type),
                formatStr(item.formation?.niveau?.nom),
                formatStr(item.formation?.remarque),

                // 4. Statut Boursier & Coordonnées
                boursierLabel,
                formatStr(item.formation?.tauxBourse),
                formatStr(item.identite?.contact?.adresse),
                formatStr(item.identite?.contact?.telephone),
                formatStr(item.identite?.contact?.email)
            ].map(cell => {
                const content = formatStr(cell);
                return `"${content.replace(/"/g, '""')}"`;
            });
        });

        const csvContent = [
            headers.join(";"),
            ...rows.map(row => row.join(";"))
        ].join("\r\n");

        // --- ENCODAGE & BOM UTF-8 ---
        // L'ajout du BOM (\ufeff) est CRUCIAL pour que Excel reconnaisse l'UTF-8
        // et affiche correctement les accents malgaches.
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });

        const finalFilename = filename.toLowerCase().endsWith(".csv")
            ? filename
            : (filename.toLowerCase().endsWith(".excel") ? filename.replace(/\.excel$/i, ".csv") : filename + ".csv");

        this.downloadBlob(blob, finalFilename);
    },

    /**
     * Télécharge un blob sous forme de fichier
     */
    downloadBlob(blob: Blob, filename: string) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
};
