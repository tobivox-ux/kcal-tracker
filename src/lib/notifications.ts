import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const WEEKLY_SUMMARY_ID = 'weekly-summary-sunday';
const REST_TIMER_ID = 'rest-timer-done';
const DAILY_TRACKING_ID = 'daily-tracking-reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

// Schedules (or re-schedules, replacing the previous one) a local
// notification every Sunday at 18:00 with the latest weekly summary.
// Local scheduling works in Expo Go for testing; a dev build is
// recommended for reliable long-term delivery in production.
export async function scheduleWeeklySummaryNotification(bodyText: string) {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('weekly-summary', {
      name: 'Wochenrückblick',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await Notifications.cancelScheduledNotificationAsync(WEEKLY_SUMMARY_ID).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: WEEKLY_SUMMARY_ID,
    content: {
      title: 'Dein Wochenrückblick 📊',
      body: bodyText,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // 1 = Sonntag
      hour: 18,
      minute: 0,
    },
  });
}

// Schedules a one-off notification for when the current rest timer runs
// out — fires even if the app is backgrounded. Call again (it replaces the
// previous one) whenever a new rest period starts; call
// cancelRestTimerNotification when the timer is skipped or adjusted so a
// stale "Pause vorbei" doesn't arrive late.
export async function scheduleRestTimerNotification(seconds: number) {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('rest-timer', {
      name: 'Pausentimer',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  await Notifications.cancelScheduledNotificationAsync(REST_TIMER_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: REST_TIMER_ID,
    content: {
      title: 'Pause vorbei 💪',
      body: 'Zeit für den nächsten Satz!',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, repeats: false },
  });
}

export async function cancelRestTimerNotification() {
  await Notifications.cancelScheduledNotificationAsync(REST_TIMER_ID).catch(() => {});
}

// Daily reminder in case nothing's been logged yet. A real implementation
// would check today's food_logs/workout_sessions from Supabase before
// sending (or cancel this if the user already logged everything); for now
// it's a fixed daily nudge.
export async function scheduleDailyTrackingReminder() {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('tracking-reminder', {
      name: 'Tracking-Erinnerung',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await Notifications.cancelScheduledNotificationAsync(DAILY_TRACKING_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_TRACKING_ID,
    content: {
      title: 'Alles getrackt? 📝',
      body: 'Vergiss nicht, deine Mahlzeiten und dein Workout heute einzutragen.',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 20, minute: 0 },
  });
}
