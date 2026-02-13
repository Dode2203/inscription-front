import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Identite, Formation, PaiementEtudiant } from '@/lib/db';
const formatAr = (value: number | string | null | undefined): string => {
  const number = Number(value) || 0;

  return (
    new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(number)
      .replace(/\s/g, ' ') // 🔥 CRUCIAL
      + ' Ar'
  );
};

export const generateReceiptPDF = async (
  identite: Identite,
  formation: Formation,
  paiements: PaiementEtudiant[],  
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const centerX = pageWidth / 2;
  const numDossier = formation?.matricule || `D-${identite.id}`;
  const today = new Date().toLocaleDateString('fr-FR');

  // --- FONCTION CHARGEMENT IMAGES ---
  const loadImage = (url: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
    });
  };

  // Chargement préalable des images
  const logoImg = await loadImage("/espa-logo.png");
  const signatureImg = await loadImage("/signature.jpeg");

  // --- LOGO ---
  if (logoImg) {
    doc.addImage(logoImg, 'PNG', margin, 10, 25, 25);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("Premier Partenaire des Professionnels", margin - 2, 40);
  }

  // ==========================================
  // EN-TÊTE
  // ==========================================
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(`(DATE: ${today})`, pageWidth - margin, 10, { align: "right" });

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

  // Cadre Photo
  doc.setLineWidth(0.5);
  doc.rect(155, 15, 40, 45);
  doc.setFontSize(16);
  doc.text("PHOTO", 175, 42, { align: "center" });

  // ==========================================
  // RENSEIGNEMENTS PÉDAGOGIQUES
  // ==========================================
  let currentY = 75;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RENSEIGNEMENTS PEDAGOGIQUES", margin, currentY);
  doc.line(margin, currentY + 1, margin + 70, currentY + 1);

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
  doc.text(`IM : ${ numDossier }`, margin, currentY);

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
  doc.text(`Fils/Fille de : ${identite.contact.nomPere || ".................................................."}`, margin, currentY);
  currentY += 7;
  doc.text(`Et de : ${identite.contact.nomMere || ".................................................."}`, margin, currentY);
  currentY += 7;
  doc.text(`Date et Lieu de naissance : ${identite.dateNaissance} à ${identite.lieuNaissance}`, margin, currentY);
  currentY += 7;
  doc.text(`CIN : ${identite.cin?.numero || "-"} du ${identite.cin?.dateDelivrance || "-"} à ${identite.cin?.lieuDelivrance || "-"}`, margin, currentY);
  currentY += 7;
  doc.text(`Contact : ${identite.contact.telephone} / ${identite.contact.email}`, margin, currentY);

  // --- SÉPARATEUR ---
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
  autoTable(doc, {
    startY: currentY,
    body: [
      ['Nom & Prénoms', `${identite.nom.toUpperCase()} ${identite.prenom}`],
      ['Mention / Niveau', `${formation.mention} / ${formation.niveau}`],
      ['N° Dossier', numDossier]
    ],
    theme: 'plain',
    styles: { cellPadding: 1, fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
  });

  // 1. On prépare les données dynamiquement avec une boucle (map)
// 1. Transformer les données avec correction automatique du texte
  const tableBody = paiements.map((p) => {
    // Correction du problème d'encodage (P‚dagogique -> Pédagogique)
    let designation = p.typeDroit;
    if (designation === 'P‚dagogique') {
      designation = 'Pédagogique';
    }

    return [
      designation || '-',
      p.reference || '-',
      formatAr(p.montant || 0)
    ];
  });

  // 2. Générer le tableau avec les données nettoyées
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 5,
    head: [['DESIGNATION', 'REFERENCE', 'MONTANT']],
    body: tableBody,
    theme: 'grid',
    headStyles: { 
      fillColor: [230, 230, 230], 
      textColor: 0,
      fontStyle: 'bold' 
    },
    columnStyles: {
      2: { halign: 'right' } // Aligne les montants à droite pour plus de lisibilité
    }
  });
  // ==========================================
  // BLOC SIGNATURE RESPONSABLE (TOUT EN BAS)
  // ==========================================
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const signatureX = pageWidth - margin - 60; // Position horizontale du bloc

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Le Responsable,", signatureX, finalY);

  // Ajout de l'image de la signature si elle existe
  if (signatureImg) {
    // On la place entre "Le Responsable" et le Nom
    // doc.addImage(signatureImg, 'JPEG', signatureX, finalY + 2, 40, 25);
  }

  // Nom du responsable
  doc.setFontSize(10);
//  doc.text("RAZAFINTSALAMA Hantanirina Tahinasoa", signatureX - 5, finalY + 32);

  doc.save(`Fiche_ESPA_${identite.nom.replace(/\s+/g, '_')}.pdf`);
};

function formatMontant(m: any) {
  return Number(m).toLocaleString('fr-FR');
}