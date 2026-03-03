"use client";

import React from "react";
import Image from "next/image";

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        // 1. On réduit py-8 à py-4 (moitié moins haut)
        <footer className="py-4 border-t border-slate-200 bg-white">
            <div className="container mx-auto px-6">
                {/* 2. On utilise sm:flex-row pour mettre le logo à côté du texte sur PC */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
                    
                    <div className="flex items-center">
                        <Image 
                            src="/espaLogo.jpeg" 
                            alt="Logo ESPA"
                            width={64}  // On demande le double de la taille d'affichage
                            height={64} // pour la netteté sur écrans Retina
                            className="w-8 h-8 object-contain" // On force l'affichage à 32px (w-8 = 32px)
                        />
                    </div>

                    <div className="text-center sm:text-left border-l-0 sm:border-l sm:pl-6 border-slate-200">
                        <p className="text-xs text-muted-foreground font-medium">
                            © {currentYear} ESPA Vontovorona
                        </p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-tighter leading-none mt-1">
                            Ecole Supérieure Polytechnique d'Antananarivo
                        </p>
                    </div>
                    
                </div>
            </div>
        </footer>
    );
};