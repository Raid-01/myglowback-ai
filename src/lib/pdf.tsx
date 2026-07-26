import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica', color: '#2C2A24' },
  header: { marginBottom: 24, borderBottom: '2 solid #456348', paddingBottom: 12 },
  brand: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#374F39' },
  label: { color: '#6B6659', fontSize: 9, textTransform: 'uppercase', marginBottom: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  section: { marginTop: 18 },
  sectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 13, marginBottom: 8, color: '#374F39' },
  step: { marginBottom: 4 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 10,
    borderTop: '1 solid #E4DDCC',
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
  },
});

interface InvoicePdfProps {
  invoiceNumber: string;
  clinicName: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt?: string | null;
}

export async function renderInvoicePdf(props: InvoicePdfProps): Promise<Buffer> {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>MyGlowBack.AI</Text>
          <Text style={{ color: '#6B6659', marginTop: 2 }}>Subscription Invoice</Text>
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Invoice Number</Text>
            <Text>{props.invoiceNumber}</Text>
          </View>
          <View>
            <Text style={styles.label}>Billed To</Text>
            <Text>{props.clinicName}</Text>
          </View>
          <View>
            <Text style={styles.label}>Status</Text>
            <Text>{props.status}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Due Date</Text>
            <Text>{props.dueDate}</Text>
          </View>
          {props.paidAt && (
            <View>
              <Text style={styles.label}>Paid On</Text>
              <Text>{props.paidAt}</Text>
            </View>
          )}
        </View>

        <View style={styles.totalRow}>
          <Text>Total</Text>
          <Text>
            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(props.amount)}
          </Text>
        </View>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}

interface PrescriptionPdfProps {
  patientName: string;
  clinicName: string;
  skinType: string;
  concerns: string[];
  routine: { am: string[]; pm: string[] };
  ingredients: string[];
  followUpDate: string;
  createdAt: string;
}

export async function renderPrescriptionPdf(props: PrescriptionPdfProps): Promise<Buffer> {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>{props.clinicName}</Text>
          <Text style={{ color: '#6B6659', marginTop: 2 }}>90-Day Skincare Protocol</Text>
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Patient</Text>
            <Text>{props.patientName}</Text>
          </View>
          <View>
            <Text style={styles.label}>Skin Type</Text>
            <Text>{props.skinType}</Text>
          </View>
          <View>
            <Text style={styles.label}>Concerns</Text>
            <Text>{props.concerns.join(', ')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AM Routine</Text>
          {props.routine.am.map((step, i) => (
            <Text key={i} style={styles.step}>
              {i + 1}. {step}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PM Routine</Text>
          {props.routine.pm.map((step, i) => (
            <Text key={i} style={styles.step}>
              {i + 1}. {step}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Active Ingredients</Text>
          <Text>{props.ingredients.join(', ') || 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow-up</Text>
          <Text>{props.followUpDate}</Text>
        </View>

        <Text style={{ marginTop: 30, fontSize: 9, color: '#6B6659' }}>
          Generated {props.createdAt} by {props.clinicName} via MyGlowBack.AI. This protocol is a
          general recommendation and does not replace individualized medical advice.
        </Text>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
