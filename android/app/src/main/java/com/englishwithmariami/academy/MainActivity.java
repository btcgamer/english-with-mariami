package com.englishwithmariami.academy;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MariamiBillingPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
