// ceci n est plus utilisable sauf si besoin c'est l'affichage des evenement  recent 

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "inscription",
      student: "KOUASSI Jean",
      action: "Nouvelle inscription - Licence 1 Informatique",
      time: "Il y a 5 minutes",
      status: "en-attente",
    },
    {
      id: 2,
      type: "certificat",
      student: "DIALLO Fatou",
      action: "Demande certificat de scolarité",
      time: "Il y a 15 minutes",
      status: "en-attente",
    },
    {
      id: 3,
      type: "reinscription",
      student: "TANOH Marie",
      action: "Réinscription - Master 2 Gestion",
      time: "Il y a 1 heure",
      status: "validé",
    },
    {
      id: 4,
      type: "diplome",
      student: "KOFFI Paul",
      action: "Retrait diplôme - Licence 3",
      time: "Il y a 2 heures",
      status: "validé",
    },
    {
      id: 5,
      type: "inscription",
      student: "BAMBA Sarah",
      action: "Nouvelle inscription - Master 1 Marketing",
      time: "Il y a 3 heures",
      status: "validé",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validé":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Validé</Badge>
      case "en-attente":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">En attente</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Activité Récente</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{activity.student}</p>
              <p className="text-sm text-muted-foreground">{activity.action}</p>
              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
            </div>
            {getStatusBadge(activity.status)}
          </div>
        ))}
      </div>
    </Card>
  )
}
