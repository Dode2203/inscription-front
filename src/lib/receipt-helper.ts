// src/lib/receipt-helper.ts
import { generateReceiptPDF } from '@/lib/generateReceipt';
import { Student, Identite, Formation, PaiementData } from '@/lib/db';

export function prepareReceiptData(student: Student) {
  if (!student.droitsPayes || student.droitsPayes.length === 0) {
    throw new Error("Aucun paiement trouvé pour cet étudiant");
  }

  const paiementAdmin = student.droitsPayes.find(p => p.typeDroit === 'Administratif');
  const paiementPedago = student.droitsPayes.find(p => p.typeDroit === 'Pédagogique');
  const paiementEcolage = student.droitsPayes.find(p => p.typeDroit === 'Écolage');

  const identite: Identite = {
    id: student.id,
    nom: student.nom,
    prenom: student.prenom,
    dateNaissance: student.dateNaissance 
      ? new Date(student.dateNaissance).toLocaleDateString('fr-FR') 
      : 'Non spécifié',
    lieuNaissance: student.lieuNaissance || 'Non renseigné',
    sexe: student.sexe || 'Non spécifié',
    contact: {
      adresse: student.contact?.adresse || 'Non renseigné',
      email: student.contact?.email || 'Non renseigné',
      telephone: student.contact?.telephone || 'Non renseigné'
    }
  };

  const formation: Formation = {
    formation: student.typeFormation?.nom || 'Non spécifié',
    formationType: 'Initial',
    niveau: 'Licence',
    mention: 'Non spécifiée'
  };

  const paiementData: PaiementData = {
    refAdmin: paiementAdmin?.reference || '',
    dateAdmin: paiementAdmin?.datePaiement 
      ? new Date(paiementAdmin.datePaiement).toLocaleDateString('fr-FR') 
      : '',
    montantAdmin: paiementAdmin?.montant.toString() || '0',
    refPedag: paiementPedago?.reference || '',
    datePedag: paiementPedago?.datePaiement 
      ? new Date(paiementPedago.datePaiement).toLocaleDateString('fr-FR') 
      : '',
    montantPedag: paiementPedago?.montant.toString() || '0',
    refEcolage: paiementEcolage?.reference || '',
    dateEcolage: paiementEcolage?.datePaiement 
      ? new Date(paiementEcolage.datePaiement).toLocaleDateString('fr-FR') 
      : '',
    montantEcolage: paiementEcolage?.montant.toString() || '0'
  };

  return { identite, formation, paiementData };
}

export function downloadReceipt(student: Student) {
  try {
    const { identite, formation, paiementData } = prepareReceiptData(student);
    generateReceiptPDF(identite, formation, paiementData);
  } catch (error) {
    alert((error as Error).message);
  }
}