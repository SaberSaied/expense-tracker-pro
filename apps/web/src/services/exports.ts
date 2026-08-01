/**
 * Exports API service.
 * Downloads financial data files (CSV/PDF/XLSX) using the authenticated session.
 */
import { API_BASE_URL, tokenStorage } from "./api";

export type ExportFormat = "csv" | "pdf" | "xlsx";

interface ApiResponseError {
  message?: string;
}

/** Parse the server-provided filename from a Content-Disposition header. */
function parseFilename(disposition: string | null, fallback: string): string {
  if (!disposition) return fallback;
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  return match?.[1] ?? fallback;
}

/** Trigger a browser download for a blob. */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const exportsApi = {
  /**
   * GET /exports/reports — download a report as CSV, PDF or XLSX.
   * Resolves once the file has been handed to the browser.
   */
  async downloadReport(options: {
    format: ExportFormat;
    startDate: string;
    endDate: string;
  }): Promise<string> {
    const params = new URLSearchParams({
      type: "summary",
      format: options.format,
      startDate: options.startDate,
      endDate: options.endDate,
    });

    const token = tokenStorage.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/exports/reports?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      let message = "Export failed";
      try {
        const data = (await response.json()) as ApiResponseError;
        if (data.message) message = data.message;
      } catch {
        // Non-JSON error body — keep the generic message
      }
      throw new Error(message);
    }

    const blob = await response.blob();
    const disposition = response.headers.get("Content-Disposition");
    const filename = parseFilename(disposition, `summary-report.${options.format}`);
    triggerDownload(blob, filename);
    return filename;
  },
};
