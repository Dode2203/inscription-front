import { NextRequest } from "next/server";
import { callApiGet } from "@/lib/callApi";

export async function GET(request: NextRequest) {
    // Ajout d'un paramètre optionnel pour filtrer par année
    const allowParams = ["idEtudiant", "annee"];
    
    // Si aucun paramètre n'est fourni, on récupère tous les étudiants
    const searchParams = new URL(request.url).searchParams;
    if (searchParams.toString() === '') {
        // Par défaut, on récupère les étudiants de l'année en cours
        const currentYear = new Date().getFullYear();
        searchParams.set('annee', currentYear.toString());
    }

    return callApiGet(request, "/etudiants", allowParams);
}