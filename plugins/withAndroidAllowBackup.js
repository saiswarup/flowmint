
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidAllowBackup(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const application = manifest.application?.[0];

    if (application) {
      // Disable app-data backup and override conflicting library settings.
      application.$['android:allowBackup'] = 'false';
      application.$['tools:replace'] = 'android:allowBackup';

      manifest.$['xmlns:tools'] =
        'http://schemas.android.com/tools';
    }

    return config;
  });
};