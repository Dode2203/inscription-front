import { NextRequest } from "next/server";
import { callApiGet } from "@/lib/callApi";
import { all } from "axios";
export async function GET(request: NextRequest) {
    const allowParams= ["idEtudiant"];

    return callApiGet(request, "/etudiants", allowParams);
}