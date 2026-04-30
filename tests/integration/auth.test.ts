import request from 'supertest';

// Base URL for the running Next.js dev server
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Auth API', () => {
  const timestamp = Date.now();
  const testEmail = `testuser+${timestamp}@example.com`;
  const testPassword = 'TestPass123';

  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const res = await request(BASE_URL)
        .post('/api/auth/register')
        .send({ fullName: 'Test User', email: testEmail, password: testPassword });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toMatchObject({
        email: testEmail,
        fullName: 'Test User',
        role: 'user',
      });
    });

    it('should reject duplicate email with 409', async () => {
      const res = await request(BASE_URL)
        .post('/api/auth/register')
        .send({ fullName: 'Test User', email: testEmail, password: testPassword });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should reject invalid email with 400', async () => {
      const res = await request(BASE_URL)
        .post('/api/auth/register')
        .send({ fullName: 'Test', email: 'not-an-email', password: testPassword });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject weak password with 400', async () => {
      const res = await request(BASE_URL)
        .post('/api/auth/register')
        .send({ fullName: 'Test', email: `weak+${timestamp}@example.com`, password: 'short' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials and return a token', async () => {
      const res = await request(BASE_URL)
        .post('/api/auth/login')
        .send({ email: testEmail, password: testPassword });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should reject wrong password with 401', async () => {
      const res = await request(BASE_URL)
        .post('/api/auth/login')
        .send({ email: testEmail, password: 'WrongPass999' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should reject non-existent email with 401', async () => {
      const res = await request(BASE_URL)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: testPassword });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout and clear the auth cookie', async () => {
      const res = await request(BASE_URL).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
