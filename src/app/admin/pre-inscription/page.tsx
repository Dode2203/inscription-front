"use client";

import { useState, useEffect } from "react";
import { User, Formation, Mention, Nationalite } from "@/lib/db";
import Header from "@/components/static/Header";
import Menu from "@/components/static/Menu";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Search } from "lucide-react";
import { getInitialData } from "@/lib/appConfig";
import { useRouter } from "next/navigation";
import QuickPreForm from "@/components/admin/pre-inscription/QuickPreForm";
import PreSearchList from "@/components/admin/pre-inscription/PreSearchList";
import FinalConversionForm from "@/components/admin/pre-inscription/FinalConversionForm";

interface PreInscrit {
    id: number;
    nom: string;
    prenom: string;
    formationId: number;
    mentionId: number;
}

type ViewMode = "quick-entry" | "search-convert";

export default function PreInscriptionPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState("/admin/pre-inscription");
    const [loading, setLoading] = useState(true);

    const [formations, setFormations] = useState<Formation[]>([]);
    const [mentions, setMentions] = useState<Mention[]>([]);
    const [nationalites, setNationalites] = useState<Nationalite[]>([]);

    const [viewMode, setViewMode] = useState<ViewMode>("quick-entry");
    const [selectedCandidate, setSelectedCandidate] = useState<PreInscrit | null>(null);

    const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';

    useEffect(() => {
        const checkAuthAndLoadData = async () => {
            try {
                const [authRes, initialData] = await Promise.all([
                    fetch(`/api/auth/me`),
                    getInitialData()
                ]);

                if (!authRes.ok) {
                    window.location.href = login;
                    return;
                }

                const data = await authRes.json();
                setUser(data.user);
                if (data.user.role !== "Admin" && data.user.role !== "Utilisateur") {
                    await fetch("/api/auth/logout", { method: "POST" });
                    router.push(login);
                }

                if (initialData.formations) setFormations(initialData.formations);
                if (initialData.mentions) setMentions(initialData.mentions);
                if (initialData.nationalites) setNationalites(initialData.nationalites);

            } catch (err) {
                window.location.href = login;
            } finally {
                setLoading(false);
            }
        };
        checkAuthAndLoadData();
    }, [login, router]);

    const handleSelectCandidate = (candidate: PreInscrit) => {
        setSelectedCandidate(candidate);
    };

    const handleConversionSuccess = () => {
        // Retour à la vue de recherche et réinitialisation
        setSelectedCandidate(null);
    };

    const handleCancelConversion = () => {
        setSelectedCandidate(null);
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="animate-spin h-12 w-12 border-b-2 border-accent" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            <Header user={user} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Menu user={user} activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="mt-6">
                    {/* Navigation entre les vues */}
                    <div className="flex gap-4 mb-6 justify-center">
                        <Button
                            variant={viewMode === "quick-entry" ? "default" : "outline"}
                            onClick={() => {
                                setViewMode("quick-entry");
                                setSelectedCandidate(null);
                            }}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Saisie Rapide
                        </Button>
                        <Button
                            variant={viewMode === "search-convert" ? "default" : "outline"}
                            onClick={() => {
                                setViewMode("search-convert");
                                setSelectedCandidate(null);
                            }}
                            className="flex items-center gap-2"
                        >
                            <Search className="h-4 w-4" />
                            Recherche & Conversion
                        </Button>
                    </div>

                    {/* Affichage conditionnel selon le mode */}
                    {viewMode === "quick-entry" && (
                        <QuickPreForm
                            formations={formations}
                            mentions={mentions}
                            onSuccess={() => {
                                // Optionnel : basculer vers la vue de recherche après ajout
                                // setViewMode("search-convert");
                            }}
                        />
                    )}

                    {viewMode === "search-convert" && (
                        <>
                            {!selectedCandidate ? (
                                <PreSearchList onSelectCandidate={handleSelectCandidate} />
                            ) : (
                                <FinalConversionForm
                                    selectedCandidate={selectedCandidate}
                                    formations={formations}
                                    mentions={mentions}
                                    nationalites={nationalites}
                                    onSuccess={handleConversionSuccess}
                                    onCancel={handleCancelConversion}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
