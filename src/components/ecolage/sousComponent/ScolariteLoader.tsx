'use client';
import React, { useEffect, useState } from 'react';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { ScolaritePDF } from '@/lib/pdf/generatePdfEcolage';
import { Eye, Printer, Download, Loader2 } from 'lucide-react';

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

  const [isViewing, setIsViewing] = useState(false);

  const handleViewPDF = async () => {
    setIsViewing(true);
    try {
      const doc = <ScolaritePDF data={data} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
    } finally {
      setIsViewing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center gap-2 p-4">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">Chargement des données...</span>
    </div>
  );
  if (!data) return <p className="p-4 text-sm text-red-500">Aucune donnée trouvée pour l'ID {idEtudiant}</p>;

  return (
    <div className="p-4 border rounded shadow-sm bg-white">
      <p className="mb-4 text-sm font-medium">
        Prêt pour : <strong>{data.etudiant.nom} {data.etudiant.prenom}</strong>
      </p>

      <div className="flex flex-wrap gap-2">
        <PDFDownloadLink
          document={<ScolaritePDF data={data} />}
          fileName={`Ecolage_${data.etudiant.nom}_${data.etudiant.prenom}.pdf`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
        >
          {({ loading: pdfLoading }) => (
            <>
              {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
              Télécharger
            </>
          )}
        </PDFDownloadLink>

        <button
          onClick={handleViewPDF}
          disabled={isViewing}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          {isViewing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          Visualiser / Imprimer
        </button>
      </div>
    </div>
  );
};