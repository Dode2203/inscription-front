
export interface PaiementEcolage {
    id: string | number;
    refBordereau: string;
    montant: number;
    datePaiement: string;
    anneeUniversitaire: string;
    niveau: string;
    mention: string;
    nomPrenom: string;
    typeDroits: string;
}

export interface EtudiantSearchResult {
    id: number;
    nom: string;
    prenom: string;
    dateNaissance: string;
    sexe: string;
    contact: {
        adresse?: string;
        email?: string;
        telephone?: string;
    };
}

export interface EcolageRegistration {
    id_niveau_etudiant: number;
    id: string | number; // For backward compatibility if needed, but we prefer id_niveau_etudiant
    niveau: string;
    annee_scolaire: string;
    anneeScolaire: string | number; // For backward compatibility
    mention: string;
    reste_a_payer: number;
    resteAPayer: number; // For backward compatibility
}

export interface EtudiantEcolageDetail extends EtudiantSearchResult {
    registrations: EcolageRegistration[];
}

export interface EcolageFormInput {
    idEtudiant: string | number;
    registrationId: string | number;
    ref: string;
    montant: number;
    datePaiement: string;
}
export interface EcolageHistoryItem {
    id_paiement: number;
    date_paiement: string;
    date?: string; // Keep for safety if backend uses both
    montant: number;
    ref_bordereau: string;
    annee_universitaire: string;
    niveau: string | { nom: string };
    mention: string | { nom: string };
    reste_global: number;
}

export interface EcolageHistoryResponse {
    status: string;
    data: {
        etudiant: { id: number; nom: string; prenom: string };
        history: EcolageHistoryItem[];
    };
}
