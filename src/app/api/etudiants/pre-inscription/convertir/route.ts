import { NextRequest } from "next/server";
import { callApiPost } from "@/lib/callApi";

export async function POST(request: NextRequest) {
    // Champs requis pour la conversion d'une pré-inscription en inscription finale
    const requiredFields = [
        "preInscriptionId", // ID de la pré-inscription à convertir
        "etudiantData"      
    ];

    // Pointage vers l'endpoint de conversion Symfony
    return callApiPost(request, "/pre-inscription/convertir", requiredFields);
}
