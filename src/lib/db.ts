// Simple in-memory database for demonstration
// In production, replace with a real database like Supabase or Neon

import { Parentheses } from "lucide-react"

export interface User {
  id?: string
  name?: string
  nom?: string
  prenom?: string
  email: string
  password?: string
  role?: "Admin" | "Utilisateur"
  createdAt?: Date
  status?: string
}

export interface Event {
  id?: string | number
  titre: string
  description: string
  debut?: string
  fin?: string
  type?: string | number
  typeEventId?: string | number
  photoId?: string | number | null
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
  id?: number | string;
  adresse: string;
  email: string;
  telephone?: string; // "?" signifie optionnel
  nomPere?: string;
  nomMere?: string;
}
export interface Nationalite {
  id?: number | string;
  nom: string;
  type: number;
  typeNationaliteNom?: string;
}

export interface Cin {
  id?: number | string;
  numero: string;
  dateDelivrance: string;
  lieuDelivrance: string;
}

export interface Baccalaureat {
  id?: number | string;
  serie: string;
  anneeObtention: string;
  numero?: string;
}
// Structure de l'objet identité (basée sur votre JSON)
export interface Identite {
  id: number | string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: string;
  nomPere?: string;
  nomMere?: string;
  nationalite?: Nationalite;
  contact: Contact;
  cin?: Cin;
  bacc?: Baccalaureat;
}
export interface Formation {
  idFormation: string | number;
  formation: string;
  formationType: string;
  idNiveau: string | number;
  typeNiveau: number;
  gradeNiveau: number
  niveau: string;
  mention: string;
  statusEtudiant?: string;
  id?: string | number;
  nom?: string;
  typeFormation?: string;
  matricule?: string;
  estBoursier?: number;

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
  idNiveau: string | number;
  idFormation: string | number;
  estBoursier: number;
}
export interface EtudiantRecherche {
  id: number | string;
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
  estBoursier: number;
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
  idEtudiant: string;
  typeFormation: string;
  passant?: boolean;
  estBoursier: number;
}
export interface Inscription {
  id: number | string;
  matricule: string;
  dateInscription: string | Date;
  description: string
}
export interface Niveau {
  id: number | string;
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

// 1. Interface pour la réponse globale de l'API
export interface ApiResponse {
  status: string;
  annee: number;
  data: Student;
}

// 2. Interface principale de l'étudiant
export interface Student {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance?: string;
  sexe?: string;
  nomPere?: string;
  nomMere?: string;
  matricule?: string;
  estBoursier?: number | string;
  contact?: {
    adresse?: string;
    email?: string;
    telephone?: string;
    nomMere?: string;
    nomPere?: string;
  };

  formation?: {
    id: number;
    nom: string;
    type?: {
      id: number;
      nom: string;
    };
    dateFormation?: string;
  };
  typeFormation?: {

    nom: string;

  };

  niveau?: {
    id: number;
    nom: string;
    type?: number;
    grade?: number;
  };

  mention?: {
    id: number;
    nom: string;
  };

  // Changement ici : correspond à la clé "payments" du JSON
  payments?: Array<{
    montant: number;
    datePaiement: string;
    typeDroit: string;
    reference: string;
  }>;

  // Optionnel : Garder les anciennes propriétés si vous faites 
  // une transformation de données après la réception
  parcours?: {
    nom: string;
  };
  inscription?: {
    matricule?: string;
    anneeUniversitaire?: string;
  };
  dateInscription?: string;
  cin?: Cin
}
export interface Parent {
  nomPere: string;
  nomMere: string;
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


