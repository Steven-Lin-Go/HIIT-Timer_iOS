// Android-only release settings for local (non-EAS) builds. Touches nothing
// on iOS: it registers Android mods only.
//
// 1. EAS Update channel. EAS Build injects the channel from eas.json; a local
//    Gradle build does not, so without this header every update check is
//    rejected (HTTP 400). Android uses its own channel so an iOS update is
//    never pushed to Android by accident, and vice versa.
// 2. Upload-key signing. When the Gradle properties below are defined (they
//    live in GRADLE_USER_HOME/gradle.properties, outside the repo), release
//    builds are signed with the Google Play upload key. Without them the
//    template's debug signing is kept, so local release testing still works.
// 3. Hermes compiler path. On Windows the React Native Gradle plugin runs
//    hermesc through `cmd /c`; when the hermesc path itself needs quoting (the
//    project lives under "D:\@Side Project"), cmd strips the outer quotes and
//    the release build fails. HIIT_HERMESC may point at a copy of hermesc in a
//    path without spaces; unset, React Native's default is used.
const { withAndroidManifest, withAppBuildGradle, AndroidConfig } = require('expo/config-plugins');

const CHANNEL = 'production-android';
const HEADERS_KEY = 'expo.modules.updates.UPDATES_CONFIGURATION_REQUEST_HEADERS_KEY';
const SIGNING_MARKER = '// @hiit-android-release: upload signing, hermesc';

const SIGNING_BLOCK = `
${SIGNING_MARKER}
if (findProperty('HIIT_UPLOAD_STORE_FILE')) {
    android {
        signingConfigs {
            upload {
                storeFile file(findProperty('HIIT_UPLOAD_STORE_FILE'))
                storePassword findProperty('HIIT_UPLOAD_STORE_PASSWORD')
                keyAlias findProperty('HIIT_UPLOAD_KEY_ALIAS')
                keyPassword findProperty('HIIT_UPLOAD_KEY_PASSWORD')
            }
        }
        buildTypes {
            release {
                signingConfig signingConfigs.upload
            }
        }
    }
}
if (findProperty('HIIT_HERMESC')) {
    react {
        hermesCommand = findProperty('HIIT_HERMESC')
    }
}
`;

const withUpdateChannel = (config) =>
  withAndroidManifest(config, (config) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      app,
      HEADERS_KEY,
      JSON.stringify({ 'expo-channel-name': CHANNEL }),
    );
    return config;
  });

const withUploadSigning = (config) =>
  withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes(SIGNING_MARKER)) {
      config.modResults.contents += SIGNING_BLOCK;
    }
    return config;
  });

module.exports = (config) => withUploadSigning(withUpdateChannel(config));
