import { POST } from "@/app/api/documents/[id]/sign/route";
import {
  prismaMock,
  testUsers,
  testDocuments,
  createAuthHeader,
  parseResponse,
} from "@/__tests__/utils/testHelpers";

describe("POST /api/documents/[id]/sign", () => {
  const signRequest = {
    signatureData: "base64-signature-data",
  };

  it("should sign document successfully", async () => {
    prismaMock.document.findUnique.mockResolvedValue({
      ...testDocuments.pending,
      sender: testUsers.alex,
      recipient: testUsers.blake,
    } as any);

    const signedDocument = {
      ...testDocuments.pending,
      status: "SIGNED",
      signedAt: new Date(),
      sender: testUsers.alex,
      recipient: testUsers.blake,
    };
    prismaMock.document.update.mockResolvedValue(signedDocument as any);

    const headers = createAuthHeader(testUsers.blake.id, testUsers.blake.email);
    headers.set("Content-Type", "application/json");

    const request = new Request(
      `http://localhost:3000/api/documents/${testDocuments.pending.id}/sign`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(signRequest),
      }
    );

    const response = await POST(request, {
      params: { id: testDocuments.pending.id },
    });
    const { status, data } = await parseResponse(response);

    expect(status).toBe(200);
    expect(data).toHaveProperty("document");
    expect(data).toHaveProperty("message");
    expect(data.message).toContain("signed successfully");
  });

  it("should return 401 for unauthorized user", async () => {
    const request = new Request(
      `http://localhost:3000/api/documents/${testDocuments.pending.id}/sign`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signRequest),
      }
    );

    const response = await POST(request, {
      params: { id: testDocuments.pending.id },
    });
    const { status, data } = await parseResponse(response);

    expect(status).toBe(401);
    expect(data.error).toBe("UNAUTHORIZED");
  });

  it("should return 404 for non-existent document", async () => {
    prismaMock.document.findUnique.mockResolvedValue(null);

    const headers = createAuthHeader(testUsers.blake.id, testUsers.blake.email);
    headers.set("Content-Type", "application/json");

    const request = new Request(
      "http://localhost:3000/api/documents/non-existent-id/sign",
      {
        method: "POST",
        headers,
        body: JSON.stringify(signRequest),
      }
    );

    const response = await POST(request, { params: { id: "non-existent-id" } });
    const { status, data } = await parseResponse(response);

    expect(status).toBe(404);
    expect(data.error).toBe("NOT_FOUND");
  });

  it("should return 403 when wrong user tries to sign", async () => {
    prismaMock.document.findUnique.mockResolvedValue({
      ...testDocuments.pending,
      sender: testUsers.alex,
      recipient: testUsers.blake,
    } as any);

    const headers = createAuthHeader(testUsers.alex.id, testUsers.alex.email);
    headers.set("Content-Type", "application/json");

    const request = new Request(
      `http://localhost:3000/api/documents/${testDocuments.pending.id}/sign`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(signRequest),
      }
    );

    const response = await POST(request, {
      params: { id: testDocuments.pending.id },
    });
    const { status, data } = await parseResponse(response);

    expect(status).toBe(403);
    expect(data.error).toBe("FORBIDDEN");
  });

  it("should update document status to SIGNED", async () => {
    prismaMock.document.findUnique.mockResolvedValue({
      ...testDocuments.pending,
      sender: testUsers.alex,
      recipient: testUsers.blake,
    } as any);

    const updatedDocument = {
      ...testDocuments.pending,
      status: "SIGNED",
      signedAt: new Date(),
      sender: testUsers.alex,
      recipient: testUsers.blake,
    };
    prismaMock.document.update.mockResolvedValue(updatedDocument as any);

    const headers = createAuthHeader(testUsers.blake.id, testUsers.blake.email);
    headers.set("Content-Type", "application/json");

    const request = new Request(
      `http://localhost:3000/api/documents/${testDocuments.pending.id}/sign`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(signRequest),
      }
    );

    await POST(request, { params: { id: testDocuments.pending.id } });

    expect(prismaMock.document.update).toHaveBeenCalledWith({
      where: { id: testDocuments.pending.id },
      data: {
        status: "SIGNED",
        signedAt: expect.any(Date),
      },
      include: expect.any(Object),
    });
  });

  it("should return 500 for database errors", async () => {
    prismaMock.document.findUnique.mockRejectedValue(
      new Error("Database error")
    );

    const headers = createAuthHeader(testUsers.blake.id, testUsers.blake.email);
    headers.set("Content-Type", "application/json");

    const request = new Request(
      `http://localhost:3000/api/documents/${testDocuments.pending.id}/sign`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(signRequest),
      }
    );

    const response = await POST(request, {
      params: { id: testDocuments.pending.id },
    });
    const { status, data } = await parseResponse(response);

    expect(status).toBe(500);
    expect(data.error).toBe("SERVER_ERROR");
  });
});
