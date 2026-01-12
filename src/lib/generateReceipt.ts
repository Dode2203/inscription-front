import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Identite, Formation, PaiementData, Inscription } from '@/lib/db';

export const generateReceiptPDF = (
  identite: Identite,
  formation: Formation,
  paiement: PaiementData,
  inscription: Inscription,
) => {
  const doc = new jsPDF();
  
  // 1. Définition du Logo
  // Le chemin part du dossier 'public' de Next.js
  const logoUrl = "/espa-logo.png"; 

  const numQuittance = inscription?.matricule || `Q-${identite.id}-${new Date().getTime().toString().slice(-6)}`;

  // --- Design de l'En-tête ---
  // Rectangle bleu de fond
  doc.setFillColor(30, 58, 138); 
  doc.rect(0, 0, 210, 45, 'F');
  
  // AJOUT DU LOGO
  // addImage(src, format, x, y, largeur, hauteur)
  try {
    doc.addImage(logoUrl, 'PNG', 15, 7, 30, 30);
  } catch (e) {
    console.error("Logo non trouvé ou format invalide", e);
  }

  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("RECEPISSE D'INSCRIPTION", 115, 22, { align: "center" });
  
  doc.setFontSize(10);
  doc.text("ECOLE SUPERIEURE POLYTECHNIQUE D'ANTANANARIVO", 115, 32, { align: "center" });

  // --- Corps du document ---
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(`NUMÉRO DE SÉRIE : ${identite.id}`, 14, 55);
  doc.text(`QUITTANCE N° : ${numQuittance}`, 140, 55);

  // --- Section Informations Étudiant ---
  autoTable(doc, {
    startY: 65,
    head: [[{ content: 'IDENTIFICATION DE L\'ETUDIANT', colSpan: 2, styles: { halign: 'center', fillColor: [30, 58, 138] } }]],
    body: [
      ['Nom & Prénoms', `${identite.nom.toUpperCase()} ${identite.prenom}`],
      ['Date & Lieu de Naissance', `${identite.dateNaissance} à ${identite.lieuNaissance}`],
      ['Contact', `${identite.contact.telephone || 'Non renseigné'}`],
      ['Email', identite.contact.email],
    ],
    theme: 'grid',
    headStyles: { textColor: [255, 255, 255] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, fillColor: [245, 245, 245] } }
  });

  // --- Section Académique ---
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [[{ content: 'PARCOURS ACADÉMIQUE', colSpan: 2, styles: { halign: 'center', fillColor: [30, 58, 138] } }]],
    body: [
      ['Formation / Mention', `${formation.formation} - ${formation.mention}`],
      ['Niveau', formation.niveau],
      ['Type de Parcours', formation.formationType],
    ],
    theme: 'grid',
    headStyles: { textColor: [255, 255, 255] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, fillColor: [245, 245, 245] } }
  });

  // --- Section Financière ---
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['DÉSIGNATION', 'RÉFÉRENCE', 'DATE', 'MONTANT']],
    body: [
      ['Droits Administratifs', paiement.refAdmin, paiement.dateAdmin, `${paiement.montantAdmin} Ar`],
      ['Frais Pédagogiques', paiement.refPedag, paiement.datePedag, `${paiement.montantPedag} Ar`],
      ['Écolage', paiement.refEcolage || '-', paiement.dateEcolage || '-', `${paiement.montantEcolage || 0} Ar`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [251, 191, 36], textColor: [30, 58, 138] }, 
  });

  // --- Signature et Cachet ---
  const finalY = (doc as any).lastAutoTable.finalY + 25;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("L'Etudiant(e)", 40, finalY);
  doc.text("Le Responsable SDE", 140, finalY);
  
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("(Signature précédée de la mention 'Lu et approuvé')", 25, finalY + 5);

  // Bordure décorative
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, 200, 287);

  // Sauvegarde
  doc.save(`Recepisse_${identite.nom.replace(/\s+/g, '_')}_${identite.id}.pdf`);
};