import { NextRequest } from "next/server";
import { callApiGet } from "@/lib/callApi";

export async function GET(request: NextRequest) {
    const allowedParams = ['annee'];
    const response = await callApiGet(request, "/etudiants/inscrits-par-annee", allowedParams);
    return response;
    
}
