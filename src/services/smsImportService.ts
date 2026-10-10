import {
  InteractionManager,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { parseTransactionMessage } from '../utils/parseTransaction';
import { batchImportTransactions } from './autoExpenseService';

const SmsAndroid =
  Platform.OS === 'android' ? require('react-native-get-sms-android') : null;

interface SmsRecord {
  _id: string;
  body: string;
  date: string;
}

const SCAN_TIMEOUT_MS = 12000;

async function hasSmsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  try {
    return await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_SMS
    );
  } catch {
    return false;
  }
}

function readSmsInbox(maxCount: number): Promise<SmsRecord[]> {
  return new Promise(resolve => {
    let settled = false;

    const finish = (messages: SmsRecord[]) => {
      if (settled) return;
      settled = true;
      resolve(messages);
    };

    const timer = setTimeout(() => finish([]), SCAN_TIMEOUT_MS);

    try {
      SmsAndroid.list(
        JSON.stringify({
          box: 'inbox',
          maxCount,
        }),
        () => {
          clearTimeout(timer);
          finish([]);
        },
        (_count: number, smsList: string) => {
          clearTimeout(timer);
          try {
            const messages: SmsRecord[] = JSON.parse(smsList);
            finish(Array.isArray(messages) ? messages : []);
          } catch {
            finish([]);
          }
        }
      );
    } catch {
      clearTimeout(timer);
      finish([]);
    }
  });
}

export async function scanAndImportSms(
  maxCount = 50
): Promise<number> {
  if (Platform.OS !== 'android') return 0;

  const permitted = await hasSmsPermission();
  if (!permitted) return 0;

  await new Promise<void>(resolve => {
    InteractionManager.runAfterInteractions(() => resolve());
  });

  const messages = await readSmsInbox(maxCount);

  const items = messages
    .map(sms => {
      const parsed = parseTransactionMessage(
        sms.body,
        new Date(Number(sms.date)).toISOString()
      );

      if (!parsed) return null;

      return {
        parsed,
        sourceId: `sms-${sms._id}`,
        source: 'sms' as const,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return batchImportTransactions(items);
}
