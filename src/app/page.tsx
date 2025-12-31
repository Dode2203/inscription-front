import { DashboardStats } from "@/components/utilisateur/dashboard/dashboard-stats"
import { RecentActivity } from "@/components/utilisateur/dashboard/recent-activity"
import { QuickActions } from "@/components/utilisateur/dashboard/quick-actions"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-secondary/30 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-secondary">Système de Gestion Étudiante</h1>
              <p className="text-sm opacity-80">SDE - Administration Universitaire</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Admin</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Tableau de Bord</h2>
          <p className="text-muted-foreground">Vue d'ensemble de l'activité étudiante</p>
        </div>

        <DashboardStats />

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  )
}
