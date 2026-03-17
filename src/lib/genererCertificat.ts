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
}

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

/**
 * Fonction utilitaire pour imprimer du texte avec des parties en gras dans jsPDF
 * Utilise la syntaxe **texte en gras**
 */
const printRichText = (doc: jsPDF, text: string, startX: number, startY: number, maxWidth: number, lineHeight: number) => {
  const chunks = text.split('**');
  let cursorX = startX;
  let cursorY = startY;

  chunks.forEach((chunk, index) => {
    const isBold = index % 2 !== 0;
    doc.setFont("times", isBold ? "bold" : "normal");
    
    // On sépare par mot mais on garde les espaces pour les traiter
    const words = chunk.split(/(\s+)/); 
    
    words.forEach(word => {
      if (word === '') return;

      const wordWidth = doc.getTextWidth(word);

      // Si le mot (ou l'espace) dépasse la largeur max, on passe à la ligne
      // (Sauf si c'est un espace en début de ligne, on l'ignore)
      if (cursorX + wordWidth > startX + maxWidth && word.trim() !== '') {
        cursorX = startX;
        cursorY += lineHeight;
      }

      // COMMANDE CRUCIALE : On dessine le texte, même si c'est un espace
      doc.text(word, cursorX, cursorY);
      cursorX += wordWidth;
    });
  });
  
  doc.setFont("times", "normal");
  return cursorY;
};

export const generateCertificatScolaritePDF = async (
  student: Student,
  nomPrenom: string,
  isChef: boolean = false,
  shouldSave: boolean = true,
  
  
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

  // --- RÉFÉRENCE EN GRAS ---
  doc.setFont("times", "bold");
  doc.text(`Réf : UA/ESPA/SDE/ CS/${student.id}`, margin, currentY + 2);
  doc.setFont("times", "normal"); // Retour à la normale

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
  currentY = 80;
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
  currentY += 10;
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.text("Le Directeur de l'Ecole Supérieure Polytechnique d'Antananarivo certifie que :", margin, currentY);

  currentY += 12;
  doc.setFont("times", "bolditalic");
  doc.setFontSize(13);
  const nomComplet = `${student.nom} ${student.prenom || ""}`.toUpperCase();
  doc.text(nomComplet, margin, currentY);

  currentY += 10;
  doc.setFontSize(11);
  const dateTexte = formatDateFR(student.dateNaissance);
  const lieuTexte = student.lieuNaissance || ".................................";

  // --- LIEU DE NAISSANCE EN GRAS ---
  doc.setFont("times", "normal");
  const phraseNaissance = `Né(e) le ${dateTexte} à `;
  doc.text(phraseNaissance, margin, currentY);
  
  doc.setFont("times", "bold");
  doc.text(lieuTexte, margin + doc.getTextWidth(phraseNaissance), currentY);
  doc.setFont("times", "normal");

  currentY += 10;
// 1. On récupère le chiffre du grade
const niveauGrade = student.niveau?.grade || 0;

// 2. On définit la correspondance entre le chiffre et le texte
const gradeEnLettres: { [key: number]: string } = {
  1: "Première Année",
  2: "Deuxième Année",
  3: "Troisième Année",
  4: "Quatrième Année",
  5: "Cinquième Année"
};

// 3. On récupère le libellé (ex: "Première Année") ou on garde le chiffre par défaut
const gradeTexte = gradeEnLettres[niveauGrade] || `${niveauGrade}ème Année`;

// 4. Détermination Licence ou Master
const niveauLettre = niveauGrade > 3 ? "MASTER" : "LICENCE";

let typeFormation = student.formation?.type?.nom || "Formation non définie";

// Ajustement du genre pour MASTER PROFESSIONNEL
if (niveauLettre === "MASTER" && typeFormation?.toUpperCase() === "PROFESSIONNELLE") {
  typeFormation = "PROFESSIONNEL";
}


// 5. Construction du niveauTexte final
// Résultat ex: "PREMIERE ANNEE DE LICENCE PROFESSIONNELLE"
let niveauTexte = `${niveauLettre} ${typeFormation.toUpperCase()} ${gradeTexte.toUpperCase()}`;
if (student.formation?.nom.toUpperCase()=="MASTER RECHERCHE") {
  niveauTexte = "MASTER A VISEE DE RECHERCHE";
}
  const mention = student.mention?.nom || "Mention non définie";
  const mentionAbr = student.mention?.abr|| "";

  const matricule = student.matricule || student.inscription?.matricule || "En cours";
  const mentionGras = mention
  .trim()                         // 1. Enlève les espaces au tout début et à la fin
  .toUpperCase()                  
  .split(/\s+/)                   // 2. Coupe par n'importe quel bloc d'espaces (gère les doubles espaces)
  .map(mot => `**${mot}** `)       // 3. Met chaque mot en gras individuellement
  .join(' ');                      // 4. Rejoint avec UN SEUL espace standard
  // --- MENTION ET MATRICULE EN GRAS (Utilisation de la fonction utilitaire) ---
  const corpsTexte = `est régulièrement inscrit(e) comme étudiant(e) permanent(e) en **: ${niveauTexte.toUpperCase()} ** de la Mention  ${mentionGras}  (**${mentionAbr}**) au sein de notre Ecole durant l'année Universitaire ${anneeUniv} sous le matricule : **${matricule}**.`;
  
  // printRichText gère le gras et les retours à la ligne, et nous renvoie la nouvelle position Y
  currentY = printRichText(doc, corpsTexte, margin, currentY, pageWidth - (margin * 2), 6.5);

  // ==========================================
  // BLOC DE SIGNATURE
  // ==========================================
  currentY += 30; // Ajustement de l'espacement car currentY est maintenant à la fin du paragraphe
  const signatureX = 120;
  
  const dateStr = today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(`Fait à Antananarivo, le ${dateStr}`, signatureX, currentY);

  currentY += 8;
  doc.setFontSize(10);
  doc.text("Pour le Directeur,", signatureX, currentY);
  currentY += 5;
  doc.text("Par délégation", signatureX, currentY);
  currentY += 5;
  doc.text(isChef ? "Le Chef de Service des Etudiants" : "L'Adjoint au Chef de Service des Etudiants", signatureX, currentY);

  // Nom du responsable
  currentY += 35;
  doc.setFont("times", "bold");
  doc.text(nomPrenom, signatureX - 5, currentY);

  // ==========================================
  // PIED DE PAGE (NOTE)
  // ==========================================
  doc.setFont("times", "italic");
  doc.setFontSize(8);
  const note = "Le Service des Etudiants ne délivre qu'un seul certificat de scolarité par année universitaire, l'étudiant peut faire plusieurs copies certifiées.";
  const noteLines = doc.splitTextToSize(note, pageWidth - (margin * 2));
  
  doc.line(margin, 275, pageWidth - margin, 275); // Ligne de séparation
  doc.text(noteLines, margin, 280, { align: "justify" });

  if (shouldSave) {
    doc.save(`Certificat_Scolarite_${student.nom.replace(/\s+/g, '_')}.pdf`);
  }

  return doc;
};