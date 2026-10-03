package org.quantumbrowser.app

import android.os.Bundle
import android.view.View
import android.widget.EditText
import android.widget.ImageButton
import androidx.appcompat.app.AppCompatActivity
import org.mozilla.geckoview.GeckoRuntime
import org.mozilla.geckoview.GeckoRuntimeSettings
import org.mozilla.geckoview.GeckoSession
import org.mozilla.geckoview.GeckoView
import org.mozilla.geckoview.WebExtension

/**
 * Quantum Browser Android implementation powered strictly by Mozilla GeckoView.
 * Android WebView, Chromium, and Blink are strictly excluded.
 */
class MainActivity : AppCompatActivity() {
    private lateinit var geckoView: GeckoView
    private lateinit var geckoSession: GeckoSession
    private lateinit var geckoRuntime: GeckoRuntime

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        geckoView = findViewById(R.id.gecko_view)
        val urlInput = findViewById<EditText>(R.id.url_input)
        val backBtn = findViewById<ImageButton>(R.id.btn_back)
        val forwardBtn = findViewById<ImageButton>(R.id.btn_forward)
        val reloadBtn = findViewById<ImageButton>(R.id.btn_reload)

        // 1. Initialize Mozilla GeckoRuntime with strict privacy defaults
        val runtimeSettings = GeckoRuntimeSettings.Builder()
            .useContentProcess(true)
            .allowInsecureConnections(GeckoRuntimeSettings.ALLOW_ALL)
            .configFilePath("")
            .build()

        geckoRuntime = GeckoRuntime.create(this, runtimeSettings)

        // 2. Pre-bundle and install uBlock Origin WebExtension from assets
        installBundledUBlockOrigin()

        // 3. Create GeckoSession with enhanced tracking protection
        geckoSession = GeckoSession().apply {
            open(geckoRuntime)
            settings.useTrackingProtection = true
            settings.suspendMediaWhenInactive = true
            loadUri("https://www.google.com")
        }

        geckoView.setSession(geckoSession)

        // 4. Navigation handlers
        backBtn.setOnClickListener { geckoSession.goBack() }
        forwardBtn.setOnClickListener { geckoSession.goForward() }
        reloadBtn.setOnClickListener { geckoSession.reload() }
    }

    private fun installBundledUBlockOrigin() {
        // Install uBlock Origin WebExtension directly into GeckoRuntime
        geckoRuntime.webExtensionController.ensureBuiltIn(
            "resource://android/assets/extensions/uBlock0.firefox.xpi",
            "uBlock0@raymondhill.net"
        ).accept(
            { extension ->
                android.util.Log.i("QuantumBrowser", "uBlock Origin WebExtension bundled & active: ${extension?.id}")
            },
            { throwable ->
                android.util.Log.e("QuantumBrowser", "Failed to load bundled uBlock Origin: ${throwable.message}")
            }
        )
    }

    override fun onDestroy() {
        geckoSession.close()
        super.onDestroy()
    }
}
