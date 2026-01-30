"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, EtudiantRecherche } from "@/lib/db";
import Header from "@/components/static/Header";
import Menu from "@/components/static/Menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, Save, User as UserIcon, X, Fingerprint, GraduationCap } from "lucide-react";
import { toast } from "sonner";

// --- INTERFACES POUR TYPESCRIPT ---
interface FormDataState {
  id: number | string | null;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexeId: number;
  cinNumero: string;
  cinLieu: string;
  dateCin: string;
  baccNumero: string;
  baccAnnee: string | number;
  baccSerie: string;
  proposEmail: string;
  proposAdresse: string;
  telephone: string;
}

interface CompactFieldProps {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}

export default function ModificationPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  
  // États recherche
  const [nomSearch, setNomSearch] = useState("");
  const [prenomSearch, setPrenomSearch] = useState("");
  const [loadingRecherche, setLoadingRecherche] = useState(false);

  // Fonction utilitaire pour formater les dates au format ISO 8601 attendu par Symfony
  const toIsoString = (dateStr: string | null) => {
    if (!dateStr || dateStr === "") return null;
    // Ajoute l'heure minuit et le fuseau horaire local/Z pour satisfaire Symfony
    return `${dateStr}T00:00:00+00:00`;
  };

  const [etudiantsTrouves, setEtudiantsTrouves] = useState<EtudiantRecherche[]>([]);
  const [afficherListe, setAfficherListe] = useState(false);

  const [currentEtudiantId, setCurrentEtudiantId] = useState<number | string | null>(null);
  
  // État du formulaire initialisé
  const [formData, setFormData] = useState<FormDataState>({
    id: null,
    nom: '', 
    prenom: '', 
    dateNaissance: '', 
    lieuNaissance: '',
    sexeId: 1, 
    cinNumero: '', 
    cinLieu: '', 
    dateCin: '',
    baccNumero: '', 
    baccAnnee: '', 
    baccSerie: '',
    proposEmail: '', 
    proposAdresse: '', 
    telephone: ''
  });

  const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';

  // 1. Auth Check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`/api/auth/me`);
        if (!response.ok) { router.push(login); return; }
        const data = await response.json();
        setUser(data.user);
      } catch (err) { router.push(login); }
      finally { setLoading(false); }
    };
    checkAuth();
  }, [login, router]);

  // 2. Recherche par Nom
  const rechercheEtudiants = async () => {
    if (!nomSearch && !prenomSearch) return toast.error("Entrez au moins un nom");
    setLoadingRecherche(true);
    try {
      const res = await fetch("/api/etudiants/recherche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nomSearch, prenom: prenomSearch })
      });
      const response = await res.json();
      if (res.ok && response.data.length > 0) {
        setEtudiantsTrouves(response.data);
        setAfficherListe(true);
      } else { toast.error("Aucun résultat"); }
    } finally { setLoadingRecherche(false); }
  };


  // 3. Récupération et pré-remplissage des données de l'étudiant
  const selectEtudiant = async (id: number | string) => {
    setLoadingRecherche(true);
    try {
      const response = await fetch(`/api/etudiants/modifier/formulaire?id=${id}`);
      const result = await response.json();
      
      if (result.status === "success") {
        const d = result.data;
        // On peuple l'état du formulaire champ par champ
        setFormData({
          id: d.id,
          nom: d.nom || "",
          prenom: d.prenom || "",
          dateNaissance: d.dateNaissance ? d.dateNaissance.split('T')[0] : "",
          lieuNaissance: d.lieuNaissance || "",
          sexeId: d.sexeId || 1,
          cinNumero: d.cinNumero || "",
          cinLieu: d.cinLieu || "",
          dateCin: d.dateCin ? d.dateCin.split('T')[0] : "",
          baccNumero: d.baccNumero || "",
          baccAnnee: d.baccAnnee || "",
          baccSerie: d.baccSerie || "",
          proposEmail: d.proposEmail || "",
          proposAdresse: d.proposAdresse || "",
          telephone: d.telephone || ""
        });
        // On définit l'ID de l'étudiant courant pour afficher le formulaire
        setCurrentEtudiantId(id);
        setAfficherListe(false);
        toast.success("Dossier étudiant chargé");
      } else {
        toast.error(result.message || "Erreur de récupération");
      }
    } catch (e) {
      console.error("Erreur technique:", e);
      toast.error("Erreur technique lors du chargement");
    } finally {
      setLoadingRecherche(false);
    }
  };

  // 4. Mise à jour des données de l'étudiant
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    const requiredFields = [
      { field: 'nom', label: 'Nom' },
      { field: 'prenom', label: 'Prénom' },
      { field: 'dateNaissance', label: 'Date de naissance' },
      { field: 'lieuNaissance', label: 'Lieu de naissance' },
      { field: 'sexeId', label: 'Sexe' },
      { field: 'cinNumero', label: 'Numéro CIN' },
      { field: 'cinLieu', label: 'Lieu de délivrance CIN' },
      { field: 'dateCin', label: 'Date de délivrance CIN' },
      { field: 'baccNumero', label: 'Numéro de baccalauréat' },
      { field: 'baccAnnee', label: 'Année du baccalauréat' },
      { field: 'baccSerie', label: 'Série du baccalauréat' },
      { field: 'proposEmail', label: 'Email' },
      { field: 'proposAdresse', label: 'Adresse' }
    ];

    const missingFields = requiredFields
      .filter(({ field }) => !formData[field as keyof typeof formData])
      .map(({ label }) => label);

    if (missingFields.length > 0) {
      toast.error(`Champs obligatoires manquants : ${missingFields.join(', ')}`);
      return;
    }

    setLoadingSave(true);
    
    try {
      // Vérification de l'ID
      if (!formData.id) {
        throw new Error("ID de l'étudiant manquant");
      }

      // Nettoyage et formatage strict pour correspondre au DTO Symfony
      const dataToSend = {
        id: Number(formData.id),
        nom: (formData.nom || "").toUpperCase().trim(),
        prenom: (formData.prenom || "").trim(),
        // Formatage des dates au format ISO 8601 attendu par Symfony
        dateNaissance: toIsoString(formData.dateNaissance || ""),
        lieuNaissance: formData.lieuNaissance || "",
        sexeId: Number(formData.sexeId) || 1,
        // Données CIN
        cinNumero: formData.cinNumero || "",
        cinLieu: formData.cinLieu || "",
        dateCin: toIsoString(formData.dateCin),
        // Données BACC
        baccNumero: formData.baccNumero || "",
        baccAnnee: formData.baccAnnee ? Number(formData.baccAnnee) : 0,
        baccSerie: formData.baccSerie || "",
        // Données de contact
        proposEmail: formData.proposEmail || "",
        proposAdresse: formData.proposAdresse || "",
        // Champ optionnel
        telephone: formData.telephone || ""
      };

      // console.log('Payload envoyé à l\'API:', dataToSend); 

      const response = await fetch('/api/etudiants/modifier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        toast.success('Modifications enregistrées !');
        setAfficherListe(true);
      } else {
        // Affiche l'erreur détaillée si elle existe
        const errorMsg = result.error || result.message || 'Erreur lors de la sauvegarde';
        console.error('Erreur du serveur:', result);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Détail erreur:', error);
      toast.error(error.message || 'Erreur de connexion au serveur');
    } finally { 
      setLoadingSave(false); 
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-900" /></div>;

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <Header user={user} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Menu user={user} activeTab="" setActiveTab={() => {}} />

        {/* BARRE DE RECHERCHE */}
        <div className="relative z-20 mb-6">
          <div className="bg-white p-2 rounded-lg shadow-sm border flex items-center gap-3">
            <Search size={18} className="text-slate-400 ml-2" />
            <input className="flex-1 bg-transparent border-none focus:ring-0 text-sm h-9" placeholder="Nom..." value={nomSearch} onChange={(e)=>setNomSearch(e.target.value)} />
            <input className="flex-1 bg-transparent border-none focus:ring-0 text-sm h-9 border-l pl-3" placeholder="Prénom..." value={prenomSearch} onChange={(e)=>setPrenomSearch(e.target.value)} />
            <Button onClick={rechercheEtudiants} disabled={loadingRecherche} size="sm" className="bg-blue-900 px-6">
              {loadingRecherche ? <Loader2 className="animate-spin" /> : "Rechercher"}
            </Button>
          </div>

          {afficherListe && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
              {etudiantsTrouves.map((e) => (
                <div key={e.id} onClick={() => selectEtudiant(e.id)} className="p-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-b">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 text-xs font-bold">{e.nom[0]}</div>
                  <span className="text-sm font-medium">{e.nom} {e.prenom}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FORMULAIRE D'EDITION */}
        {currentEtudiantId && (
          <Card className="border-none shadow-lg animate-in fade-in slide-in-from-bottom-2">
            <CardHeader className="bg-blue-900 text-white py-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-md flex items-center gap-2"><UserIcon size={18} /> Dossier N° {currentEtudiantId}</CardTitle>
                <Button variant="ghost" size="sm" className="text-white hover:bg-blue-800" onClick={() => setCurrentEtudiantId(null)}><X size={16}/></Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <form onSubmit={handleUpdate} className="space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* COL 1: IDENTITÉ */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-1">Etat Civil</h4>
                    <div className="bg-slate-50 p-2 rounded border">
                      <p className="text-xs text-slate-500">ID Étudiant</p>
                      <p className="font-medium">{formData.id}</p>
                    </div>
                    <CompactField 
                      label="Nom" 
                      value={formData.nom} 
                      onChange={(v: string) => setFormData({...formData, nom: v})} 
                      required
                    />
                    <CompactField 
                      label="Prénom" 
                      value={formData.prenom} 
                      onChange={(v: string) => setFormData({...formData, prenom: v})} 
                      // required
                    />
                    <CompactField 
                      label="Date de naissance" 
                      type="date" 
                      value={formData.dateNaissance} 
                      onChange={(v: string) => setFormData({...formData, dateNaissance: v})} 
                      required
                    />
                    <CompactField 
                      label="Lieu de naissance" 
                      value={formData.lieuNaissance} 
                      onChange={(v: string) => setFormData({...formData, lieuNaissance: v})} 
                      required
                    />
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Sexe</Label>
                      <select 
                        value={formData.sexeId} 
                        onChange={(e) => setFormData({...formData, sexeId: Number(e.target.value)})}
                        className="h-9 w-full text-sm border-slate-200 focus:border-blue-400 bg-slate-50/50 rounded-md px-3"
                        required
                      >
                        <option value="1">Masculin</option>
                        <option value="2">Féminin</option>
                      </select>
                    </div>
                  </div>

                  {/* COL 2: CIN & BACC */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-1 flex items-center gap-1">
                        <Fingerprint size={12}/> CIN
                      </h4>
                      <CompactField 
                        label="Numéro CIN" 
                        value={formData.cinNumero} 
                        onChange={(v: string) => setFormData({...formData, cinNumero: v})} 
                        required
                      />
                      <CompactField 
                        label="Lieu de délivrance" 
                        value={formData.cinLieu} 
                        onChange={(v: string) => setFormData({...formData, cinLieu: v})} 
                        required
                      />
                      <CompactField 
                        label="Date de délivrance" 
                        type="date" 
                        value={formData.dateCin} 
                        onChange={(v: string) => setFormData({...formData, dateCin: v})} 
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-1 flex items-center gap-1">
                        <GraduationCap size={12}/> Baccalauréat
                      </h4>
                      <CompactField 
                        label="Numéro BACC" 
                        value={formData.baccNumero} 
                        onChange={(v: string) => setFormData({...formData, baccNumero: v})} 
                        required
                      />
                      <CompactField 
                        label="Année d'obtention" 
                        type="number" 
                        value={formData.baccAnnee} 
                        onChange={(v: string) => setFormData({...formData, baccAnnee: v})} 
                        required
                      />
                      <CompactField 
                        label="Série BACC" 
                        value={formData.baccSerie} 
                        onChange={(v: string) => setFormData({...formData, baccSerie: v})} 
                        required
                      />
                    </div>
                  </div>

                  {/* COL 3: CONTACT */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-1">
                      Coordonnées
                    </h4>
                    <CompactField 
                      label="Email" 
                      type="email" 
                      value={formData.proposEmail} 
                      onChange={(v: string) => setFormData({...formData, proposEmail: v})} 
                      required
                    />
                    {/* <CompactField 
                      label="Téléphone" 
                      type="tel" 
                      value={formData.telephone} 
                      onChange={(v: string) => setFormData({...formData, telephone: v})} 
                      required
                    /> */}
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Adresse</Label>
                      <textarea 
                        value={formData.proposAdresse} 
                        onChange={(e) => setFormData({...formData, proposAdresse: e.target.value})}
                        className="min-h-[100px] w-full text-sm border-slate-200 focus:border-blue-400 bg-slate-50/50 rounded-md p-2"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={loadingSave} className="bg-green-700 hover:bg-green-800 px-12 h-11 text-white">
                    {loadingSave ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />}
                    Enregistrer les modifications
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

// --- SOUS-COMPOSANT TYPÉ ---
function CompactField({ label, value, onChange, type = "text", required = false }: CompactFieldProps & { required?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
          {label}
        </Label>
        {required && <span className="text-red-500 text-xs">*</span>}
      </div>
      <Input 
        type={type} 
        value={value ?? ""} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} 
        className="h-9 text-sm border-slate-200 focus:border-blue-400 bg-slate-50/50"
        required={required}
      />
    </div>
  );
}