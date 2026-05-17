// *Schedule reminder emails before subscription renewal

import dayjs from 'dayjs'

import { createRequire } from 'module';
import Subscription from '../models/subscription.model.js';
const require = createRequire(import.meta.url);
const { serve } = require('@upstash/workflow/express');

const REMINDERS = [7,5,2,1];

// 1. Creates a worflow handler main workflow starts here
export const sendReminders = serve(async (context) => {
    const { subscriptionId } = context.requestPayload;

    // 2. Go to mongodb fetch subscription details     
    const subscription = await fetchSubscription(context, subscriptionId);

    // 4. Status check  
    if (!subscription || subscription.status !== 'active') return;

    // 5. Converting normal JS Date into Day.js object 
    const renewalDate = dayjs(subscription.renewalDate);

    // 6. Expired Check : Is renewal already in past?  renewal = Feb 22  today = 16 may workflow stops 
    if (renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for subscription ${subscriptionId}. stopping workflow`)
        return;
    }

    // 7. Core Reminder loop 
    for (const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, 'day');  
        /*
            renewal date = 22 feb, reminder date = 15 feb 17 20 21 
            now in 1st loop daysBefore = 7
                renewalDate.subtract(7, 'day') FEB 22 - 7 = FEB 15
            now in 2nd loop daysBefore = 5 
                renewalDate.subtract(7, 'day') FEB 22 - 5 = FEB 17
        */

        // 8. Only schedule reminders for future dates : today feb19 feb 15 17 will be skipped and 20 21 will be scheduled 
        if (reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);
        }
    }
});

// 3. Mongoose fetches actual user data 
const fetchSubscription = async(context, subscriptionId) => {
    return await context.run('get subscription', async() => {
        return Subscription.findById(subscriptionId).populate('user', 'name email');
    })
}
/*  "user": {
        "name": "Ruturaj",
        "email": "rutu@gmail.com"
        }
*/
        
// 8. Pause workflow execution until specific future time
const sleepUntilReminder = async(context, label, date) => {
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate());
}

// 9. Execute this step as a tracked workflow step with context.run() Workflow engine knows step incomplete
const triggerReminder = async (context, label) => {
    return await context.run(label, () => {
        console.log(`Triggering ${label} reminder`);
    })
}








