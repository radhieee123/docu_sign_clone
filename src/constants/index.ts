export const USERS = {
  ALEX: {
    EMAIL: "alex@acme.com",
    NAME: "Alex",
    INITIALS: "A",
  },
  BLAKE: {
    EMAIL: "blake@acme.com",
    NAME: "Blake",
    INITIALS: "B",
  },
} as const;

export const USER_EMAILS = [USERS.ALEX.EMAIL, USERS.BLAKE.EMAIL] as const;

export const DOCUMENT_STATUS = {
  PENDING: "PENDING",
  SIGNED: "SIGNED",
  DECLINED: "DECLINED",
  EXPIRED: "EXPIRED",
} as const;

export const DOCUMENT_DEFAULTS = {
  SUBJECT: "Complete with Docusign",
  MESSAGE: "",
  REMINDER_FREQUENCY: "Every day",
} as const;

export const FILE_TYPES = {
  PDF: "application/pdf",
  DOC: "application/msword",
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  TXT: "text/plain",
} as const;

export const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.txt";

export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  MAX_FILE_NAME_LENGTH: 255,
} as const;

export const TEMPLATES = {
  CONTRACT: {
    PATH: "/sample-pdfs/sample-contract.pdf",
    TITLE: "Employment Contract",
    FILENAME: "sample-contract.pdf",
  },
  INVOICE: {
    PATH: "/sample-pdfs/sample-invoice.pdf",
    TITLE: "Sample Invoice",
    FILENAME: "sample-invoice.pdf",
  },
} as const;

export const FIELD_TYPES = {
  SIGNATURE: "signature",
  INITIAL: "initial",
  DATE_SIGNED: "date_signed",
  NAME: "name",
  EMAIL: "email",
  COMPANY: "company",
  TITLE: "title",
  TEXT: "text",
  CHECKBOX: "checkbox",
} as const;

export const FIELD_LABELS = {
  [FIELD_TYPES.SIGNATURE]: "Signature",
  [FIELD_TYPES.INITIAL]: "Initial",
  [FIELD_TYPES.DATE_SIGNED]: "Date Signed",
  [FIELD_TYPES.NAME]: "Name",
  [FIELD_TYPES.EMAIL]: "Email Address",
  [FIELD_TYPES.COMPANY]: "Company",
  [FIELD_TYPES.TITLE]: "Title",
  [FIELD_TYPES.TEXT]: "Text",
  [FIELD_TYPES.CHECKBOX]: "Checkbox",
} as const;

export const RECIPIENT_ROLES = {
  NEEDS_TO_SIGN: "Needs to Sign",
  RECEIVES_COPY: "Receives a Copy",
  IN_PERSON_SIGNER: "In Person Signer",
} as const;

export const RECIPIENT_ROLE_OPTIONS = [
  RECIPIENT_ROLES.NEEDS_TO_SIGN,
  RECIPIENT_ROLES.RECEIVES_COPY,
  RECIPIENT_ROLES.IN_PERSON_SIGNER,
] as const;

export const REMINDER_FREQUENCIES = [
  "Every day",
  "Every 2 days",
  "Every 3 days",
  "Every week",
  "Never",
] as const;

export const COLORS = {
  PRIMARY: "#4c00fb",
  PRIMARY_HOVER: "#4c00fb",
  SECONDARY: "#1a1464",
  SECONDARY_HOVER: "#14104d",
  BORDER: "#e5e7eb",
  BACKGROUND: "#f9fafb",
  SUCCESS: "#10b981",
  ERROR: "#ef4444",
  WARNING: "#f59e0b",
} as const;

export const Z_INDEX = {
  MODAL: 9999,
  SIGNATURE: 10,
  DROPDOWN: 50,
  TOOLTIP: 100,
} as const;

export const SIGNATURE_STYLES = {
  FONT_FAMILY: "'Brush Script MT', cursive",
  FONT_SIZE: "24px",
  COLOR: "#111827",
} as const;

export const SIGNATURE_POSITION = {
  DEFAULT_X: 200,
  DEFAULT_Y: 300,
  MIN_X: 0,
  MIN_Y: 0,
  SIGNATURE_WIDTH: 200,
  SIGNATURE_HEIGHT: 50,
} as const;

export const PDF_CONFIG = {
  WORKER_SRC:
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
  DEFAULT_SCALE: 1.5,
  THUMBNAIL_WIDTH: 128,
  THUMBNAIL_HEIGHT: 176,
} as const;

export const API_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  DOCUMENTS: "/api/documents",
  DOCUMENT_BY_ID: (id: string) => `/api/documents/${id}`,
  SIGN_DOCUMENT: (id: string) => `/api/documents/${id}/sign`,
  USERS: "/api/users",
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: "token",
  TEMPLATE_PDF: "templatePDF",
  USER_PREFERENCES: "userPreferences",
} as const;

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 6,
  MAX_SUBJECT_LENGTH: 100,
  MAX_MESSAGE_LENGTH: 10000,
  MIN_RECIPIENTS: 1,
  MAX_RECIPIENTS: 50,
} as const;

export const MESSAGES = {
  SUCCESS: {
    DOCUMENT_CREATED: "Document created successfully!",
    DOCUMENT_SIGNED: "Document signed successfully!",
    DOCUMENT_DELETED: "Document deleted successfully!",
    LOGIN_SUCCESS: "Login successful!",
  },
  ERROR: {
    DOCUMENT_CREATE_FAILED: "Failed to create document. Please try again.",
    DOCUMENT_SIGN_FAILED: "Failed to sign document. Please try again.",
    DOCUMENT_NOT_FOUND: "Document not found",
    LOGIN_FAILED: "Login failed",
    INVALID_CREDENTIALS: "Invalid credentials",
    UNAUTHORIZED: "You are not authorized to perform this action",
    FILE_TOO_LARGE: "File size exceeds maximum limit",
    INVALID_FILE_TYPE: "Invalid file type",
    NO_RECIPIENT: "Please fill in recipient name and email",
    ALREADY_SIGNED: "Document is already signed",
  },
  INFO: {
    LOADING_DOCUMENT: "Loading document...",
    PROCESSING: "Processing...",
    SIGNING: "Signing...",
    UPLOADING: "Uploading...",
  },
  WARNINGS: {
    UNSAVED_CHANGES:
      "You have unsaved changes. Are you sure you want to leave?",
    DELETE_DOCUMENT: "Are you sure you want to delete this document?",
  },
} as const;

export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  DISPLAY_WITH_TIME: "MMM dd, yyyy h:mm a",
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  SHORT: "MM/dd/yyyy",
} as const;

export const DASHBOARD_FILTERS = {
  ALL: "all",
  PENDING: "pending",
  COMPLETED: "completed",
  SENT: "sent",
  RECEIVED: "received",
} as const;

export const CHART_COLORS = {
  PENDING: "#fbbf24",
  SIGNED: "#10b981",
  DECLINED: "#ef4444",
  EXPIRED: "#6b7280",
} as const;

export const getOtherUser = (currentUserEmail: string) => {
  if (currentUserEmail === USERS.ALEX.EMAIL) return USERS.BLAKE;
  if (currentUserEmail === USERS.BLAKE.EMAIL) return USERS.ALEX;
  return null;
};

export const getUserByEmail = (email: string) => {
  if (email === USERS.ALEX.EMAIL) return USERS.ALEX;
  if (email === USERS.BLAKE.EMAIL) return USERS.BLAKE;
  return null;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export type DocumentStatus =
  (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];
export type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES];
export type RecipientRole =
  (typeof RECIPIENT_ROLES)[keyof typeof RECIPIENT_ROLES];
export type ReminderFrequency = (typeof REMINDER_FREQUENCIES)[number];
export type DashboardFilter =
  (typeof DASHBOARD_FILTERS)[keyof typeof DASHBOARD_FILTERS];
