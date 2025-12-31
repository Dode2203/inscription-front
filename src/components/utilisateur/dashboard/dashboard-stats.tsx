import { Card } from "@/components/ui/card"
import { Users, FileText, Award, Clock } from "lucide-react"

export function DashboardStats() {
  const stats = [
    {
      title: "Étudiants Inscrits",
      value: "1,247",
      change: "+12% ce mois",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Demandes en Attente",
      value: "34",
      change: "8 nouvelles aujourd'hui",
      icon: Clock,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Certificats Émis",
      value: "892",
      change: "+5% ce mois",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Diplômes Délivrés",
      value: "156",
      change: "Session 2024",
      icon: Award,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
            </div>
            <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
