import { NextRequest, NextResponse } from "next/server";
import { callApiPost } from "@/lib/callApi";

export async function POST(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: "ID de paiement manquant" }, { status: 400 });
    }

    // Relais vers l'endpoint backend PHP Symfony : POST /api/paiements/annuler/{id}
    return callApiPost(request, `/ecolage/payment/annuler/${id}`, []);
}
