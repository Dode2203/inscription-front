// src/lib/receipt-helper.ts
import { generateReceiptPDF } from '@/lib/generateReceipt';
import { Student, Identite, Formation, PaiementData, Inscription } from '@/lib/db';

/**
 * Prépare les données pour le PDF à partir des données de l'API
 */
export function prepareReceiptData(student: Student) {
  if (!student) {
    throw new Error("Données de l'étudiant manquantes");
  }

  // 1. IDENTITÉ - Utilise l'interface Identite de db.ts
  const identite: Identite = {
    id: student.id,
    nom: student.nom || 'Non spécifié',
    prenom: student.prenom || 'Non spécifié',
    dateNaissance: student.dateNaissance 
      ? new Date(student.dateNaissance).toLocaleDateString('fr-FR') 
      : 'Non spécifié',
    lieuNaissance: student.lieuNaissance || 'Non renseigné',
    sexe: student.sexe || 'Non spécifié',
    contact: {
      adresse: student.contact?.adresse || 'Non renseigné',
      email: student.contact?.email || 'Non renseigné',
      telephone: student.contact?.telephone || ''
    }
  };

  // 2. FORMATION - Utilise l'interface Formation de db.ts
  const formation: Formation = {
    idFormation: (student.formation?.id || 0).toString(),
    formation: student.formation?.nom || 'Non spécifié',
    formationType: student.formation?.type?.nom || 'Initial',
    typeNiveau: (student.niveau?.type || 0).toString(),
    gradeNiveau: (student.niveau?.grade || 0).toString(),
    niveau: student.niveau?.nom || 'Non spécifié',
    mention: student.mention?.nom || 'Non spécifiée',
  };

  // 3. INSCRIPTION - Utilise l'interface Inscription de db.ts
  const inscription: Inscription | null = student.inscription 
    ? {
        id: student.id,
        matricule: student.inscription.matricule || `MAT-${student.id}`,
        dateInscription: student.inscription.anneeUniversitaire || new Date().toISOString(),
        description: `Inscription ${student.inscription.anneeUniversitaire || ''}`
      }
    : null;

  // 4. PAIEMENTS - Utilise l'interface PaiementData de db.ts
  const paiementData: PaiementData = extractPaiementData(student);

  return { identite, formation, paiementData, inscription };
}

/**
 * Extrait les données de paiement depuis l'API
 */
function extractPaiementData(student: Student): PaiementData {
  // Initialiser avec des valeurs par défaut
  let refAdmin = '';
  let dateAdmin = '';
  let montantAdmin = '0';
  let refPedag = '';
  let datePedag = '';
  let montantPedag = '0';
  let refEcolage = '';
  let dateEcolage = '';
  let montantEcolage = '0';

  // Traiter les droits payés de l'API
  if (student.droitsPayes && Array.isArray(student.droitsPayes)) {
    student.droitsPayes.forEach(paiement => {
      const montant = paiement.montant.toString();
      const date = paiement.datePaiement 
        ? new Date(paiement.datePaiement).toLocaleDateString('fr-FR') 
        : '';
      const ref = paiement.reference || '';

      if (paiement.typeDroit === 'Administratif') {
        refAdmin = ref;
        dateAdmin = date;
        montantAdmin = montant;
      } else if (paiement.typeDroit === 'Pédagogique') {
        refPedag = ref;
        datePedag = date;
        montantPedag = montant;
      }
    });
  }

  // Traiter l'écolage (si présent)
  if (student.ecolage && Array.isArray(student.ecolage) && student.ecolage.length > 0) {
    const premiereTranche = student.ecolage[0];
    refEcolage = premiereTranche.reference || '';
    dateEcolage = premiereTranche.datePaiement 
      ? new Date(premiereTranche.datePaiement).toLocaleDateString('fr-FR') 
      : '';
    montantEcolage = premiereTranche.montant.toString();
  }

  // Retourner selon l'interface PaiementData de db.ts
  return {
    refAdmin,
    dateAdmin,
    montantAdmin,
    refPedag,
    datePedag,
    montantPedag,
    refEcolage,
    dateEcolage,
    montantEcolage,
    idNiveau: (student.niveau?.id || 0).toString(),
    idFormation: (student.formation?.id || 0).toString(),
    passant: false
  };
}

/**
 * Récupère les détails complets d'un étudiant depuis l'API
 */
async function fetchStudentDetails(studentId: number): Promise<Student> {
  const currentYear = new Date().getFullYear();
  const response = await fetch(
    `/api/etudiants/details-par-annee?idEtudiant=${studentId}&annee=${currentYear}`
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur API (${response.status}): ${errorText}`);
  }
  
  const result = await response.json();
  
  if (result.status !== 'success' || !result.data) {
    throw new Error(result.message || 'Données de l\'étudiant non disponibles');
  }
  
  return result.data;
}

/**
 * Télécharge le reçu d'un étudiant
 */
export async function downloadReceipt(student: Student) {
  try {
    console.log('📥 Récupération des détails de l\'étudiant...');
    
    // Récupérer les détails complets
    const fullStudentData = await fetchStudentDetails(student.id);
    
    console.log('📄 Préparation des données PDF...');
    
    // Préparer les données avec les interfaces de db.ts
    const { identite, formation, paiementData, inscription } = prepareReceiptData(fullStudentData);
    
    console.log('✅ Génération du PDF...');
    
    // Générer le PDF
    generateReceiptPDF(identite, formation, paiementData, inscription);
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération du reçu:', error);
    throw error;
  }
}