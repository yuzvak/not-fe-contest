interface TelegramWebAppUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

interface SafeAreaInset {
  top: number
  bottom: number
  left: number
  right: number
}

interface TelegramThemeParams {
  accent_text_color?: string
  bg_color?: string
  button_color?: string
  button_text_color?: string
  bottom_bar_bg_color?: string
  destructive_text_color?: string
  header_bg_color?: string
  hint_color?: string
  link_color?: string
  secondary_bg_color?: string
  section_bg_color?: string
  section_header_text_color?: string
  subtitle_text_color?: string
  text_color?: string
}

interface TelegramWebApp {
  ready: () => void
  expand: () => void
  close: () => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  safeAreaInset: SafeAreaInset
  contentSafeAreaInset: SafeAreaInset
  colorScheme: "light" | "dark"
  themeParams: TelegramThemeParams
  initData: string
  initDataUnsafe: {
    user?: TelegramWebAppUser
    chat_type?: string
    auth_date?: number
    hash?: string
  }
  version: string
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
    setParams: (params: {
      text?: string
      color?: string
      text_color?: string
      is_active?: boolean
      is_visible?: boolean
    }) => void
  }
  BackButton: {
    isVisible: boolean
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
  }
  HapticFeedback: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void
    notificationOccurred: (type: "error" | "success" | "warning") => void
    selectionChanged: () => void
  }
  onEvent: (eventType: string, eventHandler: (data?: any) => void) => void
  offEvent: (eventType: string, eventHandler: (data?: any) => void) => void
  sendData: (data: string) => void
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void
  openTelegramLink: (url: string) => void
  showPopup: (
    params: {
      title?: string
      message: string
      buttons?: Array<{
        id?: string
        type?: "default" | "ok" | "close" | "cancel" | "destructive"
        text?: string
      }>
    },
    callback?: (buttonId: string) => void,
  ) => void
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
  showScanQrPopup: (
    params: {
      text?: string
    },
    callback?: (text: string) => boolean,
  ) => void
  closeScanQrPopup: () => void
  requestFullscreen?: () => void
  disableVerticalSwipe?: () => void
  exitFullscreen?: () => void
  requestTheme?: () => void
  setHeaderColor?: (color: string) => void
  setBackgroundColor?: (color: string) => void
  shareMessage?: (msgId: string, callback?: (success: boolean) => void) => void
}

export class TelegramWebAppService {
  private webApp: TelegramWebApp | null = null
  private isInitialized = false
  private themeChangeCallbacks: Array<(themeParams: TelegramThemeParams, colorScheme: "light" | "dark") => void> = []
  private currentBackButtonCallback: (() => void | boolean) | null = null

  constructor() {
    
  }

  private waitForTelegram(): Promise<TelegramWebApp> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("Window is not available"))
        return
      }

      if (window.Telegram?.WebApp) {
        console.log("Telegram WebApp found immediately")
        resolve(window.Telegram.WebApp)
        return
      }

      let attempts = 0
      const maxAttempts = 50

      const pollForTelegram = () => {
        attempts++

        if (window.Telegram?.WebApp) {
          console.log(`Telegram WebApp found after ${attempts} attempts`)
          resolve(window.Telegram.WebApp)
        } else if (attempts >= maxAttempts) {
          console.warn("Telegram WebApp not found after maximum attempts")
          reject(new Error("Telegram WebApp script failed to load"))
        } else {
          setTimeout(pollForTelegram, 100)
        }
      }

      pollForTelegram()
    })
  }

  private getVersion(): string {
    return this.webApp?.version || "6.0"
  }

  private isVersionSupported(minVersion: string): boolean {
    const currentVersion = this.getVersion()
    const current = currentVersion.split(".").map(Number)
    const min = minVersion.split(".").map(Number)

    for (let i = 0; i < Math.max(current.length, min.length); i++) {
      const currentPart = current[i] || 0
      const minPart = min[i] || 0

      if (currentPart > minPart) return true
      if (currentPart < minPart) return false
    }

    return true
  }

  async init(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("Starting Telegram WebApp initialization...")
      this.webApp = await this.waitForTelegram()

      if (this.webApp) {
        console.log("Telegram WebApp object obtained, calling ready()...")
        console.log("Telegram WebApp version:", this.getVersion())

        this.webApp.ready()

        this.webApp.expand()

        this.webApp.enableClosingConfirmation()

        this.setupTheme()
        this.setupSafeArea()
        this.setupThemeListener()

        this.requestTheme()

        this.isInitialized = true

        console.log("Telegram WebApp initialized successfully:", {
          version: this.getVersion(),
          isExpanded: this.webApp.isExpanded,
          viewportHeight: this.webApp.viewportHeight,
          colorScheme: this.webApp.colorScheme,
          themeParams: this.webApp.themeParams,
          safeAreaInset: this.webApp.safeAreaInset,
          contentSafeAreaInset: this.webApp.contentSafeAreaInset,
          user: this.webApp.initDataUnsafe?.user,
        })
      }
    } catch (error) {
      console.warn("Failed to initialize Telegram WebApp:", error)
      this.isInitialized = true
    }
  }

  private setupTheme(): void {
    if (!this.webApp || typeof document === "undefined") return

    try {
      this.applyTheme(this.webApp.themeParams, this.webApp.colorScheme)
    } catch (error) {
      console.warn("Failed to setup theme:", error)
    }
  }

  private applyTheme(themeParams: TelegramThemeParams, colorScheme: "light" | "dark"): void {
    if (typeof document === "undefined") return

    try {
      const root = document.documentElement

      root.setAttribute("data-theme", colorScheme)

      if (themeParams.bg_color) {
        root.style.setProperty("--tg-bg-color", themeParams.bg_color)
        root.style.setProperty("--background", this.hexToHsl(themeParams.bg_color))
      }

      if (themeParams.text_color) {
        root.style.setProperty("--tg-text-color", themeParams.text_color)
        root.style.setProperty("--foreground", this.hexToHsl(themeParams.text_color))
      }

      if (themeParams.button_color) {
        root.style.setProperty("--tg-button-color", themeParams.button_color)
        root.style.setProperty("--primary", this.hexToHsl(themeParams.button_color))
      }

      if (themeParams.button_text_color) {
        root.style.setProperty("--tg-button-text-color", themeParams.button_text_color)
        root.style.setProperty("--primary-foreground", this.hexToHsl(themeParams.button_text_color))
      }

      if (themeParams.secondary_bg_color) {
        root.style.setProperty("--tg-secondary-bg-color", themeParams.secondary_bg_color)
        root.style.setProperty("--card", this.hexToHsl(themeParams.secondary_bg_color))
        root.style.setProperty("--popover", this.hexToHsl(themeParams.secondary_bg_color))
      }

      if (themeParams.hint_color) {
        root.style.setProperty("--tg-hint-color", themeParams.hint_color)
        root.style.setProperty("--muted-foreground", this.hexToHsl(themeParams.hint_color))
      }

      if (themeParams.link_color) {
        root.style.setProperty("--tg-link-color", themeParams.link_color)
        root.style.setProperty("--accent", this.hexToHsl(themeParams.link_color))
      }

      if (themeParams.destructive_text_color) {
        root.style.setProperty("--tg-destructive-color", themeParams.destructive_text_color)
        root.style.setProperty("--destructive", this.hexToHsl(themeParams.destructive_text_color))
      }

      if (themeParams.header_bg_color) {
        root.style.setProperty("--tg-header-bg-color", themeParams.header_bg_color)
      }

      if (themeParams.bottom_bar_bg_color) {
        root.style.setProperty("--tg-bottom-bar-bg-color", themeParams.bottom_bar_bg_color)
      }

      if (this.webApp?.setHeaderColor && themeParams.header_bg_color) {
        this.webApp.setHeaderColor(themeParams.header_bg_color)
      }

      if (this.webApp?.setBackgroundColor && themeParams.bg_color) {
        this.webApp.setBackgroundColor(themeParams.bg_color)
      }

      console.log("✅ Theme applied successfully:", {
        colorScheme,
        themeParams,
      })
    } catch (error) {
      console.warn("Failed to apply theme:", error)
    }
  }

  private hexToHsl(hex: string): string {
    const r = Number.parseInt(hex.slice(1, 3), 16) / 255
    const g = Number.parseInt(hex.slice(3, 5), 16) / 255
    const b = Number.parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
  }

  private setupThemeListener(): void {
    if (!this.webApp) return

    try {
      const handleThemeChange = (data: any) => {
        console.log("🎨 Theme changed:", data)

        if (data && data.theme_params) {
          this.applyTheme(data.theme_params, this.webApp?.colorScheme || "dark")

          this.themeChangeCallbacks.forEach((callback) => {
            try {
              callback(data.theme_params, this.webApp?.colorScheme || "dark")
            } catch (error) {
              console.warn("Theme change callback error:", error)
            }
          })
        }
      }

      this.webApp.onEvent("theme_changed", handleThemeChange)

      console.log("✅ Theme listener setup successfully")
    } catch (error) {
      console.warn("Failed to setup theme listener:", error)
    }
  }

  private setupSafeArea(): void {
    if (!this.webApp || typeof document === "undefined") return

    try {
      const root = document.documentElement

      if (this.webApp.safeAreaInset) {
        const { top, bottom, left, right } = this.webApp.safeAreaInset
        root.style.setProperty("--tg-safe-area-inset-top", `${top}px`)
        root.style.setProperty("--tg-safe-area-inset-bottom", `${bottom}px`)
        root.style.setProperty("--tg-safe-area-inset-left", `${left}px`)
        root.style.setProperty("--tg-safe-area-inset-right", `${right}px`)

        console.log("Safe area insets applied:", { top, bottom, left, right })
      }

      if (this.webApp.contentSafeAreaInset) {
        const { top, bottom, left, right } = this.webApp.contentSafeAreaInset
        root.style.setProperty("--tg-content-safe-area-inset-top", `${top}px`)
        root.style.setProperty("--tg-content-safe-area-inset-bottom", `${bottom}px`)
        root.style.setProperty("--tg-content-safe-area-inset-left", `${left}px`)
        root.style.setProperty("--tg-content-safe-area-inset-right", `${right}px`)

        console.log("Content safe area insets applied:", { top, bottom, left, right })
      }

      if (!this.webApp.safeAreaInset) {
        root.style.setProperty("--tg-safe-area-inset-top", "0px")
        root.style.setProperty("--tg-safe-area-inset-bottom", "0px")
        root.style.setProperty("--tg-safe-area-inset-left", "0px")
        root.style.setProperty("--tg-safe-area-inset-right", "0px")
      }

      if (!this.webApp.contentSafeAreaInset) {
        root.style.setProperty("--tg-content-safe-area-inset-top", "0px")
        root.style.setProperty("--tg-content-safe-area-inset-bottom", "0px")
        root.style.setProperty("--tg-content-safe-area-inset-left", "0px")
        root.style.setProperty("--tg-content-safe-area-inset-right", "0px")
      }
    } catch (error) {
      console.warn("Failed to setup safe area:", error)
      if (typeof document !== "undefined") {
        const root = document.documentElement
        root.style.setProperty("--tg-safe-area-inset-top", "0px")
        root.style.setProperty("--tg-safe-area-inset-bottom", "0px")
        root.style.setProperty("--tg-safe-area-inset-left", "0px")
        root.style.setProperty("--tg-safe-area-inset-right", "0px")
        root.style.setProperty("--tg-content-safe-area-inset-top", "0px")
        root.style.setProperty("--tg-content-safe-area-inset-bottom", "0px")
        root.style.setProperty("--tg-content-safe-area-inset-left", "0px")
        root.style.setProperty("--tg-content-safe-area-inset-right", "0px")
      }
    }
  }

  requestTheme(): void {
    if (!this.webApp) return

    try {
      if (typeof this.webApp.requestTheme === "function") {
        this.webApp.requestTheme()
        console.log("✅ Theme requested successfully")
      } else {
        console.warn("requestTheme method not available in this Telegram WebApp version")
      }
    } catch (error) {
      console.warn("Failed to request theme:", error)
    }
  }

  setHeaderColor(color: string): void {
    if (!this.webApp) return

    try {
      if (typeof this.webApp.setHeaderColor === "function") {
        this.webApp.setHeaderColor(color)
        console.log("✅ Header color set:", color)
      } else {
        console.warn("setHeaderColor method not available in this Telegram WebApp version")
      }
    } catch (error) {
      console.warn("Failed to set header color:", error)
    }
  }

  setBackgroundColor(color: string): void {
    if (!this.webApp) return

    try {
      if (typeof this.webApp.setBackgroundColor === "function") {
        this.webApp.setBackgroundColor(color)
        console.log("✅ Background color set:", color)
      } else {
        console.warn("setBackgroundColor method not available in this Telegram WebApp version")
      }
    } catch (error) {
      console.warn("Failed to set background color:", error)
    }
  }

  shareMessage(msgId: string, callback?: (success: boolean) => void): void {
    if (!this.webApp) {
      console.warn("Telegram WebApp not available for sharing")
      callback?.(false)
      return
    }

    try {
      if (typeof this.webApp.shareMessage === "function") {
        this.webApp.shareMessage(msgId, (success) => {
          console.log("✅ Message shared:", { msgId, success })
          callback?.(success)
        })
        console.log("✅ Share message initiated:", msgId)
      } else {
        console.warn("shareMessage method not available in this Telegram WebApp version")
        callback?.(false)
      }
    } catch (error) {
      console.warn("Failed to share message:", error)
      callback?.(false)
    }
  }

  onThemeChange(callback: (themeParams: TelegramThemeParams, colorScheme: "light" | "dark") => void): void {
    this.themeChangeCallbacks.push(callback)
  }

  offThemeChange(callback: (themeParams: TelegramThemeParams, colorScheme: "light" | "dark") => void): void {
    const index = this.themeChangeCallbacks.indexOf(callback)
    if (index > -1) {
      this.themeChangeCallbacks.splice(index, 1)
    }
  }

  getThemeParams(): TelegramThemeParams {
    return this.webApp?.themeParams || {}
  }

  getSafeAreaInset(): SafeAreaInset {
    return this.webApp?.safeAreaInset || { top: 0, bottom: 0, left: 0, right: 0 }
  }

  getContentSafeAreaInset(): SafeAreaInset {
    return this.webApp?.contentSafeAreaInset || { top: 0, bottom: 0, left: 0, right: 0 }
  }

  getUser(): TelegramWebAppUser | null {
    return this.webApp?.initDataUnsafe?.user || null
  }

  getColorScheme(): "light" | "dark" {
    return this.webApp?.colorScheme || "dark"
  }

  isExpanded(): boolean {
    return this.webApp?.isExpanded || false
  }

  expand(): void {
    if (this.webApp) {
      try {
        this.webApp.expand()
      } catch (error) {
        console.warn("Failed to expand:", error)
      }
    }
  }

  close(): void {
    if (this.webApp) {
      try {
        this.webApp.close()
      } catch (error) {
        console.warn("Failed to close:", error)
      }
    }
  }

  showMainButton(text: string, onClick: () => void): void {
    if (!this.webApp) return

    try {
      this.webApp.MainButton.setText(text)
      this.webApp.MainButton.onClick(onClick)
      this.webApp.MainButton.show()
    } catch (error) {
      console.warn("Failed to show main button:", error)
    }
  }

  hideMainButton(): void {
    if (this.webApp) {
      try {
        this.webApp.MainButton.hide()
      } catch (error) {
        console.warn("Failed to hide main button:", error)
      }
    }
  }

  requestFullscreen(): void {
    if (!this.webApp) return

    try {
      console.log("Requesting fullscreen mode...")

      if (typeof this.webApp.requestFullscreen === "function" && this.isVersionSupported("6.1")) {
        this.webApp.requestFullscreen()
        console.log("✅ Fullscreen requested successfully")
      } else {
        console.warn(
          `requestFullscreen method not available in Telegram WebApp version ${this.getVersion()}. Requires version 6.1+`,
        )
      }
    } catch (error) {
      console.warn("Failed to request fullscreen:", error)
    }
  }

  exitFullscreen(): void {
    if (!this.webApp) return

    try {
      if (typeof this.webApp.exitFullscreen === "function" && this.isVersionSupported("6.1")) {
        this.webApp.exitFullscreen()
        console.log("✅ Exited fullscreen successfully")
      } else {
        console.warn(
          `exitFullscreen method not available in Telegram WebApp version ${this.getVersion()}. Requires version 6.1+`,
        )
      }
    } catch (error) {
      console.warn("Failed to exit fullscreen:", error)
    }
  }

  showBackButton(callback: () => void | boolean): void {
    if (!this.webApp) return

    try {
      console.log("Showing back button...")

      if (this.currentBackButtonCallback) {
        this.webApp.BackButton.offClick(this.currentBackButtonCallback)
      }

      const wrappedCallback = () => {
        console.log("Back button clicked")
        try {
          const result = callback()
          console.log("Back button callback result:", result)
          return result
        } catch (error) {
          console.error("Back button callback error:", error)
          return undefined
        }
      }

      this.currentBackButtonCallback = wrappedCallback

      this.webApp.BackButton.onClick(wrappedCallback)
      this.webApp.BackButton.show()

      console.log("Back button shown successfully")
    } catch (error) {
      console.warn("Failed to show back button:", error)
    }
  }

  hideBackButton(): void {
    if (!this.webApp) return

    try {
      console.log("Hiding back button...")

      if (this.currentBackButtonCallback) {
        this.webApp.BackButton.offClick(this.currentBackButtonCallback)
        this.currentBackButtonCallback = null
      }

      this.webApp.BackButton.hide()
      console.log("Back button hidden successfully")
    } catch (error) {
      console.warn("Failed to hide back button:", error)
    }
  }

  disableVerticalSwipes(): void {
    if (!this.webApp) return
    try {
      if (typeof this.webApp.disableVerticalSwipe === "function" && this.isVersionSupported("6.1")) {
        this.webApp.disableVerticalSwipe()
        console.log("✅ Vertical swipes disabled successfully")
      }
    } catch (error) {
      console.warn("Failed to disable vertical swipes:", error)
    }
  }

  hapticFeedback(
    type: "impact" | "notification" | "selection",
    style?: "light" | "medium" | "heavy" | "error" | "success" | "warning",
  ): void {
    if (!this.webApp) return

    try {
      switch (type) {
        case "impact":
          this.webApp.HapticFeedback.impactOccurred((style as "light" | "medium" | "heavy") || "medium")
          break
        case "notification":
          this.webApp.HapticFeedback.notificationOccurred((style as "error" | "success" | "warning") || "success")
          break
        case "selection":
          this.webApp.HapticFeedback.selectionChanged()
          break
      }
    } catch (error) {
      console.warn("Haptic feedback failed:", error)
    }
  }

  showAlert(message: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.webApp) {
        try {
          this.webApp.showAlert(message, () => resolve())
        } catch (error) {
          console.warn("Failed to show alert:", error)
          if (typeof alert !== "undefined") {
            alert(message)
          }
          resolve()
        }
      } else {
        if (typeof alert !== "undefined") {
          alert(message)
        }
        resolve()
      }
    })
  }

  showConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.webApp) {
        try {
          this.webApp.showConfirm(message, (confirmed) => resolve(confirmed))
        } catch (error) {
          console.warn("Failed to show confirm:", error)
          resolve(typeof confirm !== "undefined" ? confirm(message) : false)
        }
      } else {
        resolve(typeof confirm !== "undefined" ? confirm(message) : false)
      }
    })
  }

  isAvailable(): boolean {
    return !!this.webApp
  }

  getInitData(): string {
    return this.webApp?.initData || ""
  }

  sendData(data: string): void {
    if (this.webApp) {
      try {
        this.webApp.sendData(data)
      } catch (error) {
        console.warn("Failed to send data:", error)
      }
    }
  }

  openLink(url: string, tryInstantView = false): void {
    if (this.webApp) {
      try {
        this.webApp.openLink(url, { try_instant_view: tryInstantView })
      } catch (error) {
        console.warn("Failed to open link via Telegram:", error)
        if (typeof window !== "undefined") {
          window.open(url, "_blank")
        }
      }
    } else {
      if (typeof window !== "undefined") {
        window.open(url, "_blank")
      }
    }
  }
}

export const telegramWebApp = new TelegramWebAppService()
