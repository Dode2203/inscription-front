import { type NextRequest, NextResponse } from "next/server"

import axios from "axios";
import { getServerAxios } from "@/lib/getServerAxios";
import { callApiGet } from "@/lib/callApi";
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type) {
        return Response.json({ error: "Paramètre 'type' obligatoire" }, { status: 400 });
    }

    // Appel générique
    return callApiGet(request, `/evenement/${type}`, ["limit", "date"]);
}

export async function POST(request: NextRequest) {
    // 1. Obtenir l'instance Axios avec l'authentification
    const api = getServerAxios(request); 

    try {
        const body = await request.json();
        const { title, description, type, startDate, endDate, image } = body;

        const requiredFields = ["title", "description", "type"];
        const missingFields: string[] = [];

        // Si typeEventId = 1 alors ajouter deux champs obligatoires
        if (type === "1") {
            requiredFields.push("startDate", "endDate");
        }

        // Vérification des champs requis
        for (const field of requiredFields) {
            if (body[field] === undefined || body[field] === null || body[field] === "") {
                missingFields.push(field);
            }
        }

        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    status: "error",
                    message: "Champs requis manquants : " + missingFields.join(", "),
                    missingFields,
                },
                { status: 400 }
            );
        }

        const formData = {
            titre: title,
            description: description,
            typeEventId: type,
            debut: startDate,
            fin: endDate,
            photoBinaire: image,
        };
        
        // 2. Utilisation directe de l'instance 'api'
        const apiResponse = await api.post("/evenement", formData, {
            headers: { "Content-Type": "application/json" },
        });

        return NextResponse.json(
            { message: "Creer avec succes", data: apiResponse.data },
            { status: 201 }
        );

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
          
          const axiosErr = err; // TypeScript sait que c'est une AxiosError ici

          // VÉRIFICATION CRUCIALE : L'erreur a-t-elle une réponse HTTP ?
          if (axiosErr.response) {
              
              console.error("Erreur API :", axiosErr.response.data);

              const status = axiosErr.response.status || 500;
              const data = axiosErr.response.data || {};

              const msg =
                  (data as { message?: string }).message ||
                  (data as { error?: string }).error ||
                  (typeof data === 'string' ? data : JSON.stringify(data)) ||
                  "Erreur interne lors de l'appel au service";
              
              return NextResponse.json({ error: msg }, { status });
          } else {
              // Cas d'erreur sans réponse HTTP (ex: erreur réseau, timeout)
              const msg = axiosErr.message || "Erreur de connexion au service backend.";
              return NextResponse.json({ error: msg }, { status: 503 }); // 503 Service Unavailable
          }
      }

      // 3. Gestion de toutes les autres erreurs (parsing JSON initial, erreurs internes)
      console.error("Erreur non gérée:", err);
      return NextResponse.json({ error: "Erreur interne inconnue du serveur" }, { status: 500 });
  }
}