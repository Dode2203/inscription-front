import { NextRequest } from "next/server";
import { callApiPost } from "@/lib/callApi";

export async function POST(request: NextRequest) {
    const requiredFields = [
        "idEtudiant",
        "nomPere",
        "nomMere"
    ];
    // This calls the Symfony backend endpoint to update personal details
    return callApiPost(request, "/etudiants/inscription/update-propos-parents", requiredFields);
}
