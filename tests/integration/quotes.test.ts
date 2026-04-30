import request from 'supertest';

const BASE_URL = 'http://localhost:3001/api';

describe('Quote API Endpoints', () => {
  let userToken: string;
  let userId: string;
  let quoteId: string;

  // Setup: Register and login a test user
  beforeAll(async () => {
    const registerRes = await request(BASE_URL)
      .post('/auth/register')
      .send({
        fullName: 'Test Quote User',
        email: `quote-test-${Date.now()}@example.com`,
        password: 'QuoteTest123!',
      });

    expect(registerRes.status).toBe(201);
    userToken = registerRes.body.token;
    userId = registerRes.body.user.id;
  });

  describe('POST /quotes', () => {
    it('should create a new quote with valid input', async () => {
      const res = await request(BASE_URL)
        .post('/quotes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          fullName: 'Test User',
          address: '123 Test St, Austin, TX',
          monthlyConsumptionKwh: 800,
          systemSizeKw: 7,
          downPayment: 5000,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('quote');
      expect(res.body).toHaveProperty('offers');
      expect(res.body.quote).toMatchObject({
        fullName: 'Test User',
        address: '123 Test St, Austin, TX',
        monthlyConsumptionKwh: 800,
        systemSizeKw: 7,
        downPayment: 5000,
      });
      expect(res.body.quote.systemPrice).toBe(8400); // 7 * 1200
      expect(res.body.quote.principalAmount).toBe(3400); // 8400 - 5000
      expect(res.body.quote.riskBand).toBe('A'); // Band A: consumption >= 400 and system <= 6
      expect(res.body.offers).toHaveLength(3);
      expect(res.body.offers[0].termYears).toBe(5);
      expect(res.body.offers[1].termYears).toBe(10);
      expect(res.body.offers[2].termYears).toBe(15);

      quoteId = res.body.quote.id;
    });

    it('should return Band C for low consumption', async () => {
      const res = await request(BASE_URL)
        .post('/quotes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          fullName: 'Test User',
          address: '456 Low Power St, Austin, TX',
          monthlyConsumptionKwh: 200,
          systemSizeKw: 3,
          downPayment: 2000,
        });

      expect(res.status).toBe(201);
      expect(res.body.quote.riskBand).toBe('C');
      expect(res.body.quote.systemPrice).toBe(3600); // 3 * 1200
    });

    it('should return Band B for medium consumption', async () => {
      const res = await request(BASE_URL)
        .post('/quotes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          fullName: 'Test User',
          address: '789 Medium Power St, Austin, TX',
          monthlyConsumptionKwh: 500,
          systemSizeKw: 5,
          downPayment: 3000,
        });

      expect(res.status).toBe(201);
      expect(res.body.quote.riskBand).toBe('B');
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(BASE_URL)
        .post('/quotes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          fullName: '',
          address: '123 Test St',
          monthlyConsumptionKwh: -100, // Invalid: negative
          systemSizeKw: 5,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(BASE_URL)
        .post('/quotes')
        .send({
          fullName: 'Test User',
          address: '123 Test St',
          monthlyConsumptionKwh: 800,
          systemSizeKw: 7,
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /quotes/:id', () => {
    it('should fetch a quote by ID', async () => {
      const res = await request(BASE_URL)
        .get(`/quotes/${quoteId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('quote');
      expect(res.body).toHaveProperty('offers');
      expect(res.body.quote.id).toBe(quoteId);
      expect(res.body.offers.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent quote', async () => {
      const res = await request(BASE_URL)
        .get('/quotes/nonexistent-id')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(BASE_URL).get(`/quotes/${quoteId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /quotes (user quotes)', () => {
    it('should list user quotes', async () => {
      const res = await request(BASE_URL)
        .get('/quotes')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('quotes');
      expect(Array.isArray(res.body.quotes)).toBe(true);
      expect(res.body.quotes.length).toBeGreaterThan(0);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(BASE_URL).get('/quotes');

      expect(res.status).toBe(401);
    });
  });

  describe('Risk Band Calculation', () => {
    it('should calculate Band A correctly', async () => {
      const res = await request(BASE_URL)
        .post('/quotes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          fullName: 'Band A Test',
          address: '123 A St',
          monthlyConsumptionKwh: 500, // >= 400
          systemSizeKw: 4, // <= 6
          downPayment: 0,
        });

      expect(res.status).toBe(201);
      expect(res.body.quote.riskBand).toBe('A');
      expect(res.body.offers[0].apr).toBe(6.9); // Band A APR
    });

    it('should calculate Band B correctly', async () => {
      const res = await request(BASE_URL)
        .post('/quotes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          fullName: 'Band B Test',
          address: '456 B St',
          monthlyConsumptionKwh: 350, // < 400, >= 250
          systemSizeKw: 5,
          downPayment: 0,
        });

      expect(res.status).toBe(201);
      expect(res.body.quote.riskBand).toBe('B');
      expect(res.body.offers[0].apr).toBe(8.9); // Band B APR
    });

    it('should calculate Band C correctly', async () => {
      const res = await request(BASE_URL)
        .post('/quotes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          fullName: 'Band C Test',
          address: '789 C St',
          monthlyConsumptionKwh: 200, // < 250
          systemSizeKw: 3,
          downPayment: 0,
        });

      expect(res.status).toBe(201);
      expect(res.body.quote.riskBand).toBe('C');
      expect(res.body.offers[0].apr).toBe(11.9); // Band C APR
    });
  });
});
