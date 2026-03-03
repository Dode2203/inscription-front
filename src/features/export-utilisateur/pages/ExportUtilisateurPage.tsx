"use client";

import { useInitialData } from "@/context/DataContext";
import Header from "@/components/static/Header";
import Menu from "@/components/static/Menu";
import { ExportFilters } from "../components/ExportFilters";
import { ExportTable } from "../components/ExportTable";
import { useExportFilters } from "../hooks/useExportFilters";
import { useState, useEffect } from "react";
import { User } from "@/lib/db";

export function ExportUtilisateurPage() {
    const { mentions, niveaux } = useInitialData();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState("/utilisateur/export");
    const [loadingAuth, setLoadingAuth] = useState(true);
    const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';

    const {
        filteredData,
        loading,
        isExporting,
        selectedMention,
        setSelectedMention,
        selectedNiveau,
        setSelectedNiveau,
        sortByDate,
        setSortByDate,
        sortDesc,
        setSortDesc,
        handleExport
    } = useExportFilters();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(`/api/auth/me`);
                if (!response.ok) {
                    window.location.href = login;
                    return;
                }
                const data = await response.json();
                setUser(data.user);
            } catch (err) {
                window.location.href = login;
            } finally {
                setLoadingAuth(false);
            }
        };
        checkAuth();
    }, [login]);

    if (loadingAuth) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const onExport = (format: 'pdf' | 'excel' | 'csv') => {
        const mentionLabel = mentions.find(m => m.id.toString() === selectedMention)?.nom || "";
        const niveauLabel = niveaux.find(n => n.id.toString() === selectedNiveau)?.nom || "";
        handleExport(format, mentionLabel, niveauLabel);
    };

    return (
        <main className="min-h-screen bg-background">
            <Header user={user} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Menu user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            <div className="container mx-auto px-6 py-8 space-y-8">
                <ExportFilters
                    mentions={mentions}
                    niveaux={niveaux}
                    selectedMention={selectedMention}
                    setSelectedMention={setSelectedMention}
                    selectedNiveau={selectedNiveau}
                    setSelectedNiveau={setSelectedNiveau}
                    sortByDate={sortByDate}
                    setSortByDate={setSortByDate}
                    sortDesc={sortDesc}
                    setSortDesc={setSortDesc}
                />

                <ExportTable
                    data={filteredData}
                    loading={loading}
                    isExporting={isExporting}
                    onExport={onExport}
                />
            </div>
        </main>
    );
}
