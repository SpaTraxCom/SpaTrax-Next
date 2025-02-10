"use client";

import { establishmentsTable, logsTable, usersTable } from "@/lib/db/schema";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Image,
} from "@react-pdf/renderer";
import { InferSelectModel } from "drizzle-orm";

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 8,
  },
  header: {
    fontSize: 12,
  },
  body: {
    marginTop: 25,
  },
  //   Table
  table: {
    width: "100%",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    borderTop: "1px solid #EEE",
    paddingTop: 8,
    paddingBottom: 8,
  },
  signature: {
    height: 20,
    width: 50,
  },
  bold: {
    fontWeight: "bold",
  },
  col1: {
    width: "20%",
  },
  col2: {
    width: "20%",
  },
  col3: {
    width: "10%",
  },
  col4: {
    width: "20%",
  },
  col5: {
    width: "30%",
    textAlign: "right",
  },
});

interface Props {
  establishment: InferSelectModel<typeof establishmentsTable>;
  dateStart: string;
  dateEnd: string;
  logs: (InferSelectModel<typeof logsTable> & {
    user: InferSelectModel<typeof usersTable>;
  })[];
}

export default function ClientPDFViewer(props: Props) {
  const e = props.establishment;
  const MyDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text>{e.business_name}</Text>
          <Text>{`${e.address}`}</Text>
          <Text>{`${e.city}, ${e.state} ${e.postal}`}</Text>
        </View>
        <View style={styles.body}>
          {/* Table Header */}
          <View style={[styles.row, styles.bold]}>
            <Text style={styles.col1}>Date</Text>
            <Text style={styles.col2}>Name</Text>
            <Text style={styles.col3}>Chair</Text>
            <Text style={styles.col4}>Signature</Text>
            <Text style={styles.col5}>Cleaned</Text>
          </View>
          {/* Table Body */}
          {[...props.logs].map((row, i) => (
            <View key={i} style={styles.row} wrap={false}>
              <Text style={styles.col1}>
                {new Date(row.performed_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </Text>
              <Text style={styles.col2}>
                {row.user.first_name} {row.user.last_name}
              </Text>
              <Text style={styles.col3}>{row.chair}</Text>
              <Text style={styles.col4}>
                <Image style={styles.signature} src={row.esignature || ""} />{" "}
              </Text>
              <Text style={styles.col5}>{row.presets?.join(", ")}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );

  if (!props.logs.length) return;

  return (
    <div>
      <PDFViewer width={1000} height={1500}>
        <MyDocument />
      </PDFViewer>

      {/* <PDFDownloadLink
        className="mt-4 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2"
        document={<MyDocument />}
        fileName="my-document.pdf"
      >
        {({ loading }) => (loading ? "Loading..." : "Download PDF")}
      </PDFDownloadLink> */}
    </div>
  );
}
