import { POST } from "@/app/api/auth/login/route";
import {
  prismaMock,
  testUsers,
  parseResponse,
} from "@/__tests__/utils/testHelpers";

describe("POST /api/auth/login", () => {
  const validCredentials = {
    email: "alex@acme.com",
    password: "password123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should login successfully with valid credentials", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...testUsers.alex,
      mockPassword: "password123",
    } as any);

    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validCredentials),
    });

    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(200);
    expect(data).toHaveProperty("token");
    expect(data).toHaveProperty("user");
    expect(data.user.email).toBe("alex@acme.com");
    expect(data.user).not.toHaveProperty("password");
  });

  it("should return 401 for non-existent user", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nonexistent@acme.com",
        password: "password123",
      }),
    });

    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(401);
    expect(data.error).toBe("UNAUTHORIZED");
  });

  it("should return 401 for incorrect password", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...testUsers.alex,
      mockPassword: "differentpassword",
    } as any);

    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validCredentials),
    });

    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(401);
    expect(data.error).toBe("UNAUTHORIZED");
  });

  it("should return 500 for database errors", async () => {
    prismaMock.user.findUnique.mockRejectedValue(new Error("Database error"));

    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validCredentials),
    });

    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(500);
    expect(data.error).toBe("SERVER_ERROR");
  });

  it("should not return password in response", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...testUsers.alex,
      mockPassword: "password123",
    } as any);

    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validCredentials),
    });

    const response = await POST(request);
    const { data } = await parseResponse(response);

    expect(data.user).not.toHaveProperty("password");
  });

  it("should generate valid JWT token", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...testUsers.alex,
      mockPassword: "password123",
    } as any);

    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validCredentials),
    });

    const response = await POST(request);
    const { data } = await parseResponse(response);

    expect(data.token).toBeDefined();
    expect(typeof data.token).toBe("string");
    expect(data.token.split(".")).toHaveLength(3);
  });
});
