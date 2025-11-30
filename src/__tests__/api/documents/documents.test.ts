import { GET, POST } from "@/app/api/documents/route";
import {
  prismaMock,
  testUsers,
  testDocuments,
  createAuthHeader,
  parseResponse,
} from "@/__tests__/utils/testHelpers";

describe("GET /api/documents", () => {
  it("should return documents for authenticated user", async () => {
    const mockDocuments = [
      {
        ...testDocuments.pending,
        sender: testUsers.alex,
        recipient: testUsers.blake,
      },
      {
        ...testDocuments.signed,
        sender: testUsers.alex,
        recipient: testUsers.blake,
      },
    ];

    prismaMock.document.findMany.mockResolvedValue(mockDocuments as any);

    const headers = createAuthHeader(testUsers.alex.id, testUsers.alex.email);
    const request = new Request("http://localhost:3000/api/documents", {
      method: "GET",
      headers,
    });

    const response = await GET(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(2);
    expect(prismaMock.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { senderId: testUsers.alex.id },
            { recipientId: testUsers.alex.id },
          ]),
        }),
      })
    );
  });

  it("should return 401 for missing authorization", async () => {
    const request = new Request("http://localhost:3000/api/documents", {
      method: "GET",
    });

    const response = await GET(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(401);
    expect(data.error).toBe("UNAUTHORIZED");
  });

  it("should return 401 for invalid token", async () => {
    const headers = new Headers();
    headers.set("Authorization", "Bearer invalid-token");

    const request = new Request("http://localhost:3000/api/documents", {
      method: "GET",
      headers,
    });

    const response = await GET(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(401);
    expect(data.error).toBe("UNAUTHORIZED");
  });

  it("should return empty array when no documents exist", async () => {
    prismaMock.document.findMany.mockResolvedValue([]);

    const headers = createAuthHeader(testUsers.alex.id, testUsers.alex.email);
    const request = new Request("http://localhost:3000/api/documents", {
      method: "GET",
      headers,
    });

    const response = await GET(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(200);
    expect(data).toEqual([]);
  });

  it("should return 500 for database errors", async () => {
    prismaMock.document.findMany.mockRejectedValue(new Error("Database error"));

    const headers = createAuthHeader(testUsers.alex.id, testUsers.alex.email);
    const request = new Request("http://localhost:3000/api/documents", {
      method: "GET",
      headers,
    });

    const response = await GET(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(500);
    expect(data.error).toBe("SERVER_ERROR");
  });
});

describe("POST /api/documents", () => {
  const validDocument = {
    title: "New Contract",
    recipientId: testUsers.blake.id,
    fileName: "contract.pdf",
    fileType: "application/pdf",
    fileData: "base64encodeddata",
  };

  it("should create document successfully", async () => {
    const createdDocument = {
      ...testDocuments.pending,
      ...validDocument,
      id: "new-doc-id",
      senderId: testUsers.alex.id,
    };

    prismaMock.user.findUnique.mockResolvedValue(testUsers.blake as any);
    prismaMock.document.create.mockResolvedValue(createdDocument as any);

    const headers = createAuthHeader(testUsers.alex.id, testUsers.alex.email);
    headers.set("Content-Type", "application/json");

    const request = new Request("http://localhost:3000/api/documents", {
      method: "POST",
      headers,
      body: JSON.stringify(validDocument),
    });

    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(201);
    expect(data).toHaveProperty("document");
    expect(data).toHaveProperty("message");
    expect(data.document.title).toBe(validDocument.title);
  });

  it("should return 401 for unauthorized request", async () => {
    const request = new Request("http://localhost:3000/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validDocument),
    });

    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(401);
    expect(data.error).toBe("UNAUTHORIZED");
  });

  it("should return 500 for database errors", async () => {
    prismaMock.user.findUnique.mockResolvedValue(testUsers.blake as any);
    prismaMock.document.create.mockRejectedValue(new Error("Database error"));

    const headers = createAuthHeader(testUsers.alex.id, testUsers.alex.email);
    headers.set("Content-Type", "application/json");

    const request = new Request("http://localhost:3000/api/documents", {
      method: "POST",
      headers,
      body: JSON.stringify(validDocument),
    });

    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(500);
    expect(data.error).toBe("SERVER_ERROR");
  });
});
