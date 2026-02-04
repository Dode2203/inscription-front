// lib/appConfig.ts
import { cache } from 'react';
import { Niveau, Mention, Formation, Nationalite } from './db';

export interface InitialData {
  niveaux: Niveau[];
  mentions: Mention[]; // Changé de 'formations' à 'mentions'
  formations : Formation[];
  nationalites : Nationalite[];
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

export const getInitialData = cache(async (): Promise<InitialData> => { 

  try {
    const [resNiveaux, resMentions, resFormations, resNationalites] = await Promise.all([
      fetch(`/api/etudiants/niveaux`, { next: { revalidate: 3600 } }), 
      fetch(`/api/etudiants/mentions`, { next: { revalidate: 3600 } }),
      fetch(`/api/etudiants/formations`, { next: { revalidate: 3600 } }),
      fetch(`/api/nationalites`, { next: { revalidate: 3600 } }),
    ]);

    const niveaux = await safeParse<Niveau>(resNiveaux);
    const mentions = await safeParse<Mention>(resMentions);
    const formations = await safeParse<Formation>(resFormations);
    const nationalites = await safeParse<Nationalite>(resNationalites);

    return { niveaux, mentions, formations, nationalites };
  } catch (error) {
    console.error("❌ Erreur getInitialData:", error);
    return { niveaux: [], mentions: [], formations: [], nationalites: []};
  }
});