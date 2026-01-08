import { DashboardStats } from "@/components/utilisateur/dashboard/dashboard-stats"
import { QuickActions } from "@/components/utilisateur/dashboard/quick-actions"
import { MousePointerClick } from "lucide-react"


export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header avec les couleurs d'origine */}
      <header className="border-b border-secondary/30 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 bg-white rounded-xl flex items-center justify-center p-1 shadow-inner border-2 border-secondary/20">
          <img 
            src="/espa-logo.png" // Remplacez par le nom exact de votre fichier dans /public
            alt="Logo ESPA"
            className="h-full w-full object-contain"
          />
        </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary tracking-tight">
                  Système de Gestion Étudiante
                </h1>
                <p className="text-sm opacity-80">Scolarité</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full">
                <span className="text-xs font-medium text-secondary">Session Administrateur</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        {/* Section Titre de la page */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Tableau de Bord</h2>
            <p className="text-muted-foreground mt-1">Vue d'ensemble et outils de gestion</p>
          </div>
        </div>

        {/* Statistiques en haut (plus compact) */}
        <div className="mb-12">
          <DashboardStats />
        </div>

        {/* Section Actions Rapides - Prend toute la place centrale */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-primary font-semibold text-lg border-b pb-2">
            <MousePointerClick className="w-5 h-5 text-secondary" />
            <h3>Actions Rapides & Opérations</h3>
          </div>
          
          <div className="bg-card rounded-2xl p-2 shadow-sm border border-border/50">
            {/* L'affichage se fait ici en pleine largeur */}
            <QuickActions />
          </div>
        </div>

        {/* Footer simple */}
        <footer className="mt-20 py-6 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ESPA - Gestion des Inscriptions
        </footer>
      </main>
    </div>
  )
}