import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js';
import cache from '../middlewares/cache.middleware.js';
import { getAIInsights, getSpendForecast } from '../controllers/ai.controller.js';

const aiRouter = Router();

aiRouter.get('/insights', authorize, cache(600), getAIInsights);   // cache 10 min — LLM is slow+costly
aiRouter.get('/forecast', authorize, cache(3600), getSpendForecast); // cache 1 hr — pure math, rarely changes

export default aiRouter;