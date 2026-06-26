// * Schedule reminder emails before subscription renewal

import dayjs from 'dayjs'

import { createRequire } from 'module';

// Needed because Upstash package uses CommonJS require syntax
const require = createRequire(import.meta.url);

// Import Upstash workflow serve function
const { serve } = require("@upstash/workflow/express");

import Subscription from '../models/subscription.model.js';
import { sendReminderEmail } from '../utils/send-email.js'

// Reminder days before renewal date
// Example: if renewal = Feb 22
// reminders will trigger on Feb 15, 17, 20, 21
const REMINDERS = [7, 5, 2, 1]

// 1. Main workflow starts here
export const sendReminders = serve(async (context) => {

  // Extract subscriptionId sent from API/workflow trigger
  const { subscriptionId } = context.requestPayload;

  // 2. Fetch subscription details from MongoDB
  const subscription = await fetchSubscription(context, subscriptionId);

  // 3. Stop workflow if:
  // subscription not found
  // OR subscription is inactive/cancelled
  if(!subscription || subscription.status !== 'active') return;

  // 4. Convert MongoDB renewal date into Day.js object
  const renewalDate = dayjs(subscription.renewalDate);

  // 5. Expired check
  // If renewal date already passed -> stop workflow
  /*
      Example:
      renewalDate = Feb 22
      today       = May 16

      Since renewal already expired,
      no reminders should be sent
  */
  if(renewalDate.isBefore(dayjs())) {
    console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
    return;
  }

  // 6. Main reminder scheduling loop
  for (const daysBefore of REMINDERS) {

    // Calculate reminder date
    const reminderDate = renewalDate.subtract(daysBefore, 'day');

    /*
        Example:
        renewalDate = Feb 22

        Loop 1:
        daysBefore = 7
        reminderDate = Feb 15

        Loop 2:
        daysBefore = 5
        reminderDate = Feb 17

        Loop 3:
        daysBefore = 2
        reminderDate = Feb 20

        Loop 4:
        daysBefore = 1
        reminderDate = Feb 21
    */

    // 7. Only sleep/schedule future reminders
    /*
        Example:
        today = Feb 19

        Feb 15 -> skipped
        Feb 17 -> skipped
        Feb 20 -> scheduled
        Feb 21 -> scheduled
    */
    if(reminderDate.isAfter(dayjs())) {

      // Pause workflow until reminder date arrives
      await sleepUntilReminder(
        context,
        `Reminder ${daysBefore} days before`,
        reminderDate
      );
    }

    // 8. When workflow wakes up,
    // check if today matches reminder day
    if (dayjs().isSame(reminderDate, 'day')) {

      // Trigger email reminder
      await triggerReminder(
         context,
        `Reminder ${daysBefore} days before`,
        subscription
      );
    }
  }
});

// 2A. Fetch subscription from MongoDB
const fetchSubscription = async (context, subscriptionId) => {

  // context.run() makes this a tracked workflow step
  return await context.run('get subscription', async () => {

    // Populate user field to get name + email
    return Subscription
      .findById(subscriptionId)
      .populate('user', 'name email');
  })
}

/*
    Example populated result:

    {
      "_id": "123",
      "renewalDate": "2026-02-22",
      "status": "active",

      "user": {
        "name": "Ruturaj",
        "email": "rutu@gmail.com"
      }
    }
*/

// 7A. Pause workflow execution until future reminder date
const sleepUntilReminder = async (context, label, date) => {

  console.log(`Sleeping until ${label} reminder at ${date}`);

  // Workflow sleeps here
  // and automatically wakes up later
  await context.sleepUntil(label, date.toDate());
}

// 8A. Send actual reminder email
const triggerReminder = async (context, label, subscription) => {

  // context.run() creates durable workflow step
  // If failure happens, Upstash can retry safely
  return await context.run(label, async () => {

    console.log(`Triggering ${label} reminder`);

    // Send reminder email
    await sendReminderEmail({

      // User email fetched from populate()
      to: subscription.user.email,

      // Email type
      type: label,

      // Full subscription object
      subscription,
    })
  })
}