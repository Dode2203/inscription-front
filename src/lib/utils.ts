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
export function formatDate(dateString?: string): string {
  let date = new Date(dateString ?? '');

  // Si date invalide ou absente → date du jour
  if (!dateString || isNaN(date.getTime())) {
    date = new Date();
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
export function formatDateTime(dateString?: string): string {
  let date = new Date(dateString ?? '');

  // Si undefined, null ou date invalide → date du jour
  if (!dateString || isNaN(date.getTime())) {
    date = new Date();
  }

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Convertit une Date JavaScript au format SQL 'Y-m-d H:i:s'
 * @param date L'objet Date à convertir
 * @returns string formatée ou chaîne vide si date invalide
 */
export const formatToSql = (date: Date | null | undefined): string => {
  if (!date || isNaN(date.getTime())) {
    return '';
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Assurez-vous d'utiliser `export` devant les deux fonctions.
// De cette façon, vous pourrez les importer nommément dans n'importe quel composant :
// import { cn, formatDate } from "@/lib/utils";