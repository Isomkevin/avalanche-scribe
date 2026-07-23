import jsPDF from "jspdf";

export type ReportInput = {
  functionName?: string;
  functionSignature?: string;
  contractCode?: string;
  explainText?: string;
  debugText?: string;
  simulationText?: string;
  wallet?: string | null;
  network?: string;
};

function stripMd(s: string): string {
  return s
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?|```/g, ""))
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#+\s*/gm, "");
}

export function generateReport(input: ReportInput): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;

  const ensureRoom = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeLines = (text: string, opts: { size?: number; bold?: boolean; color?: [number, number, number] } = {}) => {
    const size = opts.size ?? 10;
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(opts.color ?? [30, 30, 30]));
    const wrapped = doc.splitTextToSize(text, pageW - margin * 2);
    for (const line of wrapped) {
      ensureRoom(size + 4);
      doc.text(line, margin, y);
      y += size + 4;
    }
  };

  const heading = (t: string) => {
    y += 8;
    ensureRoom(28);
    writeLines(t, { size: 14, bold: true, color: [232, 65, 66] });
    doc.setDrawColor(232, 65, 66);
    doc.setLineWidth(1);
    doc.line(margin, y - 4, pageW - margin, y - 4);
    y += 6;
  };

  const section = (title: string, body?: string) => {
    if (!body || !body.trim()) return;
    heading(title);
    writeLines(stripMd(body));
  };

  // Cover
  doc.setFillColor(20, 20, 30);
  doc.rect(0, 0, pageW, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Avalanche Scribe — Analysis Report", margin, 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(new Date().toLocaleString(), margin, 72);
  y = 120;

  // Metadata
  writeLines(`Function: ${input.functionName || "—"}`, { bold: true });
  if (input.functionSignature) writeLines(`Signature: ${input.functionSignature}`);
  writeLines(`Network: ${input.network || "Avalanche Fuji (43113)"}`);
  writeLines(`Wallet: ${input.wallet || "not connected"}`);

  section("AI Explanation", input.explainText);
  section("Debug & Security Findings", input.debugText);
  section("Simulation Result", input.simulationText);

  if (input.contractCode) {
    heading("Contract Source");
    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    const wrapped = doc.splitTextToSize(input.contractCode, pageW - margin * 2);
    for (const line of wrapped) {
      ensureRoom(10);
      doc.text(line, margin, y);
      y += 10;
    }
  }

  // Footer page numbers
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Avalanche Scribe · Page ${i} / ${total}`, pageW - margin, pageH - 20, { align: "right" });
  }

  return doc;
}

export function downloadReport(input: ReportInput, filename?: string) {
  const doc = generateReport(input);
  const name =
    filename ||
    `scribe-report-${input.functionName || "contract"}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(name);
}