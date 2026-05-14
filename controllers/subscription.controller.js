import Subscription from '../models/subscription.model.js';

export const createSubscription = async (req, res, next) => {
    try {

        const subscription = await Subscription.create({

            ...req.body,
            /* 
                Take all frontend data 
                {
                    "name": "Netflix Premium",
                    "price": 11.11,
                    "currency": "USD",
                    "frequency": "monthly",
                    "category": "entertainment",
                    "startDate": "2024-02-01T00:00:00.000Z",
                    "paymentMethod": "Credit Card"
                }
            */

            user: req.user._id  // attach  logged in user
        });

        res.status(201).json({
            success: true,
            data: subscription
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
