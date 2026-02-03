"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle2, History, Search, UserCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ecolageService } from "@/services/ecolageService"
import { EcolageHistoryTable } from "@/components/ecolage/EcolageHistoryTable"
import { EtudiantEcolageDetail } from "@/types/ecolage"
import { EtudiantRecherche } from "@/lib/db"
import { cn } from "@/lib/utils"

export function InsertionEcolageForm() {
    // Search states
    const [nomSearch, setNomSearch] = useState("")
    const [prenomSearch, setPrenomSearch] = useState("")
    const [loadingRecherche, setLoadingRecherche] = useState(false)
    const [etudiantsTrouves, setEtudiantsTrouves] = useState<EtudiantRecherche[]>([])
    const [afficherListeEtudiants, setAfficherListeEtudiants] = useState(false)

    // Selection states
    const [selectedStudent, setSelectedStudent] = useState<EtudiantEcolageDetail | null>(null)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [showHistory, setShowHistory] = useState(false)

    // Form states
    const [registrationId, setRegistrationId] = useState("")
    const [refBordereau, setRefBordereau] = useState("")
    const [montant, setMontant] = useState("")
    const [datePaiement, setDatePaiement] = useState(new Date().toISOString().split('T')[0])
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const rechercheEtudiants = async () => {
        if (!nomSearch && !prenomSearch) return
        setLoadingRecherche(true)
        setSelectedStudent(null)
        setAfficherListeEtudiants(false)
        try {
            // Updated service uses POST /api/etudiants/recherche
            const data = await ecolageService.searchEtudiant({ nom: nomSearch, prenom: prenomSearch })

            // Sorting like in InscriptionForm
            const sortedStudents = (data || []).sort((a, b) => {
                const nomA = a.nom ?? "";
                const nomB = b.nom ?? "";
                const compareNom = nomA.localeCompare(nomB);
                if (compareNom !== 0) return compareNom;
                return (a.prenom ?? "").localeCompare(b.prenom ?? "");
            });

            setEtudiantsTrouves(sortedStudents)
            setAfficherListeEtudiants(true)
            if (sortedStudents.length > 0) {
                toast.success(`${sortedStudents.length} étudiant(s) trouvé(s)`)
            } else {
                toast.error("Aucun étudiant trouvé")
            }
        } catch (err: any) {
            toast.error("Erreur lors de la recherche")
        } finally {
            setLoadingRecherche(false)
        }
    }

    const selectEtudiant = async (etudiant: EtudiantRecherche) => {
        setLoadingDetails(true)
        setAfficherListeEtudiants(false)
        setRegistrationId("")
        try {
            // First get technical details from ecolage service
            const response = await ecolageService.fetchStudentEcolageDetails(etudiant.id)
            const registrations = response.data || []

            // We use the basic info from the search result and the registrations from the ecolage detail API
            setSelectedStudent({
                id: Number(etudiant.id),
                nom: etudiant.nom,
                prenom: etudiant.prenom,
                dateNaissance: (etudiant as any).dateNaissance || "",
                sexe: (etudiant as any).sexe || "",
                contact: (etudiant as any).contact || {},
                registrations: registrations.map((reg: any) => ({
                    ...reg,
                    id_niveau_etudiant: reg.id_niveau_etudiant,
                    niveau: reg.niveau,
                    annee_scolaire: reg.annee_scolaire,
                    reste_a_payer: reg.reste_a_payer
                }))
            })
            toast.info(`Étudiant sélectionné : ${etudiant.nom} ${etudiant.prenom}`)
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la récupération des détails")
        } finally {
            setLoadingDetails(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedStudent || !registrationId || !refBordereau || !montant) {
            toast.error("Veuillez remplir tous les champs obligatoires")
            return
        }

        setLoadingSubmit(true)
        const payload = {
            idEtudiant: selectedStudent.id,
            registrationId: registrationId,
            ref: refBordereau,
            montant: Number(montant),
            datePaiement: datePaiement
        }

        try {
            await ecolageService.savePaiement(payload)
            toast.success("Paiement enregistré avec succès")
            // Reset form partly
            setRegistrationId("")
            setRefBordereau("")
            setMontant("")
            setShowHistory(false)
            // Optional: load updated details to refresh balance
            selectEtudiant({ id: selectedStudent.id, nom: selectedStudent.nom, prenom: selectedStudent.prenom })
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'enregistrement")
        } finally {
            setLoadingSubmit(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Template Search Box */}
            <div className="p-4 bg-slate-50 border rounded-xl shadow-sm">
                <Label className="text-slate-600 font-bold mb-4 block italic">
                    Rechercher un étudiant
                </Label>
                <div className="grid md:grid-cols-5 gap-3 items-end">
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="nom">Nom</Label>
                        <Input
                            id="nom"
                            placeholder="Nom de l'étudiant"
                            value={nomSearch}
                            onChange={(e) => setNomSearch(e.target.value.toUpperCase())}
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
                        onClick={rechercheEtudiants}
                        disabled={loadingRecherche}
                        className="bg-blue-900 text-amber-400 hover:bg-blue-800 w-full"
                    >
                        {loadingRecherche ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                        Rechercher
                    </Button>
                </div>
            </div>

            {/* Results Mapping - Match Template */}
            {etudiantsTrouves.length > 0 && afficherListeEtudiants && (
                <div className="mt-4 border rounded-lg divide-y bg-white shadow-sm overflow-hidden mb-6 animate-in slide-in-from-top-2 duration-300">
                    {etudiantsTrouves.map((etudiant) => (
                        <button
                            key={etudiant.id}
                            type="button"
                            onClick={() => selectEtudiant(etudiant)}
                            className="w-full text-left px-4 py-4 hover:bg-slate-50 transition flex items-center gap-3 border-l-4 border-transparent hover:border-blue-900"
                        >
                            <UserCircle className="w-5 h-5 text-slate-400" />
                            <p className="font-bold text-slate-800">
                                {etudiant.nom} <span className="font-medium">{etudiant.prenom}</span>
                            </p>
                        </button>
                    ))}
                </div>
            )}

            {loadingDetails && (
                <div className="flex justify-center py-10">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-900" />
                </div>
            )}

            {selectedStudent && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Selection Pivot Banner */}
                    <div className="p-5 bg-blue-50/50 border-l-4 border-blue-900 rounded-r-lg flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <CheckCircle2 className="w-6 h-6 text-blue-900" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Étudiant sélectionné :</p>
                                <p className="text-xl font-bold text-slate-900 uppercase">
                                    {selectedStudent.nom} <span className="capitalize font-semibold">{selectedStudent.prenom}</span>
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowHistory(!showHistory)}
                            className="bg-white hover:bg-slate-50 text-blue-900 border-blue-200"
                        >
                            <History className="w-4 h-4 mr-2" />
                            {showHistory ? "Masquer historiques" : "Consulter historiques"}
                        </Button>
                    </div>

                    {/* Payment Form */}
                    <Card className="border-none shadow-md overflow-hidden">
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold text-slate-700">Sélectionner le Niveau / Année *</Label>
                                            {selectedStudent.registrations && selectedStudent.registrations.length > 0 ? (
                                                <Select value={registrationId} onValueChange={setRegistrationId}>
                                                    <SelectTrigger className="w-full h-11">
                                                        <SelectValue placeholder="Choisir une inscription" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {selectedStudent.registrations.map((reg) => {
                                                            const isSolded = reg.reste_a_payer <= 0;
                                                            return (
                                                                <SelectItem
                                                                    key={reg.id_niveau_etudiant}
                                                                    value={reg.id_niveau_etudiant.toString()}
                                                                    disabled={isSolded}
                                                                    className={cn(isSolded && "opacity-60 grayscale")}
                                                                >
                                                                    <div className="flex justify-between w-full gap-4">
                                                                        <span>{reg.niveau} ({reg.annee_scolaire})</span>
                                                                        <span className={cn("font-bold", isSolded ? "text-green-600" : "text-blue-900")}>
                                                                            — Reste : {isSolded ? "0 (Soldé)" : `${reg.reste_a_payer.toLocaleString()} Ar`}
                                                                        </span>
                                                                    </div>
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="p-3 bg-red-50 border border-red-100 rounded text-red-600 text-sm italic">
                                                    Aucune inscription trouvée pour cet étudiant.
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="ref" className="text-sm font-bold text-slate-700">Référence Bordereau (REF) *</Label>
                                            <Input
                                                id="ref"
                                                className="h-11"
                                                placeholder="Ex: BORD-12345"
                                                value={refBordereau}
                                                onChange={(e) => setRefBordereau(e.target.value.toUpperCase())}
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="montant" className="text-sm font-bold text-slate-700">Montant Versé *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="montant"
                                                    type="number"
                                                    className="h-11 pr-12 text-lg font-bold text-blue-900"
                                                    placeholder="Montant en Ar"
                                                    value={montant}
                                                    onChange={(e) => setMontant(e.target.value)}
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                                                    Ar
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="datePaiement" className="text-sm font-bold text-slate-700">Date de Paiement *</Label>
                                            <Input
                                                id="datePaiement"
                                                type="date"
                                                className="h-11"
                                                value={datePaiement}
                                                onChange={(e) => setDatePaiement(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loadingSubmit || !registrationId}
                                    className="w-full h-14 text-xl font-bold bg-green-700 hover:bg-green-800 shadow-lg shadow-green-100 transition-all active:scale-[0.98]"
                                >
                                    {loadingSubmit ? <Loader2 className="mr-2 animate-spin size-6" /> : null}
                                    ENREGISTRER LE PAIEMENT
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {showHistory && (
                        <div className="animate-in slide-in-from-bottom-6 duration-500">
                            <EcolageHistoryTable idEtudiant={selectedStudent.id} />
                        </div>
                    )}
                </div>
            )}

            {!selectedStudent && !loadingDetails && (
                <div className="py-24 text-center border-2 border-dashed rounded-2xl bg-slate-50/50 border-slate-200">
                    <UserCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">
                        Veuillez rechercher et sélectionner un étudiant pour enregistrer un paiement.
                    </p>
                </div>
            )}
        </div>
    )
}
