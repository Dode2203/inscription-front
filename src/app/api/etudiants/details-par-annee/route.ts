// src/app/api/etudiants/details-par-annee/route.ts
import { NextRequest } from "next/server";
import { callApiGet } from "@/lib/callApi";

export async function GET(request: NextRequest) {
    const allowedParams = ["idEtudiant", "annee"];
    const response = await callApiGet(request, "/etudiants/details-par-annee", allowedParams);        
    return response;
    
}
