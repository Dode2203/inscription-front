import { NextRequest } from "next/server";
import { callApiPost } from "@/lib/callApi";

export async function POST(request: NextRequest) {
   const requiredFields = [
      "idNiveau",
      "idFormation",
      "refAdmin",
      "dateAdmin",
      "montantAdmin",
      "refPedag",
      "datePedag",
      "montantPedag",
      "estBoursier",
   ];
   return callApiPost(request, "/etudiants/inscrire", requiredFields);
}