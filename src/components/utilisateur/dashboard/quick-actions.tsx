import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, RefreshCw, FileCheck, GraduationCap } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "Réinscription",
      description: "Réinscrire un étudiant existant",
      icon: RefreshCw,
      href: "/utilisateur/inscription",
      color: "text-secondary",
    },
    {
      title: "Certificat de scolarité", 
      description: "Gérer les certificats",
      icon: FileCheck,
      href: "/utilisateur/certificat",
      color: "text-primary",
    },
    {
      title: "Diplômes",
      description: "Gérer les diplômes",
      icon: GraduationCap,
      href: "/diplomes",
      color: "text-secondary",
    },
  ]

  return (
    <Card className="p-6 border-primary/20">
      <h3 className="text-lg font-semibold text-primary mb-4">Actions Rapides</h3>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4 px-4 hover:bg-secondary/10 border-primary/10 bg-transparent"
            >
              <action.icon className={`w-5 h-5 mr-3 ${action.color}`} />
              <div className="text-left">
                <p className="font-medium text-foreground">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </Card>
  )
}
