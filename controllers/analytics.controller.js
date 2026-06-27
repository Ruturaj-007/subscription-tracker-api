import Subscription from '../models/subscription.model.js';
import mongoose from 'mongoose';

// GET /api/v1/analytics/total-spend
export const getTotalSpend = async (req, res, next) => {
    try {
        const result = await Subscription.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.user._id), status: 'active' } },
            { $group: { _id: '$currency', total: { $sum: '$price' } } }
        ]);

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/analytics/monthly-spend
export const getMonthlySpend = async (req, res, next) => {
    try {
        const result = await Subscription.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.user._id), status: 'active' } },
            {
                $group: {
                    _id: {
                        year: { $year: '$startDate' },
                        month: { $month: '$startDate' }
                    },
                    total: { $sum: '$price' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } }
        ]);

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/analytics/category-spend
export const getCategorySpend = async (req, res, next) => {
    try {
        const result = await Subscription.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.user._id), status: 'active' } },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$price' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]);

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/analytics/upcoming-renewals
export const getUpcomingRenewals = async (req, res, next) => {
    try {
        const today = new Date();
        const next7Days = new Date();
        next7Days.setDate(today.getDate() + 7);

        const result = await Subscription.find({
            user: req.user._id,
            status: 'active',
            renewalDate: { $gte: today, $lte: next7Days }
        }).sort({ renewalDate: 1 });

        res.status(200).json({ success: true, count: result.length, data: result });
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/analytics/dashboard
export const getDashboardStats = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);

        const today = new Date();
        const next7Days = new Date();
        next7Days.setDate(today.getDate() + 7);

        const [totalSpend, categorySpend, upcomingRenewals, statusBreakdown] = await Promise.all([
            Subscription.aggregate([
                { $match: { user: userId, status: 'active' } },
                { $group: { _id: '$currency', total: { $sum: '$price' } } }
            ]),
            Subscription.aggregate([
                { $match: { user: userId, status: 'active' } },
                { $group: { _id: '$category', total: { $sum: '$price' }, count: { $sum: 1 } } },
                { $sort: { total: -1 } }
            ]),
            Subscription.find({
                user: req.user._id,
                status: 'active',
                renewalDate: { $gte: today, $lte: next7Days }
            }).sort({ renewalDate: 1 }),
            Subscription.aggregate([
                { $match: { user: userId } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalSpend,
                categorySpend,
                upcomingRenewals: { count: upcomingRenewals.length, items: upcomingRenewals },
                statusBreakdown
            }
        });
    } catch (error) {
        next(error);
    }
};