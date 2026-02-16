import { NextRequest } from "next/server";
import { callApiPost } from "@/lib/callApi";

export async function POST(request: NextRequest) {
   const requiredFields = [
      "idEtudiant"
   ];
   return callApiPost(request, "/etudiants/changerNiveauEtudiant", requiredFields);
}