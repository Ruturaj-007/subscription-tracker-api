import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Subscription Tracker API',
            version: '1.0.0',
            description: 'A production-grade subscription management API with analytics, AI insights, and Redis caching.',
        },
        servers: [
            { url: 'http://localhost:5500', description: 'Development' },
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
                Subscription: {
                    type: 'object',
                    properties: {
                        _id:           { type: 'string' },
                        name:          { type: 'string', example: 'Netflix' },
                        price:         { type: 'number', example: 199 },
                        currency:      { type: 'string', example: 'USD' },
                        frequency:     { type: 'string', enum: ['daily','weekly','monthly','yearly'] },
                        category:      { type: 'string', example: 'entertainment' },
                        paymentMethod: { type: 'string', example: 'Credit Card' },
                        status:        { type: 'string', enum: ['active','cancelled','expired'] },
                        startDate:     { type: 'string', format: 'date-time' },
                        renewalDate:   { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: 'Auth' },
            { name: 'Subscriptions' },
            { name: 'Analytics' },
            { name: 'AI' },
            { name: 'Reports' },
            { name: 'Health' },
        ],
        paths: {
            // AUTH
            '/api/v1/auth/sign-up': {
                post: {
                    tags: ['Auth'], summary: 'Register a new user', security: [],
                    requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' } }, required: ['name','email','password'] } } } },
                    responses: { 201: { description: 'User created' }, 409: { description: 'User already exists' } },
                },
            },
            '/api/v1/auth/sign-in': {
                post: {
                    tags: ['Auth'], summary: 'Login', security: [],
                    requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email','password'] } } } },
                    responses: { 200: { description: 'Login successful, returns JWT token' }, 401: { description: 'Invalid credentials' } },
                },
            },
            '/api/v1/auth/sign-out': {
                post: { tags: ['Auth'], summary: 'Logout', responses: { 200: { description: 'Logged out' } } },
            },

            // SUBSCRIPTIONS
            '/api/v1/subscriptions': {
                post: {
                    tags: ['Subscriptions'], summary: 'Create a subscription',
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Subscription' } } } },
                    responses: { 201: { description: 'Subscription created' } },
                },
            },
            '/api/v1/subscriptions/user/{id}': {
                get: {
                    tags: ['Subscriptions'], summary: 'Get user subscriptions with filters, search, sort, pagination',
                    parameters: [
                        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                        { name: 'search', in: 'query', schema: { type: 'string' } },
                        { name: 'status', in: 'query', schema: { type: 'string', enum: ['active','cancelled','expired'] } },
                        { name: 'category', in: 'query', schema: { type: 'string' } },
                        { name: 'frequency', in: 'query', schema: { type: 'string', enum: ['daily','weekly','monthly','yearly'] } },
                        { name: 'priceMin', in: 'query', schema: { type: 'number' } },
                        { name: 'priceMax', in: 'query', schema: { type: 'number' } },
                        { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date' } },
                        { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date' } },
                        { name: 'sortBy', in: 'query', schema: { type: 'string', example: 'price:desc' } },
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                    ],
                    responses: { 200: { description: 'List of subscriptions with pagination' } },
                },
            },
            '/api/v1/subscriptions/{id}': {
                get:    { tags: ['Subscriptions'], summary: 'Get subscription by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Subscription details' } } },
                put:    { tags: ['Subscriptions'], summary: 'Update subscription', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
                delete: { tags: ['Subscriptions'], summary: 'Delete subscription', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' } } },
            },

            // ANALYTICS
            '/api/v1/analytics/dashboard':         { get: { tags: ['Analytics'], summary: 'Dashboard stats (cached 5min)', responses: { 200: { description: 'Full dashboard data' } } } },
            '/api/v1/analytics/total-spend':        { get: { tags: ['Analytics'], summary: 'Total spend by currency', responses: { 200: { description: 'Total spend' } } } },
            '/api/v1/analytics/monthly-spend':      { get: { tags: ['Analytics'], summary: 'Monthly spend breakdown', responses: { 200: { description: 'Monthly data' } } } },
            '/api/v1/analytics/category-spend':     { get: { tags: ['Analytics'], summary: 'Spend by category', responses: { 200: { description: 'Category breakdown' } } } },
            '/api/v1/analytics/upcoming-renewals':  { get: { tags: ['Analytics'], summary: 'Renewals in next 7 days (cached 1min)', responses: { 200: { description: 'Upcoming renewals' } } } },

            // AI
            '/api/v1/ai/insights':  { get: { tags: ['AI'], summary: 'AI spending insights powered by Groq/LLaMA', responses: { 200: { description: 'AI analysis and suggestions' } } } },
            '/api/v1/ai/forecast':  { get: { tags: ['AI'], summary: 'Quarterly and annual spend forecast', responses: { 200: { description: 'Forecast data' } } } },

            // REPORTS
            '/api/v1/subscriptions/export/csv': { get: { tags: ['Reports'], summary: 'Export subscriptions as CSV', responses: { 200: { description: 'CSV file download', content: { 'text/csv': {} } } } } },

            // HEALTH
            '/health': { get: { tags: ['Health'], summary: 'Health check — DB + Redis status', security: [], responses: { 200: { description: 'All services healthy' }, 503: { description: 'One or more services degraded' } } } },
        },
    },
    apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);