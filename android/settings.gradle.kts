pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        // Mozilla Maven repository for official GeckoView binaries
        maven {
            url = java.net.URI("https://maven.mozilla.org/maven2/")
        }
    }
}

rootProject.name = "QuantumBrowser"
include(":app")
