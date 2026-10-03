# Quantum Browser Proguard rules
# Preserve Mozilla GeckoView classes and interfaces for ARM64 release

-keep class org.mozilla.geckoview.** { *; }
-keep interface org.mozilla.geckoview.** { *; }
-dontwarn org.mozilla.geckoview.**

-keep class org.quantumbrowser.app.** { *; }
