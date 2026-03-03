"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Filter, CalendarDays, ArrowUpDown } from "lucide-react";
import { Mention, Niveau } from "@/lib/db";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

interface ExportFiltersProps {
    mentions: Mention[];
    niveaux: Niveau[];
    selectedMention: string;
    setSelectedMention: (id: string) => void;
    selectedNiveau: string;
    setSelectedNiveau: (id: string) => void;
    sortByDate: boolean;
    setSortByDate: (checked: boolean) => void;
    sortDesc: boolean;
    setSortDesc: (checked: boolean) => void;
}

export function ExportFilters({
    mentions,
    niveaux,
    selectedMention,
    setSelectedMention,
    selectedNiveau,
    setSelectedNiveau,
    sortByDate,
    setSortByDate,
    sortDesc,
    setSortDesc,
}: ExportFiltersProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-900 rounded-lg">
                    <Filter className="w-6 h-6 text-amber-400" />
                </div>
                <h1 className="text-2xl font-bold text-blue-900">Exportation des Étudiants</h1>
            </div>

            {/* Barre de Filtres */}
            <Card className="p-6 border-t-4 border-blue-900 shadow-md">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-blue-900 font-bold">1. Mention</Label>
                        <select
                            className="w-full h-10 px-3 rounded-md border border-slate-300 outline-none focus:ring-2 focus:ring-blue-900"
                            value={selectedMention}
                            onChange={(e) => setSelectedMention(e.target.value)}
                        >
                            <option value="">Toutes les mentions</option>
                            {mentions.map(m => <option key={m.id} value={m.id.toString()}>{m.nom}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-blue-900 font-bold">2. Niveau</Label>
                        <select
                            className="w-full h-10 px-3 rounded-md border border-slate-300 outline-none focus:ring-2 focus:ring-blue-900"
                            value={selectedNiveau}
                            onChange={(e) => setSelectedNiveau(e.target.value)}
                        >
                            <option value="">Tous les niveaux</option>
                            {niveaux.map(n => <option key={n.id} value={n.id.toString()}>{n.nom}</option>)}
                        </select>
                    </div>

                    {/* NOUVELLE SECTION : Options de Tri Identiques à la page de filtrage */}
                    <div className="col-span-full pt-6 mt-4 border-t border-slate-200">
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">
                            Options d'affichage
                        </p>

                        <div className="flex flex-wrap items-center gap-10">
                            {/* Option 1: Tri par Date */}
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="sortByDate"
                                    checked={sortByDate}
                                    onCheckedChange={(checked: boolean) => setSortByDate(checked)}
                                    className="h-5 w-5 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                                <Label
                                    htmlFor="sortByDate"
                                    className="flex items-center gap-2 text-sm font-medium leading-none cursor-pointer text-slate-700 hover:text-blue-600 transition-colors"
                                >
                                    <CalendarDays className="w-4 h-4 text-slate-400" />
                                    <span>Trier par date <span className="text-xs text-slate-400 font-normal ml-1">(vs Nom)</span></span>
                                </Label>
                            </div>

                            {/* Option 2: Ordre Décroissant */}
                            <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                                <Switch
                                    id="sortDesc"
                                    checked={sortDesc}
                                    onCheckedChange={(checked: boolean) => setSortDesc(checked)}
                                    className="data-[state=checked]:bg-indigo-600"
                                />
                                <Label
                                    htmlFor="sortDesc"
                                    className="flex items-center gap-2 text-sm font-medium cursor-pointer text-slate-700 hover:text-indigo-600 transition-colors"
                                >
                                    <ArrowUpDown className={`w-4 h-4 transition-transform duration-300 ${sortDesc ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`} />
                                    Ordre décroissant
                                </Label>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
