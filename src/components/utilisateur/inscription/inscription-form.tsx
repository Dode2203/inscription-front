"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, CheckCircle2 } from "lucide-react"

export function InscriptionForm() {
  const [step, setStep] = useState("identite")
  const [parcoursType, setParcoursType] = useState("lmd")
  const [searchTerm, setSearchTerm] = useState("")
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [validatedDocs, setValidatedDocs] = useState<Record<string, boolean>>({
    photo: false,
    acte: false,
    diplome: false,
    cni: false,
    medical: false,
  })

  const handleSearch = () => {
    if (searchTerm.length > 3) {
      setIsDataLoaded(true)
      // En réalité, on remplirait les états du formulaire ici
    }
  }

  const toggleDoc = (docId: string) => {
    setValidatedDocs((prev) => ({ ...prev, [docId]: !prev[docId] }))
  }

  return (
    <Card className="max-w-4xl mx-auto p-6">
      <div className="mb-8 p-4 bg-slate-50 border rounded-xl flex gap-3 items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="searchData" className="text-slate-600 font-bold">
            Importer données (Barre de recherche)
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="searchData"
              placeholder="Rechercher par Nom, Prénom ou ID exporté..."
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleSearch} className="bg-blue-900 text-amber-400 hover:bg-blue-800">
          Rechercher & Remplir
        </Button>
      </div>

      <Tabs value={step} onValueChange={setStep}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="identite">1. Identité</TabsTrigger>
          <TabsTrigger value="academique">2. Académique</TabsTrigger>
          <TabsTrigger value="paiement">3. Règlement</TabsTrigger>
          <TabsTrigger value="documents">4. Documents</TabsTrigger>
          <TabsTrigger value="validation">5. Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="identite" className="space-y-6 mt-6">
          {isDataLoaded && (
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm border border-emerald-100 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Données importées avec succès pour l'étape Identité.
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Informations Personnelles</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input id="nom" placeholder="Entrez le nom" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenoms">Prénoms *</Label>
                <Input id="prenoms" placeholder="Entrez les prénoms" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateNaissance">Date de Naissance *</Label>
                <Input id="dateNaissance" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lieuNaissance">Lieu de Naissance *</Label>
                <Input id="lieuNaissance" placeholder="Ville, Pays" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sexe">Sexe *</Label>
                <select
                  id="sexe"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Sélectionnez</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationalite">Nationalité *</Label>
                <Input id="nationalite" placeholder="Pays" required />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Contact</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone *</Label>
                <Input id="telephone" type="tel" placeholder="+225 XX XX XX XX XX" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="adresse">Adresse *</Label>
                <Input id="adresse" placeholder="Adresse complète" required />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setStep("academique")}>Suivant</Button>
          </div>
        </TabsContent>

        <TabsContent value="academique" className="space-y-6 mt-6">
          {isDataLoaded && (
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm border border-emerald-100 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Données importées avec succès pour l'étape Académique.
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Parcours Académique</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Type de Parcours *</Label>
                <RadioGroup defaultValue="lmd" onValueChange={setParcoursType} className="flex space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lmd" id="lmd" />
                    <Label htmlFor="lmd">Parcours LMD (Classique)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="professionnel" id="professionnel" />
                    <Label htmlFor="professionnel">Parcours Professionnel</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filiere">Filière *</Label>
                <select
                  id="filiere"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Sélectionnez une filière</option>
                  <option value="informatique">Informatique</option>
                  <option value="gestion">Gestion</option>
                  <option value="marketing">Marketing</option>
                  <option value="finance">Finance</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="niveau">Niveau *</Label>
                <select
                  id="niveau"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Sélectionnez un niveau</option>
                  <option value="L1">Licence 1</option>
                  <option value="L2">Licence 2</option>
                  <option value="L3">Licence 3</option>
                  <option value="M1">Master 1</option>
                  <option value="M2">Master 2</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="anneeAcademique">Année Académique *</Label>
                <Input id="anneeAcademique" placeholder="2024-2025" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regime">Régime *</Label>
                <select
                  id="regime"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Sélectionnez</option>
                  <option value="journalier">Journalier</option>
                  <option value="soir">Soir</option>
                  <option value="weekend">Weekend</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Diplôme Précédent</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dernierDiplome">Dernier Diplôme Obtenu *</Label>
                <Input id="dernierDiplome" placeholder="Ex: BAC, Licence..." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anneeDiplome">Année d'Obtention *</Label>
                <Input id="anneeDiplome" type="number" placeholder="2023" required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="etablissement">Établissement d'Origine *</Label>
                <Input id="etablissement" placeholder="Nom de l'établissement" required />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("identite")}>
              Précédent
            </Button>
            <Button onClick={() => setStep("paiement")}>Suivant</Button>
          </div>
        </TabsContent>

        <TabsContent value="paiement" className="space-y-6 mt-6">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">Détails du Règlement</h3>
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm border border-blue-100">
              Note : À partir de cette étape, les données de paiement seront enregistrées (POST).
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <h4 className="font-medium text-blue-900">Droits Administratifs</h4>
                <div className="space-y-2">
                  <Label htmlFor="refAdmin">Référence du Paiement *</Label>
                  <Input id="refAdmin" placeholder="Ex: PAY-ADMIN-XXXX" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateAdmin">Date du Paiement *</Label>
                  <Input id="dateAdmin" type="date" required />
                </div>
              </div>
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <h4 className="font-medium text-blue-900">Droits Pédagogiques</h4>
                <div className="space-y-2">
                  <Label htmlFor="refPedag">Référence du Paiement *</Label>
                  <Input id="refPedag" placeholder="Ex: PAY-PEDAG-XXXX" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="datePedag">Date du Paiement *</Label>
                  <Input id="datePedag" type="date" required />
                </div>
              </div>
            </div>
            {parcoursType === "professionnel" && (
              <div className="mt-6 p-6 border-2 border-amber-200 rounded-xl bg-amber-50/30">
                <h4 className="text-lg font-bold text-amber-900 mb-4 flex items-center">
                  <span className="bg-amber-100 p-2 rounded-full mr-2">💰</span>
                  Formulaire d'Écolage (Parcours Professionnel)
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="montantEcolage">Montant Total Ecolage *</Label>
                    <Input id="montantEcolage" type="number" placeholder="FCFA" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refEcolage">Référence Paiement Acompte *</Label>
                    <Input id="refEcolage" placeholder="REF-ECO-XXXX" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateEcolage">Date du Paiement *</Label>
                    <Input id="dateEcolage" type="date" required />
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <Checkbox id="engagement" />
                  <label htmlFor="engagement" className="text-sm text-muted-foreground leading-none">
                    L'étudiant s'engage à respecter les échéances de paiement de l'écolage.
                  </label>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("academique")}>
              Précédent
            </Button>
            <Button onClick={() => setStep("documents")}>Suivant</Button>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6 mt-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Validation des Documents Physiques</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Cochez les documents qui ont été présentés physiquement et validés.
            </p>
            <div className="space-y-3">
              {[
                { id: "photo", label: "Photo d'identité (x3)" },
                { id: "acte", label: "Extrait d'acte de naissance" },
                { id: "diplome", label: "Copie certifiée du diplôme" },
                { id: "cni", label: "Photocopie de la CNI / Passeport" },
                { id: "medical", label: "Certificat médical d'aptitude" },
              ].map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                    validatedDocs[doc.id] ? "bg-emerald-50 border-emerald-200" : "bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {validatedDocs[doc.id] ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
                    )}
                    <span className={`font-medium ${validatedDocs[doc.id] ? "text-emerald-900" : "text-slate-700"}`}>
                      {doc.label}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant={validatedDocs[doc.id] ? "ghost" : "outline"}
                    className={validatedDocs[doc.id] ? "text-emerald-600" : ""}
                  >
                    {validatedDocs[doc.id] ? "Validé" : "En attente"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("paiement")}>
              Précédent
            </Button>
            <Button onClick={() => setStep("validation")}>Suivant</Button>
          </div>
        </TabsContent>

        <TabsContent value="validation" className="space-y-6 mt-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Récapitulatif de l'Inscription</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Veuillez vérifier toutes les informations avant de valider l'inscription
            </p>
            <div className="space-y-4">
              <Card className="p-4 bg-muted/50">
                <h4 className="font-semibold text-foreground mb-2">Informations Personnelles</h4>
                <p className="text-sm text-muted-foreground">Nom, prénoms, date de naissance, contact...</p>
              </Card>
              <Card className="p-4 bg-muted/50">
                <h4 className="font-semibold text-foreground mb-2">Parcours Académique</h4>
                <p className="text-sm text-muted-foreground">Filière, niveau, année académique, diplômes...</p>
              </Card>
              <Card className="p-4 bg-muted/50">
                <h4 className="font-semibold text-foreground mb-2">Documents</h4>
                <p className="text-sm text-muted-foreground">Photo, acte de naissance, diplômes, CNI...</p>
              </Card>
              <Card className="p-4 bg-muted/50 border-blue-200 border">
                <h4 className="font-semibold text-blue-900 mb-2">Règlement Financier</h4>
                <p className="text-sm text-muted-foreground">
                  Droits administratifs et pédagogiques enregistrés.
                  {parcoursType === "professionnel" ? " Dossier d'écolage inclus." : " Parcours LMD standard."}
                </p>
              </Card>
            </div>
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>Note importante :</strong> Une fois validée, l'inscription sera soumise pour approbation. Un
                numéro matricule sera généré automatiquement.
              </p>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("documents")}>
              Précédent
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">Valider l'Inscription</Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
