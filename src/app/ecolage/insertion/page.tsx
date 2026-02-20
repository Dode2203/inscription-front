"use client"

import { useState, useEffect } from "react"
import Header from "@/components/static/Header"
import Menu from "@/components/static/Menu"
import { User } from "@/lib/db"
import { InsertionEcolageForm } from "@/components/ecolage/InsertionEcolageForm"
import { useRouter } from "next/navigation"
export default function InsertionEcolagePage() {
    const [user, setUser] = useState<User | null>(null);
        const [loading , setLoading] = useState(true);
        const login = process.env.NEXT_PUBLIC_LOGIN_URL || "/login";
        const router = useRouter();
          useEffect(() => {
        const fetchData = async () => {
          try {
            const authResponse = await fetch('/api/auth/me');
            if (!authResponse.ok) {
              await fetch("/api/auth/logout", { method: "POST" })
              router.push(login); 
              return;
            }
            
            
            const userData = await authResponse.json();
            if (userData.user.role !== "Ecolage" ) {
                await fetch("/api/auth/logout", { method: "POST" })
                router.push(login); 
                return;
            }
            setUser(userData.user);
            
          } catch (err) {
            await fetch("/api/auth/logout", { method: "POST" })
            router.push(login);
          } finally {
            setLoading(false);
          }
        };
    
        fetchData();
      }, [login]);
    
        if (loading) {
            return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
            );
        }

    return (
        <main className="min-h-screen bg-[#f8fafc]">
            <Header user={user} />

            <div className="max-w-7xl mx-auto px-4 py-6">
                <Menu user={user} />

                <div className="mt-6">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-foreground mb-2">Insertion Paiement</h2>
                        <p className="text-muted-foreground">Enregistrement des nouveaux paiements d'écolage</p>
                    </div>

                    <div className="animate-in fade-in duration-500">
                        <InsertionEcolageForm />
                    </div>
                </div>
            </div>
        </main>
    )
}
