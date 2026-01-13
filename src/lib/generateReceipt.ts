import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Identite, Formation, PaiementData, Inscription } from '@/lib/db';

export const generateReceiptPDF = (
  identite: Identite,
  formation: Formation,
  paiement: PaiementData,
  inscription?: Inscription | null,
) => {
  const doc = new jsPDF();
  
  // Logo
  const logoUrl = "/espa-logo.png"; 

  // Génération du numéro de quittance
  const numQuittance = inscription?.matricule 
    || `Q-${identite.id}-${new Date().getTime().toString().slice(-6)}`;

  // En-tête avec fond noir
  doc.setFillColor(33, 33, 33);
  doc.rect(0, 0, 210, 45, 'F');
  
  try {
    doc.addImage(logoUrl, 'PNG', 15, 7, 30, 30);
  } catch (e) {
    console.error("Logo non trouvé", e);
  }

  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("RECEPISSE D'INSCRIPTION", 115, 22, { align: "center" });
  
  doc.setFontSize(10);
  doc.text("ECOLE SUPERIEURE POLYTECHNIQUE D'ANTANANARIVO", 115, 32, { align: "center" });

  // Corps du document
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(`NUMÉRO DE SÉRIE : ${identite.id}`, 14, 55);
  doc.text(`QUITTANCE N° : ${numQuittance}`, 140, 55);

  // Section Identification Étudiant
  autoTable(doc, {
    startY: 65,
    head: [[{ 
      content: 'IDENTIFICATION DE L\'ETUDIANT', 
      colSpan: 2, 
      styles: { halign: 'center', fillColor: [60, 60, 60] } 
    }]],
    body: [
      ['Nom & Prénoms', `${identite.nom.toUpperCase()} ${identite.prenom}`],
      ['Date & Lieu de Naissance', `${identite.dateNaissance} à ${identite.lieuNaissance}`],
      ['Sexe', identite.sexe],
      ['Contact', identite.contact.adresse || 'Non renseigné'], 
      ['Email', identite.contact.email],
    ],
    theme: 'grid',
    headStyles: { textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 
      0: { fontStyle: 'bold', cellWidth: 60, fillColor: [240, 240, 240] } 
    }
  });

  // Section Parcours Académique
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 8,
    head: [[{ 
      content: 'PARCOURS ACADÉMIQUE', 
      colSpan: 2, 
      styles: { halign: 'center', fillColor: [60, 60, 60] } 
    }]],
    body: [
      ['Formation', formation.formation],
      ['Mention', formation.mention],
      ['Niveau', formation.niveau],
      ['Type de Parcours', formation.formationType],
    ],
    theme: 'grid',
    headStyles: { textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 
      0: { fontStyle: 'bold', cellWidth: 60, fillColor: [240, 240, 240] } 
    }
  });

  // Section Financière
  const tableBody: any[] = [];
  
  // Droits Administratifs
  if (paiement.montantAdmin && paiement.montantAdmin !== '0') {
    tableBody.push([
      'Droits Administratifs', 
      paiement.refAdmin || '-', 
      paiement.dateAdmin || '-', 
      `${formatMontant(paiement.montantAdmin)} Ar`
    ]);
  }
  
  // Frais Pédagogiques
  if (paiement.montantPedag && paiement.montantPedag !== '0') {
    tableBody.push([
      'Frais Pédagogiques', 
      paiement.refPedag || '-', 
      paiement.datePedag || '-', 
      `${formatMontant(paiement.montantPedag)} Ar`
    ]);
  }
  
  // Écolage
  if (paiement.montantEcolage && paiement.montantEcolage !== '0') {
    tableBody.push([
      'Écolage', 
      paiement.refEcolage || '-', 
      paiement.dateEcolage || '-', 
      `${formatMontant(paiement.montantEcolage)} Ar`
    ]);
  }

  // Si aucun paiement
  if (tableBody.length === 0) {
    tableBody.push([
      'Droits Administratifs', '-', '-', '0 Ar'
    ]);
    tableBody.push([
      'Frais Pédagogiques', '-', '-', '0 Ar'
    ]);
    tableBody.push([
      'Écolage', '-', '-', '0 Ar'
    ]);
  }

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 8,
    head: [['DÉSIGNATION', 'RÉFÉRENCE', 'DATE', 'MONTANT']],
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [250, 250, 250] }
  });

  // Signature et Cachet
  const finalY = (doc as any).lastAutoTable.finalY + 25;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("L'Etudiant(e)", 40, finalY);
  doc.text("Le Responsable SDE", 140, finalY);
  
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("(Signature précédée de la mention 'Lu et approuvé')", 25, finalY + 5);

  // Bordure décorative
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.rect(5, 5, 200, 287);

  // Sauvegarde
  const fileName = `Recepisse_${identite.nom.replace(/\s+/g, '_')}_${numQuittance}.pdf`;
  doc.save(fileName);
};

/**
 * Formate un montant pour l'affichage
 */
function formatMontant(montant: string | number): string {
  const num = typeof montant === 'string' ? parseFloat(montant) : montant;
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}