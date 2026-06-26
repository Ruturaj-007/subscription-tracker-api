import { workflowClient } from '../config/upstash.js';
import Subscription from '../models/subscription.model.js';
import { SERVER_URL, NODE_ENV } from '../config/env.js';

export const createSubscription = async (req, res, next) => {
    try {

        const subscription = await Subscription.create({
    ...req.body,
    user: req.user._id
});

// Only trigger workflow if SERVER_URL is a real public URL (not localhost)
let workflowRunId = null;
if (NODE_ENV !== 'development') {
    const result = await workflowClient.trigger({
        url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
        body: { subscriptionId: subscription.id },
        headers: { 'content-type': 'application/json' },
        retries: 0,
    });
    workflowRunId = result.workflowRunId;
}

res.status(201).json({
    success: true,
    data: { subscription, workflowRunId }
});

    } catch (error) {
        next(error);
    }
}

 export const getUserSubscriptions = async (req, res, next) => {
        try {
            // check if the user is the same as the one in the token 
            if (req.user.id != req.params.id) {
                const error = new Error('You are not the owner of this account');
                error.status = 401;
                throw error;
            }

            const subscriptions = await Subscription.find({
                user: req.params.id
            });    
            
            res.status(200).json({
                success : true,
                data: subscriptions
            })     
        
        } catch (error) {
            next(error)
        }
    };
