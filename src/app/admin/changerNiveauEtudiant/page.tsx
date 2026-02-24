"use client"
import { InscriptionForm } from "@/components/utilisateur/inscription/inscription-form" 
import { useState, useEffect } from "react"
import { User} from "@/lib/db" // Assurez-vous que les types User et Event sont bien définis
import Header from "@/components/static/Header"
import Menu from "@/components/static/Menu"
import { useRouter } from "next/navigation"
import { ChangerNiveauEtudiant } from "@/components/admin/changerNiveauEtudiant/changerNiveauEtudiant"

export default function ModificationNiveauPage() 
 {
    const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("/admin/changerNiveauEtudiant");
  const [loading, setLoading] = useState(true); // Chargement initial
  const login= process.env.NEXT_PUBLIC_LOGIN_URL || '/login';

  useEffect(() => {
    // Check authentication and fetch user info
    const checkAuth = async () => {
      try {
        const response = await fetch(`/api/auth/me`);
        if (!response.ok) {
          await fetch("/api/auth/logout", { method: "POST" })
          router.push(login); 
          return;
        }
        const data = await response.json();
        setUser(data.user);
        if (data.user.role !== "Admin" ) {
          await fetch("/api/auth/logout", { method: "POST" })
          router.push(login); 
        }
      } catch (err) {
        await fetch("/api/auth/logout", { method: "POST" })
        router.push(login); 
      }
      finally{
        setLoading(false)
      }
      // Note: setLoading(false) est géré dans le finally de fetchEvents pour ne pas masquer le contenu
    };

    checkAuth();
    
  }, []); // Exécuté une seule fois au montage

  // Afficheur de chargement initial
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  return (
    <main className="min-h-screen bg-background">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Menu user={user} activeTab={activeTab} setActiveTab={setActiveTab} />

        

      </div>
      <main className="container mx-auto px-6 py-8">  
               <ChangerNiveauEtudiant />
 
      </main>
      
    </main>
  );
}


