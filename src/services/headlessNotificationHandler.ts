import {
  buildNotificationText,
  isFinancialApp,
  parseTransactionMessage,
} from '../utils/parseTransaction';
import { importTransactionIfNew } from './autoExpenseService';

interface NotificationPayload {
  time?: string;
  app?: string;
  title?: string;
  text?: string;
  bigText?: string;
  subText?: string;
}

export async function handleHeadlessNotification({
  notification,
}: {
  notification?: string;
}): Promise<void> {
  if (!notification) return;

  try {
    const data: NotificationPayload = JSON.parse(notification);
    const text = buildNotificationText(data);

    if (!text.trim()) return;

    const looksFinancial =
      isFinancialApp(data.app) ||
      /(?:rs\.?|inr|₹|debited|paid|sent|credit)/i.test(text);

    if (!looksFinancial) return;

    const parsed = parseTransactionMessage(
      text,
      data.time || new Date().toISOString()
    );

    if (!parsed) return;

    const sourceId = `notif-${data.app || 'unknown'}-${data.time || ''}-${parsed.amount}-${parsed.merchant}`;

    await importTransactionIfNew(parsed, sourceId, 'notification');
  } catch (e) {
    console.warn('Headless notification import failed:', e);
  }
}
