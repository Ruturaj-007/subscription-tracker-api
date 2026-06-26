import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import { 
    createSubscription ,
    getUserSubscriptions
} from "../controllers/subscription.controller.js";
import { validate } from '../middlewares/validate.middleware.js';
import { createSubscriptionSchema } from '../validations/subscription.validation.js';

const subscriptionRouter = Router();

subscriptionRouter.get('/', authorize, validate(createSubscriptionSchema), createSubscription);

subscriptionRouter.get('/user/:id', authorize, getUserSubscriptions); 

subscriptionRouter.get('/upcoming-renewals', (req, res) => res.send({
    title: 'GET upcoming renewals'
}));

subscriptionRouter.get('/:id', (req, res) => res.send({
    title: 'GET subscription details'
}));

subscriptionRouter.get('/:id/cancel', (req, res) => res.send({
    title: 'CANCEL subscriptions'
}));

subscriptionRouter.post('/', authorize, createSubscription);

subscriptionRouter.put('/:id', (req, res) => res.send({
    title: 'UPDATE subscription'
}));

subscriptionRouter.delete('/:id', (req, res) => res.send({
    title: 'DELETE subscription'
}));

subscriptionRouter.delete('/user/:id', (req, res) => res.send({
    title: 'DELETE user subscriptions'
}));

export default subscriptionRouter;