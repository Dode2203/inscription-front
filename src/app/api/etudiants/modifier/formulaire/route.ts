import { NextRequest } from "next/server";
import { callApiGet } from "@/lib/callApi";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  // On utilise callApiGet pour pointer vers l'endpoint Symfony /etudiants/{id}/documents
  return callApiGet(request, `/etudiants/${id}/documents`);
}
