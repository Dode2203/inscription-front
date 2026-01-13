// src/components/utilisateur/dashboard/student-table.tsx
'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Loader2 } from "lucide-react";
import { Student } from "@/lib/db";
import { downloadReceipt } from "@/lib/receipt-helper";

interface StudentTableProps {
  students: Student[];
}

export function StudentTable({ students }: StudentTableProps) {
  const [loadingStudentId, setLoadingStudentId] = useState<number | null>(null);

  const handleDownload = async (student: Student) => {
    try {
      setLoadingStudentId(student.id);
      await downloadReceipt(student);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoadingStudentId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Étudiants</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Type de formation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length > 0 ? (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.nom}</TableCell>
                  <TableCell>{student.prenom}</TableCell>
                  <TableCell>{student.typeFormation?.nom || 'Non spécifié'}</TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleDownload(student)}
                      disabled={loadingStudentId === student.id}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingStudentId === student.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Chargement...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-1" />
                          Télécharger le reçu
                        </>
                      )}
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  Aucun étudiant trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}