// src/lib/utils.ts

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Fonction pour fusionner des chaînes de classes CSS,
 * particulièrement utile avec Tailwind CSS.
 * C'est la fonction 'cn' (class names) typique.
 */
export function cn(...inputs: ClassValue[]) {
  // L'instruction retourne directement le résultat de la fusion
  // en utilisant clsx et twMerge.
  return twMerge(clsx(inputs)) 
}

/**
 * Fonction pour formater une chaîne de date en une chaîne
 * de caractères lisible en français.
 * @param dateString - La chaîne de caractères représentant la date.
 * @returns La date formatée (ex: "11 décembre 2025").
 */
export function formatDate(dateString: string): string {
  // 1. Création de l'objet Date à partir de la chaîne fournie en paramètre.
  const date = new Date(dateString); 

  // 2. Formatage de la date en "fr-FR".
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Assurez-vous d'utiliser `export` devant les deux fonctions.
// De cette façon, vous pourrez les importer nommément dans n'importe quel composant :
// import { cn, formatDate } from "@/lib/utils";