/**
 * resumeParser.js — Robust PDF & DOCX text extraction
 *
 * PDF Strategy (in order of attempt):
 *   1. pdf-parse PDFParse class with standard options
 *   2. pdf-parse PDFParse with relaxed/tolerant options
 *   3. Raw text heuristic extraction (for malformed PDFs)
 *
 * DOCX Strategy:
 *   1. mammoth.extractRawText (standard)
 *   2. mammoth.convertToHtml then strip tags (fallback)
 */

import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

// ─── PDF Extraction ───────────────────────────────────────────────────────────

/**
 * Extracts text from a PDF buffer.
 * Tries multiple strategies to handle edge cases (corrupted, compressed, complex PDFs).
 *
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} extracted text, or "" on failure
 */
export async function extractPDFText(buffer) {
  // Strategy 1: Standard PDFParse with normal options
  const strategy1 = await _tryPDFParse(buffer, {
    verbosity: 0,
  });
  if (strategy1 && strategy1.trim().length > 20) {
    return strategy1;
  }

  // Strategy 2: PDFParse with disableRange (helps with some server environments)
  const strategy2 = await _tryPDFParse(buffer, {
    verbosity: 0,
    disableRange: true,
    disableStream: true,
    disableAutoFetch: true,
  });
  if (strategy2 && strategy2.trim().length > 20) {
    return strategy2;
  }

  // Strategy 3: Raw byte heuristic — extract printable ASCII from the PDF binary
  // This catches text from PDFs where font encoding prevents normal extraction
  const strategy3 = _extractTextHeuristic(buffer);
  if (strategy3 && strategy3.trim().length > 20) {
    console.warn("[resumeParser] Used heuristic extraction for PDF");
    return strategy3;
  }

  console.error("[resumeParser] All PDF extraction strategies failed");
  return "";
}

/**
 * Try extracting text using PDFParse with given options.
 */
async function _tryPDFParse(buffer, options = {}) {
  let parser;
  try {
    // Ensure we pass a proper Buffer (not Uint8Array) — PDFParse handles the conversion
    const normalizedBuffer =
      Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

    parser = new PDFParse({
      data: normalizedBuffer,
      ...options,
    });

    const result = await parser.getText();

    // getText() returns { pages: [...], text: string, total: number }
    const text = result?.text ?? "";
    return text;
  } catch (err) {
    // Log only at debug level — caller decides whether to escalate
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[resumeParser] PDFParse attempt failed (${JSON.stringify(options)}):`,
        err?.message
      );
    }
    return "";
  } finally {
    try {
      await parser?.destroy?.();
    } catch {
      /* ignore destroy errors */
    }
  }
}

/**
 * Heuristic: extract printable ASCII runs from raw PDF bytes.
 * Useful for PDFs where text is embedded without proper font ToUnicode maps.
 */
function _extractTextHeuristic(buffer) {
  try {
    const str = buffer.toString("latin1");

    // Extract runs of printable characters (ASCII 32-126 + common chars)
    const matches = str.match(/[\x20-\x7E\n\r\t]{4,}/g) || [];

    // Filter out PDF syntax keywords and keep human-readable text
    const pdfKeywords = new Set([
      "obj", "endobj", "stream", "endstream", "xref", "trailer",
      "startxref", "true", "false", "null", "Type", "Font", "Page",
      "Resources", "MediaBox", "Contents", "BT", "ET", "Tf", "Td",
      "PDF", "Adobe", "Creator", "Producer",
    ]);

    const cleaned = matches
      .filter((m) => {
        const trimmed = m.trim();
        if (trimmed.length < 4) return false;
        if (pdfKeywords.has(trimmed)) return false;
        // Keep if it has multiple word-like tokens
        const words = trimmed.split(/\s+/).filter((w) => /[a-zA-Z]{2,}/.test(w));
        return words.length >= 1;
      })
      .join(" ");

    return cleaned;
  } catch {
    return "";
  }
}

// ─── DOCX Extraction ──────────────────────────────────────────────────────────

/**
 * Extracts text from a DOCX buffer using mammoth.
 *
 * @param {Buffer} buffer - DOCX file buffer
 * @returns {Promise<string>} extracted text, or "" on failure
 */
export async function extractDOCXText(buffer) {
  // Strategy 1: Direct raw text extraction
  try {
    const normalizedBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    const result = await mammoth.extractRawText({ buffer: normalizedBuffer });

    if (result.value && result.value.trim().length > 10) {
      if (result.messages?.length > 0 && process.env.NODE_ENV !== "production") {
        console.warn("[resumeParser] mammoth warnings:", result.messages);
      }
      return result.value;
    }
  } catch (err) {
    console.warn("[resumeParser] mammoth extractRawText failed:", err?.message);
  }

  // Strategy 2: Convert to HTML then strip tags
  try {
    const normalizedBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    const result = await mammoth.convertToHtml({ buffer: normalizedBuffer });

    if (result.value) {
      const text = result.value
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<\/li>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/&#\d+;/g, " ");
      return text;
    }
  } catch (err) {
    console.error("[resumeParser] mammoth convertToHtml fallback failed:", err?.message);
  }

  return "";
}

// ─── Text Normalization ───────────────────────────────────────────────────────

/**
 * Cleans and normalizes extracted resume text for LLM processing.
 * Preserves enough structure (newlines) so the AI can understand sections.
 *
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text) {
  if (!text) return "";

  return text
    // Normalize line endings
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Remove null bytes and replacement characters
    .replace(/\x00/g, "")
    .replace(/\uFFFD/g, "")
    // Remove other non-printable control characters (keep \n and \t)
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Collapse horizontal whitespace (spaces/tabs) but preserve newlines
    .replace(/[^\S\n]+/g, " ")
    // Collapse 3+ consecutive newlines to max 2
    .replace(/\n{3,}/g, "\n\n")
    // Trim each line
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    // Final trim
    .trim();
}

// ─── File Type Validation ─────────────────────────────────────────────────────

/**
 * Validates a file buffer is actually a PDF (checks magic bytes).
 * Prevents false positives from renamed files.
 *
 * @param {Buffer} buffer
 * @returns {boolean}
 */
export function isPDFBuffer(buffer) {
  if (!buffer || buffer.length < 5) return false;
  // PDF magic bytes: %PDF-
  return (
    buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46 && // F
    buffer[4] === 0x2D    // -
  );
}

/**
 * Validates a file buffer is actually a DOCX (ZIP-based, starts with PK).
 *
 * @param {Buffer} buffer
 * @returns {boolean}
 */
export function isDOCXBuffer(buffer) {
  if (!buffer || buffer.length < 4) return false;
  // ZIP magic bytes: PK\x03\x04
  return buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
}
