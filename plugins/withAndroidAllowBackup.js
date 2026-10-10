
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidAllowBackup(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    manifest.$['xmlns:tools'] =
      'http://schemas.android.com/tools';

    const application = manifest.application?.[0];

    if (application) {
      application.$['android:allowBackup'] = 'false';
      application.$['tools:replace'] = 'android:allowBackup';
    }

    return config;
  });
};