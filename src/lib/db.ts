// Simple in-memory database for demonstration
// In production, replace with a real database like Supabase or Neon

export interface User {
  id?: string
  name?: string
  nom?:string
  prenom?:string
  email: string
  password?: string
  role?: "Admin" | "Utilisateur"
  createdAt?: Date
  status?:string
}

export interface Event {
  id?: string| number
  titre: string
  description: string
  debut?: string
  fin?: string
  type?: string | number
  typeEventId?: string|number
  photoId?: string|number|null
  photoBinaire?: string
  user?: User
  datePublication?: string
}
export interface News {
  id: string
  title: string
  content: string
  image?: string
  publishedDate: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
export interface Contact {
  adresse: string;
  email: string;
  telephone?: string; // "?" signifie optionnel
}

// Structure de l'objet identité (basée sur votre JSON)
export interface Identite {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: string;
  nationalite?: string;
  contact: Contact;
}
export interface Formation {
  idFormation:string|number;
  formation: string;
  formationType: string;
  idNiveau:string|number;
  typeNiveau: number;
  gradeNiveau: number
  niveau: string;
  mention: string;
  statusEtudiant?: string;


}

export interface Mention {
  id: number;
  nom: string;
  abr: string;
}

export interface PaiementData {
  refAdmin: string;
  dateAdmin: string;
  montantAdmin: string;
  refPedag: string;
  datePedag: string;
  montantPedag: string;
  montantEcolage?: string;
  refEcolage?: string;
  dateEcolage?: string;
  idNiveau: string|number;
  idFormation: string|number;
}
export interface EtudiantRecherche {
  id: number|string;
  nom: string;
  prenom: string;
}
export interface PaiementData {
  refAdmin: string;
  dateAdmin: string;
  montantAdmin: string;
  refPedag: string;
  datePedag: string;
  montantPedag: string;
  montantEcolage?: string;
  refEcolage?: string;
  dateEcolage?: string;
  passant?: boolean;
}
export interface InscriptionData {
  refAdmin: string;
  dateAdmin: string;
  montantAdmin: string;
  refPedag: string;
  datePedag: string;
  montantPedag: string;
  montantEcolage?: string;
  refEcolage?: string;
  dateEcolage?: string;
  idEtudiant:string;
  typeFormation:string;
  passant?:boolean
}
export interface Inscription {
  id: number|string;
  matricule: string;
  dateInscription : string | Date;
  description : string
}
export interface Niveau {
  id: number|string;
  nom: string;
  grade: number;
  type: number;
}


// Refactorisation Liste etudiant 
export interface PaiementEtudiant {
  id?: number;
  montant: number;
  datePaiement: string;
  typeDroit: string;
  reference: string;
  modePaiement?: string;
  libelle?: string;
  statut?: string;
}

export interface StatsData {
  total_etudiants: number;
  total_paiements: number;
  nouvelles_inscriptions: number;
}

export interface Student {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance?: string;
  sexe?: string;
  matricule?: string;
  contact?: {
    adresse?: string;
    email?: string;
    telephone?: string;
  };
  
  // Formation (structure de l'API)
  formation?: {
    nom: string;
    type?: {
      nom: string;
    };
  };
  
  // Ancienne structure (compatibilité)
  typeFormation?: {
    nom: string;
  };
  
  // Niveau et mention
  niveau?: {
    nom: string;
  };
  mention?: {
    nom: string;
  };
  parcours?: {
    nom: string;
  };
  
  // Inscription
  inscription?: {
    matricule?: string;
    anneeUniversitaire?: string;
  };
  
  // Paiements
  droitsPayes?: Array<{
    typeDroit: string;
    montant: number;
    reference: string;
    datePaiement: string;
  }>;
  
  ecolage?: Array<{
    tranche: number;
    montant: number;
    reference: string;
    datePaiement: string;
  }>;
}

// In-memory storage (replace with database)
let users: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@espa.mg",
    password: "admin123", // In production, use bcrypt
    role: "Admin",
    createdAt: new Date(),
  },
]

let events: Event[] = []
let news: News[] = []

// User operations
export const db = {
  users: {
    findByEmail: (email: string) => users.find((u) => u.email === email),
    create: (user: Omit<User, "id" | "createdAt">) => {
      const newUser = { ...user, id: Date.now().toString(), createdAt: new Date() }
      users.push(newUser)
      return newUser
    },
    getAll: () => users,
    delete: (id: string) => {
      users = users.filter((u) => u.id !== id)
    },
  },
  events: {
    getAll: () => events,
    getById: (id: string) => events.find((e) => e.id === id),
    create: (event: Omit<Event, "id" | "createdAt" | "updatedAt">) => {
      const newEvent = {
        ...event,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      events.push(newEvent)
      return newEvent
    },
    update: (id: string, event: Partial<Event>) => {
      const index = events.findIndex((e) => e.id === id)
      if (index !== -1) {
        events[index] = { ...events[index], ...event }
        return events[index]
      }
    },
    delete: (id: string) => {
      events = events.filter((e) => e.id !== id)
    },
  },
  news: {
    getAll: () => news,
    getById: (id: string) => news.find((n) => n.id === id),
    create: (article: Omit<News, "id" | "createdAt" | "updatedAt">) => {
      const newNews = {
        ...article,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      news.push(newNews)
      return newNews
    },
    update: (id: string, article: Partial<News>) => {
      const index = news.findIndex((n) => n.id === id)
      if (index !== -1) {
        news[index] = { ...news[index], ...article, updatedAt: new Date() }
        return news[index]
      }
    },
    delete: (id: string) => {
      news = news.filter((n) => n.id !== id)
    },
  },
}


