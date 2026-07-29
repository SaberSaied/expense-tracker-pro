import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { RequestHandler } from "express";
import { ValidationError } from "@/common/errors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateId(): string {
  return crypto.randomUUID();
}

// Uploads directory: server/uploads/
export const UPLOADS_DIR = path.resolve(__dirname, "../../../uploads");
export const AVATARS_DIR = path.join(UPLOADS_DIR, "avatars");
export const RECEIPTS_DIR = path.join(UPLOADS_DIR, "receipts");

// Ensure the upload directories exist at module load
fs.mkdirSync(AVATARS_DIR, { recursive: true });
fs.mkdirSync(RECEIPTS_DIR, { recursive: true });

// ─── Allowed MIME types ───────────────────────────────────────

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// ─── Storage Configuration ────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, AVATARS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${generateId()}${ext}`;
    cb(null, uniqueName);
  },
});

// ─── File Filter ──────────────────────────────────────────────

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype as typeof ALLOWED_MIME_TYPES[number])) {
    cb(null, true);
  } else {
    cb(new ValidationError("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."));
  }
}

// ─── Exported Upload Middleware ────────────────────────────────

export const uploadAvatarMiddleware: RequestHandler = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
}).single("avatar") as unknown as RequestHandler;

/**
 * Returns the public URL path for an avatar filename.
 */
export function getAvatarUrl(filename: string): string {
  return `/uploads/avatars/${filename}`;
}

/**
 * Deletes an avatar file from disk by its filename.
 */
export async function deleteAvatarFile(filename: string): Promise<void> {
  const filePath = path.join(AVATARS_DIR, filename);
  try {
    await fsp.unlink(filePath);
  } catch {
    // File may not exist — ignore
  }
}

// ─── Receipt Upload ───────────────────────────────────────────

const receiptStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, RECEIPTS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${generateId()}${ext}`;
    cb(null, uniqueName);
  },
});

/** Multer middleware for uploading a single receipt image. Reuses the same file filter as avatars. */
export const uploadReceiptMiddleware: RequestHandler = multer({
  storage: receiptStorage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
}).single("receipt") as unknown as RequestHandler;

/**
 * Returns the public URL path for a receipt filename.
 */
export function getReceiptUrl(filename: string): string {
  return `/uploads/receipts/${filename}`;
}

/**
 * Deletes a receipt file from disk by its URL path.
 * Accepts the full receiptUrl or just the filename.
 */
export async function deleteReceiptFile(receiptUrl: string): Promise<void> {
  const filename = receiptUrl.split("/").pop();
  if (!filename) return;
  const filePath = path.join(RECEIPTS_DIR, filename);
  try {
    await fsp.unlink(filePath);
  } catch {
    // File may not exist — ignore
  }
}
