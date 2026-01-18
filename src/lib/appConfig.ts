// lib/appConfig.ts
import { cache } from 'react';
import { Niveau, Mention, Formation } from './db';

export interface InitialData {
  niveaux: Niveau[];
  formations: Formation[]; // Changé de 'formations' à 'mentions'
}

async function safeParse<T>(res: Response): Promise<T[]> {
  if (!res.ok) {
    console.error(`Erreur HTTP: ${res.status} sur ${res.url}`);
    return [];
  }
  try {
    const text = await res.text();
    if (!text) return [];
    const json = JSON.parse(text);
    return json.data || [];
  } catch (e) {
    console.error("Erreur de parsing JSON", e);
    return [];
  }
}

export const getInitialData = cache(async (): Promise<InitialData> => {  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    const [resNiveaux, resFormations] = await Promise.all([
      fetch(`/api/etudiants/niveaux`, { next: { revalidate: 3600 } }),
      fetch(`/api/etudiants/formations`, { next: { revalidate: 3600 } })
    ]);

    const niveaux = await safeParse<Niveau>(resNiveaux);
    const formations = await safeParse<Formation>(resFormations);

    return { niveaux, formations };
  } catch (error) {
    console.error("❌ Erreur getInitialData:", error);
    return { niveaux: [],formations: [] };
  }
});