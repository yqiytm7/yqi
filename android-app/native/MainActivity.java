package com.yunustextile.yqi;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(YqNativePlugin.class);
        super.onCreate(savedInstanceState);

        // Notification channels used by push messages (messages, calls)
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = getSystemService(NotificationManager.class);
            NotificationChannel m = new NotificationChannel("yqi_msg", "YQI messages", NotificationManager.IMPORTANCE_HIGH);
            m.enableVibration(true);
            nm.createNotificationChannel(m);
            NotificationChannel c = new NotificationChannel("yqi_call", "YQI calls", NotificationManager.IMPORTANCE_HIGH);
            c.enableVibration(true);
            c.setVibrationPattern(new long[]{0, 600, 300, 600, 300, 600});
            c.setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE), new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
            nm.createNotificationChannel(c);
        }

        // Draw behind the bars ourselves and keep the page clear of status bar, nav bar and the keyboard.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(0xFF0E240E);
        getWindow().setNavigationBarColor(0xFF0E240E);
        WindowInsetsControllerCompat wc = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        wc.setAppearanceLightStatusBars(false);
        wc.setAppearanceLightNavigationBars(false);

        final WebView wv = getBridge().getWebView();
        ViewCompat.setOnApplyWindowInsetsListener(wv, (v, insets) -> {
            Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
            ViewGroup.MarginLayoutParams lp = (ViewGroup.MarginLayoutParams) v.getLayoutParams();
            lp.leftMargin = bars.left;
            lp.rightMargin = bars.right;
            lp.topMargin = bars.top;
            lp.bottomMargin = Math.max(bars.bottom, ime.bottom);
            v.setLayoutParams(lp);
            return WindowInsetsCompat.CONSUMED;
        });

        // Phone back: one step back inside YQI (chat, sheets, pages). At the start screen keep the app alive, like WhatsApp.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                wv.evaluateJavascript("(function(){try{return !!(window.YQBACK&&window.YQBACK.back());}catch(e){return false}})()", r -> {
                    if (!"true".equals(r)) moveTaskToBack(true);
                });
            }
        });
    }
}
