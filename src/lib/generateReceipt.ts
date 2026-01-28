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
  const logoUrl = "/espa-logo.png"; 

  // Génération du numéro de quittance
  const numQuittance = inscription?.matricule 
    || `Q-${identite.id}-${new Date().getTime().toString().slice(-6)}`;

  // --- 1. EN-TÊTE INSTITUTIONNEL (Style Liste) ---
  try {
    doc.addImage(logoUrl, 'PNG', 15, 10, 25, 25);
  } catch (e) {
    console.error("Logo non trouvé", e);
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  
  const textX = 45; 
  doc.text("UNIVERSITE D'ANTANANARIVO", textX, 15);
  doc.text("ECOLE SUPERIEURE POLYTECHNIQUE", textX, 20);
  doc.text("D'ANTANANARIVO", textX, 25);
  doc.text("--------------ooOoo--------------", textX, 30);
  
  doc.setFontSize(10);
  doc.text("Année Universitaire 2025/2026", 140, 15);

  // --- 2. TITRE DU DOCUMENT ---
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("RECEPISSE D'INSCRIPTION", 105, 48, { align: "center" });
  
  doc.setFontSize(10);
  doc.text(`QUITTANCE N° : ${numQuittance}`, 105, 55, { align: "center" });

  // --- 3. IDENTIFICATION (Style Grille Epurée) ---
  autoTable(doc, {
    startY: 65,
    head: [[{ 
      content: 'IDENTIFICATION DE L\'ETUDIANT', 
      colSpan: 2, 
      styles: { halign: 'center', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } 
    }]],
    body: [
      ['Nom & Prénoms', `${identite.nom.toUpperCase()} ${identite.prenom}`],
      ['Date & Lieu de Naissance', `${identite.dateNaissance} à ${identite.lieuNaissance}`],
      ['Sexe', identite.sexe],
      ['Contact / Email', `${identite.contact.adresse || '-'} / ${identite.contact.email}`],
    ],
    theme: 'grid',
    styles: { lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0] },
    columnStyles: { 
      0: { fontStyle: 'bold', cellWidth: 60, fillColor: [250, 250, 250] } 
    }
  });

  // --- 4. PARCOURS ACADÉMIQUE ---
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 5,
    head: [[{ 
      content: 'PARCOURS ACADÉMIQUE', 
      colSpan: 2, 
      styles: { halign: 'center', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } 
    }]],
    body: [
      ['Formation', formation.formation],
      ['Mention / Niveau', `${formation.mention} - ${formation.niveau}`],
      ['Type de Parcours', formation.formationType],
    ],
    theme: 'grid',
    styles: { lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0] },
    columnStyles: { 
      0: { fontStyle: 'bold', cellWidth: 60, fillColor: [250, 250, 250] } 
    }
  });

  // --- 5. SECTION FINANCIÈRE ---
  const tableBody: any[] = [];
  if (paiement.montantAdmin && paiement.montantAdmin !== '0') {
    tableBody.push(['Droits Administratifs', paiement.refAdmin || '-', paiement.dateAdmin || '-', `${formatMontant(paiement.montantAdmin)} Ar`]);
  }
  if (paiement.montantPedag && paiement.montantPedag !== '0') {
    tableBody.push(['Frais Pédagogiques', paiement.refPedag || '-', paiement.datePedag || '-', `${formatMontant(paiement.montantPedag)} Ar`]);
  }
  if (paiement.montantEcolage && paiement.montantEcolage !== '0') {
    tableBody.push(['Écolage', paiement.refEcolage || '-', paiement.dateEcolage || '-', `${formatMontant(paiement.montantEcolage)} Ar`]);
  }

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 5,
    head: [['DÉSIGNATION', 'RÉFÉRENCE', 'DATE', 'MONTANT']],
    body: tableBody.length > 0 ? tableBody : [['-', '-', '-', '0 Ar']],
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineColor: [0, 0, 0], lineWidth: 0.1 },
    styles: { lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0] },
  });

  // --- 6. SIGNATURES ---
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("L'Etudiant(e),", 30, finalY);
  doc.text("Le Responsable SDE,", 140, finalY);
  
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("(Signature précédée de la mention 'Lu et approuvé')", 15, finalY + 20);

  // Bas de page (Fait à...)
  doc.setFont("helvetica", "normal");
  doc.text(`Fait à Antananarivo, le ${new Date().toLocaleDateString('fr-FR')}`, 130, finalY + 30);

  // Bordure simple
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.1);
  doc.rect(5, 5, 200, 287);

  // Sauvegarde
  const fileName = `Recepisse_${identite.nom.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};

function formatMontant(montant: string | number): string {
  const num =
    typeof montant === 'string'
      ? Number(montant.replace(/\s|\/|,/g, ''))
      : montant;

  return num.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, '.');
}

