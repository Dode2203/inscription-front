import { NextRequest } from "next/server";
import { callApiGet } from "@/lib/callApi";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Backend path: /ecolage/etudiant/${id}/history
    return callApiGet(request, `/ecolage/etudiant/${id}/history`, []);
}
