// src/components/utilisateur/dashboard/student-details-modal.tsx
'use client';

import { useState } from 'react';
import { Download, Loader2, X, User, Calendar, MapPin, Mail, GraduationCap, CreditCard, Pencil, Eye } from 'lucide-react';
import { Student } from '@/lib/db';
import { downloadReceipt, viewReceipt } from '@/lib/receipt-helper';
import ModifierPaiementForm from '@/components/admin/modification/ModifierPaiementForm';

interface StudentDetailsModalProps {
  student: Student;
  onClose: () => void;
  onUpdateSuccess?: (idEtudiant: number | string) => void;
}

export function StudentDetailsModal({ student, onClose, onUpdateSuccess }: StudentDetailsModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState<any>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0
    }).format(montant) + ' Ar';
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      // console.log(student);
      await downloadReceipt(student);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const [isViewing, setIsViewing] = useState(false);
  const handleViewPDF = async () => {
    try {
      setIsViewing(true);
      await viewReceipt(student);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la visualisation du PDF');
    } finally {
      setIsViewing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-lg sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {student.nom} {student.prenom}
              </h2>
              {student.matricule && (
                <p className="text-sm text-gray-500">Matricule: {student.matricule}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
          {/* Informations personnelles */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Informations personnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-500">Date de naissance</p>
                <p className="font-medium flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDate(student.dateNaissance)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lieu de naissance</p>
                <p className="font-medium flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {student.lieuNaissance || 'Non renseigné'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sexe</p>
                <p className="font-medium mt-1">{student.sexe || 'Non spécifié'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {student.contact?.email || 'Non renseigné'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Adresse</p>
                <p className="font-medium flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {student.contact?.adresse || 'Non renseigné'}
                </p>
              </div>
            </div>
          </section>

          {/* Formation */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Formation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-500">Formation</p>
                <p className="font-medium mt-1">
                  {(student as any).formation?.nom || student.typeFormation?.nom || 'Non spécifié'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type de formation</p>
                <p className="font-medium mt-1">
                  {(student as any).formation?.type?.nom || 'Non spécifié'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Niveau</p>
                <p className="font-medium mt-1">
                  {(student as any).niveau?.nom || 'Non spécifié'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mention</p>
                <p className="font-medium mt-1">
                  {(student as any).mention?.nom || 'Non spécifiée'}
                </p>
              </div>
            </div>
          </section>

          {/* Paiements */}
          {/* Section Droits (Pédagogiques & Administratifs) */}
          {student.payments && student.payments.filter(p => p.typeDroit !== 'Ecolage').length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Droits payés
              </h3>
              <div className="space-y-3">
                {student.payments
                  .filter(p => p.typeDroit !== 'Ecolage')
                  .map((paiement, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          {paiement.typeDroit === 'P‚dagogique' ? 'Pédagogique' : paiement.typeDroit}
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatMontant(paiement.montant)}
                        </span>
                        <button
                          onClick={() => setSelectedPaymentForEdit({
                            ...paiement,
                            idEtudiant: student.id,
                            idNiveau: (student as any).niveau?.id || student.niveau?.id
                          })}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                          title="Modifier ce paiement"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Référence</p>
                          <p className="font-medium">{paiement.reference}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Date de paiement</p>
                          <p className="font-medium">{formatDate(paiement.datePaiement)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Section Écolage */}
          {student.payments && student.payments.filter(p => p.typeDroit === 'Ecolage').length > 0 && (
            <section className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Écolage</h3>
              <div className="space-y-3">
                {student.payments
                  .filter(p => p.typeDroit === 'Ecolage')
                  .map((paiement, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          {/* Si vous n'avez pas de propriété 'tranche', on affiche le type */}
                          {paiement.typeDroit}
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {formatMontant(paiement.montant)}
                        </span>
                        <button
                          onClick={() => setSelectedPaymentForEdit({
                            ...paiement,
                            idEtudiant: student.id,
                            idNiveau: (student as any).niveau?.id || student.niveau?.id
                          })}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-green-600"
                          title="Modifier ce paiement"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Référence</p>
                          <p className="font-medium">{paiement.reference}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Date de paiement</p>
                          <p className="font-medium">{formatDate(paiement.datePaiement)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Formulaire de modification (superposé) */}
          {selectedPaymentForEdit && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
              <div className="w-full max-w-lg">
                <ModifierPaiementForm
                  payment={selectedPaymentForEdit}
                  onClose={() => setSelectedPaymentForEdit(null)}
                  onSuccess={() => setSelectedPaymentForEdit(null)}
                  onUpdateSuccess={onUpdateSuccess}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t px-6 py-4 flex justify-end gap-3 rounded-b-lg sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg text-sm font-medium"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </>
            )}
          </button>
          <button
            onClick={handleViewPDF}
            disabled={isViewing}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold shadow-sm"
          >
            {isViewing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Préparation...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Visualiser / Imprimer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}