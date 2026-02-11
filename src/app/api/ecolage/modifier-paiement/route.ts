import { NextRequest } from "next/server";
import { callApiPost } from "@/lib/callApi";

export async function POST(request: NextRequest) {
    // Champs requis pour la modification d'un paiement
    const requiredFields = [
        "id",
        "montant",
        "datePayment",
        "reference"
    ];

    // Relais vers l'endpoint backend Symfony pour modifier un paiement
    return callApiPost(request, "/ecolage/modifier-paiement", requiredFields);
}
