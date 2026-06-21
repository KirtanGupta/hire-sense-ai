// ─── Report Service — Phase 6 ─────────────────────────────────────────────────
// Client-side PDF generation using jsPDF.
// Import this file dynamically from browser components only.

function scoreLabel(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Average";
  if (score >= 40) return "Below Average";
  return "Needs Improvement";
}

export async function generatePDFReport(session, userName = "Candidate") {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = doc.internal.pageSize.getWidth();
  let y = 20;

  function line(text, size = 11, bold = false, color = [30, 30, 30]) {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...color);
    doc.text(text, 20, y);
    y += size * 0.55;
  }

  function gap(mm = 5) { y += mm; }

  function rule() {
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, W - 20, y);
    y += 5;
  }

  function bullet(text, color = [30, 30, 30]) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...color);
    const wrapped = doc.splitTextToSize(`• ${text}`, W - 45);
    doc.text(wrapped, 25, y);
    y += wrapped.length * 5.5;
  }

  function checkNewPage() {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  const date = new Date(session.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, W, 28, "F");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("HireSense AI — Interview Report", 20, 13);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 20, 22);
  y = 38;

  // ── Candidate Info ─────────────────────────────────────────────────────────
  line("Candidate Information", 13, true, [40, 40, 40]);
  gap(2);
  line(`Name: ${userName}`, 10);
  line(`Role: ${session.role}`, 10);
  line(`Difficulty: ${session.difficulty} | Experience: ${session.experience}`, 10);
  line(`Interview Date: ${date}`, 10);
  line(`Total Questions: ${session.totalQuestions}`, 10);
  gap(3);
  rule();

  // ── Overall Scores ─────────────────────────────────────────────────────────
  line("Overall Scores", 13, true, [40, 40, 40]);
  gap(2);
  line(`Overall Score:       ${session.overallScore ?? "N/A"}%  (${scoreLabel(session.overallScore)})`, 11, false, [30, 30, 30]);
  line(`Technical Score:     ${session.technicalScore ?? "N/A"}%  (${scoreLabel(session.technicalScore)})`, 11);
  line(`Communication Score: ${session.communicationScore ?? "N/A"}%  (${scoreLabel(session.communicationScore)})`, 11);
  line(`Confidence Score:    ${session.confidenceScore ?? "N/A"}%  (NLP Analysis)`, 11);
  gap(3);
  rule();

  // ── Strengths ─────────────────────────────────────────────────────────────
  line("Strengths", 13, true, [22, 163, 74]);
  gap(2);
  (session.strengths || []).forEach((s) => bullet(s, [22, 101, 52]));
  gap(3);
  rule();

  // ── Weaknesses ────────────────────────────────────────────────────────────
  line("Areas for Improvement", 13, true, [220, 38, 38]);
  gap(2);
  (session.weaknesses || []).forEach((w) => bullet(w, [153, 27, 27]));
  gap(3);
  rule();

  // ── Recommendation ────────────────────────────────────────────────────────
  line("Recommendation", 13, true, [40, 40, 40]);
  gap(2);
  const recLines = doc.splitTextToSize(session.recommendation || "N/A", W - 40);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  doc.text(recLines, 20, y);
  y += recLines.length * 6;
  gap(3);
  rule();

  // ── Question-by-Question ──────────────────────────────────────────────────
  checkNewPage();
  line("Question-by-Question Scores", 13, true, [40, 40, 40]);
  gap(2);

  (session.questions || []).forEach((q, i) => {
    checkNewPage();
    const score = q.evaluation?.score ?? "N/A";
    line(`Q${i + 1}. ${q.question.slice(0, 80)}${q.question.length > 80 ? "…" : ""}`, 10, true);
    line(`Score: ${score}%  |  Feedback: ${(q.evaluation?.feedback || "N/A").slice(0, 90)}`, 9, false, [80, 80, 80]);
    gap(3);
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(`HireSense AI | Page ${p} of ${pageCount}`, W / 2, 290, { align: "center" });
  }

  const filename = `Interview_Report_${session.role.replace(/\s+/g, "_")}_${date.replace(/\s+/g, "")}.pdf`;
  doc.save(filename);
}
