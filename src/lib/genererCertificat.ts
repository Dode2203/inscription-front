import jsPDF from 'jspdf';
import { Student } from '@/lib/db'; // Ajustez l'import selon votre structure

/**
 * Calcule l'année universitaire précédente (N-1)
 * @param anneeCurrent Exemple: "2025-2026" ou "2025"
 * @returns Exemple: "2024-2025"
 */
function getPreviousAcademicYear(anneeCurrent?: string): string {
  const defaultYear = "2024-2025";
  
  if (!anneeCurrent) return defaultYear;

  // Extrait tous les nombres de la chaîne
  const years = anneeCurrent.match(/\d+/g);

  if (years && years.length >= 1) {
    const start = parseInt(years[0]) - 1;
    // Si on a une deuxième année (ex: 2026), on fait -1, sinon on fait start + 1
    const end = years[1] ? parseInt(years[1]) - 1 : start + 1;
    
    return `${start}-${end}`;
  }

  return defaultYear;
};
/**
 * Formate une date en JJ/MM/AAAA
 * @param dateStr exemple: "2022-05-02"
 * @returns exemple: "02/05/2022"
 */
const formatDateFR = (dateStr: any): string => {
  if (!dateStr) return "";

  try {
    const date = new Date(dateStr);

    // Vérifie si la date est valide
    if (isNaN(date.getTime())) {
        // Si c'est déjà une chaîne type "02/05/2022", on la renvoie telle quelle
        return typeof dateStr === 'string' ? dateStr : "";
    }

    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');

    return `${d}/${m}/${y}`; 
  } catch (error) {
    console.error("Erreur formatage date:", error);
    return "";
  }
};
export const generateCertificatScolaritePDF = async (
  student: Student,
  shouldSave: boolean = true
) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const centerX = pageWidth / 2;
  const today = new Date();

  // --- FONCTION CHARGEMENT IMAGES ---
  const loadImage = (url: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.crossOrigin = "Anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
    });
  };

  const logoImg = await loadImage("/espa-logo.png"); // Assurez-vous que le chemin est correct

  // ==========================================
  // EN-TÊTE (MINISTÈRE & SERVICE)
  // ==========================================
  doc.setFont("times", "bold");
  doc.setFontSize(9);
  
  let currentY = 20;
  const headerLeft = [
    "Ministère de l'Enseignement Supérieur et de la",
    "Recherche Scientifique",
    "-------------------",
    "Université d'Antananarivo",
    "Ecole Supérieure Polytechnique d'Antananarivo",
    "-----------------",
    "Administration Centrale",
    "-----------------",
    "Service des Etudiants",
    "-----------------"
  ];

  headerLeft.forEach(line => {
    doc.text(line, 55, currentY, { align: "center" });
    currentY += 4.5;
  });

  doc.setFont("times", "normal");
  doc.text(`Réf : UA/ESPA/SDE/ CS/${Math.floor(Math.random() * 90000) + 10000}`, margin, currentY + 2);

  // --- LOGO (A DROITE) ---
  if (logoImg) {
    doc.addImage(logoImg, 'PNG', 150, 15, 35, 35);
    doc.setFontSize(7);
    doc.setFont("times", "italic");
    doc.text("Premier Partenaire des Professionnels", 167.5, 53, { align: "center" });
  }

  // ==========================================
  // TITRE DU DOCUMENT
  // ==========================================
  currentY = 70;
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.text("CERTIFICAT DE SCOLARITE", centerX, currentY, { align: "center" });
  
  currentY += 7;
  doc.setFontSize(11);
  const anneeUniv = getPreviousAcademicYear("2026");
  doc.text(`ANNEE UNIVERSITAIRE ${anneeUniv}`, centerX, currentY, { align: "center" });

  // ==========================================
  // CORPS DU TEXTE
  // ==========================================
  currentY += 20;
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.text("Le Directeur de l'Ecole Supérieure Polytechnique d'Antananarivo certifie que :", margin, currentY);

  currentY += 12;
  doc.setFont("times", "bolditalic");
  doc.setFontSize(13);
  const nomComplet = `${student.nom} ${student.prenom || ""}`.toUpperCase();
  doc.text(nomComplet, margin, currentY);

  currentY += 10;
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.text(`Né(e) le ${formatDateFR(student.dateNaissance)}`, margin, currentY);
  doc.text(`à ${student.lieuNaissance || "................................."}`, 70, currentY);

  currentY += 10;
  const niveau = student.niveau?.nom || "Niveau non défini";
  const mention = student.mention?.nom || "Mention non définie";
  const parcours = student.parcours?.nom || student.formation?.nom || "Parcours non défini";
  const matricule = student.matricule || student.inscription?.matricule || "En cours";

  // Texte justifié (simulé avec splitTextToSize)
  const corpsTexte = `est régulièrement inscrit(e) comme étudiant(e) permanent(e) en : ${niveau.toUpperCase()} de la Mention ${mention.toUpperCase()} - Parcours au sein de notre Ecole durant l'année Universitaire ${anneeUniv} sous le matricule : ${matricule}.`;
  
  const textLines = doc.splitTextToSize(corpsTexte, pageWidth - (margin * 2));
  doc.text(textLines, margin, currentY, { lineHeightFactor: 1.5 });

  // ==========================================
  // BLOC DE SIGNATURE
  // ==========================================
  currentY += 40;
  const signatureX = 120;
  
  const dateStr = today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(`Fait à Antananarivo, le ${dateStr}`, signatureX, currentY);

  currentY += 8;
  doc.setFontSize(10);
  doc.text("Pour le Directeur,", signatureX, currentY);
  currentY += 5;
  doc.text("Par délégation", signatureX, currentY);
  currentY += 5;
  doc.text("Le Chef du Service des Etudiants", signatureX, currentY);

  // Nom du responsable
  currentY += 35;
  doc.setFont("times", "bold");
  doc.text("RAZAFINTSALAMA Hantanirina Tahinasoa", signatureX - 5, currentY);

  // ==========================================
  // PIED DE PAGE (NOTE)
  // ==========================================
  doc.setFont("times", "italic");
  doc.setFontSize(8);
  const note = "Le Service des Etudiants ne délivre qu'un seul certificat de scolarité par année universitaire, l'étudiant peut faire plusieurs copies certifiées par le Directeur de l'Ecole Supérieure Polytechnique d'Antananarivo.";
  const noteLines = doc.splitTextToSize(note, pageWidth - (margin * 2));
  
  doc.line(margin, 275, pageWidth - margin, 275); // Ligne de séparation
  doc.text(noteLines, margin, 280, { align: "justify" });

  if (shouldSave) {
    doc.save(`Certificat_Scolarite_${student.nom.replace(/\s+/g, '_')}.pdf`);
  }

  return doc;
};