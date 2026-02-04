"use client"

import { useState, useEffect } from "react"
import Header from "@/components/static/Header"
import Menu from "@/components/static/Menu"
import { User } from "@/lib/db"
import { VerificationEcolageTable } from "@/components/ecolage/VerificationEcolageTable"

export default function VerificationEcolagePage() {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const storedUser = localStorage.getItem("membre")
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch (err) {
                console.error("Failed to parse user from localStorage", err)
            }
        }
    }, [])

    return (
        <main className="min-h-screen bg-[#f8fafc]">
            <Header user={user} />

            <div className="max-w-7xl mx-auto px-4 py-6">
                <Menu user={user} />

                <div className="mt-6">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-foreground mb-2">Vérification Paiement</h2>
                        <p className="text-muted-foreground">Historique et validation des paiements effectués</p>
                    </div>

                    <div className="animate-in fade-in duration-500">
                        <VerificationEcolageTable />
                    </div>
                </div>
            </div>
        </main>
    )
}
