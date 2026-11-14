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
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

@CapacitorPlugin(name = "YqNative", permissions = {
    @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
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
}
