import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const TelegramContext = createContext(null);

export function TelegramProvider({ children }) {
  const [tg, setTg] = useState(null);
  const [isTelegram, setIsTelegram] = useState(false);
  const [user, setUser] = useState(null);
  const [colorScheme, setColorScheme] = useState("dark");
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800
  );

  const mainButtonClickRef = useRef(null);
  const backButtonClickRef = useRef(null);

  useEffect(() => {
    const webApp = typeof window !== "undefined" ? window.Telegram?.WebApp : null;

    if (webApp) {
      setTg(webApp);
      // If initData is present or platform is not unknown, we are in Telegram
      const hasInitData = Boolean(webApp.initData && webApp.initData.length > 0);
      const isKnownPlatform = webApp.platform && webApp.platform !== "unknown";
      const insideTelegram = hasInitData || isKnownPlatform;

      setIsTelegram(Boolean(insideTelegram));

      if (webApp.initDataUnsafe?.user) {
        setUser(webApp.initDataUnsafe.user);
      }

      if (webApp.colorScheme) {
        setColorScheme(webApp.colorScheme);
      }

      if (webApp.viewportHeight) {
        setViewportHeight(webApp.viewportHeight);
      }

      try {
        webApp.ready();
        webApp.expand();

        // Style the Telegram chrome to match our dark studio design
        if (webApp.setHeaderColor) {
          webApp.setHeaderColor("#090909");
        }
        if (webApp.setBackgroundColor) {
          webApp.setBackgroundColor("#090909");
        }
        if (webApp.enableClosingConfirmation) {
          webApp.enableClosingConfirmation();
        }
      } catch (err) {
        console.warn("[Telegram] Error during WebApp initialization:", err);
      }

      // Handle viewport resize
      const handleViewportChanged = () => {
        if (webApp.viewportHeight) {
          setViewportHeight(webApp.viewportHeight);
        }
      };

      webApp.onEvent?.("viewportChanged", handleViewportChanged);

      return () => {
        webApp.offEvent?.("viewportChanged", handleViewportChanged);
      };
    }
  }, []);

  // Haptic feedback utilities
  const hapticFeedback = useMemo(() => {
    return {
      impact: (style = "medium") => {
        try {
          tg?.HapticFeedback?.impactOccurred(style);
        } catch {
          // No-op outside Telegram
        }
      },
      notification: (type = "success") => {
        try {
          tg?.HapticFeedback?.notificationOccurred(type);
        } catch {
          // No-op outside Telegram
        }
      },
      selection: () => {
        try {
          tg?.HapticFeedback?.selectionChanged();
        } catch {
          // No-op outside Telegram
        }
      },
    };
  }, [tg]);

  // MainButton manager (Telegram native bottom action button)
  const mainButton = useMemo(() => {
    return {
      show: ({
        text = "CONTINUE",
        onClick,
        color = "#d6a85f",
        textColor = "#090909",
        isProgress = false,
        isEnabled = true,
      }) => {
        if (!tg?.MainButton) return;

        tg.MainButton.setText(text);
        tg.MainButton.setParams({
          color,
          text_color: textColor,
          is_active: isEnabled,
          is_visible: true,
        });

        if (isProgress) {
          tg.MainButton.showProgress(false);
        } else {
          tg.MainButton.hideProgress();
        }

        if (onClick) {
          if (mainButtonClickRef.current) {
            tg.MainButton.offClick(mainButtonClickRef.current);
          }
          mainButtonClickRef.current = onClick;
          tg.MainButton.onClick(onClick);
        }

        tg.MainButton.show();
      },
      hide: () => {
        if (!tg?.MainButton) return;
        if (mainButtonClickRef.current) {
          tg.MainButton.offClick(mainButtonClickRef.current);
          mainButtonClickRef.current = null;
        }
        tg.MainButton.hide();
      },
      showProgress: (leaveActive = false) => {
        tg?.MainButton?.showProgress(leaveActive);
      },
      hideProgress: () => {
        tg?.MainButton?.hideProgress();
      },
    };
  }, [tg]);

  // BackButton manager (Telegram native top-left back button)
  const backButton = useMemo(() => {
    return {
      show: (onClick) => {
        if (!tg?.BackButton) return;

        if (onClick) {
          if (backButtonClickRef.current) {
            tg.BackButton.offClick(backButtonClickRef.current);
          }
          backButtonClickRef.current = onClick;
          tg.BackButton.onClick(onClick);
        }

        tg.BackButton.show();
      },
      hide: () => {
        if (!tg?.BackButton) return;
        if (backButtonClickRef.current) {
          tg.BackButton.offClick(backButtonClickRef.current);
          backButtonClickRef.current = null;
        }
        tg.BackButton.hide();
      },
    };
  }, [tg]);

  // Send data back to Telegram bot
  const sendData = (data) => {
    if (tg?.sendData) {
      try {
        const payload = typeof data === "string" ? data : JSON.stringify(data);
        tg.sendData(payload);
        return true;
      } catch (err) {
        console.warn("[Telegram] sendData failed:", err);
      }
    }
    return false;
  };

  // Close Mini App
  const close = () => {
    if (tg?.close) {
      tg.close();
    }
  };

  // Show Alert
  const showAlert = (message, callback) => {
    if (tg?.showAlert) {
      tg.showAlert(message, callback);
    } else {
      window.alert(message);
      if (callback) callback();
    }
  };

  // Show Confirm
  const showConfirm = (message, callback) => {
    if (tg?.showConfirm) {
      tg.showConfirm(message, callback);
    } else {
      const result = window.confirm(message);
      if (callback) callback(result);
    }
  };

  // Open Telegram link
  const openTelegramLink = (url) => {
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(url);
    } else {
      window.open(url, "_blank");
    }
  };

  const value = {
    tg,
    isTelegram,
    user,
    colorScheme,
    viewportHeight,
    themeParams: tg?.themeParams || {},
    hapticFeedback,
    mainButton,
    backButton,
    sendData,
    close,
    showAlert,
    showConfirm,
    openTelegramLink,
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    return {
      tg: null,
      isTelegram: false,
      user: null,
      colorScheme: "dark",
      viewportHeight: typeof window !== "undefined" ? window.innerHeight : 800,
      themeParams: {},
      hapticFeedback: {
        impact: () => {},
        notification: () => {},
        selection: () => {},
      },
      mainButton: {
        show: () => {},
        hide: () => {},
        showProgress: () => {},
        hideProgress: () => {},
      },
      backButton: {
        show: () => {},
        hide: () => {},
      },
      sendData: () => false,
      close: () => {},
      showAlert: (msg, cb) => {
        window.alert(msg);
        if (cb) cb();
      },
      showConfirm: (msg, cb) => {
        const res = window.confirm(msg);
        if (cb) cb(res);
      },
      openTelegramLink: (url) => window.open(url, "_blank"),
    };
  }
  return context;
}
