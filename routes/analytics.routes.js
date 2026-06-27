import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js';
import cache from '../middlewares/cache.middleware.js';
import {
    getTotalSpend,
    getMonthlySpend,
    getCategorySpend,
    getUpcomingRenewals,
    getDashboardStats
} from '../controllers/analytics.controller.js';

const analyticsRouter = Router();

analyticsRouter.get('/total-spend',       authorize, cache(300), getTotalSpend);
analyticsRouter.get('/monthly-spend',     authorize, cache(300), getMonthlySpend);
analyticsRouter.get('/category-spend',    authorize, cache(300), getCategorySpend);
analyticsRouter.get('/upcoming-renewals', authorize, cache(60),  getUpcomingRenewals);
analyticsRouter.get('/dashboard',         authorize, cache(300), getDashboardStats);

export default analyticsRouter;