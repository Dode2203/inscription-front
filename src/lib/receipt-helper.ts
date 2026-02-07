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
  const elanelana = '                           '

  // 1. IDENTITÉ - Utilise l'interface Identite de db.ts
  const identite: Identite = {
    id: student.id,
    nom: student.nom || elanelana,
    prenom: student.prenom || elanelana,
    dateNaissance: student.dateNaissance
      ? new Date(student.dateNaissance).toLocaleDateString('fr-FR')
      : elanelana,
    lieuNaissance: student.lieuNaissance || elanelana,
    sexe: student.sexe || elanelana,
    contact: {
      adresse: student.contact?.adresse || elanelana,
      email: student.contact?.email || elanelana,
      telephone: student.contact?.telephone || '',
      nomMere: student.contact?.nomMere || elanelana,
      nomPere: student.contact?.nomPere || elanelana
    },
    cin: {
      numero: student.cin?.numero || elanelana,
      dateDelivrance: student.cin?.dateDelivrance || elanelana,
      lieuDelivrance: student.cin?.lieuDelivrance || elanelana
    }
  };

  // 2. FORMATION - Utilise l'interface Formation de db.ts
  const formation: Formation = {
    // On s'assure que l'ID est bien traité selon le type string | number
    idFormation: student.formation?.id ?? 0,
    formation: student.formation?.nom || elanelana,
    formationType: student.formation?.type?.nom || elanelana,

    // Attention ici : si l'interface attend des strings, ajoute .toString()
    idNiveau: (student.niveau?.id ?? 0).toString(),

    // Vérifie si ces champs doivent être des strings dans l'interface :
    typeNiveau: student.niveau?.type || 0,
    gradeNiveau: student.niveau?.grade || 0,

    niveau: student.niveau?.nom || elanelana,
    mention: student.mention?.nom || elanelana
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

  // On utilise student.payments (la nouvelle clé du JSON)
  if (student.payments && Array.isArray(student.payments)) {
    student.payments.forEach((paiement) => {
      const montant = (paiement.montant || 0).toString();
      const date = paiement.datePaiement
        ? new Date(paiement.datePaiement).toLocaleDateString('fr-FR')
        : '';
      const ref = paiement.reference || '';

      // On filtre par le nom du typeDroit
      // On gère les types possibles (Administratif, Pédagogique, Ecolage)
      const type = paiement.typeDroit;

      if (type === 'Administratif') {
        refAdmin = ref;
        dateAdmin = date;
        montantAdmin = montant;
      } else if (type === 'Pédagogique' || type === 'P‚dagogique') {
        refPedag = ref;
        datePedag = date;
        montantPedag = montant;
      } else if (type === 'Ecolage') {
        refEcolage = ref;
        dateEcolage = date;
        montantEcolage = montant;
      }
    });
  }

  // Retourner selon l'interface PaiementData
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
    passant: false, // À adapter selon votre logique métier
    estBoursier: student.estBoursier ?? 0
  };
}

export async function downloadReceipt(student: Student) {
  try {
    // console.log('📥 Récupération des détails de l\'étudiant...');

    // Récupérer les détails complets
    // const fullStudentData = await fetchStudentDetails(student.id);

    // console.log('📄 Préparation des données PDF...');
    // console.log('Données de l\'étudiant:', student);

    // Préparer les données avec les interfaces de db.ts
    const { identite, formation, paiementData, inscription } = prepareReceiptData(student);
    // console.log('Données préparées pour le PDF:', { identite, formation, paiementData, inscription });
    // console.log('identite', identite);
    // console.log('formation', formation);
    // console.log('paiementData', paiementData);
    // console.log('inscription', inscription);
    generateReceiptPDF(identite, formation, paiementData, inscription);

  } catch (error) {
    console.error('❌ Erreur lors de la génération du reçu:', error);
    throw error;
  }
}