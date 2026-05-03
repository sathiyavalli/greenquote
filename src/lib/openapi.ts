export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'GreenQuote API',
    description: 'API documentation for GreenQuote solar financing pre-qualification platform',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'UserPass456!' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['fullName', 'email', 'password'],
        properties: {
          fullName: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'UserPass456!' },
        },
      },
      CreateQuoteRequest: {
        type: 'object',
        required: ['fullName', 'address', 'monthlyConsumptionKwh', 'systemSizeKw'],
        properties: {
          fullName: { type: 'string', example: 'John Doe' },
          address: { type: 'string', example: '123 Main St, Berlin' },
          monthlyConsumptionKwh: { type: 'number', example: 450 },
          systemSizeKw: { type: 'number', example: 5.5 },
          downPayment: { type: 'number', example: 1000 },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Service is healthy',
          },
          '503': {
            description: 'Service is unhealthy',
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'User registered' },
          '400': { description: 'Validation error' },
          '409': { description: 'Conflict: email exists' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Login success' },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout user',
        responses: {
          '200': { description: 'Logout success' },
        },
      },
    },
    '/api/quotes': {
      get: {
        tags: ['Quotes'],
        summary: 'Get current user quotes',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Quotes fetched' },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Quotes'],
        summary: 'Create quote',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateQuoteRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Quote created' },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/quotes/{id}': {
      get: {
        tags: ['Quotes'],
        summary: 'Get quote by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Quote fetched' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/admin/quotes': {
      get: {
        tags: ['Admin'],
        summary: 'Get all quotes (admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Admin quotes fetched' },
          '403': { description: 'Forbidden' },
        },
      },
    },
  },
} as const;
