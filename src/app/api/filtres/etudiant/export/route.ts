import { NextRequest } from "next/server";
import { callApiGet } from "@/lib/callApi";

export async function GET(request: NextRequest) {
  // 1. Définir l'URL de votre backend Symfony
  // Idéalement, utilisez une variable d'environnement pour l'URL de base
  const url = `/filtres/etudiant/export`;

  // 2. Définir les paramètres que vous autorisez à passer du front vers le back
  // En regardant votre code PHP, vous avez besoin de : idMention, idNiveau, limit
  const allowedParams = ["idMention", "idNiveau", "limit"];

  // 3. Appeler l'utilitaire
  return await callApiGet(request, url, allowedParams);
}