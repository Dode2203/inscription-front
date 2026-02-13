'use client';
import React, { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ScolaritePDF } from '@/lib/pdf/generatePdfEcolage';

interface Props {
  idEtudiant: string | number;
}

export const ScolariteLoader = ({ idEtudiant }: Props) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (idEtudiant) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/ecolage/all-detail?id=${idEtudiant}`);
          const result = await response.json();
          if (result.status === "success") {
            // console.log(result.data);
            setData(result.data);
          }
        } catch (error) {
          console.error("Erreur API:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [idEtudiant]); // Se relance si l'idEtudiant change

  if (loading) return <p>Chargement des données...</p>;
  if (!data) return <p>Aucune donnée trouvée pour l'ID {idEtudiant}</p>;

  return (
    <div className="p-4 border rounded shadow-sm bg-white">
      <p className="mb-4 text-sm font-medium">
        Prêt pour : <strong>{data.etudiant.nom}</strong>
      </p>
      
      <PDFDownloadLink
        document={<ScolaritePDF data={data} />}
        fileName={`Ecolage_${data.etudiant.nom} ${data.etudiant.prenom}.pdf`}
        className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold"
      >
        {({ loading: pdfLoading }) =>
          pdfLoading ? "Génération du fichier..." : "Télécharger PDF"
        }
      </PDFDownloadLink>
    </div>
  );
};