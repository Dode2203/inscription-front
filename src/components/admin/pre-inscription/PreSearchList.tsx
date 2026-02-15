"use client";

import { useState } from "react";
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
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<PreInscrit[]>([]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);

        try {
            const response = await fetch('/api/etudiants/pre-inscription/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchTerm || "" }), // Utilisation de 'query' comme attendu par le backend
            });

            const result = await response.json();
            if (response.status === 401 || response.status === 403) {
                toast.error("Session expirée. Redirection...");
                await fetch("/api/auth/logout", { method: "POST" });
                router.push(login);
                return;
            }
            if (response.ok) {
                setResults(result.data || result.results || []);
                if ((result.data || result.results || []).length === 0) {
                    toast.info("Aucun candidat trouvé");
                }
            } else {
                throw new Error(result.message || result.error || "Erreur lors de la recherche");
            }
        } catch (error: any) {
            toast.error(error.message || "Une erreur est survenue lors de la recherche");
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Recherche de Pré-inscrits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Rechercher par nom ou prénom..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white"
                        />
                    </div>
                    <Button type="submit" disabled={isSearching}>
                        {isSearching ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                    </Button>
                </form>

                {results.length > 0 && (
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
                )}
            </CardContent>
        </Card>
    );
}
