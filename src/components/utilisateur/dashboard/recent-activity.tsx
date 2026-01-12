'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect, useState } from "react";

interface Payment {
  montant: number;
  datePaiement: string;
  typeDroit: string;
  reference: string;
}

export interface Student {
  id: number;
  matricule: string | null;
  nom: string;
  prenom: string;
  typeFormation: {
    id: number;
    nom: string;
  };
  dateNaissance: string;
  lieuNaissance: string;
  sexe: string;
  contact: {
    adresse: string;
    email: string;
  };
  droitsPayes: Payment[];
  ecolage: any;
}

interface RecentActivityProps {
  students: Student[];
  loading?: boolean;
  error?: string | null;
}

export function RecentActivity({ students = [], loading = false, error = null }: RecentActivityProps) {
  // Utilisation des propriétés passées en paramètres
  const [localLoading, setLocalLoading] = useState(loading);
  const [localError, setLocalError] = useState<string | null>(error);

  // Mise à jour de l'état local lorsque les props changent
  useEffect(() => {
    setLocalLoading(loading);
  }, [loading]);

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  // Si des étudiants sont fournis, on ne fait pas de requête supplémentaire
  useEffect(() => {
    if (students.length > 0) {
      setLocalLoading(false);
      setLocalError(null);
    }
  }, [students]);

  // Fonction pour formater la date en français
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: fr });
  };

  // Calculer le montant total des droits payés
  const getTotalPayments = (payments: Payment[]) => {
    return payments.reduce((sum, payment) => sum + payment.montant, 0);
  };

  if (localLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (localError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erreur</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{localError}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des étudiants</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Type de formation</TableHead>
              <TableHead>Total payé</TableHead>
              <TableHead>Dernier paiement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length > 0 ? (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.nom}</TableCell>
                  <TableCell>{student.prenom}</TableCell>
                  <TableCell>{student.typeFormation.nom}</TableCell>
                  <TableCell>
                    {student.droitsPayes && student.droitsPayes.length > 0
                      ? `${getTotalPayments(student.droitsPayes).toLocaleString('fr-MG')} MGA`
                      : 'Aucun paiement'}
                  </TableCell>
                  <TableCell>
                    {student.droitsPayes && student.droitsPayes.length > 0
                      ? formatDate(student.droitsPayes[0].datePaiement)
                      : '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
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
