package com.yunustextile.yqi;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(YqNativePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
