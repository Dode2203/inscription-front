import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { formatDate } from '../utils';
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottom: 2, paddingBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  studentInfo: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginTop: 15, marginBottom: 8, backgroundColor: '#eeeeee', padding: 4 },
  table: {
  width: "100%",
  borderStyle: "solid",
  borderWidth: 1
},
  tableRow: { flexDirection: "row" },
  tableColHeader: { width: "25%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#f9f9f9' },
  tableCol: { width: "25%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableCell: { margin: 5, fontSize: 8 }
});

export const ScolaritePDF = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>RELEVÉ DE SITUATION FINANCIÈRE</Text>
      </View>

      <View style={styles.studentInfo}>
        <Text>Étudiant : {data.etudiant.nom} {data.etudiant.prenom}</Text>
        <Text>Numéro Matricule : {data.etudiant.id}</Text>
        <Text>Date d'édition : {new Date().toLocaleDateString()}</Text>
      </View>

      <Text style={styles.sectionTitle}>1. Détails de l'écolage par niveau</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          {["Niveau", "Année", "Payé (Ar)", "Reste (Ar)"].map(h => (
            <View key={h} style={styles.tableColHeader}><Text style={styles.tableCell}>{h}</Text></View>
          ))}
        </View>
        {data.details.map((item: any, i: number) => (
          <View key={i} style={styles.tableRow}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.niveau}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.annee_scolaire}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.montant_paye.toLocaleString()}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.reste_a_payer.toLocaleString()}</Text></View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>2. Historique des paiements</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          {["Date", "Réf", "Niveau", "Annee","Montant (Ar)"].map(h => (
            <View key={h} style={styles.tableColHeader}><Text style={styles.tableCell}>{h}</Text></View>
          ))}
        </View>
        {data.history.map((pay: any, i: number) => (
          <View key={i} style={styles.tableRow}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{formatDate(pay.date)}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{pay.reference}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{pay.niveau}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{pay.annee}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{pay.montant.toLocaleString()}</Text></View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);