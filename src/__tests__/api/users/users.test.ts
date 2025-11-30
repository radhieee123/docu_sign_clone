import { GET } from '@/app/api/users/route';
import {
  prismaMock,
  testUsers,
  createAuthHeader,
  parseResponse,
} from '@/__tests__/utils/testHelpers';

describe('GET /api/users', () => {
  it('should return all users for authenticated request', async () => {
    const mockUsers = [testUsers.alex, testUsers.blake];
    prismaMock.user.findMany.mockResolvedValue(mockUsers as any);

    const headers = createAuthHeader(testUsers.alex.id, testUsers.alex.email);
    const request = new Request('http://localhost:3000/api/users', {
      method: 'GET',
      headers,
    });

    const response = await GET(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(2);
    expect(prismaMock.user.findMany).toHaveBeenCalled();
  });

  it('should not return passwords in user list', async () => {
    const mockUsers = [
      { ...testUsers.alex, password: 'hashed-password' },
      { ...testUsers.blake, password: 'hashed-password' },
    ];
    prismaMock.user.findMany.mockResolvedValue(mockUsers as any);

    const headers = createAuthHeader(testUsers.alex.id, testUsers.alex.email);
    const request = new Request('http://localhost:3000/api/users', {
      method: 'GET',
      headers,
    });

    const response = await GET(request);
    const { data } = await parseResponse(response);

    expect(data.every((user: any) => !user.password)).toBe(true);
  });

  it('should return 401 for missing authorization', async () => {
    const request = new Request('http://localhost:3000/api/users', {
      method: 'GET',
    });

    const response = await GET(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(401);
    expect(data.error).toBe('UNAUTHORIZED');
  });

  it('should return 401 for invalid token', async () => {
    const headers = new Headers();
    headers.set('Authorization', 'Bearer invalid-token');

    const request = new Request('http://localhost:3000/api/users', {
      method: 'GET',
      headers,
    });

    const response = await GET(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(401);
    expect(data.error).toBe('UNAUTHORIZED');
  });

  it('should return empty array when no users exist', async () => {
    prismaMock.user.findMany.mockResolvedValue([]);

    const headers = createAuthHeader(testUsers.alex.id, testUsers.alex.email);
    const request = new Request('http://localhost:3000/api/users', {
      method: 'GET',
      headers,
    });

    const response = await GET(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(200);
    expect(data).toEqual([]);
  });

  it('should select only id, name, and email fields', async () => {
    const mockUsers = [testUsers.alex, testUsers.blake];
    prismaMock.user.findMany.mockResolvedValue(mockUsers as any);

    const headers = createAuthHeader(testUsers.alex.id, testUsers.alex.email);
    const request = new Request('http://localhost:3000/api/users', {
      method: 'GET',
      headers,
    });

    await GET(request);

    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  });

  it('should return 500 for database errors', async () => {
    prismaMock.user.findMany.mockRejectedValue(new Error('Database error'));

    const headers = createAuthHeader(testUsers.alex.id, testUsers.alex.email);
    const request = new Request('http://localhost:3000/api/users', {
      method: 'GET',
      headers,
    });

    const response = await GET(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(500);
    expect(data.error).toBe('SERVER_ERROR');
  });

  it('should handle multiple concurrent requests', async () => {
    const mockUsers = [testUsers.alex, testUsers.blake];
    prismaMock.user.findMany.mockResolvedValue(mockUsers as any);

    const headers = createAuthHeader(testUsers.alex.id, testUsers.alex.email);
    
    const requests = Array(5).fill(null).map(() =>
      new Request('http://localhost:3000/api/users', {
        method: 'GET',
        headers,
      })
    );

    const responses = await Promise.all(requests.map(req => GET(req)));
    const results = await Promise.all(
      responses.map(res => parseResponse(res))
    );

    results.forEach(({ status, data }) => {
      expect(status).toBe(200);
      expect(data).toHaveLength(2);
    });

    expect(prismaMock.user.findMany).toHaveBeenCalledTimes(5);
  });
});
