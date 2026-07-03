import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

/**
 * Local reminder notifications: one nudge the day before at 10:00 and one at
 * the promised time. Device-local (no push service needed) and a no-op on web.
 */

let configured = false;
function ensureConfigured() {
  if (configured || Platform.OS === 'web') return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  ensureConfigured();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

export async function scheduleReminderNotifications(customerName: string, dueAtISO: string): Promise<void> {
  if (Platform.OS === 'web') return;
  const ok = await ensureNotificationPermission();
  if (!ok) return;

  const due = new Date(dueAtISO);
  const now = Date.now();

  // Day before at 10:00 local time.
  const dayBefore = new Date(due);
  dayBefore.setDate(dayBefore.getDate() - 1);
  dayBefore.setHours(10, 0, 0, 0);
  if (dayBefore.getTime() > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Collection due tomorrow',
        body: `${customerName} promised to pay tomorrow. A friendly reminder call works wonders.`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: dayBefore },
    });
  }

  if (due.getTime() > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Collection due today',
        body: `${customerName} promised to pay today. Open their khata to record the payment.`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: due },
    });
  }
}
