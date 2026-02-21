"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "next/navigation"

interface PreInscrit {
    id: number;
    nom: string;
    prenom: string;
    formationId: number;
    formationNom?: string;
    mentionId: number;
    mentionNom?: string;
}

interface PreSearchListProps {
    onSelectCandidate: (candidate: PreInscrit) => void;
}

export default function PreSearchList({ onSelectCandidate }: PreSearchListProps) {

    const router = useRouter();
    const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';
    const [nomSearch, setNomSearch] = useState("");
    const [prenomSearch, setPrenomSearch] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<PreInscrit[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const fetchResults = async (nom: string, prenom: string) => {
        setIsSearching(true);
        setHasSearched(true);
        try {
            const isAll = nom.trim() === "" && prenom.trim() === "";
            const url = `/api/etudiants/pre-inscription${isAll ? '?type=all' : ''}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom, prenom }),
            });

            const result = await response.json();

            if (response.status === 401 || response.status === 403) {
                toast.error("Session expirée. Redirection...");
                await fetch("/api/auth/logout", { method: "POST" });
                router.push(login);
                return;
            }

            if (response.ok && result.status === "success") {
                setResults(result.data || []);
            } else {
                throw new Error(result.message || result.error || "Erreur lors de la récupération des données");
            }
        } catch (error: any) {
            toast.error(error.message || "Une erreur est survenue lors de la recherche");
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchResults(nomSearch, prenomSearch);
    };

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Recherche de Pré-inscrits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-slate-50 p-4 border rounded-xl">
                    <div className="md:col-span-2 space-y-2">
                        <label htmlFor="nom" className="text-sm font-medium text-slate-600">Nom</label>
                        <Input
                            id="nom"
                            type="text"
                            placeholder="Nom"
                            value={nomSearch}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNomSearch(e.target.value)}
                            className="bg-white"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label htmlFor="prenom" className="text-sm font-medium text-slate-600">Prénom</label>
                        <Input
                            id="prenom"
                            type="text"
                            placeholder="Prénom"
                            value={prenomSearch}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrenomSearch(e.target.value)}
                            className="bg-white"
                        />
                    </div>
                    <Button type="submit" disabled={isSearching} className="bg-blue-900 text-white">
                        {isSearching ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                            <>
                                <Search className="h-4 w-4 mr-2" />
                                Rechercher
                            </>
                        )}
                    </Button>
                </form>

                {results.length > 0 ? (
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
                        </h3>
                        <div className="space-y-2">
                            {results.map((candidate) => (
                                <div
                                    key={candidate.id}
                                    className="p-4 border rounded-lg hover:bg-accent/5 cursor-pointer transition-colors"
                                    onClick={() => onSelectCandidate(candidate)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">
                                                {candidate.nom} {candidate.prenom}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {candidate.formationNom || `Formation ID: ${candidate.formationId}`} - {candidate.mentionNom || `Mention ID: ${candidate.mentionId}`}
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Sélectionner
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : !isSearching && hasSearched && (
                    <div className="text-center py-8 text-muted-foreground">
                        Aucun résultat trouvé pour "{nomSearch} {prenomSearch}".
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
