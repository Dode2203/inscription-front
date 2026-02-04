import { NextRequest } from "next/server";
import { callApiPost } from "@/lib/callApi";

export async function POST(request: NextRequest) {
    // Champs requis pour l'enregistrement d'un paiement d'écolage
    const requiredFields = [
        "etudiant_id",
        "nom_niveau",
        "montant",
        "date_paiement",
        "ref_bordereau"
    ];

    // Relais vers l'endpoint backend PHP validé via Postman
    return callApiPost(request, "/ecolage/payment/save", requiredFields);
}
