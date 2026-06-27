import Subscription from '../models/subscription.model.js';
import { GROQ_API_KEY } from '../config/env.js';

// GET /api/v1/ai/insights
export const getAIInsights = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find({
            user: req.user._id,
            status: 'active'
        });

        if (subscriptions.length === 0) {
            return res.status(200).json({
                success: true,
                data: { insights: 'No active subscriptions found to analyze.' }
            });
        }

        // Build a clean summary to send to Groq
        const totalMonthly = subscriptions.reduce((acc, sub) => {
            const monthly = {
                daily: sub.price * 30,
                weekly: sub.price * 4,
                monthly: sub.price,
                yearly: sub.price / 12,
            }[sub.frequency] || sub.price;
            return acc + monthly;
        }, 0);

        const subList = subscriptions.map(s =>
            `- ${s.name} (${s.category}): ₹${s.price}/${s.frequency}`
        ).join('\n');

        const prompt = `
You are a personal finance assistant. Do not show your thinking process. Just respond directly in the required format.
You are a personal finance assistant. Analyze these active subscriptions and give concise, actionable insights.

Subscriptions:
${subList}

Total estimated monthly spend: ₹${totalMonthly.toFixed(2)}

Respond in this exact format:
TOTAL: [monthly spend summary]
OVERLAPS: [any duplicate or overlapping services, or "None detected"]
SAVINGS: [specific saving suggestions with estimated amounts, or "None identified"]
PRIORITY: [which subscription gives best value, which to consider cancelling]

Keep it under 150 words. Be specific with rupee amounts.
        `.trim();

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'qwen/qwen3.6-27b',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 300,
                temperature: 0.5,
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Groq API error');
        }

        const groqData = await response.json();
        const insights = groqData.choices[0].message.content;

        res.status(200).json({
            success: true,
            data: {
                totalMonthlyEstimate: `₹${totalMonthly.toFixed(2)}`,
                subscriptionCount: subscriptions.length,
                insights,
            }
        });

    } catch (error) {
        next(error);
    }
};

// GET /api/v1/ai/forecast
export const getSpendForecast = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find({
            user: req.user._id,
            status: 'active'
        });

        // Normalize everything to monthly cost
        const monthlyTotal = subscriptions.reduce((acc, sub) => {
            const monthly = {
                daily: sub.price * 30,
                weekly: sub.price * 4,
                monthly: sub.price,
                yearly: sub.price / 12,
            }[sub.frequency] || sub.price;
            return acc + monthly;
        }, 0);

        const now = new Date();
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

        const forecast = Array.from({ length: 3 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
            return {
                month: `${months[d.getMonth()]} ${d.getFullYear()}`,
                estimatedSpend: `₹${monthlyTotal.toFixed(2)}`,
            };
        });

        res.status(200).json({
            success: true,
            data: {
                currentMonthlySpend: `₹${monthlyTotal.toFixed(2)}`,
                quarterlyForecast: forecast,
                annualEstimate: `₹${(monthlyTotal * 12).toFixed(2)}`,
            }
        });

    } catch (error) {
        next(error);
    }
};