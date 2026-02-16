import { NextRequest } from "next/server";
import { callApiGet } from "@/lib/callApi";
export async function GET(request: NextRequest) {
    const allowParams= ["idEtudiant"];

    return callApiGet(request, "/etudiants/all", allowParams);
}