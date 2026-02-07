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
import { useRouter } from "next/navigation"

export function InsertionEcolageForm() {
    const router = useRouter()
    const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login'
    // Selection states
    const [selectedStudent, setSelectedStudent] = useState<EtudiantEcolageDetail | null>(null)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [lastUpdatedHistory, setLastUpdatedHistory] = useState(Date.now())

    // Search states (Twin logic from InscriptionForm)
    const [nomSearch, setNomSearch] = useState("")
    const [prenomSearch, setPrenomSearch] = useState("")
    const [etudiantsTrouves, setEtudiantsTrouves] = useState<EtudiantRecherche[]>([])
    const [loadingRecherche, setLoadingRecherche] = useState(false)
    const [afficherListeEtudiants, setAfficherListeEtudiants] = useState(false)
    const [loadingEtudiant, setLoadingEtudiant] = useState(false)
    const [formation, setFormation] = useState<any>(null)

    // Form states
    const [registrationId, setRegistrationId] = useState("")
    const [refBordereau, setRefBordereau] = useState("")
    const [montant, setMontant] = useState("")
    const [datePaiement, setDatePaiement] = useState(new Date().toISOString().split('T')[0])
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const rechercheEtudiants = async () => {
        setLoadingRecherche(true);
        setSelectedStudent(null);
        setRegistrationId("");
        try {
            const res = await fetch("/api/etudiants/recherche", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nom: nomSearch, prenom: prenomSearch })
            });

            if (res.status === 401 || res.status === 403) {
                toast.error("Session expirée. Redirection...");
                await fetch("/api/auth/logout", { method: "POST" });
                router.push(login);
                return;
            }

            const response = await res.json();

            const sortedStudents = (response.data || []).sort((a: EtudiantRecherche, b: EtudiantRecherche) => {
                const nomA = a.nom ?? "";
                const nomB = b.nom ?? "";
                return nomA.localeCompare(nomB);
            });

            setEtudiantsTrouves(sortedStudents);
            setAfficherListeEtudiants(true);

            if (response.data?.length > 0) {
                toast.success(`${response.data.length} étudiant(s) trouvé(s)`);
            } else {
                toast.error("Aucun étudiant trouvé");
            }
        } catch (err) {
            toast.error("Une erreur technique est survenue");
        } finally {
            setLoadingRecherche(false);
        }
    };

    const fetchEtudiant = async (idEtudiant: number | string) => {
        setLoadingEtudiant(true);
        setLoadingDetails(true);
        try {
            // Twin call to get basic identity/info
            const res = await fetch(`/api/etudiants?idEtudiant=${encodeURIComponent(idEtudiant)}`);
            if (res.status === 401 || res.status === 403) {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push(login);
                return;
            }

            const response = await res.json();
            if (!res.ok) throw new Error(response.error || "Erreur");

            const identite = response.data.identite;

            // Follow up with Ecolage details call (propagating token via NextRequest route)
            const ecolageRes = await ecolageService.fetchStudentEcolageDetails(idEtudiant);
            const registrations = ecolageRes.data || [];

            setFormation(response.data.formation);

            setSelectedStudent({
                id: Number(idEtudiant),
                nom: identite.nom,
                prenom: identite.prenom,
                dateNaissance: identite.dateNaissance || "",
                sexe: identite.sexe || "",
                contact: identite.contact || {},
                formation: response.data.formation,
                registrations: registrations.map((reg: any) => ({
                    ...reg,
                    id_niveau_etudiant: reg.id_niveau_etudiant,
                    niveau: reg.niveau,
                    annee_scolaire: reg.annee_scolaire,
                    reste_a_payer: reg.reste_a_payer
                }))
            });

            setAfficherListeEtudiants(false);
            toast.info(`Détails chargés pour : ${identite.nom}`);
        } catch (err: any) {
            toast.error(err.message || "Erreur lors du chargement des détails");
        } finally {
            setLoadingEtudiant(false);
            setLoadingDetails(false);
            setAfficherListeEtudiants(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedStudent || !registrationId || !refBordereau || !montant) {
            toast.error("Veuillez remplir tous les champs obligatoires")
            return
        }

        const selectedReg = selectedStudent.registrations.find(
            r => r.id_niveau_etudiant.toString() === registrationId
        );

        if (!selectedReg) {
            toast.error("Inscription non trouvée");
            return;
        }

        setLoadingSubmit(true)

        // Payload format for /api/ecolage/payment/save (PHP Backend expected)
        const payload = {
            etudiant_id: Number(selectedStudent.id),
            annee_scolaire: selectedReg.annee_scolaire, // We need the Level Name (e.g., LP2)
            montant: Number(montant),
            date_paiement: datePaiement, // Already YYYY-MM-DD from 'date' input
            ref_bordereau: refBordereau
        }

        try {
            await ecolageService.savePaiement(payload)
            toast.success("Paiement enregistré avec succès pour " + selectedReg.niveau)

            // Reset form
            setRegistrationId("")
            setRefBordereau("")
            setMontant("")
            setShowHistory(false)

            // Refresh details (specifically to see updated balances)
            fetchEtudiant(selectedStudent.id)
            setLastUpdatedHistory(Date.now())
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'enregistrement")
        } finally {
            setLoadingSubmit(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="p-4 bg-slate-50 border rounded-xl shadow-sm">
                <Label className="text-slate-600 font-bold mb-4 block italic">
                    Rechercher un étudiant
                </Label>
                <div className="grid md:grid-cols-5 gap-3 items-end">
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="nom">Nom</Label>
                        <Input
                            id="nom"
                            placeholder="Nom"
                            value={nomSearch}
                            onChange={(e) => setNomSearch(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="prenom">Prénom</Label>
                        <Input
                            id="prenom"
                            placeholder="Prénom"
                            value={prenomSearch}
                            onChange={(e) => setPrenomSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={rechercheEtudiants}
                        disabled={loadingRecherche}
                        className="bg-blue-900 text-white"
                    >
                        {loadingRecherche ? <Loader2 className="animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                        Rechercher
                    </Button>
                </div>
            </div>

            {etudiantsTrouves.length > 0 && afficherListeEtudiants && (
                <div className="mt-4 border rounded-lg divide-y bg-white shadow-sm overflow-hidden mb-6">
                    {etudiantsTrouves.map((etudiant) => (
                        <button
                            key={etudiant.id}
                            type="button"
                            onClick={() => fetchEtudiant(etudiant.id)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-100 transition"
                        >
                            <p className="font-semibold">{etudiant.nom} {etudiant.prenom}</p>
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
                                    {formation?.mention && (
                                        <span className="ml-3 text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full uppercase tracking-wider">
                                            {formation.mention}
                                        </span>
                                    )}
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
                                                                    <div className="flex justify-between w-full font-medium">
                                                                        <span>{reg.niveau} ({reg.annee_scolaire}) — Reste : {isSolded ? "0 (Soldé)" : `${reg.reste_a_payer.toLocaleString()} Ar`}</span>
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
                                                onChange={(e: any) => setRefBordereau(e.target.value.toUpperCase())}
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
                                                    onChange={(e: any) => setMontant(e.target.value)}
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
                                                onChange={(e: any) => setDatePaiement(e.target.value)}
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
                            <EcolageHistoryTable
                                idEtudiant={selectedStudent.id}
                                lastUpdated={lastUpdatedHistory}
                                mention={formation?.mention}
                            />
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