// src/app/api/etudiants/details-par-annee/route.ts
import { NextRequest } from "next/server";
import { callApiGet } from "@/lib/callApi";

export async function GET(request: NextRequest) {
    try {
        const searchParams = new URL(request.url).searchParams;
        const idEtudiant = searchParams.get('idEtudiant');
        const annee = searchParams.get('annee') || new Date().getFullYear().toString();
        
        // Vérifier que l'ID étudiant est fourni
        if (!idEtudiant) {
            return new Response(JSON.stringify({
                status: "error",
                message: "L'ID de l'étudiant est requis"
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        
        // Appeler l'API backend avec les paramètres
        const response = await callApiGet(
            request, 
            "/etudiants/details-par-annee", 
            ["idEtudiant", "annee"]
        );
        
        return response;
        
    } catch (error) {
        console.error('Erreur dans /api/etudiants/details-par-annee:', error);
        return new Response(JSON.stringify({
            status: "error",
            message: error instanceof Error ? error.message : "Erreur lors de la récupération des détails"
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
