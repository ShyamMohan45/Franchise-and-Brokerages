const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo config plugin to enable cleartext HTTP traffic on Android.
 * Essential for connecting to local development backends (e.g. http://172.22.41.137:5000)
 * in standalone Android preview APK builds.
 */
module.exports = function withCleartextTraffic(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const application = androidManifest.manifest.application?.[0];
    if (application) {
      if (!application.$) {
        application.$ = {};
      }
      application.$['android:usesCleartextTraffic'] = 'true';
    }
    return config;
  });
};
