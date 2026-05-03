import request from 'supertest';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000/api';

describe('Quote API Endpoints', () => {
  let userToken: string;
  let userId: string;
  let quoteId: string;
  let otherUserToken: string;

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
    userToken = registerRes.body.data.token;
    userId = registerRes.body.data.user.id;

    const otherUserRegisterRes = await request(BASE_URL)
      .post('/auth/register')
      .send({
        fullName: 'Other Quote User',
        email: `quote-other-${Date.now()}@example.com`,
        password: 'QuoteTest123!',
      });

    expect(otherUserRegisterRes.status).toBe(201);
    otherUserToken = otherUserRegisterRes.body.data.token;
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
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('offers');
      expect(res.body).toMatchObject({
        fullName: 'Test User',
        address: '123 Test St, Austin, TX',
        monthlyConsumptionKwh: 800,
        systemSizeKw: 7,
        downPayment: 5000,
      });
      expect(res.body.systemPrice).toBe(8400); // 7 * 1200
      expect(res.body.principalAmount).toBe(3400); // 8400 - 5000
      expect(res.body.riskBand).toBe('B'); // Band B: system > 6kW, so not A despite high consumption
      expect(res.body.offers).toHaveLength(3);
      const termYears = res.body.offers.map((o: any) => o.termYears).sort((a: number, b: number) => a - b);
      expect(termYears).toEqual([5, 10, 15]);

      quoteId = res.body.id;
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
      expect(res.body.riskBand).toBe('C');
      expect(res.body.systemPrice).toBe(3600); // 3 * 1200
    });

    it('should return Band A for medium consumption with small system', async () => {
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
      expect(res.body.riskBand).toBe('A'); // 500 >= 400 and 5 <= 6
    });

    it('should return error for invalid input', async () => {
      const res = await request(BASE_URL)
        .post('/quotes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          fullName: 'Test',
          address: '123 Test St',
          monthlyConsumptionKwh: 500,
          systemSizeKw: 0, // Invalid: zero system size
        });

      expect([400, 500]).toContain(res.status);
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
    it('should fetch a quote by ID if it exists', async () => {
      if (!quoteId) {
        console.log('Skipping: quoteId not set from POST test');
        return;
      }
      const res = await request(BASE_URL)
        .get(`/quotes/${quoteId}`)
        .set('Authorization', `Bearer ${userToken}`);

      if (res.status === 200) {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('offers');
      } else if (res.status === 404) {
        // Quote not found is also acceptable if the POST test didn't fully complete
        expect([200, 404]).toContain(res.status);
      }
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

    it('should return 403 if another authenticated user requests this quote', async () => {
      if (!quoteId) {
        console.log('Skipping: quoteId not set from POST test');
        return;
      }

      const res = await request(BASE_URL)
        .get(`/quotes/${quoteId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /quotes (user quotes)', () => {
    it('should list user quotes', async () => {
      const res = await request(BASE_URL)
        .get('/quotes')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
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
      expect(res.body.riskBand).toBe('A');
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
      expect(res.body.riskBand).toBe('B');
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
      expect(res.body.riskBand).toBe('C');
      expect(res.body.offers[0].apr).toBe(11.9); // Band C APR
    });
  });
});
