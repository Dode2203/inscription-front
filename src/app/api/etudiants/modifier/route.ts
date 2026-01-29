import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Récupération de l'URL du backend depuis les variables d'environnement
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error("URL du backend non configurée");
    }

    // Récupération du corps de la requête
    const body = await request.json();
    
    // Log pour le débogage
    console.log("Données transmises au backend:", JSON.stringify(body, null, 2));
    
    // Appel direct au backend Symfony
    const response = await fetch(`${backendUrl}/etudiants/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Tu peux ajouter d'autres en-têtes nécessaires ici
      },
      body: JSON.stringify(body)
    });

    // Renvoie la réponse brute du backend
    const responseData = await response.json();
    console.log("Réponse du backend:", responseData);
    
    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error("Erreur dans la route de modification:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: error instanceof Error ? error.message : "Erreur inconnue"
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
