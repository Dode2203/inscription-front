import { NextRequest } from "next/server";
import { callApiPost } from "@/lib/callApi";
export async function POST(request: NextRequest) {
  // Champs requis pour la création d'un étudiant
  const requiredFields = [
    "id",
    "nom",
    // "prenom",
    "dateNaissance",
    "lieuNaissance",
    "sexeId",
    "cinNumero",
    "cinLieu",
    "dateCin",
    "baccNumero",
    "baccAnnee",
    "baccSerie",
    "proposEmail",
    "proposAdresse"
  ];

  // Pointage vers l'endpoint de sauvegarde Symfony
  return callApiPost(request, "/etudiants/save", requiredFields);
}
