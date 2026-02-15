import { NextRequest } from "next/server";
import { callApiPost } from "@/lib/callApi";

export async function POST(request: NextRequest) {
    // Champs requis pour la pré-inscription rapide
    const requiredFields = [
        "nom",
        "prenom",
        "mentionId",
        "formationId"
    ];

    // Pointage vers l'endpoint de sauvegarde pré-inscription Symfony
    return callApiPost(request, "/pre-inscription/save", requiredFields);
}
