import { DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

jest.mock("../db");

import { prisma } from "../db";

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

export const testUsers = {
  alex: {
    id: "test-user-1",
    email: "alex@acme.com",
    name: "Alex Johnson",
    password: "$2a$10$hashedpassword",
  },
  blake: {
    id: "test-user-2",
    email: "blake@acme.com",
    name: "Blake Smith",
    password: "$2a$10$hashedpassword",
  },
};

export const testDocuments = {
  pending: {
    id: "test-doc-1",
    title: "Test Contract",
    status: "PENDING",
    senderId: testUsers.alex.id,
    recipientId: testUsers.blake.id,
    requestedAt: new Date("2024-01-01"),
    signedAt: null,
    fileName: "test.pdf",
    fileType: "application/pdf",
    fileData: Buffer.from("test file data"),
  },
  signed: {
    id: "test-doc-2",
    title: "Signed Contract",
    status: "SIGNED",
    senderId: testUsers.alex.id,
    recipientId: testUsers.blake.id,
    requestedAt: new Date("2024-01-01"),
    signedAt: new Date("2024-01-02"),
    fileName: "signed.pdf",
    fileType: "application/pdf",
    fileData: Buffer.from("signed file data"),
  },
};

export function createAuthToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET || "test-secret", {
    expiresIn: "24h",
  });
}

export function createAuthHeader(userId: string, email: string): Headers {
  const token = createAuthToken(userId, email);
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  return headers;
}

export function createMockRequest(
  method: string,
  url: string,
  options: {
    headers?: Headers;
    body?: any;
  } = {}
): Request {
  const { headers = new Headers(), body } = options;

  return new Request(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function parseResponse<T = any>(
  response: Response
): Promise<{
  status: number;
  data: T;
}> {
  const data = await response.json();
  return {
    status: response.status,
    data,
  };
}

export function createMockFile(
  filename: string = "test.pdf",
  type: string = "application/pdf",
  content: string = "test file content"
): File {
  const blob = new Blob([content], { type });
  return new File([blob], filename, { type });
}

export function createMockFormData(file: File): FormData {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
}

export type MockPrisma = DeepMockProxy<PrismaClient>;
