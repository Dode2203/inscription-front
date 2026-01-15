// src/app/page.tsx (ou votre fichier d'accueil)
import Link from "next/link"
import { ArrowRight, GraduationCap, ShieldCheck, LayoutDashboard } from "lucide-react"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header simplifié */}
      <header className="border-b border-secondary/30 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-inner border-2 border-secondary/20">
                <img 
                  src="/espa-logo.png" 
                  alt="Logo ESPA"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-secondary tracking-tight">
                  ESPA
                </h1>
                <p className="text-xs opacity-80">Ecole Supérieure Polytechnique</p>
              </div>
            </div>
            
            <Link 
              href="/login" 
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 shadow-sm"
            >
              Se connecter
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Section Hero - Bienvenue */}
      <main className="flex-grow flex items-center">
        <div className="container mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-5xl font-extrabold text-foreground leading-tight">
                  Système de Gestion <br />
                  <span className="text-primary">des Étudiants</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Plateforme centralisée pour la gestion des inscriptions, le suivi académique 
                   et l'administration de la scolarité de l'ESPA.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/login" 
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all flex items-center gap-3 shadow-lg"
                >
                  Accéder au Portail
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
              </div>

              {/* Petites fonctionnalités en avant-propos */}
              <div className="grid sm:grid-cols-2 gap-6 pt-8">
                <div className="flex gap-3">
                  <div className="mt-1 bg-secondary/20 p-2 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-bold">Accès Sécurisé</h4>
                    <p className="text-sm text-muted-foreground">Espace réservé au personnel administratif.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1 bg-secondary/20 p-2 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-bold">Suivi Complet</h4>
                    <p className="text-sm text-muted-foreground">Gestion du cursus de l'inscription au diplôme.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Illustration ou Image à droite */}
            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl -rotate-3 transition-transform"></div>
              <div className="relative bg-white border border-border p-4 rounded-3xl shadow-2xl rotate-1">
                 {/* Ici vous pouvez mettre une capture d'écran de l'app ou une illustration */}
                <div className="bg-slate-50 rounded-2xl aspect-video flex items-center justify-center border border-dashed border-muted-foreground/30">
                   <img 
                    src="/api/placeholder/600/400" 
                    alt="Dashboard Preview" 
                    className="rounded-lg opacity-80"
                   />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer simple */}
      <footer className="py-8 border-t text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-6">
          <p>© {new Date().getFullYear()} ESPA - Système de Gestion Étudiante v1.0</p>
          <p className="mt-1 text-xs opacity-60">Département de la Scolarité - Vontovorona</p>
        </div>
      </footer>
    </div>
  )
}