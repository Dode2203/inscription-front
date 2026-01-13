import { cache } from 'react';
import { Niveau , Formation } from './db';

export interface InitialData {
  niveaux: Niveau[];
  formations: Formation[];
  
}

/**
 * Fonction utilitaire interne pour parser les réponses JSON en toute sécurité.
 * @param res La réponse Fetch
 * @returns Un tableau de type T
 */
async function safeParse<T>(res: Response): Promise<T[]> {
  if (!res.ok) {
    console.error(`Erreur HTTP: ${res.status} sur ${res.url}`);
    return [];
  }

  try {
    const text = await res.text();
    if (!text) return [];
    
    const json = JSON.parse(text);
    // On extrait .data car vos APIs Next.js renvoient souvent { data: [...] }
    return json.data || [];
  } catch (e) {
    console.error("Erreur de parsing JSON sur", res.url, e);
    return [];
  }
}

/**
 * Récupère les données globales (Niveaux et Formations).
 * - cache() : mémorise le résultat pendant UNE seule requête (évite les doublons).
 * - { revalidate: false } : stocke le résultat sur le serveur pour TOUS les utilisateurs.
 */
export const getInitialData = cache(async (): Promise<InitialData> => {
  // En SSR, l'URL doit être absolue.
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  console.log("🔄 Chargement initial des données depuis les APIs...");

  console.log("baseUrl", baseUrl);

  try {
    // Exécution parallèle des deux appels
    const [resNiveaux, resFormations] = await Promise.all([
      fetch(`${baseUrl}/api/etudiants/niveaux`, { 
        method: 'GET',
        next: { revalidate: false } 
      }),
      fetch(`${baseUrl}/api/etudiants/formations`, { 
        method: 'GET',
        next: { revalidate: false } 
      })
    ]);

    const niveaux = await safeParse<Niveau>(resNiveaux);
    const formations = await safeParse<Formation>(resFormations);

    return { niveaux, formations };
  } catch (error) {
    console.error("❌ Erreur critique lors de getInitialData:", error);
    return { niveaux: [], formations: [] };
  }
});