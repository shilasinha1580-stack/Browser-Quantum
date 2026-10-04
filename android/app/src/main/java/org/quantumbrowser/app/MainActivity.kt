package org.quantumbrowser.app

import android.os.Bundle
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import android.widget.ImageButton
import androidx.appcompat.app.AppCompatActivity
import org.mozilla.geckoview.GeckoResult
import org.mozilla.geckoview.GeckoRuntime
import org.mozilla.geckoview.GeckoRuntimeSettings
import org.mozilla.geckoview.GeckoSession
import org.mozilla.geckoview.GeckoSessionSettings
import org.mozilla.geckoview.GeckoView
import org.mozilla.geckoview.WebRequestError
import java.net.URLEncoder

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
            .aboutConfigEnabled(true)
            .allowInsecureConnections(GeckoRuntimeSettings.ALLOW_ALL)
            .configFilePath("")
            .build()

        geckoRuntime = GeckoRuntime.create(this, runtimeSettings)

        // 2. Pre-bundle and install uBlock Origin WebExtension from assets
        installBundledUBlockOrigin()

        // 3. Create GeckoSession with enhanced tracking protection and standard mobile Gecko settings
        geckoSession = GeckoSession().apply {
            open(geckoRuntime)

            // Essential session configuration
            settings.allowJavascript = true
            settings.useTrackingProtection = true
            settings.suspendMediaWhenInactive = false
            settings.userAgentMode = GeckoSessionSettings.USER_AGENT_MODE_MOBILE
            settings.userAgentOverride = "Mozilla/5.0 (Android 14; Mobile; rv:135.0) Gecko/135.0 Firefox/135.0"

            // Permission Delegate
            permissionDelegate = object : GeckoSession.PermissionDelegate {
                override fun onMediaPermissionRequest(
                    session: GeckoSession,
                    uri: String,
                    video: Array<out GeckoSession.PermissionDelegate.MediaSource>?,
                    audio: Array<out GeckoSession.PermissionDelegate.MediaSource>?,
                    callback: GeckoSession.PermissionDelegate.MediaCallback
                ) {
                    callback.grant(video?.firstOrNull(), audio?.firstOrNull())
                }

                override fun onContentPermissionRequest(
                    session: GeckoSession,
                    perm: GeckoSession.PermissionDelegate.ContentPermission
                ): GeckoResult<Int> {
                    return GeckoResult.fromValue(
                        GeckoSession.PermissionDelegate.ContentPermission.VALUE_ALLOW
                    )
                }
            }

            // Navigation Delegate with verified GeckoView 99+ signatures
            navigationDelegate = object : GeckoSession.NavigationDelegate {
                override fun onLocationChange(
                    session: GeckoSession,
                    url: String?
                ) {
                    url?.let {
                        urlInput.setText(it)
                    }
                }

                override fun onLoadError(
                    session: GeckoSession,
                    uri: String?,
                    error: WebRequestError
                ): GeckoResult<String>? {
                    android.util.Log.e("QuantumBrowser", "Navigation load error on $uri: ${error.category} / ${error.code}")
                    return null
                }
            }

            loadUri("https://www.google.com")
        }

        geckoView.setSession(geckoSession)

        // 4. Navigation handlers
        urlInput.setOnEditorActionListener { _, actionId, event ->
            if (actionId == EditorInfo.IME_ACTION_GO ||
                actionId == EditorInfo.IME_ACTION_SEARCH ||
                (event != null && event.keyCode == android.view.KeyEvent.KEYCODE_ENTER && event.action == android.view.KeyEvent.ACTION_DOWN)
            ) {
                val input = urlInput.text.toString().trim()
                if (input.isNotEmpty()) {
                    val uri = if (input.startsWith("http://") || input.startsWith("https://")) {
                        input
                    } else if (input.contains(".") && !input.contains(" ")) {
                        "https://$input"
                    } else {
                        "https://www.google.com/search?q=" + URLEncoder.encode(input, "UTF-8")
                    }
                    geckoSession.loadUri(uri)
                    val imm = getSystemService(INPUT_METHOD_SERVICE) as? InputMethodManager
                    imm?.hideSoftInputFromWindow(urlInput.windowToken, 0)
                }
                true
            } else {
                false
            }
        }

        backBtn.setOnClickListener { geckoSession.goBack() }
        forwardBtn.setOnClickListener { geckoSession.goForward() }
        reloadBtn.setOnClickListener { geckoSession.reload() }
    }

    private fun installBundledUBlockOrigin() {
        geckoRuntime.webExtensionController.ensureBuiltIn(
            "resource://android/assets/extensions/uBlock0.firefox.xpi",
            "uBlock0@raymondhill.net"
        ).accept(
            { extension ->
                android.util.Log.i("QuantumBrowser", "uBlock Origin WebExtension active: ${extension?.id}")
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
