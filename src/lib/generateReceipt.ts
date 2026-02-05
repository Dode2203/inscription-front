import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Identite, Formation, PaiementData, Inscription } from '@/lib/db';

export const generateReceiptPDF = async (
  identite: Identite,
  formation: Formation,
  paiement: PaiementData,
  inscription?: Inscription | null,
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const centerX = pageWidth / 2;
  const numDossier = inscription?.matricule || `D-${identite.id}`;
  const today = new Date().toLocaleDateString('fr-FR');

  // --- FONCTION LOGO ---
  const addLogo = (url: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        doc.addImage(img, 'PNG', margin, 10, 25, 25);
        // Slogan sous le logo
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("Premier Partenaire des Professionnels", margin - 2, 40);
        resolve();
      };
      img.onerror = () => resolve();
    });
  };

  await addLogo("/espa-logo.png");

  // ==========================================
  // EN-TÊTE (STYLE IMAGE)
  // ==========================================

  // 1. Date automatique en haut à droite
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(`(DATE: ${today})`, pageWidth - margin, 10, { align: "right" });

  // 2. Bloc de texte central
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Université d’Antananarivo", centerX, 18, { align: "center" });
  
  doc.setFont("helvetica", "bold");
  doc.text("Ecole Supérieure Polytechnique d’Antananarivo", centerX, 24, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.text("Service des Etudiants", centerX, 30, { align: "center" });

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("FICHE D’INSCRIPTION", centerX, 45, { align: "center" });
  
  doc.setFontSize(14);
  doc.text("Année Universitaire 2025-2026", centerX, 53, { align: "center" });

  // 3. Cadre Photo à droite
  doc.setLineWidth(0.5);
  doc.rect(155, 15, 40, 45); 
  doc.setFontSize(16);
  doc.text("PHOTO", 175, 42, { align: "center" });

  // ==========================================
  // RENSEIGNEMENTS PÉDAGOGIQUES
  // ==========================================
  
  let currentY = 75;
  
  // Titre souligné
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RENSEIGNEMENTS PEDAGOGIQUES", margin, currentY);
  doc.line(margin, currentY + 1, margin + 70, currentY + 1); // Soulignement

  doc.text(`Dossier N° :`, 140, currentY);
  doc.setFont("helvetica", "italic");
  doc.text(`${numDossier}`, 170, currentY);
  
  currentY += 12;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Mention : ${formation.mention}`, margin, currentY);
  currentY += 7;
  doc.text(`Parcours : ${formation.formation}`, margin, currentY);
  currentY += 7;
  doc.text(`Niveau : ${formation.niveau}`, margin, currentY);
  doc.text(`Type de formation : ${formation.formationType}`, 110, currentY);
  currentY += 7;
  doc.text(`IM : ${inscription?.matricule || "-"}`, margin, currentY);

  // --- ETAT CIVIL ---
  currentY += 12;
  doc.setFont("helvetica", "bold");
  doc.text("ETAT CIVIL", margin, currentY);
  doc.line(margin, currentY + 1, margin + 22, currentY + 1);
  
  currentY += 8;
  doc.setFont("helvetica", "normal");
  doc.text(`Nom : ${identite.nom.toUpperCase()}`, margin, currentY);
  currentY += 7;
  doc.text(`Prénom(s) : ${identite.prenom}`, margin, currentY);
  currentY += 7;
  doc.text(`Date et Lieu de naissance : ${identite.dateNaissance} à ${identite.lieuNaissance}`, margin, currentY);
  currentY += 7;
  doc.text(`CIN : ${identite.cin?.numero || "-"} du ${identite.cin?.dateDelivrance || "-"} à ${identite.cin?.lieuDelivrance || "-"}`, margin, currentY);
  currentY += 7;
  doc.text(`Contact : ${identite.contact.telephone} / ${identite.contact.email}`, margin, currentY);

  // --- SÉPARATEUR POUR LE RÉCÉPISSÉ ---
  currentY += 15;
  doc.setLineDashPattern([2, 2], 0);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  doc.setLineDashPattern([], 0);

  // ==========================================
  // RÉCÉPISSÉ (BAS DE PAGE)
  // ==========================================
  currentY += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("RECEPISSE D’INSCRIPTION 2025-2026", centerX, currentY, { align: "center" });

  currentY += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const recapData = [
    ['Nom & Prénoms', `${identite.nom.toUpperCase()} ${identite.prenom}`],
    ['Mention / Niveau', `${formation.mention} / ${formation.niveau}`],
    ['N° Dossier', numDossier]
  ];

  autoTable(doc, {
    startY: currentY,
    body: recapData,
    theme: 'plain',
    styles: { cellPadding: 1, fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Tableau des paiements simplifié
  autoTable(doc, {
    startY: finalY,
    head: [['DESIGNATION', 'REFERENCE', 'MONTANT']],
    body: [
      ['Droit Administratif', paiement.refAdmin || '-', `${formatMontant(paiement.montantAdmin || 0)} Ar`],
      ['Droit Pédagogique', paiement.refPedag || '-', `${formatMontant(paiement.montantPedag || 0)} Ar`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [230, 230, 230], textColor: 0 }
  });
  doc.text("Le Responsable,", pageWidth - margin - 40, finalY);
  doc.save(`Fiche_ESPA_${identite.nom.replace(/\s+/g, '_')}.pdf`);
};

function formatMontant(m: any) {
  return Number(m).toLocaleString('fr-FR');
}