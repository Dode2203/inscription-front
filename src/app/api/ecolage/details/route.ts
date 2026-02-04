import { NextRequest } from "next/server";
import { callApiGet } from "@/lib/callApi";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // On utilise NextRequest pour que getServerAxios puisse extraire les cookies (auth_token)
    return callApiGet(request, `/ecolage/etudiant/${id}/details`);
}
