export interface LoginCredentials {
  email: string;
  mdp: string; // Aligné sur ton contrôleur Symfony
}

export interface AuthError {
  error: string;
  message?: string;
}
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}