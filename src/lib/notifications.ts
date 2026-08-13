import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const WEEKLY_SUMMARY_ID = 'weekly-summary-sunday';

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
