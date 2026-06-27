import { workflowClient } from '../config/upstash.js';
import Subscription from '../models/subscription.model.js';
import { SERVER_URL, NODE_ENV } from '../config/env.js';

export const createSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id
        });

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

        res.status(201).json({ success: true, data: { subscription, workflowRunId } });
    } catch (error) {
        next(error);
    }
}

export const getUserSubscriptions = async (req, res, next) => {
    try {
        if (req.user.id != req.params.id) {
            const error = new Error('You are not the owner of this account');
            error.status = 401;
            throw error;
        }

        const {
            search, status, category, frequency,
            dateFrom, dateTo, priceMin, priceMax,
            sortBy = 'createdAt:desc', page = 1, limit = 10,
        } = req.query;

        const filter = { user: req.params.id };
        if (search)               filter.name = { $regex: search, $options: 'i' };
        if (status)               filter.status = status;
        if (category)             filter.category = category;
        if (frequency)            filter.frequency = frequency;
        if (dateFrom || dateTo)   filter.startDate = { ...(dateFrom && { $gte: new Date(dateFrom) }), ...(dateTo && { $lte: new Date(dateTo) }) };
        if (priceMin || priceMax) filter.price = { ...(priceMin && { $gte: Number(priceMin) }), ...(priceMax && { $lte: Number(priceMax) }) };

        const [sortField, sortOrder] = sortBy.split(':');
        const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [subscriptions, total] = await Promise.all([
            Subscription.find(filter).sort(sort).skip(skip).limit(limitNum),
            Subscription.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            pagination: {
                total, page: pageNum, limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
                hasNextPage: pageNum < Math.ceil(total / limitNum),
                hasPrevPage: pageNum > 1,
            },
            data: subscriptions
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/subscriptions/export/csv
export const exportCSV = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user._id }).lean();

        const headers = ['Name', 'Price', 'Currency', 'Frequency', 'Category', 'Payment Method', 'Status', 'Start Date', 'Renewal Date'];

        const rows = subscriptions.map(s => [
            s.name,
            s.price,
            s.currency,
            s.frequency,
            s.category,
            s.paymentMethod,
            s.status,
            new Date(s.startDate).toISOString().split('T')[0],
            new Date(s.renewalDate).toISOString().split('T')[0],
        ].join(','));

        const csv = [headers.join(','), ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=subscriptions.csv');
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};