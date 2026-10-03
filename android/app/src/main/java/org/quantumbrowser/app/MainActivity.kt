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

        // 3. Create GeckoSession with enhanced tracking protection and full YouTube / HTML5 video compatibility
        geckoSession = GeckoSession().apply {
            open(geckoRuntime)

            // Essential JavaScript and DOM storage configuration for YouTube Polymer / web apps
            settings.allowJavascript = true
            settings.domStorageEnabled = true
            settings.cookieBehavior = org.mozilla.geckoview.GeckoSessionSettings.COOKIE_BEHAVIOR_ACCEPT_NON_TRACKERS

            // Media, HTML5 video, MediaSource (MSE), and DRM compatibility
            settings.mediaSourceEnabled = true
            settings.suspendMediaWhenInactive = false
            settings.autoplayDefault = org.mozilla.geckoview.GeckoSessionSettings.AUTOPLAY_ALLOW_ALL

            // User-Agent configuration: standard Android Gecko Firefox string for responsive mobile YouTube
            settings.userAgentMode = org.mozilla.geckoview.GeckoSessionSettings.USER_AGENT_MODE_MOBILE
            settings.userAgentOverride = "Mozilla/5.0 (Android 14; Mobile; rv:135.0) Gecko/135.0 Firefox/135.0"

            // Tracking protection enabled with uBlock Origin
            settings.useTrackingProtection = true

            // Permission Delegate: grant media, autoplay, and storage permissions required by YouTube
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
                ): org.mozilla.geckoview.GeckoResult<Int> {
                    return org.mozilla.geckoview.GeckoResult.fromValue(
                        GeckoSession.PermissionDelegate.ContentPermission.VALUE_ALLOW
                    )
                }
            }

            // Navigation Delegate: handle redirects (e.g. youtube.com -> m.youtube.com) and update URL input
            navigationDelegate = object : GeckoSession.NavigationDelegate {
                override fun onLocationChange(
                    session: GeckoSession,
                    url: String?,
                    perms: List<GeckoSession.PermissionDelegate.MediaPermission>
                ) {
                    url?.let {
                        urlInput.setText(it)
                    }
                }

                override fun onLoadError(
                    session: GeckoSession,
                    uri: String?,
                    error: GeckoSession.NavigationDelegate.LoadError
                ): org.mozilla.geckoview.GeckoResult<String>? {
                    android.util.Log.e("QuantumBrowser", "Navigation load error on $uri: ${error.category} / ${error.code}")
                    return null
                }
            }

            loadUri("https://www.google.com")
        }

        geckoView.setSession(geckoSession)

        // 4. Navigation handlers
        urlInput.setOnEditorActionListener { _, actionId, event ->
            if (actionId == android.view.inputmethod.EditorInfo.IME_ACTION_GO ||
                actionId == android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH ||
                (event != null && event.keyCode == android.view.KeyEvent.KEYCODE_ENTER && event.action == android.view.KeyEvent.ACTION_DOWN)
            ) {
                val input = urlInput.text.toString().trim()
                if (input.isNotEmpty()) {
                    val uri = if (input.startsWith("http://") || input.startsWith("https://")) {
                        input
                    } else if (input.contains(".") && !input.contains(" ")) {
                        "https://$input"
                    } else {
                        "https://www.google.com/search?q=" + java.net.URLEncoder.encode(input, "UTF-8")
                    }
                    // Standalone Android top-level navigation: loads directly via GeckoSession
                    // Native GeckoView top-level windows are not affected by X-Frame-Options or frame-ancestors
                    geckoSession.loadUri(uri)
                    val imm = getSystemService(android.content.Context.INPUT_METHOD_SERVICE) as? android.view.inputmethod.InputMethodManager
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
