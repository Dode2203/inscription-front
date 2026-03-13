import { Student } from '@/lib/db';
import React from 'react';

// Assurez-vous d'importer votre interface Student ici
// import { Student } from '@/types/student';

interface Props {
  student: Student;
}

export default function CertificatScolarite({ student }: Props) {
  // Formatage des données
  const nomComplet = `${student.nom} ${student.prenom || ''}`.toUpperCase();
  const anneeUniversitaire = student.inscription?.anneeUniversitaire || "2024-2025";
  const matricule = student.inscription?.matricule || student.matricule || "Non défini";
  const niveau = student.niveau?.nom || "Non défini";
  const mention = student.mention?.nom || "Non défini";
  const parcours = student.parcours?.nom || "Non défini";
  
  // Date du jour pour la signature
  const dateDelivrance = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).toUpperCase();

  return (
    <div className="flex justify-center bg-gray-100 p-8 min-h-screen">
      {/* Conteneur format A4 */}
      <div 
        className="bg-white text-black font-serif relative"
        style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}
      >
        {/* EN-TÊTE */}
        <div className="flex justify-between items-start mb-8 text-xs font-bold text-center">
          <div className="flex flex-col items-center w-1/2">
            <p>Ministère de l'Enseignement Supérieur et de la<br/>Recherche Scientifique</p>
            <hr className="w-3/4 border-black my-1" />
            <p>Université d'Antananarivo</p>
            <p>Ecole Supérieure Polytechnique d'Antananarivo</p>
            <hr className="w-1/2 border-black my-1" />
            <p>Administration Centrale</p>
            <hr className="w-1/3 border-black my-1" />
            <p>Service des Etudiants</p>
            <hr className="w-1/3 border-black my-1" />
            <p className="text-left w-full mt-2">Réf : UA/ESPA/SDE/ CS/50328</p>
          </div>
          
          <div className="w-1/3 flex flex-col items-center">
            {/* Remplacez la source par le chemin de votre logo ESPA */}
            {/* <img src="/logo-espa.png" alt="Logo ESPA" className="w-32 h-auto mb-2" /> */}
            <div className="w-32 h-32 border border-gray-300 flex items-center justify-center text-gray-400 mb-2 rounded-full">
              [Logo ESPA]
            </div>
            <p className="text-[10px] italic font-normal">Premier Partenaire des Professionnels</p>
          </div>
        </div>

        {/* TITRE */}
        <div className="text-center mb-10">
          <h1 className="text-xl font-bold uppercase tracking-widest">Certificat de Scolarité</h1>
          <p className="text-sm">ANNEE UNIVERSITAIRE {anneeUniversitaire}</p>
        </div>

        {/* CORPS DU TEXTE */}
        <div className="text-sm leading-relaxed mb-16 text-justify">
          <p className="mb-6">Le Directeur de l'Ecole Supérieure Polytechnique d'Antananarivo certifie que :</p>
          
          <p className="font-bold text-lg mb-4">{nomComplet}</p>
          
          <p className="mb-6">
            Né(e) le <strong>{student.dateNaissance}</strong> à <strong>{student.lieuNaissance}</strong>
          </p>
          
          <p>
            est régulièrement inscrit(e) comme étudiant(e) permanent(e) en : <strong>{niveau}</strong> de la Mention <strong>{mention}</strong> - Parcours <strong>{parcours}</strong> au sein de notre Ecole durant l'année Universitaire {anneeUniversitaire} sous le matricule : <strong>{matricule}</strong>.
          </p>
        </div>

        {/* SIGNATURES */}
        <div className="flex justify-end mt-12 mb-24">
          <div className="w-1/2 flex flex-col items-center text-sm">
            <p className="mb-4">Fait à Antananarivo, le <span className="text-red-700 font-bold">{dateDelivrance}</span></p>
            <p>Pour le Directeur,</p>
            <p>Par délégation</p>
            <p className="mb-12">Le Chef du Service des Etudiants</p>
            
            {/* Emplacement pour le cachet et la signature */}
            <div className="relative w-48 h-32 flex items-center justify-center">
              {/* <img src="/cachet-signature.png" alt="Signature" className="absolute opacity-80" /> */}
              <div className="w-32 h-32 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500 text-xs text-center rotate-[-15deg] opacity-50">
                [Cachet et Signature]
              </div>
            </div>
            
            <p className="font-bold mt-4">RAZAFINTSALAMA Hantanirina Tahinasoa</p>
          </div>
        </div>

        {/* PIED DE PAGE */}
        <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] border-t border-black pt-2">
          <p className="text-[10px] text-justify">
            Le Service des Etudiants ne délivre qu'un seul certificat de scolarité par année universitaire, l'étudiant peut faire plusieurs copies certifiées par le Directeur de l'Ecole Supérieure Polytechnique d'Antananarivo.
          </p>
        </div>
      </div>
    </div>
  );
}