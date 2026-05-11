// Native plugin integration for iOS and Android (Capacitor)
// This file is safe to import on web — all calls are no-ops outside a native app.

import { Capacitor } from "@capacitor/core";

const isNative = Capacitor.isNativePlatform();

// ─── Status Bar ───────────────────────────────────────────────
export async function initStatusBar() {
  if (!isNative) return;
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#1a1d24" });
  } catch (e) {
    console.warn("StatusBar:", e);
  }
}

// ─── Splash Screen ────────────────────────────────────────────
export async function hideSplash() {
  if (!isNative) return;
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch (e) {
    console.warn("SplashScreen:", e);
  }
}

// ─── Push Notifications ───────────────────────────────────────
export async function initPushNotifications(onMessage) {
  if (!isNative) return;
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== "granted") return;

    await PushNotifications.register();

    PushNotifications.addListener("registration", (token) => {
      console.log("Push token:", token.value);
      // TODO: store token in Supabase profiles for server-side push
    });

    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      if (onMessage) onMessage(notification);
    });

    PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      const data = action.notification.data;
      if (data?.view && onMessage) onMessage({ action: data.view, data });
    });
  } catch (e) {
    console.warn("PushNotifications:", e);
  }
}

// ─── App lifecycle (back button on Android) ───────────────────
export async function initAppListeners({ onBack }) {
  if (!isNative) return;
  try {
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else if (onBack) onBack();
    });
  } catch (e) {
    console.warn("App:", e);
  }
}
