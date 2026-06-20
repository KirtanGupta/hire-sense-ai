import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function extractPDFText(buffer) {
  let pdfParse;

  try {
    pdfParse = new PDFParse({ data: buffer });
    const data = await pdfParse.getText();
    return data?.text || "";
  } catch (error) {
    console.error("PDF extraction error:", error.message);
    return "";
  } finally {
    await pdfParse?.destroy?.();
  }
}

export async function extractDOCXText(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || "";
}

export function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}
