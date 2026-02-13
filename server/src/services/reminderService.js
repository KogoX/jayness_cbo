const User = require('../models/User');
const Payment = require('../models/Payment');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Notification = require('../models/Notification');
const { logAudit } = require('../utils/auditLogger');

const HOURLY_INTERVAL_MS = 60 * 60 * 1000;

const toMonthKey = (date = new Date()) => `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;

const toStartOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);

const toStartOfNextMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth() + 1, 1);

const createNotificationIfNew = async ({ recipient, title, message, type = 'info', dedupeKey, metadata = {} }) => {
  if (!recipient || !dedupeKey) return false;

  const exists = await Notification.findOne({ dedupeKey });
  if (exists) return false;

  await Notification.create({
    recipient,
    title,
    message,
    type,
    dedupeKey,
    metadata,
  });

  return true;
};

const runMonthlyContributionReminders = async () => {
  const now = new Date();
  const monthKey = toMonthKey(now);
  const monthStart = toStartOfMonth(now);
  const monthEnd = toStartOfNextMonth(now);

  const paidUserIds = await Payment.distinct('user', {
    user: { $ne: null },
    status: 'Completed',
    createdAt: { $gte: monthStart, $lt: monthEnd },
  });

  const recipients = await User.find({
    role: { $ne: 'admin' },
    _id: { $nin: paidUserIds },
  }).select('_id name');

  let sent = 0;

  for (const user of recipients) {
    const dedupeKey = `reminder:monthly:${monthKey}:${user._id}`;
    const created = await createNotificationIfNew({
      recipient: user._id,
      title: 'Monthly Contribution Reminder',
      message: `Hi ${user.name}, your monthly contribution is still pending for ${monthKey}.`,
      type: 'alert',
      dedupeKey,
      metadata: {
        category: 'reminder',
        reminderType: 'monthly_contribution',
        monthKey,
      },
    });
    if (created) sent += 1;
  }

  return { sent, checked: recipients.length };
};

const resolveEventMilestone = (diffMs) => {
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  if (diffMs <= 7 * day && diffMs > 7 * day - hour) return '7d';
  if (diffMs <= 1 * day && diffMs > 1 * day - hour) return '1d';
  if (diffMs <= 2 * hour && diffMs > 1 * hour) return '2h';
  return null;
};

const runEventReminders = async () => {
  const now = new Date();
  const horizon = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

  const events = await Event.find({
    date: { $gte: now, $lte: horizon },
  }).select('_id title date');

  if (!events.length) return { sent: 0, checked: 0 };

  const eventById = new Map(events.map((event) => [String(event._id), event]));
  const registrations = await EventRegistration.find({
    event: { $in: events.map((event) => event._id) },
  }).select('event fullName email phone');

  let sent = 0;
  let checked = 0;

  for (const registration of registrations) {
    const event = eventById.get(String(registration.event));
    if (!event) continue;

    const milestone = resolveEventMilestone(new Date(event.date).getTime() - now.getTime());
    if (!milestone) continue;
    checked += 1;

    if (!registration.email) continue;

    const user = await User.findOne({ email: registration.email.toLowerCase() }).select('_id');
    if (!user) continue;

    const dedupeKey = `reminder:event:${event._id}:${registration._id}:${milestone}`;
    const created = await createNotificationIfNew({
      recipient: user._id,
      title: 'Event Reminder',
      message: `${event.title} starts soon (${milestone === '7d' ? 'in 7 days' : milestone === '1d' ? 'tomorrow' : 'in about 2 hours'}).`,
      dedupeKey,
      metadata: {
        category: 'reminder',
        reminderType: 'event',
        eventId: event._id,
        milestone,
      },
    });

    if (created) sent += 1;
  }

  return { sent, checked };
};

const runReminderJobs = async () => {
  try {
    const [monthly, event] = await Promise.all([runMonthlyContributionReminders(), runEventReminders()]);

    await logAudit({
      action: 'reminder.job.run',
      entityType: 'ReminderJob',
      source: 'system_job',
      metadata: {
        monthlyContribution: monthly,
        eventReminder: event,
      },
    });
  } catch (error) {
    await logAudit({
      action: 'reminder.job.run',
      entityType: 'ReminderJob',
      source: 'system_job',
      status: 'failure',
      metadata: { error: error.message },
    });
  }
};

const startReminderJobs = () => {
  runReminderJobs();
  const timer = setInterval(runReminderJobs, HOURLY_INTERVAL_MS);
  timer.unref();
  return timer;
};

module.exports = {
  startReminderJobs,
  runReminderJobs,
};
