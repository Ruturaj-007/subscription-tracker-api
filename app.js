import express from 'express'
import cors from 'cors'
import { PORT } from './config/env.js'
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import connectToDatabase from './database/mongodb.js';
import errorMiddleware from './middlewares/error.middlewares.js';
import cookieParser from 'cookie-parser';
import workflowRouter from './routes/workflow.routes.js';
import analyticsRouter from './routes/analytics.routes.js';
import aiRouter from './routes/ai.routes.js';
import healthRouter from './routes/health.routes.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', process.env.FRONTEND_URL].filter(Boolean),
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workflowRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/health', healthRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorMiddleware);

app.get('/', (req, res) => res.send('Welcome to Subscription Tracker API!!'));

app.listen(PORT, async () => {
    console.log(`Subscription tracker is running on http://localhost:${PORT}`);
    console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
    await connectToDatabase();
});

export default app;