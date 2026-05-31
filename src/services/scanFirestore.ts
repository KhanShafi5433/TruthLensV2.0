import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  QuerySnapshot,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { AnalysisReport, RiskLevel, SuspiciousPhrase } from "./analysisTypes";
import type { MediaFileType } from "../types";

/** Must match the collection used in saveScan — both use this constant. */
export const SCANS_COLLECTION = "scans";

/** Required Firestore document fields per product spec. */
export interface ScanDocumentCore {
  userEmail: string;
  inputText: string;
  score: number;
  riskLevel: string;
  reasoning: string;
  createdAt: ReturnType<typeof serverTimestamp>;
}

/** Extra fields so tapping history can reopen the full Result screen. */
export interface ScanDocumentExtensions {
  advice: string;
  indicators: SuspiciousPhrase[];
  inputType: MediaFileType;
  title: string;
  subtitle: string;
  fileName?: string;
  confidence?: number;
  language?: string;
  detectedUrls?: string[];
  explanations?: string[];
  recommendations?: string[];
}

export type ScanRecord = ScanDocumentCore & ScanDocumentExtensions;

export interface ScanListItem {
  id: string;
  previewText: string;
  riskScore: number;
  riskLevel: RiskLevel;
  timestamp: string;
  createdAtMs: number;
}

export interface FetchScansResult {
  items: ScanListItem[];
  reports: Record<string, AnalysisReport>;
}

function logFirestoreError(context: string, error: unknown): void {
  const err = error as { code?: string; message?: string; name?: string };
  console.error(`[Firestore:${SCANS_COLLECTION}] ${context}`, {
    code: err?.code ?? "unknown",
    message: err?.message ?? String(error),
    name: err?.name,
    error,
  });
}

function isMissingIndexError(error: unknown): boolean {
  const err = error as { code?: string; message?: string };
  return (
    err?.code === "failed-precondition" ||
    (typeof err?.message === "string" &&
      err.message.toLowerCase().includes("index"))
  );
}

function formatTimestamp(value: Timestamp | Date | null | undefined): string {
  if (!value) return new Date().toLocaleString();
  const date = value instanceof Timestamp ? value.toDate() : value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function previewText(text: string, max = 90): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

function normalizeRiskLevel(value: string): RiskLevel {
  const raw = value.trim();
  if (raw === "High Risk" || raw === "High") return "High Risk";
  if (raw === "Suspicious") return "Suspicious";
  if (raw === "Moderate" || raw === "Medium") return "Moderate";
  return "Low";
}

function docToListItem(id: string, data: Record<string, unknown>): ScanListItem | null {
  try {
    const createdAt = data.createdAt as Timestamp | undefined;
    const createdAtMs = createdAt?.toMillis?.() ?? 0;
    const inputText = String(data.inputText ?? "");

    return {
      id,
      previewText: previewText(inputText),
      riskScore: Number(data.score ?? 0),
      riskLevel: normalizeRiskLevel(String(data.riskLevel ?? "Low")),
      timestamp: formatTimestamp(createdAt),
      createdAtMs,
    };
  } catch (error) {
    logFirestoreError(`parse list item failed for doc ${id}`, error);
    return null;
  }
}

export function scanToAnalysisReport(id: string, data: Record<string, unknown>): AnalysisReport {
  const createdAt = data.createdAt as Timestamp | undefined;

  return {
    id,
    input: {
      type: (data.inputType as MediaFileType) ?? "text",
      title: String(data.title ?? "Saved analysis"),
      subtitle: String(data.subtitle ?? ""),
      content: String(data.inputText ?? ""),
      fileName: data.fileName ? String(data.fileName) : undefined,
    },
    analysis: {
      score: Number(data.score ?? 0),
      riskLevel: normalizeRiskLevel(String(data.riskLevel ?? "Low")),
      indicators: Array.isArray(data.indicators) ? (data.indicators as SuspiciousPhrase[]) : [],
      reasoning: String(data.reasoning ?? ""),
      advice: String(data.advice ?? ""),
    },
    createdAt: formatTimestamp(createdAt),
  };
}

function snapshotToResult(snapshot: QuerySnapshot): FetchScansResult {
  const items: ScanListItem[] = [];
  const reports: Record<string, AnalysisReport> = {};

  if (snapshot.empty) {
    return { items, reports };
  }

  snapshot.forEach((docSnap) => {
    try {
      const data = docSnap.data() as Record<string, unknown>;
      const listItem = docToListItem(docSnap.id, data);
      if (!listItem) return;
      items.push(listItem);
      reports[docSnap.id] = scanToAnalysisReport(docSnap.id, data);
    } catch (error) {
      logFirestoreError(`skip malformed doc ${docSnap.id}`, error);
    }
  });

  items.sort((a, b) => b.createdAtMs - a.createdAtMs);

  return { items, reports };
}

export async function saveScan(
  userEmail: string,
  report: AnalysisReport,
  confidence?: number,
  language?: string,
  detectedUrls?: string[],
  explanations?: string[],
  recommendations?: string[]
): Promise<string> {
  const payload: Omit<ScanRecord, "createdAt"> & {
    createdAt: ReturnType<typeof serverTimestamp>;
  } = {
    userEmail: userEmail.trim(),
    inputText: report.input.content,
    score: report.analysis.score,
    riskLevel: report.analysis.riskLevel,
    reasoning: report.analysis.reasoning,
    advice: report.analysis.advice,
    indicators: report.analysis.indicators,
    inputType: report.input.type,
    title: report.input.title,
    subtitle: report.input.subtitle,
    fileName: report.input.fileName,
    confidence,
    language,
    detectedUrls,
    explanations,
    recommendations,
    createdAt: serverTimestamp(),
  };

  try {
    const ref = await addDoc(collection(db, SCANS_COLLECTION), payload);
    return ref.id;
  } catch (error) {
    logFirestoreError("saveScan failed", error);
    throw error;
  }
}

export async function fetchScansForUser(userEmail: string): Promise<FetchScansResult> {
  const email = userEmail.trim();

  if (!email) {
    console.warn(`[Firestore:${SCANS_COLLECTION}] fetch skipped — no user email`);
    return { items: [], reports: {} };
  }

  const scansRef = collection(db, SCANS_COLLECTION);

  try {
    const orderedQuery = query(
      scansRef,
      where("userEmail", "==", email),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(orderedQuery);
    return snapshotToResult(snapshot);
  } catch (error) {
    if (isMissingIndexError(error)) {
      console.warn(
        `[Firestore:${SCANS_COLLECTION}] composite index missing — using fallback query`
      );
    } else {
      logFirestoreError("ordered fetch failed", error);
    }

    try {
      const fallbackQuery = query(scansRef, where("userEmail", "==", email));
      const snapshot = await getDocs(fallbackQuery);
      return snapshotToResult(snapshot);
    } catch (fallbackError) {
      logFirestoreError("fallback fetch failed", fallbackError);
      throw fallbackError;
    }
  }
}

export async function fetchScanById(scanId: string): Promise<AnalysisReport | null> {
  try {
    const snap = await getDoc(doc(db, SCANS_COLLECTION, scanId));
    if (!snap.exists()) return null;
    return scanToAnalysisReport(snap.id, snap.data() as Record<string, unknown>);
  } catch (error) {
    logFirestoreError(`fetchScanById failed for ${scanId}`, error);
    throw error;
  }
}

export async function deleteAllScansForUser(userEmail: string): Promise<void> {
  const email = userEmail.trim();
  if (!email) return;

  try {
    const scansQuery = query(collection(db, SCANS_COLLECTION), where("userEmail", "==", email));
    const snapshot = await getDocs(scansQuery);
    if (snapshot.empty) return;

    await Promise.all(
      snapshot.docs.map((docSnap) => deleteDoc(doc(db, SCANS_COLLECTION, docSnap.id)))
    );
  } catch (error) {
    logFirestoreError("deleteAllScansForUser failed", error);
    throw error;
  }
}
