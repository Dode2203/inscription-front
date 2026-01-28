// src/components/utilisateur/dashboard/student-table.tsx
'use client';

import React, { useState } from 'react';
import { Download, Loader2, Eye, X, FileText, Calendar, MapPin, User, Mail, GraduationCap, CreditCard } from 'lucide-react';
import { Student } from '@/lib/db';
import { generateReceiptPDF } from '@/lib/generateReceipt';
import { StudentDetailsModal } from './student-model';

interface StudentTableProps {
  students: Student[];
}

export function StudentTable({ students }: StudentTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loadingStudentId, setLoadingStudentId] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleViewDetails = async (student: Student) => {
    try {
      setLoadingStudentId(student.id);
      
      const currentYear = new Date().getFullYear();
      const response = await fetch(
        `/api/etudiants/details-par-annee?idEtudiant=${student.id}&annee=${currentYear}`
      );
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des détails');
      }
      
      const result = await response.json();
      
      if (result.status !== 'success' || !result.data) {
        throw new Error('Données non disponibles');
      }
      
      // Fusionner les données de base avec les détails complets
      const fullStudent: Student = {
        ...student,
        ...result.data,
        typeFormation: result.data.formation?.type || student.typeFormation,
        droitsPayes: result.data.droitsPayes || [],
        ecolage: result.data.ecolage || null
      };
      
      setSelectedStudent(fullStudent);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Impossible de charger les détails de l\'étudiant');
    } finally {
      setLoadingStudentId(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedStudent) return;
    
    try {
      setIsDownloading(true);
      
      const { prepareReceiptData } = await import('@/lib/receipt-helper');
      const { identite, formation, paiementData } = prepareReceiptData(selectedStudent);
      generateReceiptPDF(identite, formation, paiementData);
      
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Étudiants</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prénom
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.prenom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleViewDetails(student)}
                        disabled={loadingStudentId === student.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loadingStudentId === student.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Chargement...
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Voir détails
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Aucun étudiant trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onDownloadPDF={handleDownloadPDF}
          isDownloading={isDownloading}
        />
      )}
    </div>
  );
}