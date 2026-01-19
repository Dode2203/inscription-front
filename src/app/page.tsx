// src/app/page.tsx
import Link from "next/link"
import { ArrowRight, GraduationCap, ShieldCheck, LayoutDashboard } from "lucide-react"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header original */}
      <header className="border-b border-secondary/30 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-inner border-2 border-secondary/20">
                <img src="/espa-logo.png" alt="Logo ESPA" className="h-full w-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-secondary tracking-tight">ESPA</h1>
                <p className="text-xs opacity-80">Ecole Supérieure Polytechnique</p>
              </div>
            </div>
            <Link href="/login" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-5 py-2 rounded-lg font-medium transition-all flex items-center gap-2">
              Se connecter
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center bg-slate-50/30">
        <div className="container mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Texte à gauche */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-5xl font-extrabold text-foreground leading-tight">
                  Système de Gestion <br />
                  <span className="text-primary">des Étudiants</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Plateforme centralisée pour la gestion des inscriptions et le suivi de l'ESPA.
                </p>
              </div>
              <Link href="/login" className="inline-flex bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all items-center gap-3">
                Accéder au Portail
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            </div>

            {/* IMAGE AVEC INCLINAISON DYNAMIQUE (GAUCHE / DROITE) */}
            <div className="hidden lg:block relative group [perspective:1200px]">
              
              {/* Zone invisible pour détecter le survol à GAUCHE */}
              <div className="absolute inset-y-0 left-0 w-1/2 z-20 peer/left"></div>
              {/* Zone invisible pour détecter le survol à DROITE */}
              <div className="absolute inset-y-0 right-0 w-1/2 z-20 peer/right"></div>

              {/* Le cadre blanc qui entoure ton code d'image */}
              <div className="relative bg-white border border-border p-4 rounded-3xl shadow-xl transition-all duration-500 ease-out transform-gpu
                peer-hover/left:[transform:rotateY(-12deg)_rotateX(2deg)] 
                peer-hover/right:[transform:rotateY(12deg)_rotateX(2deg)]">
                
                {/* --- TON CODE ORIGINAL (STYLE NON CHANGÉ) --- */}
                <div className="bg-slate-50 rounded-2xl aspect-video flex items-center justify-center border border-dashed border-muted-foreground/30 overflow-hidden ">
                  <img 
                    src="/Tableau_de_bord.png" 
                    alt="Dashboard Preview" 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </div>
                {/* -------------------------------------------- */}

              </div>

              {/* Halo décoratif en fond */}
              <div className="absolute -inset-10 rounded-full bg-primary/5 blur-3xl -z-10 group-hover:bg-primary/10 transition-colors"></div>
            </div>

          </div>
        </div>
      </main>

      <footer className="py-8 border-t text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-6">
          <p>© {new Date().getFullYear()} ESPA - Vontovorona</p>
        </div>
      </footer>
    </div>
  )
}