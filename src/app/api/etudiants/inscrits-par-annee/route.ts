import { NextRequest } from "next/server";
import { callApiGet } from "@/lib/callApi";

export async function GET(request: NextRequest) {
    try {
        // Récupérer le paramètre d'année, par défaut l'année en cours
        const searchParams = new URL(request.url).searchParams;
        const annee = searchParams.get('annee') || new Date().getFullYear().toString();
        
        // Appeler l'API avec le paramètre d'année
        const response = await callApiGet(request, "/etudiants/inscrits-par-annee", ["annee"]);
        
        // Si l'API renvoie une erreur, on la propage
        if (response.status !== 200) {
            return response;
        }
        
        // Récupérer les données de la réponse
        const responseData = await response.json();
        
        // Vérifier si la réponse contient déjà les données formatées
        if (responseData.status === 'success' && responseData.data) {
            // Si les données sont déjà dans le format attendu, on les renvoie telles quelles
            return new Response(JSON.stringify(responseData), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        
        // Sinon, on formate la réponse selon la structure attendue
        return new Response(JSON.stringify({
            status: "success",
            annee: annee,
            total: responseData.length || 0,
            data: responseData || []
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Erreur dans /api/etudiants/inscrits-par-annee:', error);
        return new Response(JSON.stringify({
            status: "error",
            message: error instanceof Error ? error.message : "Erreur lors de la récupération des données"
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
