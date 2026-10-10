import { AppRegistry, Platform } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';
import { handleHeadlessNotification } from './src/services/headlessNotificationHandler';

if (Platform.OS === 'android') {
  try {
    const { RNAndroidNotificationListenerHeadlessJsName } = require('react-native-android-notification-listener');

    if (typeof AppRegistry.registerHeadlessTask === 'function') {
      AppRegistry.registerHeadlessTask(
        RNAndroidNotificationListenerHeadlessJsName,
        () => handleHeadlessNotification
      );
    }
  } catch (error) {
    console.warn('Android notification listener unavailable:', error);
  }
}

registerRootComponent(App);
