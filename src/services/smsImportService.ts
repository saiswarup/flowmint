import { Platform } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';
import { parseTransactionMessage } from '../utils/parseTransaction';
import { importTransactionIfNew } from './autoExpenseService';

interface SmsRecord {
  _id: string;
  body: string;
  date: string;
}

export async function scanAndImportSms(
  maxCount = 100
): Promise<number> {
  if (Platform.OS !== 'android') return 0;

  return new Promise(resolve => {
    SmsAndroid.list(
      JSON.stringify({
        box: 'inbox',
        maxCount,
      }),
      () => resolve(0),
      async (_count: number, smsList: string) => {
        try {
          const messages: SmsRecord[] = JSON.parse(smsList);
          let imported = 0;

          for (const sms of messages) {
            const parsed = parseTransactionMessage(
              sms.body,
              new Date(Number(sms.date)).toISOString()
            );

            if (!parsed) continue;

            const added = await importTransactionIfNew(
              parsed,
              `sms-${sms._id}`,
              'sms'
            );

            if (added) imported += 1;
          }

          resolve(imported);
        } catch {
          resolve(0);
        }
      }
    );
  });
}
