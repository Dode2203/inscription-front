'use client';

import React, { useState } from 'react';
import { Loader2, Eye, ChevronLeft, ChevronRight } from 'lucide-react'; // Ajout d'icônes
import { Student } from '@/lib/db';
import { StudentDetailsModal } from './student-model';
import { formatDateTime } from '@/lib/utils';
import { useRouter } from "next/navigation"
import { toast } from 'sonner';

interface StudentTableProps {
  students: Student[];
  nbPagination?: number;
}

export function StudentTable({ students, nbPagination = 5 }: StudentTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loadingStudentId, setLoadingStudentId] = useState<number | null>(null);
  const router = useRouter();
  // --- Logique de Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = nbPagination;
  
  const totalPages = Math.ceil(students.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = students.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)
  ;
  // ----------------------------


  const handleViewDetails = async (student: Student) => {
    try {
      setLoadingStudentId(student.id);
      const currentYear = new Date().getFullYear();
      const response = await fetch(
        `/api/etudiants/details-par-annee?idEtudiant=${student.id}&annee=${currentYear}`
      );
      const login = process.env.NEXT_PUBLIC_LOGIN_URL || '/login';
      toast.error("Session expirée. Redirection... ");
      if (response.status === 401 || response.status === 403) {
            
            await fetch("/api/auth/logout", { method: "POST" })
            router.push(login); 
            return; 
      }
      toast.error("Session expirée. Redirection... ");
      if (response.status === 401 || response.status === 403) {
            
            await fetch("/api/auth/logout", { method: "POST" })
            router.push(login); 
            return; 
      }
      if (!response.ok) {
        toast.error("Erreur lors de la récupération des détails");
        return;
      }
      
      const result = await response.json();
      if (result.status !== 'success' || !result.data) {
        toast.error("Données non disponibles");
        return;
      }
      // console.log(result.data);
      const fullStudent: Student = {
        ...student,
        ...result.data,
        typeFormation: result.data.formation?.type || student.typeFormation,
        droitsPayes: result.data.droitsPayes || [],
        ecolage: result.data.ecolage || null
      };
      
      setSelectedStudent(fullStudent);  
    } catch (error) {
      toast.error("Impossible de charger les détails de l'étudiant");
    } finally {
      setLoadingStudentId(null);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Étudiants ({students.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Inscription</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentStudents.length > 0 ? (
                currentStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.nom}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.prenom}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(student.dateInscription)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleViewDetails(student)}
                        disabled={loadingStudentId === student.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loadingStudentId === student.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4 mr-1" />
                        )}
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500 italic">Aucun étudiant trouvé</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- Interface de Pagination --- */}
        {students.length > itemsPerPage && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="text-sm text-gray-700">
              Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à <span className="font-medium">{Math.min(indexOfLastItem, students.length)}</span> sur <span className="font-medium">{students.length}</span> résultats
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {/* Affichage simple des numéros de page */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-3 py-1 rounded-md text-sm font-medium border ${
                    currentPage === number
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {number}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}