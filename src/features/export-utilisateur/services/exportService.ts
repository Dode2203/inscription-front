import { ApiStudent } from "@/lib/db";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export interface ExportParams {
    idMention?: string;
    idNiveau?: string;
    format?: 'pdf' | 'excel' | 'csv' | 'xlsx';
}

export const exportService = {
    /**
     * Récupère la liste des étudiants via l'endpoint EXPORT DÉDIÉ
     * qui renvoie les objets complets (identite, formation, cin, contact, bacc...)
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
        const data = result.status === 'success' ? result.data : (Array.isArray(result) ? result : []);

        // Debug : vérifier la structure du premier objet (notamment CIN et Semestre)
        if (data.length > 0) {
            console.log("[exportService] Premier étudiant brut pour vérification :", data[0]);
        }

        return data;
    },

    // ─────────────────────────────────────────────
    // HELPERS PARTAGÉS
    // ─────────────────────────────────────────────

    _str(val: any): string {
        if (val === null || val === undefined || val === "null" || val === "undefined") return "";
        return String(val);
    },

    _date(dateStr: any): string {
        if (!dateStr) return "";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return this._str(dateStr);
            const y = date.getFullYear();
            const m = (date.getMonth() + 1).toString().padStart(2, '0');
            const d = date.getDate().toString().padStart(2, '0');
            return `${y}-${m}-${d}`; // Format YYYY-MM-DD pour le canevas
        } catch {
            return "";
        }
    },

    _sexe(val: any): string {
        if (!val) return "";
        const s = String(val).toLowerCase();
        if (s === 'masculin' || s === 'm' || s === 'male') return 'M';
        if (s === 'feminin' || s === 'féminin' || s === 'f' || s === 'female') return 'F';
        return this._str(val); // Conserver tel quel si autre valeur
    },

    _mapRow(item: ApiStudent): string[] {
        const isBoursierVal = item.formation?.isBoursier;
        const isBoursier = (isBoursierVal === 1 || String(isBoursierVal) === "1");
        const boursierLabel = isBoursier ? "Oui" : "Non";
        const tauxBourse = isBoursier ? "1" : "0";
        const redoublement = item.formation?.remarque ? this._str(item.formation.remarque) : "N";

        // Formattage Semestre : 'S' + nom (ex: 'S1')
        const rawSemestre = item.formation?.niveau?.nom || "";
        const semestreLabel = rawSemestre ? `S${rawSemestre.replace(/\D/g, '')}` : "";

        return [
            "",
            this._str(item.identite?.nom).toUpperCase(),
            this._str(item.identite?.prenom),
            this._sexe(item.identite?.sexe),
            this._date(item.identite?.dateNaissance),
            this._str(item.identite?.contact?.nomMere),
            this._str(item.identite?.cin?.numero), // Mapping CIN confirmé
            this._date(item.identite?.cin?.dateDelivrance),
            this._str(item.identite?.cin?.lieuDelivrance),
            this._str(item.identite?.nationalite?.nom),
            this._str(item.identite?.bacc?.annee || item.identite?.bacc?.anneeObtention),
            this._str(item.identite?.bacc?.serie),
            redoublement,
            boursierLabel,
            tauxBourse,
            this._str(item.identite?.contact?.adresse),
            this._str(item.identite?.contact?.telephone),
            "Public", // Institution : Valeur fixe demandée
            "Sciences de l'Ingénieur", // Domaine : Valeur fixe demandée
            "Initiale",
            semestreLabel, // Semestre : 'S' + grade/nom
            this._str(item.identite?.contact?.email),
        ];
    },

    // ─────────────────────────────────────────────
    // EXPORT CSV (brut, séparateur ;)
    // ─────────────────────────────────────────────

    exportToCsv(data: ApiStudent[], filename: string) {
        const headers = [
            "NUMERO FICHE DE BOURSE", "NOM", "PRÉNOMS", "SEXE", "DATE DE NAISSANCE",
            "Nom et prénom de mère", "CIN", "Date delivrance", "Lieu de délivrance",
            "NATIONALITÉ", "ANNÉE D'OBTENTION DU BACC", "SÉRIE DU BACC", "CODE DE REDOUBLEMENT",
            "BOURSIER", "TAUX DE BOURSE", "ADRESSE EXACTE", "NUMERO DE TELEPHONE",
            "Institution", "Domaine", "Type de formation", "Semestre", "Adresse e-mail"
        ];

        const rows = data.map(item =>
            this._mapRow(item).map(cell => `"${this._str(cell).replace(/"/g, '""')}"`)
        );

        const csvContent = [
            headers.join(";"),
            ...rows.map(row => row.join(";"))
        ].join("\r\n");

        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const finalFilename = filename.endsWith(".csv") ? filename : filename + ".csv";
        this.downloadBlob(blob, finalFilename);
    },

    // ─────────────────────────────────────────────
    // EXPORT XLSX CANEVAS OFFICIEL (ExcelJS)
    // ─────────────────────────────────────────────

    async exportToXlsx(data: ApiStudent[], filename: string) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = "ESPA";
        workbook.created = new Date();

        const sheet = workbook.addWorksheet("Boursiers");

        // --- Définition des colonnes (largeurs) ---
        sheet.columns = [
            { key: "col1", width: 22 },  // Matricule
            { key: "col2", width: 20 },  // Nom
            { key: "col3", width: 20 },  // Prénoms
            { key: "col4", width: 8 },  // Sexe
            { key: "col5", width: 16 },  // Date naissance
            { key: "col6", width: 25 },  // Nom mère
            { key: "col7", width: 14 },  // CIN
            { key: "col8", width: 14 },  // Date délivrance
            { key: "col9", width: 20 },  // Lieu délivrance
            { key: "col10", width: 16 },  // Nationalité
            { key: "col11", width: 14 },  // Année Bacc
            { key: "col12", width: 12 },  // Série Bacc
            { key: "col13", width: 18 },  // Code redoublement
            { key: "col14", width: 10 },  // Boursier
            { key: "col15", width: 12 },  // Taux bourse
            { key: "col16", width: 25 },  // Adresse
            { key: "col17", width: 18 },  // Téléphone
            { key: "col18", width: 18 },  // Institution
            { key: "col19", width: 22 },  // Domaine
            { key: "col20", width: 18 },  // Type formation
            { key: "col21", width: 16 },  // Semestre
            { key: "col22", width: 28 },  // Email
        ];

        // --- LIGNE 1 : En-têtes officiels ---
        const headerRow = sheet.addRow([
            "NUMERO FICHE DE BOURSE", "NOM", "PRÉNOMS", "SEXE", "DATE DE NAISSANCE",
            "Nom et prénom de mère", "CIN", "Date delivrance", "Lieu de délivrance",
            "NATIONALITÉ", "ANNÉE D'OBTENTION DU BACC", "SÉRIE DU BACC", "CODE DE REDOUBLEMENT",
            "BOURSIER", "TAUX DE BOURSE", "ADRESSE EXACTE", "NUMERO DE TELEPHONE",
            "Institution", "Domaine", "Type de formation", "Semestre", "Adresse e-mail"
        ]);

        headerRow.eachCell(cell => {
            cell.font = { bold: true, size: 10, color: { argb: "FF000000" } };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF2F2F2" }
            };
            cell.border = {
                top: { style: "thin" }, left: { style: "thin" },
                bottom: { style: "thin" }, right: { style: "thin" }
            };
            cell.alignment = { vertical: "middle", wrapText: true };
        });
        headerRow.height = 30;

        // --- LIGNE 2 : Codes guide (statiques selon le canevas officiel) ---
        // const guideRow = sheet.addRow([
        //     "[ 0 ]", "[ 1 ]", "[ 2 ]", "[ 3 ]", "[ 4 ]",
        //     "Complement Nom", "[ 5 ]", "Read Comment", "Complement du délivrance",
        //     "[ 6 ]", "[ 7 ]", "[ 8 ]", "[ 9 ]", "[ 10 ]",
        //     "[ 11 ]", "[ 12 ]", "[ 13 ] Unicité à respecter",
        //     "", "", "", "", "[ 13 ] Unicité à respecter"
        // ]);

        // guideRow.eachCell(cell => {
        //     cell.font = { italic: true, size: 9, color: { argb: "FF7F7F7F" } };
        //     cell.fill = {
        //         type: "pattern",
        //         pattern: "solid",
        //         fgColor: { argb: "FFFAFAFA" }
        //     };
        //     cell.border = {
        //         top: { style: "thin" }, left: { style: "thin" },
        //         bottom: { style: "thin" }, right: { style: "thin" }
        //     };
        // });
        // guideRow.height = 20;

        // --- LIGNES 3+ : Données ---
        data.forEach(item => {
            const rowValues = this._mapRow(item);
            const dataRow = sheet.addRow(rowValues);
            dataRow.eachCell(cell => {
                cell.font = { size: 10 };
                cell.border = {
                    top: { style: "thin" }, left: { style: "thin" },
                    bottom: { style: "thin" }, right: { style: "thin" }
                };
                cell.alignment = { vertical: "middle" };
            });
            dataRow.height = 18;
        });

        // --- Génération et téléchargement ---
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        const today = new Date();
        const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
        const finalFilename = `Export_Boursiers_${dateStr}.xlsx`;

        saveAs(blob, finalFilename);
    },

    // ─────────────────────────────────────────────
    // LEGACY  (CSV via format "excel" ou "csv")
    // ─────────────────────────────────────────────

    exportToExcel(data: ApiStudent[], filename: string) {
        this.exportToCsv(data, filename);
    },

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
