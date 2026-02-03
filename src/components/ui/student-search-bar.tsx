"use client"

import * as React from "react"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ecolageService } from "@/services/ecolageService"
import { useToast } from "@/hooks/use-toast"

import { User as UserIcon } from "lucide-react"

interface StudentSearchBarProps {
    onStudentSelect: (id: number) => void
}

export function StudentSearchBar({ onStudentSelect }: StudentSearchBarProps) {
    const [nomSearch, setNomSearch] = React.useState("")
    const [prenomSearch, setPrenomSearch] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [results, setResults] = React.useState<any[]>([])
    const { toast } = useToast()

    const handleSearch = async () => {
        if (!nomSearch && !prenomSearch) return;
        setLoading(true)
        try {
            const data = await ecolageService.searchEtudiant({ nom: nomSearch, prenom: prenomSearch })
            setResults(data)
            if (data.length === 0) {
                toast({
                    title: "Aucun résultat",
                    description: "Aucun étudiant trouvé avec ces critères.",
                    variant: "destructive"
                })
            }
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.response?.data?.message || "Erreur lors de la recherche",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = (id: number) => {
        onStudentSelect(id)
        setResults([]) // Clear results after selection
    }

    const formatDate = (date: string | null | undefined) => {
        if (!date) return "Non renseignée";
        try {
            return new Date(date).toLocaleDateString();
        } catch {
            return date;
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-5 gap-3 items-end p-4 bg-slate-50 border rounded-xl">
                <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="nom">Nom</Label>
                    <Input
                        id="nom"
                        placeholder="Nom de l'étudiant"
                        value={nomSearch}
                        onChange={(e) => setNomSearch(e.target.value)}
                    />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="prenom">Prénom</Label>
                    <Input
                        id="prenom"
                        placeholder="Prénom de l'étudiant"
                        value={prenomSearch}
                        onChange={(e) => setPrenomSearch(e.target.value)}
                    />
                </div>
                <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-900 text-white hover:bg-blue-800 w-full"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                    Rechercher
                </Button>
            </div>

            {results.length > 0 && (
                <div className="border rounded-lg shadow-lg bg-white overflow-hidden animate-in slide-in-from-top-2 duration-300 z-10 relative">
                    <div className="max-h-60 overflow-y-auto">
                        {results.map((student) => (
                            <button
                                key={student.id}
                                onClick={() => handleSelect(student.id)}
                                className="w-full text-left px-6 py-4 hover:bg-slate-50 flex items-center justify-between border-b last:border-0 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-100 p-2 rounded-full">
                                        <UserIcon className="w-5 h-5 text-blue-900" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 uppercase">{student.nom} <span className="capitalize font-medium">{student.prenom}</span></p>
                                        <p className="text-sm text-slate-500 italic">
                                            Né le {formatDate(student.dateNaissance)} • {student.sexe || "Sexe non renseigné"}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                                    ID: {student.id}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
