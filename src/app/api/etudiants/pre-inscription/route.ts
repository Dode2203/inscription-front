import { NextRequest, NextResponse } from "next/server";
import { callApiPost } from "@/lib/callApi";
import { sortStudentsAlphabetically } from "@/lib/utils";

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const searchType = searchParams.get("type");

        let response;

        if (searchType === "all") {
            // Liste complète : endpoint Symfony /pre-inscription/search
            // Pas besoin de lire le body, on passe request directement
            response = await callApiPost(request, "/pre-inscription/search", []);
        } else {
            // Recherche filtrée : lire le body UNE SEULE FOIS ici
            const body = await request.json();
            const nom: string = body.nom ?? "";
            const prenom: string = body.prenom ?? "";

            // Construire un nouveau Request synthétique avec exactement { nom, prenom }
            // pour que callApiPost puisse le lire sans double-read du stream
            const syntheticRequest = new NextRequest(request.url, {
                method: "POST",
                headers: request.headers,
                body: JSON.stringify({ nom, prenom }),
            });

            response = await callApiPost(
                syntheticRequest,
                "/pre-inscription/search-filter",
                []
            );
        }

        if (!response.ok) {
            return response;
        }

        const result = await response.json();
        let students = result.data || result.results || [];

        // Tri : Applique systématiquement sortStudentsAlphabetically
        students = sortStudentsAlphabetically(students);

        return NextResponse.json({
            status: "success",
            data: students
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: error.message || "Une erreur interne est survenue"
        }, { status: error.response?.status || 500 });
    }
}
