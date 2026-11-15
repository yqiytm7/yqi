// Applies the YQI native parts on top of the fresh Capacitor Android project.
const fs = require('fs'), path = require('path');
const A = path.join(__dirname, 'android', 'app'), M = path.join(A, 'src', 'main');
const J = path.join(M, 'java', 'com', 'yunustextile', 'yqi');
fs.mkdirSync(J, {recursive: true});
for (const f of fs.readdirSync(path.join(__dirname, 'native'))) fs.copyFileSync(path.join(__dirname, 'native', f), path.join(J, f));
// remove template splash images (replaced by drawable/splash.xml)
const RES = path.join(M, 'res');
for (const d of fs.readdirSync(RES)) { const p = path.join(RES, d, 'splash.png'); if (fs.existsSync(p)) fs.unlinkSync(p); }
const cp = (s, t) => { for (const f of fs.readdirSync(s)) { const a = path.join(s, f), b = path.join(t, f); if (fs.statSync(a).isDirectory()) { fs.mkdirSync(b, {recursive: true}); cp(a, b); } else fs.copyFileSync(a, b); } };
cp(path.join(__dirname, 'res'), RES);
// permissions
const mf = path.join(M, 'AndroidManifest.xml'); let m = fs.readFileSync(mf, 'utf8');
const perms = ['REQUEST_INSTALL_PACKAGES', 'CAMERA', 'RECORD_AUDIO', 'MODIFY_AUDIO_SETTINGS', 'POST_NOTIFICATIONS', 'WAKE_LOCK', 'VIBRATE', 'ACCESS_NETWORK_STATE'];
const add = perms.filter(p => !m.includes('android.permission.' + p + '"')).map(p => `    <uses-permission android:name="android.permission.${p}" />`).join('\n')
  + '\n    <uses-feature android:name="android.hardware.camera" android:required="false" />\n    <uses-feature android:name="android.hardware.microphone" android:required="false" />\n';
m = m.replace('</manifest>', add + '</manifest>');
fs.writeFileSync(mf, m);
// signing + version
const gf = path.join(A, 'build.gradle'); let g = fs.readFileSync(gf, 'utf8');
const run = process.env.GITHUB_RUN_NUMBER || '1';
g = g.replace(/versionCode\s+\d+/, 'versionCode ' + run).replace(/versionName\s+"[^"]*"/, 'versionName "1.0.' + run + '"');
g = g.replace(/android\s*\{/, `android {\n    signingConfigs { release { storeFile file('../../yqi.jks'); storePassword 'yqi-ytm7-2026'; keyAlias 'yqi'; keyPassword 'yqi-ytm7-2026' } }`);
g = g.replace(/release\s*\{(\s*)minifyEnabled/, 'release {$1signingConfig signingConfigs.release$1minifyEnabled');
if (!g.includes('signingConfig signingConfigs.release')) throw new Error('signing not applied');
g = g.replace(/dependencies\s*\{/, "dependencies {\n    implementation 'androidx.biometric:biometric:1.1.0'");
fs.writeFileSync(gf, g);
console.log('YQI patch applied, version 1.0.' + run);
