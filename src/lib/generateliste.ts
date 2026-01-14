import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Remplacez cette chaîne par le Base64 réel de votre logo
const LOGO_BASE64 = "/espa-logo.png"; 

export const generateStudentPDF = (data: any[], mention: string, niveau: string) => {
  const doc = new jsPDF();
  const dateGeneration = new Date().toLocaleDateString('fr-FR');

  // --- 1. LOGO ET EN-TÊTE ---
  // On place le logo en haut à gauche (x: 15, y: 10, largeur: 25, hauteur: 25)
  try {
     {
      doc.addImage(LOGO_BASE64, 'PNG', 15, 10, 25, 25);
    }
  } catch (e) {
    console.error("Erreur lors de l'ajout du logo au PDF", e);
  }

  // --- 2. TEXTE DE L'EN-TÊTE (Décalé à côté du logo) ---
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  
  const textX = 45; // Décalage pour laisser la place au logo
  doc.text("UNIVERSITE D'ANTANANARIVO", textX, 15);
  doc.text("ECOLE SUPERIEURE POLYTECHNIQUE", textX, 20);
  doc.text("D'ANTANANARIVO", textX, 25);
  doc.text("--------------ooOoo--------------", textX, 30);
  
  // Année Universitaire à droite
  doc.setFontSize(10);
  doc.text("Année Universitaire 2025/2026", 140, 15);

  // --- 3. TITRE PRINCIPAL ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("LISTE DES ÉTUDIANTS INSCRITS", 105, 48, { align: "center" });
  
  doc.setFontSize(10);
  doc.text(`MENTION : ${mention.toUpperCase() || "TOUTES"}`, 105, 56, { align: "center" });
  if (niveau) {
    doc.text(`NIVEAU : ${niveau.toUpperCase()}`, 105, 62, { align: "center" });
  }

  // --- 4. TABLEAU DES DONNÉES (Style institutionnel simple) ---
  const tableRows = data.map((et) => [
    `#${et.id.toString().padStart(4, '0')}`,
    `${et.nom.toUpperCase()} ${et.prenom}`,
    et.mentionAbr,
    et.niveau
  ]);

  autoTable(doc, {
    startY: 70,
    head: [['MATRICULE', 'NOM ET PRENOMS', 'MENTION', 'NIVEAU']],
    body: tableRows,
    theme: 'grid',
    headStyles: { 
      fillColor: [255, 255, 255], 
      textColor: [0, 0, 0], 
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0.1
    },
    bodyStyles: { 
      fontSize: 9, 
      textColor: [0, 0, 0],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 30, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
    },
    styles: {
      font: "helvetica",
      lineColor: [0, 0, 0],
      valign: 'middle'
    }
  });

  // --- 5. BAS DE PAGE ET SIGNATURE ---
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`ARRÊTÉE LA PRÉSENTE LISTE AU NOMBRE DE ${data.length} ÉTUDIANT(S).`, 15, finalY);

  const signatureY = finalY + 15;
  doc.setFont("helvetica", "normal");
  doc.text(`Fait à Antananarivo, le ${dateGeneration}`, 130, signatureY);
  
  doc.setFont("helvetica", "bold");
  doc.text("Le Responsable,", 145, signatureY + 8);
  
  // Ligne de signature
  doc.setLineWidth(0.2);
  doc.line(135, signatureY + 30, 185, signatureY + 30);

  // Téléchargement
  doc.save(`Liste_Etudiants_${mention.replace(/\s+/g, '_')}.pdf`);
};