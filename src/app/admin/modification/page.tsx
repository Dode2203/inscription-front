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
  formation: string;
  niveau: string;
  mention: string;
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
  const [etudiantsTrouves, setEtudiantsTrouves] = useState<EtudiantRecherche[]>([]);
  const [afficherListe, setAfficherListe] = useState(false);

  const [currentEtudiantId, setCurrentEtudiantId] = useState<number | string | null>(null);
  
  // État du formulaire initialisé
  const [formData, setFormData] = useState<FormDataState>({
    nom: '', prenom: '', dateNaissance: '', lieuNaissance: '',
    sexeId: 1, 
    cinNumero: '', cinLieu: '', dateCin: '',
    baccNumero: '', baccAnnee: '', baccSerie: '',
    proposEmail: '', proposAdresse: '', telephone: '',
    formation: '', niveau: '', mention: ''
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

  // 3. Sélection et remplissage (Mappage du JSON)
  const selectEtudiant = async (id: number | string) => {
    setLoadingRecherche(true);
    try {
      const res = await fetch(`/api/etudiants?idEtudiant=${encodeURIComponent(id)}`);
      const response = await res.json();
      if (res.ok) {
        const d = response.data;
        setCurrentEtudiantId(id);
        
        setFormData({
          nom: d.identite.nom || '',
          prenom: d.identite.prenom || '',
          dateNaissance: d.identite.dateNaissance ? d.identite.dateNaissance.split('T')[0] : '',
          lieuNaissance: d.identite.lieuNaissance || '',
          sexeId: d.identite.sexeId || 1,
          cinNumero: d.identite.cinNumero || '',
          cinLieu: d.identite.cinLieu || '',
          dateCin: d.identite.dateCin ? d.identite.dateCin.split('T')[0] : '',
          baccNumero: d.identite.baccNumero || '',
          baccAnnee: d.identite.baccAnnee || '',
          baccSerie: d.identite.baccSerie || '',
          proposEmail: d.identite.proposEmail || d.identite.contact?.email || '',
          proposAdresse: d.identite.proposAdresse || d.identite.contact?.adresse || '',
          telephone: d.identite.contact?.telephone || '',
          formation: d.formation?.formation || '',
          niveau: d.formation?.niveau || '',
          mention: d.formation?.mention || ''
        });
        setAfficherListe(false);
      }
    } finally { setLoadingRecherche(false); }
  };

  // 4. Update (PUT)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSave(true);
    try {
      const res = await fetch(`/api/etudiants/inscription`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentEtudiantId,
          ...formData
        }),
      });

      if (res.ok) {
        toast.success("Dossier mis à jour avec succès !");
      } else {
        toast.error("Erreur lors de la modification");
      }
    } catch (err) {
      toast.error("Erreur technique");
    } finally { setLoadingSave(false); }
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
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* COL 1: IDENTITÉ */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-1">Etat Civil</h4>
                    <CompactField label="Nom" value={formData.nom} onChange={(v: string) => setFormData({...formData, nom: v})} />
                    <CompactField label="Prénom" value={formData.prenom} onChange={(v: string) => setFormData({...formData, prenom: v})} />
                    <CompactField label="Né(e) le" type="date" value={formData.dateNaissance} onChange={(v: string) => setFormData({...formData, dateNaissance: v})} />
                    <CompactField label="Lieu" value={formData.lieuNaissance} onChange={(v: string) => setFormData({...formData, lieuNaissance: v})} />
                  </div>

                  {/* COL 2: CIN */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-1 flex items-center gap-1"><Fingerprint size={12}/> CIN</h4>
                    <CompactField label="Numéro CIN" value={formData.cinNumero} onChange={(v: string) => setFormData({...formData, cinNumero: v})} />
                    <CompactField label="Fait à" value={formData.cinLieu} onChange={(v: string) => setFormData({...formData, cinLieu: v})} />
                    <CompactField label="Date CIN" type="date" value={formData.dateCin} onChange={(v: string) => setFormData({...formData, dateCin: v})} />
                  </div>

                  {/* COL 3: BACC & CURSUS */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-1 flex items-center gap-1"><GraduationCap size={12}/> Scolarité</h4>
                    <CompactField label="Numéro BACC" value={formData.baccNumero} onChange={(v: string) => setFormData({...formData, baccNumero: v})} />
                    <CompactField label="Année BACC" value={formData.baccAnnee} onChange={(v: string) => setFormData({...formData, baccAnnee: v})} />
                    <CompactField label="Série" value={formData.baccSerie} onChange={(v: string) => setFormData({...formData, baccSerie: v})} />
                    <CompactField label="Niveau actuel" value={formData.niveau} onChange={(v: string) => setFormData({...formData, niveau: v})} />
                  </div>

                  {/* COL 4: CONTACT */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-1">Contact</h4>
                    <CompactField label="Email" value={formData.proposEmail} onChange={(v: string) => setFormData({...formData, proposEmail: v})} />
                    <CompactField label="Téléphone" value={formData.telephone} onChange={(v: string) => setFormData({...formData, telephone: v})} />
                    <CompactField label="Adresse" value={formData.proposAdresse} onChange={(v: string) => setFormData({...formData, proposAdresse: v})} />
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
function CompactField({ label, value, onChange, type = "text" }: CompactFieldProps) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{label}</Label>
      <Input 
        type={type} 
        value={value ?? ""} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} 
        className="h-9 text-sm border-slate-200 focus:border-blue-400 bg-slate-50/50" 
      />
    </div>
  );
}