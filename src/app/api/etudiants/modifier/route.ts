import { NextRequest } from "next/server";
import { callApiPost } from "@/lib/callApi";

export async function POST(request: NextRequest) {
  const requiredFields = [
    "id",
    "nom",
    "prenom",
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

  return callApiPost(request, "/etudiants/save", requiredFields);
}
