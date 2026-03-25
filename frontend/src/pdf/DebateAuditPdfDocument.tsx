import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { DebateResponse, DebateTurn } from "@/types/debate";
import { arbPdf } from "@/pdf/arbiterPdfTheme";
import {
  METRIC_ROWS,
  bandFrom01,
  deriveFallacyPills,
  paginateTranscript,
  recordFingerprint,
  resolveWinningModel,
} from "@/pdf/debateAuditPdfHelpers";

const styles = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingHorizontal: 44,
    paddingBottom: 72,
    backgroundColor: arbPdf.bg,
    fontFamily: "DM Mono",
    fontSize: 8,
    color: arbPdf.text,
    lineHeight: 1.35,
  },
  pageFooter: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    fontSize: 6.5,
    color: arbPdf.muted,
    textAlign: "center",
  },
  productLine: {
    fontSize: 7,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: arbPdf.muted,
  },
  titleStrong: {
    marginTop: 6,
    fontFamily: "Bebas Neue",
    fontSize: 22,
    letterSpacing: 1,
    color: arbPdf.text,
  },
  metaRow: {
    marginTop: 10,
    fontSize: 7,
    color: arbPdf.muted,
  },
  disclaimer: {
    marginTop: 14,
    padding: 10,
    backgroundColor: arbPdf.surface,
    borderWidth: 1,
    borderColor: arbPdf.border,
    fontSize: 6.5,
    color: arbPdf.muted,
    lineHeight: 1.4,
  },
  sectionLabel: {
    marginTop: 16,
    fontSize: 7,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: arbPdf.muted,
  },
  topic: {
    marginTop: 6,
    fontFamily: "Instrument Serif",
    fontStyle: "italic",
    fontSize: 15,
    color: arbPdf.text,
    lineHeight: 1.35,
  },
  verdictShell: {
    marginTop: 14,
    padding: 12,
    backgroundColor: arbPdf.accentMuted,
    borderLeftWidth: 4,
    borderLeftColor: arbPdf.accent,
    borderWidth: 1,
    borderColor: arbPdf.border,
  },
  verdictKicker: {
    fontSize: 7,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: arbPdf.accent,
  },
  winner: {
    marginTop: 6,
    fontFamily: "Bebas Neue",
    fontSize: 30,
    color: arbPdf.text,
    letterSpacing: 0.5,
  },
  verdictSub: {
    marginTop: 4,
    fontSize: 8,
    color: arbPdf.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  confidence: {
    marginTop: 8,
    fontSize: 8,
    color: arbPdf.muted,
  },
  confidenceNum: {
    color: arbPdf.accent,
  },
  summary: {
    marginTop: 10,
    fontFamily: "Instrument Serif",
    fontStyle: "italic",
    fontSize: 10,
    color: arbPdf.muted,
    lineHeight: 1.45,
  },
  tableHeader: {
    flexDirection: "row",
    marginTop: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: arbPdf.border,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: arbPdf.border,
  },
  colMetric: { width: "34%" },
  colPro: { width: "33%", color: arbPdf.pro, textAlign: "right" as const },
  colAgainst: { width: "33%", color: arbPdf.against, textAlign: "right" as const },
  heatRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  heatCell: {
    width: "23%",
    marginRight: "2%",
    marginBottom: 6,
    padding: 6,
    borderWidth: 1,
    borderColor: arbPdf.border,
    backgroundColor: arbPdf.surface,
  },
  heatLabel: {
    fontSize: 6,
    textTransform: "uppercase",
    color: arbPdf.muted,
    letterSpacing: 0.6,
  },
  heatBand: {
    marginTop: 4,
    fontSize: 9,
  },
  analysisHeading: {
    marginTop: 14,
    fontSize: 7,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: arbPdf.muted,
  },
  analysisBody: {
    marginTop: 6,
    marginLeft: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: arbPdf.accent,
    fontFamily: "Instrument Serif",
    fontStyle: "italic",
    fontSize: 9,
    lineHeight: 1.45,
    color: arbPdf.text,
  },
  riskGrid: {
    marginTop: 8,
    flexDirection: "row",
  },
  riskCol: {
    flex: 1,
    fontSize: 7.5,
    color: arbPdf.muted,
    lineHeight: 1.4,
    paddingRight: 8,
  },
  notesGrid: {
    marginTop: 10,
    flexDirection: "row",
  },
  notesCol: {
    flex: 1,
    paddingRight: 10,
  },
  notesTitle: {
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  noteLine: {
    fontSize: 7.5,
    color: arbPdf.muted,
    marginBottom: 3,
    paddingLeft: 6,
    borderLeftWidth: 1,
    borderLeftColor: arbPdf.border,
  },
  transcriptTitle: {
    fontFamily: "Bebas Neue",
    fontSize: 18,
    color: arbPdf.text,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  turnBar: {
    flexDirection: "row",
    marginBottom: 11,
  },
  turnAccent: {
    width: 3,
    marginRight: 8,
  },
  turnMeta: {
    fontSize: 6.5,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: arbPdf.muted,
  },
  turnBody: {
    marginTop: 4,
    fontSize: 8.5,
    lineHeight: 1.45,
    color: arbPdf.text,
  },
});

function bandColor(b: "LOW" | "MED" | "HIGH"): string {
  if (b === "LOW") return arbPdf.emerald;
  if (b === "MED") return arbPdf.amber;
  return arbPdf.red;
}

function TurnBlock({ turn }: { turn: DebateTurn }) {
  const isA = turn.side === "A";
  const accent = isA ? arbPdf.pro : arbPdf.against;
  const roundNum = Math.floor(turn.index / 2) + 1;
  return (
    <View style={styles.turnBar}>
      <View style={[styles.turnAccent, { backgroundColor: accent }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.turnMeta}>
          Round {roundNum} · {turn.role} · {turn.modelName} · index {turn.index}
        </Text>
        <Text style={styles.turnBody} wrap>
          {turn.text}
        </Text>
      </View>
    </View>
  );
}

function VerdictSummaryPage({
  result,
  generatedAt,
  fingerprint,
}: {
  result: DebateResponse;
  generatedAt: string;
  fingerprint: string;
}) {
  const { evaluation, models } = result;
  const { analysis, metrics } = evaluation;
  const winnerName = resolveWinningModel(evaluation, models);
  const fallacies = deriveFallacyPills(analysis);

  const bn = (metrics.biasNeutrality.pro + metrics.biasNeutrality.against) / 2 / 10;
  const framingRisk = 1 - bn;
  const omissionRisk = evaluation.hallucinationRiskScore;
  const authorityRisk = 1 - evaluation.accuracySignalScore;
  const rq = (metrics.rebuttalQuality.pro + metrics.rebuttalQuality.against) / 2 / 10;
  const recencyRisk = 1 - rq;

  const heatmap: { label: string; band: "LOW" | "MED" | "HIGH" }[] = [
    { label: "Framing", band: bandFrom01(framingRisk) },
    { label: "Omission", band: bandFrom01(omissionRisk) },
    { label: "Authority", band: bandFrom01(authorityRisk) },
    { label: "Recency", band: bandFrom01(recencyRisk) },
  ];

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.productLine}>Tiramisu · Arbiter — formal debate & verdict record</Text>
      <Text style={styles.titleStrong}>OFFICIAL VERDICT SUMMARY</Text>
      <Text style={styles.metaRow}>
        Generated (UTC): {generatedAt} · Record ID: {fingerprint} · Exchanges: {result.exchangeCount} · Rounds
        (pairs): {result.rounds} · Style: {result.style}
      </Text>
      <Text style={styles.disclaimer} wrap>
        This PDF is generated from large language model (LLM) outputs and automated scoring. It is intended for
        internal review, audit trails, and documentary reference only. It does not constitute legal, regulatory, or
        professional advice. Model-generated reasoning may contain errors or omissions; corroborate material claims
        with primary evidence and preserve underlying system logs and API records where formal proceedings may apply.
      </Text>

      <Text style={styles.sectionLabel}>Motion / topic</Text>
      <Text style={styles.topic} wrap>
        {result.topic}
      </Text>

      <View style={styles.verdictShell}>
        <Text style={styles.verdictKicker}>Recorded outcome</Text>
        <Text style={styles.winner}>{winnerName}</Text>
        <Text style={styles.verdictSub}>{evaluation.verdictType.replace(/_/g, " ")}</Text>
        <Text style={styles.confidence}>
          Judge confidence:{" "}
          <Text style={styles.confidenceNum}>{(evaluation.confidence * 100).toFixed(0)}%</Text>
        </Text>
        <Text style={styles.summary} wrap>
          {analysis.summary}
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Rubric scores (0–10)</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.colMetric}>Metric</Text>
        <Text style={styles.colPro}>{models.pro}</Text>
        <Text style={styles.colAgainst}>{models.against}</Text>
      </View>
      {METRIC_ROWS.map(({ key, label }) => (
        <View key={key} style={styles.tableRow}>
          <Text style={styles.colMetric}>{label}</Text>
          <Text style={styles.colPro}>{metrics[key].pro.toFixed(1)}</Text>
          <Text style={styles.colAgainst}>{metrics[key].against.toFixed(1)}</Text>
        </View>
      ))}

      <Text style={styles.sectionLabel}>Bias heatmap (banded risk read)</Text>
      <View style={styles.heatRow}>
        {heatmap.map((c) => (
          <View key={c.label} style={styles.heatCell}>
            <Text style={styles.heatLabel}>{c.label}</Text>
            <Text style={[styles.heatBand, { color: bandColor(c.band) }]}>{c.band}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Fallacy scan (keyword flag)</Text>
      <Text style={{ marginTop: 4, fontSize: 7.5, color: arbPdf.muted }} wrap>
        {fallacies.clean
          ? "None detected via keyword scan on weakness notes."
          : fallacies.detected.join(" · ")}
      </Text>

      <Text
        style={styles.pageFooter}
        fixed
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages} · Arbiter formal record · LLM-generated — verify for legal or regulatory use`
        }
      />
    </Page>
  );
}

function VerdictAnalysisPage({ result, fingerprint }: { result: DebateResponse; fingerprint: string }) {
  const { evaluation } = result;
  const { analysis } = evaluation;

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.productLine}>Tiramisu · Arbiter — verdict detail · Record ID: {fingerprint}</Text>
      <Text style={styles.titleStrong}>JUDGE ANALYSIS & MODEL NOTES</Text>
      <Text style={styles.metaRow} wrap>
        Continuation of the formal record. Motion: {result.topic}
      </Text>

      <Text style={styles.analysisHeading}>Judge narrative</Text>
      <Text style={styles.analysisBody} wrap>
        {analysis.finalReasoning}
      </Text>

      <Text style={styles.analysisHeading}>Risk read</Text>
      <View style={styles.riskGrid}>
        <Text style={styles.riskCol} wrap>
          {analysis.hallucinationBias}
        </Text>
        <Text style={[styles.riskCol, { paddingRight: 0 }]} wrap>
          {analysis.accuracyAssessment}
        </Text>
      </View>
      <Text style={{ marginTop: 6, fontSize: 7, color: arbPdf.muted }}>
        Hallucination risk {(evaluation.hallucinationRiskScore * 100).toFixed(0)}% · Accuracy signal{" "}
        {(evaluation.accuracySignalScore * 100).toFixed(0)}%
      </Text>

      <Text style={styles.analysisHeading}>Model notes</Text>
      <View style={styles.notesGrid}>
        <View style={styles.notesCol}>
          <Text style={[styles.notesTitle, { color: arbPdf.pro }]}>Pro</Text>
          {analysis.strengthsPro.map((s, i) => (
            <Text key={`sp-${i}`} style={styles.noteLine} wrap>
              + {s}
            </Text>
          ))}
          {analysis.weaknessesPro.map((s, i) => (
            <Text key={`wp-${i}`} style={[styles.noteLine, { color: arbPdf.against }]} wrap>
              − {s}
            </Text>
          ))}
        </View>
        <View style={[styles.notesCol, { paddingRight: 0 }]}>
          <Text style={[styles.notesTitle, { color: arbPdf.against }]}>Against</Text>
          {analysis.strengthsAgainst.map((s, i) => (
            <Text key={`sa-${i}`} style={styles.noteLine} wrap>
              + {s}
            </Text>
          ))}
          {analysis.weaknessesAgainst.map((s, i) => (
            <Text key={`wa-${i}`} style={[styles.noteLine, { color: arbPdf.pro }]} wrap>
              − {s}
            </Text>
          ))}
        </View>
      </View>

      <Text
        style={styles.pageFooter}
        fixed
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages} · Arbiter formal record · LLM-generated — verify for legal or regulatory use`
        }
      />
    </Page>
  );
}

export function DebateAuditPdfDocument({
  result,
  generatedAt,
}: {
  result: DebateResponse;
  generatedAt: string;
}) {
  const fingerprint = recordFingerprint(result, generatedAt);
  const chunks = paginateTranscript(result.turns);

  return (
    <Document
      title={`Arbiter formal record — ${result.topic}`}
      subject="LLM debate transcript and assessed verdict"
      creator="Tiramisu Arbiter"
    >
      <VerdictSummaryPage result={result} generatedAt={generatedAt} fingerprint={fingerprint} />
      <VerdictAnalysisPage result={result} fingerprint={fingerprint} />
      {chunks.map((turns, pi) => (
        <Page key={`t-${pi}`} size="A4" style={styles.page}>
          <Text style={styles.transcriptTitle}>{pi === 0 ? "Official transcript" : "Transcript (continued)"}</Text>
          <Text style={{ fontSize: 7, color: arbPdf.muted, marginBottom: 12 }} wrap>
            Chronological order. Each block is one model turn as recorded at generation time. Record ID: {fingerprint}
          </Text>
          {turns.map((t) => (
            <TurnBlock key={t.index} turn={t} />
          ))}
          <Text
            style={styles.pageFooter}
            fixed
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages} · Arbiter formal record · LLM-generated — verify for legal or regulatory use`
            }
          />
        </Page>
      ))}
    </Document>
  );
}
