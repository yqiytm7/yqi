package com.yunustextile.yqi;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.media.AudioDeviceInfo;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.content.pm.PackageManager;
import java.util.ArrayList;
import android.os.Environment;
import android.os.PowerManager;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.WindowManager;
import android.widget.Toast;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.FileProvider;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import android.content.pm.PackageInfo;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

@CapacitorPlugin(name = "YqNative", permissions = {
    @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS }),
    @Permission(alias = "mic", strings = { Manifest.permission.RECORD_AUDIO })
})
public class YqNativePlugin extends Plugin {
    private PowerManager.WakeLock prox;
    private static final String CH = "yqi_msg";

    private AudioManager am() { return (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE); }

    // ---------- calls: earpiece / speaker ----------
    @PluginMethod
    public void callStart(PluginCall call) {
        try { am().setMode(AudioManager.MODE_IN_COMMUNICATION); } catch (Exception e) { }
        route(call.getBoolean("speaker", false));
        getActivity().runOnUiThread(() -> getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON));
        call.resolve();
    }

    @PluginMethod
    public void setSpeaker(PluginCall call) { route(call.getBoolean("on", false)); call.resolve(); }

    @PluginMethod
    public void callEnd(PluginCall call) {
        proximity(false);
        try {
            AudioManager a = am();
            if (Build.VERSION.SDK_INT >= 31) a.clearCommunicationDevice(); else a.setSpeakerphoneOn(false);
            a.setMode(AudioManager.MODE_NORMAL);
        } catch (Exception e) { }
        getActivity().runOnUiThread(() -> getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON));
        call.resolve();
    }

    private void route(boolean speaker) {
        AudioManager a = am();
        boolean headset = false;
        try {
            if (Build.VERSION.SDK_INT >= 31) {
                AudioDeviceInfo pick = null, ear = null, spk = null;
                for (AudioDeviceInfo d : a.getAvailableCommunicationDevices()) {
                    int t = d.getType();
                    if (t == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER) spk = d;
                    else if (t == AudioDeviceInfo.TYPE_BUILTIN_EARPIECE) ear = d;
                    else if (t == AudioDeviceInfo.TYPE_BLUETOOTH_SCO || t == AudioDeviceInfo.TYPE_WIRED_HEADSET || t == AudioDeviceInfo.TYPE_WIRED_HEADPHONES
                            || t == AudioDeviceInfo.TYPE_USB_HEADSET || t == AudioDeviceInfo.TYPE_BLE_HEADSET) { if (pick == null) pick = d; }
                }
                headset = pick != null;
                AudioDeviceInfo dev = speaker ? spk : (pick != null ? pick : ear);
                if (dev != null) a.setCommunicationDevice(dev);
            } else {
                headset = a.isWiredHeadsetOn() || a.isBluetoothScoOn();
                a.setSpeakerphoneOn(speaker);
            }
        } catch (Exception e) { }
        proximity(!speaker && !headset);
    }

    private void proximity(boolean on) {
        try {
            PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
            if (on) {
                if (prox == null && pm.isWakeLockLevelSupported(PowerManager.PROXIMITY_SCREEN_OFF_WAKE_LOCK))
                    prox = pm.newWakeLock(PowerManager.PROXIMITY_SCREEN_OFF_WAKE_LOCK, "yqi:prox");
                if (prox != null && !prox.isHeld()) prox.acquire(3 * 60 * 60 * 1000L);
            } else if (prox != null && prox.isHeld()) prox.release();
        } catch (Exception e) { }
    }

    // ---------- notifications ----------
    @PluginMethod
    public void askNotify(PluginCall call) {
        if (Build.VERSION.SDK_INT < 33 || getPermissionState("notifications") == PermissionState.GRANTED) { call.resolve(); return; }
        requestPermissionForAlias("notifications", call, "notifCb");
    }

    @PermissionCallback
    private void notifCb(PluginCall call) { call.resolve(); }

    @PluginMethod
    public void notify(PluginCall call) {
        try {
            Context c = getContext();
            if (Build.VERSION.SDK_INT >= 26) {
                NotificationManager nm = c.getSystemService(NotificationManager.class);
                if (nm.getNotificationChannel(CH) == null) {
                    NotificationChannel ch = new NotificationChannel(CH, "YQI Chat", NotificationManager.IMPORTANCE_HIGH);
                    ch.enableVibration(true);
                    nm.createNotificationChannel(ch);
                }
            }
            if (Build.VERSION.SDK_INT >= 33 && getPermissionState("notifications") != PermissionState.GRANTED) { call.resolve(); return; }
            Intent open = new Intent(c, MainActivity.class);
            open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent pi = PendingIntent.getActivity(c, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            String tag = call.getString("tag", "");
            NotificationCompat.Builder b = new NotificationCompat.Builder(c, CH)
                .setSmallIcon(R.drawable.ic_stat_yqi).setColor(0xFF7DB82E)
                .setContentTitle(call.getString("title", "YQI")).setContentText(call.getString("body", ""))
                .setStyle(new NotificationCompat.BigTextStyle().bigText(call.getString("body", "")))
                .setPriority(NotificationCompat.PRIORITY_HIGH).setAutoCancel(true).setContentIntent(pi);
            NotificationManagerCompat.from(c).notify(tag.isEmpty() ? (int) (System.currentTimeMillis() % 100000) : tag.hashCode(), b.build());
        } catch (SecurityException e) { } catch (Exception e) { }
        call.resolve();
    }

    @PluginMethod
    public void toast(PluginCall call) {
        String t = call.getString("text", "");
        getActivity().runOnUiThread(() -> Toast.makeText(getContext(), t, Toast.LENGTH_SHORT).show());
        call.resolve();
    }

    // ---------- downloads (PPT, Excel, PDF, photos) ----------
    @PluginMethod
    public void saveFile(PluginCall call) {
        String name = call.getString("name", "file").replaceAll("[\\\\/:*?\"<>|]", "_");
        String mime = call.getString("mime", "application/octet-stream");
        String data = call.getString("data", "");
        try {
            byte[] bytes = Base64.decode(data, Base64.DEFAULT);
            Context c = getContext();
            Uri uri;
            if (Build.VERSION.SDK_INT >= 29) {
                ContentResolver r = c.getContentResolver();
                ContentValues v = new ContentValues();
                v.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
                v.put(MediaStore.MediaColumns.MIME_TYPE, mime);
                v.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/YQI");
                uri = r.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                if (uri == null) throw new Exception("no uri");
                try (OutputStream o = r.openOutputStream(uri)) { o.write(bytes); }
            } else {
                File dir = new File(c.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "YQI");
                dir.mkdirs();
                File f = new File(dir, name);
                try (FileOutputStream o = new FileOutputStream(f)) { o.write(bytes); }
                uri = FileProvider.getUriForFile(c, c.getPackageName() + ".fileprovider", f);
            }
            final Uri u = uri;
            getActivity().runOnUiThread(() -> {
                Toast.makeText(c, "Saved: Downloads/YQI/" + name, Toast.LENGTH_LONG).show();
                try {
                    Intent i = new Intent(Intent.ACTION_VIEW);
                    i.setDataAndType(u, mime);
                    i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                    c.startActivity(i);
                } catch (Exception e) { }
            });
            call.resolve();
        } catch (Exception e) {
            call.reject("save failed: " + e.getMessage());
        }
    }

    // ---------- app version + one-tap update ----------
    @PluginMethod
    public void info(PluginCall call) {
        JSObject o = new JSObject();
        try {
            PackageInfo pi = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            o.put("code", Build.VERSION.SDK_INT >= 28 ? (int) pi.getLongVersionCode() : pi.versionCode);
            o.put("name", pi.versionName);
        } catch (Exception e) { o.put("code", 0); }
        o.put("bio", bioOk());
        call.resolve(o);
    }

    @PluginMethod
    public void update(PluginCall call) {
        final String url = call.getString("url", "");
        final Context c = getContext();
        if (Build.VERSION.SDK_INT >= 26 && !c.getPackageManager().canRequestPackageInstalls()) {
            Intent i = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + c.getPackageName()));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            try { c.startActivity(i); } catch (Exception e) { }
            call.reject("allow");
            return;
        }
        new Thread(() -> {
            try {
                File f = new File(c.getCacheDir(), "YQI-update.apk");
                HttpURLConnection h = (HttpURLConnection) new URL(url).openConnection();
                h.setInstanceFollowRedirects(true);
                h.connect();
                int n = h.getContentLength(), got = 0, last = -1;
                try (InputStream in = h.getInputStream(); FileOutputStream o = new FileOutputStream(f)) {
                    byte[] b = new byte[65536]; int r;
                    while ((r = in.read(b)) > 0) {
                        o.write(b, 0, r); got += r;
                        int p = n > 0 ? (int) (got * 100L / n) : 0;
                        if (p != last) { last = p; JSObject ev = new JSObject(); ev.put("p", p); notifyListeners("updProgress", ev); }
                    }
                }
                Uri u = FileProvider.getUriForFile(c, c.getPackageName() + ".fileprovider", f);
                Intent i = new Intent(Intent.ACTION_VIEW);
                i.setDataAndType(u, "application/vnd.android.package-archive");
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                c.startActivity(i);
                call.resolve();
            } catch (Exception e) { call.reject("download failed: " + e.getMessage()); }
        }).start();
    }

    // ---------- fingerprint / face / phone PIN lock ----------
    private int auths() { return Build.VERSION.SDK_INT >= 30 ? (BiometricManager.Authenticators.BIOMETRIC_WEAK | BiometricManager.Authenticators.DEVICE_CREDENTIAL) : BiometricManager.Authenticators.BIOMETRIC_WEAK; }
    private boolean bioOk() { try { return BiometricManager.from(getContext()).canAuthenticate(auths()) == BiometricManager.BIOMETRIC_SUCCESS; } catch (Exception e) { return false; } }

    @PluginMethod
    public void bio(PluginCall call) {
        if (!bioOk()) { call.reject("none"); return; }
        getActivity().runOnUiThread(() -> {
            try {
                BiometricPrompt bp = new BiometricPrompt(getActivity(), ContextCompat.getMainExecutor(getContext()), new BiometricPrompt.AuthenticationCallback() {
                    @Override public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult r) { call.resolve(); }
                    @Override public void onAuthenticationError(int code, CharSequence msg) { call.reject(String.valueOf(msg)); }
                });
                BiometricPrompt.PromptInfo.Builder b = new BiometricPrompt.PromptInfo.Builder().setTitle("Unlock YQI").setSubtitle("Use your fingerprint, face or phone lock").setAllowedAuthenticators(auths());
                if (Build.VERSION.SDK_INT < 30) b.setNegativeButtonText("Cancel");
                bp.authenticate(b.build());
            } catch (Exception e) { call.reject(e.getMessage()); }
        });
    }

    // ---------- Jarvis voice: Android speech recognition (WebView has no SpeechRecognition) ----------
    private SpeechRecognizer sr;
    @PluginMethod
    public void listen(PluginCall call) {
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) { requestPermissionForAlias("mic", call, "micCb"); return; }
        startListen(call);
    }
    @PermissionCallback
    private void micCb(PluginCall call) {
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) startListen(call);
        else { JSObject o = new JSObject(); o.put("text", ""); o.put("error", "denied"); call.resolve(o); }
    }
    private void startListen(final PluginCall call) {
        final String lang = call.getString("lang", "ur-PK");
        getActivity().runOnUiThread(() -> {
            try {
                if (sr != null) { try { sr.destroy(); } catch (Exception e) { } sr = null; }
                if (!SpeechRecognizer.isRecognitionAvailable(getContext())) { JSObject o = new JSObject(); o.put("text", ""); o.put("error", "unavailable"); call.resolve(o); return; }
                sr = SpeechRecognizer.createSpeechRecognizer(getContext());
                Intent it = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                it.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                it.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
                it.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, lang);
                it.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
                it.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 1500L);
                sr.setRecognitionListener(new RecognitionListener() {
                    boolean done = false;
                    private void fin(String t, String err) { if (done) return; done = true; JSObject o = new JSObject(); o.put("text", t == null ? "" : t); if (err != null) o.put("error", err); call.resolve(o); }
                    @Override public void onResults(Bundle b) { ArrayList<String> r = b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION); fin(r != null && !r.isEmpty() ? r.get(0) : "", null); }
                    @Override public void onError(int e) { fin("", "e" + e); }
                    @Override public void onReadyForSpeech(Bundle p) { }
                    @Override public void onBeginningOfSpeech() { }
                    @Override public void onRmsChanged(float v) { }
                    @Override public void onBufferReceived(byte[] b) { }
                    @Override public void onEndOfSpeech() { }
                    @Override public void onPartialResults(Bundle b) { }
                    @Override public void onEvent(int t, Bundle b) { }
                });
                sr.startListening(it);
            } catch (Exception ex) { JSObject o = new JSObject(); o.put("text", ""); o.put("error", String.valueOf(ex.getMessage())); call.resolve(o); }
        });
    }
    @PluginMethod
    public void stopListen(PluginCall call) {
        getActivity().runOnUiThread(() -> { try { if (sr != null) sr.stopListening(); } catch (Exception e) { } });
        call.resolve();
    }

    // ---------- "Jarvis" wake word: keeps listening while YQI is open on screen ----------
    private SpeechRecognizer wsr;
    private boolean wakeOn = false, wakePaused = false;
    private String wakeLang = "ur-PK";
    private int savedMusic = -1, savedNotif = -1, savedSys = -1;
    private java.util.regex.Pattern wakePat = java.util.regex.Pattern.compile("(jarvis|jarwis|jervis|jaarvis|\u062c\u0627\u0631\u0648\u0633|\u062c\u0627\u0631\u0648\u06cc\u0633|\u062c\u0627\u0631\u0648\u0632|\u062c\u0627\u0631\u0633|\u091c\u093e\u0930\u094d\u0935\u093f\u0938)", java.util.regex.Pattern.CASE_INSENSITIVE);
    private void hush(boolean on) {
        try {
            AudioManager a = am();
            if (on) {
                if (savedMusic < 0) { savedMusic = a.getStreamVolume(AudioManager.STREAM_MUSIC); savedNotif = a.getStreamVolume(AudioManager.STREAM_NOTIFICATION); savedSys = a.getStreamVolume(AudioManager.STREAM_SYSTEM); }
                a.setStreamVolume(AudioManager.STREAM_MUSIC, 0, 0); a.setStreamVolume(AudioManager.STREAM_NOTIFICATION, 0, 0); a.setStreamVolume(AudioManager.STREAM_SYSTEM, 0, 0);
            } else if (savedMusic >= 0) {
                a.setStreamVolume(AudioManager.STREAM_MUSIC, savedMusic, 0); a.setStreamVolume(AudioManager.STREAM_NOTIFICATION, savedNotif, 0); a.setStreamVolume(AudioManager.STREAM_SYSTEM, savedSys, 0);
                savedMusic = -1;
            }
        } catch (Exception e) { }
    }
    @PluginMethod
    public void wakeStart(PluginCall call) {
        wakeLang = call.getString("lang", "ur-PK");
        String w = call.getString("words", "");
        if (w != null && !w.isEmpty()) { try { wakePat = java.util.regex.Pattern.compile("(" + w + ")", java.util.regex.Pattern.CASE_INSENSITIVE); } catch (Exception e) { } }
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) { requestPermissionForAlias("mic", call, "wakeCb"); return; }
        wakeOn = true; wakeLoop(); call.resolve();
    }
    @PermissionCallback
    private void wakeCb(PluginCall call) {
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) { wakeOn = true; wakeLoop(); }
        call.resolve();
    }
    @PluginMethod
    public void wakeStop(PluginCall call) { wakeOn = false; wakeKill(); call.resolve(); }
    private void wakeKill() {
        getActivity().runOnUiThread(() -> { try { if (wsr != null) { wsr.cancel(); wsr.destroy(); } } catch (Exception e) { } wsr = null; hush(false); });
    }
    private void wakeLoop() {
        if (!wakeOn || wakePaused) return;
        getActivity().runOnUiThread(() -> {
            try {
                if (!wakeOn || wakePaused) return;
                if (!SpeechRecognizer.isRecognitionAvailable(getContext())) return;
                if (wsr == null) {
                    wsr = SpeechRecognizer.createSpeechRecognizer(getContext());
                    wsr.setRecognitionListener(new RecognitionListener() {
                        private boolean check(Bundle b, boolean fin) {
                            ArrayList<String> r = b == null ? null : b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                            if (r == null || r.isEmpty()) return false;
                            String t = r.get(0); java.util.regex.Matcher m = wakePat.matcher(t);
                            if (!m.find()) return false;
                            if (!fin) return true; // wait for the full sentence
                            String rest = t.substring(m.end()).replaceAll("^[\\s,.!?\u060c]+", "").trim();
                            wakeOn = false; hush(false);
                            JSObject o = new JSObject(); o.put("said", rest); notifyListeners("wake", o);
                            try { wsr.destroy(); } catch (Exception e) { } wsr = null;
                            return true;
                        }
                        @Override public void onResults(Bundle b) { if (!check(b, true)) again(); }
                        @Override public void onPartialResults(Bundle b) { check(b, false); }
                        @Override public void onError(int e) { again(); }
                        @Override public void onReadyForSpeech(Bundle p) { }
                        @Override public void onBeginningOfSpeech() { }
                        @Override public void onRmsChanged(float v) { }
                        @Override public void onBufferReceived(byte[] b) { }
                        @Override public void onEndOfSpeech() { }
                        @Override public void onEvent(int t, Bundle b) { }
                        private void again() { if (wakeOn && !wakePaused) getBridge().getWebView().postDelayed(() -> wakeLoop(), 250); }
                    });
                }
                Intent it = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                it.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                it.putExtra(RecognizerIntent.EXTRA_LANGUAGE, wakeLang);
                it.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
                it.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
                hush(true);
                wsr.startListening(it);
            } catch (Exception ex) { }
        });
    }
    @Override
    protected void handleOnPause() { super.handleOnPause(); wakePaused = true; if (wsr != null) wakeKill(); }
    @Override
    protected void handleOnResume() { super.handleOnResume(); wakePaused = false; if (wakeOn) wakeLoop(); }
}
